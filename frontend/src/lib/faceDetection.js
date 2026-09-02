/**
 * faceDetection.js
 *
 * Browser-side face descriptor extraction using @vladmandic/face-api.
 * Models are loaded lazily from /models/ (bundled as static assets).
 *
 * Usage:
 *   import { loadModels, extractDescriptor } from '@/lib/faceDetection';
 *   await loadModels();
 *   const descriptor = await extractDescriptor(imageElement); // Float32Array(128) or null
 */

const MODEL_URL = '/models';

let _loaded = false;
let _loading = null;

/**
 * Lazily load face-api.js models from public/models/.
 * Safe to call multiple times — only loads once.
 */
export async function loadModels() {
  if (_loaded) return;
  if (_loading) return _loading;

  _loading = (async () => {
    const faceapi = await import('@vladmandic/face-api');
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    _loaded = true;
    console.log('[faceDetection] face-api.js models loaded from /models/');
  })();

  return _loading;
}

/**
 * Extract a 128-d face descriptor from an image element (HTMLImageElement, HTMLVideoElement, HTMLCanvasElement).
 * Returns Float32Array(128) if a face is found, or null if no face detected.
 */
export async function extractDescriptor(imageInput) {
  await loadModels();
  const faceapi = await import('@vladmandic/face-api');

  try {
    const detection = await faceapi
      .detectSingleFace(imageInput, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return null;
    return detection.descriptor; // Float32Array(128)
  } catch (err) {
    console.warn('[faceDetection] extractDescriptor error:', err);
    return null;
  }
}
