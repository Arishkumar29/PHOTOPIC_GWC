import sqlite3
import cv2
import numpy as np

# 1. Load test selfie and extract SFace embedding
img = cv2.imread('backend/models/test_selfie.jpg')
h, w = img.shape[:2]
detector = cv2.FaceDetectorYN.create('backend/models/face_detection_yunet_2023mar.onnx', '', (w, h))
recognizer = cv2.FaceRecognizerSF.create('backend/models/face_recognition_sface_2021dec.onnx', '')

_, faces = detector.detect(img)
aligned = recognizer.alignCrop(img, faces[0])
selfie_feat = recognizer.feature(aligned)

print('Selfie feature shape:', selfie_feat.shape, 'norm:', np.linalg.norm(selfie_feat))

# 2. Match against pre-cached faces in SQLite
conn = sqlite3.connect('backend/models/face_embeddings.sqlite')
c = conn.cursor()
c.execute("SELECT file_path, feat_blob FROM face_cache WHERE file_path LIKE ?", ('%evt_hqlvwvk%',))
rows = c.fetchall()
print(f'Total faces in SQLite for evt_hqlvwvk: {len(rows)}')

matches = []
seen = set()
for file_path, feat_blob in rows:
    filename = file_path.replace('\\', '/').split('/')[-1]
    if filename in seen:
        continue
    db_feat = np.frombuffer(feat_blob, dtype=np.float32).reshape(1, -1)
    cos = recognizer.match(selfie_feat, db_feat, cv2.FaceRecognizerSF_FR_COSINE)
    if cos > 0.363:
        matches.append((cos, filename))
        seen.add(filename)

matches.sort(reverse=True)
print(f'Matches found with cosine > 0.363: {len(matches)}')
print('Top 5 matches:', matches[:5])
