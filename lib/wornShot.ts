// @ts-nocheck
/**
 * Store art for cosmetics: the piece worn on the visitor's own skin. Nothing is hand-placed: the camera is fitted
 * automatically to the piece plus the body part(s) it attaches to, and turns to whichever side the piece is on.
 *
 * Every shot is drawn once by one shared off-screen 3D viewer, one after another, and kept in memory and in
 * IndexedDB (keyed by the item's files and the skin), so the next visit paints instantly with no 3D work.
 */

const SIZE = 288;
const VERSION = 'v7';
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
/**
 * Drops the few far-flung vertices of a piece (sparks, trailing particles) so they don't shrink the shot:
 * anything well outside the 4th-96th percentile box of the piece is left out of the framing.
 */
function trimStrays(pts, THREE) {
  if (pts.length < 160) return;
  const q = (arr, f) => arr[Math.min(arr.length - 1, Math.max(0, Math.floor(f * (arr.length - 1))))];
  const axes = ['x', 'y', 'z'].map((k) => pts.map((p) => p[k]).sort((a, b) => a - b));
  const lo = new THREE.Vector3(q(axes[0], 0.04), q(axes[1], 0.04), q(axes[2], 0.04));
  const hi = new THREE.Vector3(q(axes[0], 0.96), q(axes[1], 0.96), q(axes[2], 0.96));
  const pad = hi.clone().sub(lo).multiplyScalar(0.12).addScalar(1);
  const box = new THREE.Box3(lo.sub(pad), hi.add(pad));
  const kept = pts.filter((p) => box.containsPoint(p));
  if (kept.length > pts.length * 0.8) { pts.length = 0; pts.push(...kept); }
}

function frameShot(viewer, THREE, built) {
  const skin = viewer.playerObject.skin;
  viewer.playerObject.updateMatrixWorld(true);
  const piece = new THREE.Box3();
  for (const r of built.roots) if (r.object.visible !== false) piece.expandByObject(r.object);
  // the points that must be in frame: every vertex of the piece, plus the slice of the body it sits on (for context)
  const pts = [];
  const v = new THREE.Vector3();
  for (const r of built.roots) {
    if (r.object.visible === false) continue;
    r.object.traverse((o) => {
      if (!o.isMesh || !o.visible) return;
      const pos = o.geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 1) pts.push(v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).clone());
    });
  }
  trimStrays(pts, THREE);
  const attached = new Set(built.roots.filter((r) => r.object.visible !== false).map((r) => r.attach));
  const context = piece.clone().expandByScalar(5);
  const floating = attached.has('body') && built.roots.some((r) => r.side); // balloons: show the whole player
  const addPart = (part) => {
    if (!part) return;
    const whole = new THREE.Box3().expandByObject(part);
    // a piece that floats away from the body (balloons) shows the whole part instead of a clipped sliver
    const box = !floating && piece.intersectsBox(whole) ? whole.clone().intersect(context) : whole;
    if (box.isEmpty()) return;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) pts.push(new THREE.Vector3(x, y, z));
  };
  for (const name of attached) {
    if (name === 'head') addPart(skin.head);
    else if (name === 'body') { addPart(skin.body); addPart(skin.head); }
    else if (name === 'rightLeg' || name === 'leftLeg') { addPart(skin.rightLeg); addPart(skin.leftLeg); }
    else addPart(skin[name]);
  }
  if (!pts.length) return;
  const all = new THREE.Box3().setFromPoints(pts);
  // hats, hoods and masks are shown from the front (their trails may hang behind); back items from behind
  const headOnly = [...attached].every((name) => name === 'head');
  const behind = !headOnly && piece.getCenter(new THREE.Vector3()).z < -1.5;
  const yaw = behind ? Math.PI - 0.5 : 0.5;
  const pitch = 0.14;
  const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(up, dir).normalize();
  const trueUp = new THREE.Vector3().crossVectors(dir, right).normalize();
  const base = all.getCenter(new THREE.Vector3());
  // centre on the middle of what is actually visible from the camera, not on the middle of the box
  let loA = Infinity, hiA = -Infinity, loB = Infinity, hiB = -Infinity;
  for (const p of pts) { const o = p.clone().sub(base); const a = o.dot(right), b = o.dot(trueUp); loA = Math.min(loA, a); hiA = Math.max(hiA, a); loB = Math.min(loB, b); hiB = Math.max(hiB, b); }
  const center = base.clone().addScaledVector(right, (loA + hiA) / 2).addScaledVector(trueUp, (loB + hiB) / 2);
  const tan = Math.tan((viewer.fov / 2) * Math.PI / 180) / 1.05; // 5% padding
  let distance = 8;
  for (const p of pts) {
    const o = p.clone().sub(center);
    const side = Math.max(Math.abs(o.dot(right)), Math.abs(o.dot(trueUp)));
    distance = Math.max(distance, side / tan + o.dot(dir));
  }
  viewer.camera.position.copy(center).addScaledVector(dir, distance);
  viewer.camera.lookAt(center);
  if (viewer.controls) viewer.controls.target.copy(center);
}

