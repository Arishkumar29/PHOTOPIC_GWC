const ort = require('onnxruntime-node');
const fs = require('fs');

async function test() {
  console.log('Loading SFace ONNX session...');
  const session = await ort.InferenceSession.create('backend/models/face_recognition_sface_2021dec.onnx');
  console.log('Session loaded successfully!');
  
  // SFace input shape is [1, 3, 112, 112] float32
  const dummyInput = new Float32Array(1 * 3 * 112 * 112);
  const tensor = new ort.Tensor('float32', dummyInput, [1, 3, 112, 112]);
  
  const feeds = { [session.inputNames[0]]: tensor };
  const results = await session.run(feeds);
  const output = results[session.outputNames[0]];
  console.log('SFace Output shape:', output.dims);
  console.log('SFace Output feature length:', output.data.length);
}

test().catch(console.error);
