// @ts-nocheck
/**
 * Store art for cosmetics: the piece worn on the visitor's own skin. Nothing is hand-placed: the camera is fitted
 * automatically to the piece plus the body part(s) it attaches to, and turns to whichever side the piece is on.
 *
 * Every shot is drawn once by one shared off-screen 3D viewer, one after another, and kept in memory and in
 * IndexedDB (keyed by the item's files and the skin), so the next visit paints instantly with no 3D work.
 */

const SIZE = 288;
const VERSION = 'v3';
const memory = new Map<string, string>(); // key -> data URL
const waiting = new Map<string, Promise<string | null>>(); // key -> Promise
let chain: Promise<unknown> = Promise.resolve();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stage: any = null; // { viewer, THREE, ncm, skinKey }

/* ---------- persistent copy ---------- */
let dbPromise: Promise<IDBDatabase | null> | null = null;
const openDb = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open('native-shots', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('shots');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
  return dbPromise;
};
const idb = async (mode, fn) => {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('shots', mode);
      const result = fn(tx.objectStore('shots'));
      tx.oncomplete = () => resolve(result?.result ?? null);
      tx.onerror = () => resolve(null);
      tx.onabort = () => resolve(null);
    } catch { resolve(null); }
  });
};
const readSaved = (key) => idb('readonly', (store) => store.get(key));
const writeSaved = async (key, value) => {
  const count = await idb('readonly', (store) => store.count());
  if (count > 400) await idb('readwrite', (store) => store.clear());
  return idb('readwrite', (store) => store.put(value, key));
};

/* ---------- keys ---------- */
const tag = (value) => {
  const text = String(value || '');
  let h = 5381;
  const step = Math.max(1, Math.floor(text.length / 4000));
  for (let i = 0; i < text.length; i += step) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `${text.length.toString(36)}${(h >>> 0).toString(36)}`;
};
export const shotKey = (item, asset, skinUrl, model) => `${VERSION}|${item?.id}|${tag(asset?.texture)}${tag(JSON.stringify(asset?.model || ''))}|${tag(skinUrl)}|${model}`;

/* ---------- drawing ---------- */
async function getStage() {
  if (stage) return stage;
  const [lib, THREE, ncm] = await Promise.all([import('skinview3d'), import('three'), import('./ncm')]);
  const canvas = document.createElement('canvas');
  const viewer = new lib.SkinViewer({ canvas, width: SIZE, height: SIZE, model: 'auto-detect', preserveDrawingBuffer: true });
  viewer.fov = 42;
  viewer.autoRotate = false;
  viewer.animation = null;
  if (viewer.controls) { viewer.controls.enabled = false; }
  viewer.renderPaused = true;
  stage = { viewer, THREE, ncm, skinKey: null };
  return stage;
}

/**
 * Fits the camera to the piece and the body part(s) it is attached to (a hat shows the whole head, wings the torso and
 * head, shoes both legs), looking from the side the piece is on, with a little padding.
 */
function frameShot(viewer, THREE, built) {
  const skin = viewer.playerObject.skin;
  viewer.playerObject.updateMatrixWorld(true);
  const piece = new THREE.Box3();
  for (const r of built.roots) piece.expandByObject(r.object);
  const region = piece.clone();
  const attached = new Set(built.roots.map((r) => r.attach));
  const add = (part) => { if (part) region.expandByObject(part); };
  for (const name of attached) {
    if (name === 'head') { add(skin.head); }
    else if (name === 'body') { add(skin.body); add(skin.head); }
    else if (name === 'rightLeg' || name === 'leftLeg') { add(skin.rightLeg); add(skin.leftLeg); }
    else add(skin[name]);
  }
  // shoes: show the feet and a little leg, not the whole body
  if ((attached.has('rightLeg') || attached.has('leftLeg')) && !attached.has('body') && !attached.has('head')) region.max.y = Math.min(region.max.y, piece.max.y + 5);
  const center = region.getCenter(new THREE.Vector3());
  const behind = piece.getCenter(new THREE.Vector3()).z < -1.5;
  const yaw = behind ? Math.PI - 0.5 : 0.5;
  const pitch = 0.14;
  const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(up, dir).normalize();
  const trueUp = new THREE.Vector3().crossVectors(dir, right).normalize();
  const tan = Math.tan((viewer.fov / 2) * Math.PI / 180) / 1.1; // 10% padding
  let distance = 10;
  const { min, max } = region;
  for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
    const offset = new THREE.Vector3(x, y, z).sub(center);
    const side = Math.max(Math.abs(offset.dot(right)), Math.abs(offset.dot(trueUp)));
    distance = Math.max(distance, side / tan + offset.dot(dir));
  }
  viewer.camera.position.copy(center).addScaledVector(dir, distance);
  viewer.camera.lookAt(center);
  if (viewer.controls) viewer.controls.target.copy(center);
}

async function draw(item, asset, skinUrl, model) {
  const s = await getStage();
  const { viewer, THREE, ncm } = s;
  const wantSkin = `${tag(skinUrl)}|${model}`;
  if (s.skinKey !== wantSkin) {
    try { await viewer.loadSkin(skinUrl, { model }); }
    catch { await viewer.loadSkin(model === 'slim' ? '/skins/alex.png' : '/skins/steve.png', { model }); }
    viewer.loadCape(null);
    s.skinKey = wantSkin;
  }
  const image = await ncm.loadImage(asset.texture);
  const made = ncm.buildCosmetic(THREE, asset.model, image);
  // NCM cubes ship without normals; lit materials need them on this three.js build
  for (const r of made.roots) r.object.traverse((o) => { const g = o.geometry; if (g && !g.attributes.normal) g.computeVertexNormals(); });
  const built = ncm.attachToPlayer(made, viewer.playerObject.skin);
  try {
    built.update(0.35, 0);
    if (viewer.playerObject.cape) viewer.playerObject.cape.visible = false;
    frameShot(viewer, THREE, built);
    viewer.render();
    return viewer.canvas.toDataURL('image/png');
  } finally {
    built.dispose();
  }
}


/** The shot if it is already in memory. */
export const peekWornShot = (key: string): string | null => memory.get(key) || null;

/** The cosmetic worn on `skinUrl`, as a PNG data URL (null when it can't be drawn). */
export function wornShot({ item, asset, skinUrl, model }) {
  if (!item || !asset?.model || !asset?.texture) return Promise.resolve(null);
  const key = shotKey(item, asset, skinUrl, model);
  if (memory.has(key)) return Promise.resolve(memory.get(key)!);
  if (waiting.has(key)) return waiting.get(key)!;
  const job = (async () => {
    const saved = await readSaved(key);
    if (saved) { memory.set(key, saved); return saved as string; }
    // one picture at a time keeps the shared viewer simple and the page smooth
    const run = chain.then(() => draw(item, asset, skinUrl, model));
    chain = run.catch(() => {});
    const url = await run;
    if (url) { memory.set(key, url); writeSaved(key, url); }
    return url;
  })().catch(() => null).finally(() => waiting.delete(key));
  waiting.set(key, job);
  return job;
}