/**
 * Crops the render to what was actually drawn and centres it in a square with even padding, so every
 * cosmetic (hats, back items, hand items, shoes) fills its card the same way.
 */
function contentBox(src: HTMLCanvasElement) {
  const w = src.width, h = src.height;
  const read = document.createElement('canvas');
  read.width = w; read.height = h;
  const rc = read.getContext('2d', { willReadFrequently: true })!;
  rc.drawImage(src, 0, 0);
  const d = rc.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) {
    if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1, w, h, read };
}

/** Second pass: move the camera onto what was drawn and close in until it fills ~90% of the frame (sharp, not upscaled). */
function refit(viewer, THREE) {
  try {
    const b = contentBox(viewer.canvas);
    if (!b) return;
    const cam = viewer.camera;
    const target = viewer.controls ? viewer.controls.target.clone() : new THREE.Vector3();
    const dir = cam.position.clone().sub(target);
    const distance = dir.length();
    dir.normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(up, dir).normalize();
    const trueUp = new THREE.Vector3().crossVectors(dir, right).normalize();
    const viewH = 2 * distance * Math.tan((cam.fov / 2) * Math.PI / 180);
    const viewW = viewH * (b.w / b.h);
    const cx = (b.x0 + b.x1 + 1) / 2 / b.w - 0.5, cy = 0.5 - (b.y0 + b.y1 + 1) / 2 / b.h;
    const center = target.clone().addScaledVector(right, cx * viewW).addScaledVector(trueUp, cy * viewH);
    const fill = Math.max((b.x1 - b.x0 + 1) / b.w, (b.y1 - b.y0 + 1) / b.h) / 0.9;
    const next = Math.max(4, distance * Math.min(1, Math.max(0.2, fill)));
    cam.position.copy(center).addScaledVector(dir, next);
    cam.lookAt(center);
    if (viewer.controls) viewer.controls.target.copy(center);
  } catch {}
}

function fitToContent(src: HTMLCanvasElement): string {
  try {
    const b = contentBox(src);
    if (!b) return src.toDataURL('image/png');
    const { x0, y0, x1, y1, read } = b;
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
    const side = Math.ceil(Math.max(bw, bh) * 1.1);
    const out = document.createElement('canvas');
    out.width = SIZE; out.height = SIZE;
    const oc = out.getContext('2d')!;
    oc.imageSmoothingEnabled = true;
    oc.imageSmoothingQuality = 'high';
    const k = SIZE / side;
    oc.drawImage(read, x0, y0, bw, bh, (SIZE - bw * k) / 2, (SIZE - bh * k) / 2, bw * k, bh * k);
    return out.toDataURL('image/png');
  } catch {
    return src.toDataURL('image/png');
  }
}

async function draw(item, asset, skinUrl, model) {
  const s = await getStage();
  const { viewer, THREE, ncm } = s;
  const wantSkin = `${tag(skinUrl)}|${model}`;
  if (s.skinKey !== wantSkin) {
    try { await viewer.loadSkin(skinUrl, { model: model === 'slim' ? 'slim' : 'auto-detect' }); }
    catch { await viewer.loadSkin(model === 'slim' ? '/skins/alex.png' : '/skins/steve.png', { model }); }
    viewer.loadCape(null);
    s.skinKey = wantSkin;
  }
  const image = await ncm.loadImage(asset.texture);
  const made = ncm.buildCosmetic(THREE, asset.model, image);
  // NCM cubes ship without normals; lit materials need them on this three.js build
  for (const r of made.roots) r.object.traverse((o) => { const g = o.geometry; if (g && !g.attributes.normal) g.computeVertexNormals(); });
  const built = ncm.attachToPlayer(made, viewer.playerObject.skin);
  const hidden = [];
  try {
    built.update(0.35, 0);
    if (viewer.playerObject.cape) viewer.playerObject.cape.visible = false;
    // only the body part(s) the piece sits on are drawn, so the piece itself fills the card (like shoes do)
    const attached = new Set(built.roots.filter((r) => r.object.visible !== false).map((r) => r.attach));
    const keep = new Set();
    for (const name of attached) {
      if (name === 'body') { keep.add('body'); keep.add('head'); }
      else if (name === 'rightLeg' || name === 'leftLeg') { keep.add('rightLeg'); keep.add('leftLeg'); }
      else keep.add(name);
    }
    const sk = viewer.playerObject.skin;
    for (const name of ['head', 'body', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg']) {
      const part = sk[name];
      if (!part) continue;
      const show = keep.size === 0 || keep.has(name);
      for (const layer of [part.innerLayer, part.outerLayer]) if (layer) { layer.userData.wsWas ??= layer.visible; layer.visible = show && layer.userData.wsWas; }
      hidden.push(part);
    }
    frameShot(viewer, THREE, built);
    viewer.render();
    refit(viewer, THREE);
    viewer.render();
    return fitToContent(viewer.canvas);
  } finally {
    for (const part of hidden) for (const layer of [part.innerLayer, part.outerLayer]) if (layer && layer.userData.wsWas !== undefined) { layer.visible = layer.userData.wsWas; delete layer.userData.wsWas; }
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
