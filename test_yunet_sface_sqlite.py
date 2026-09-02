import sys
import os
import sqlite3
import cv2
import numpy as np
import time

def match_selfie(img_path, min_cosine=0.40):
    detector_path = "backend/models/face_detection_yunet_2023mar.onnx"
    recognizer_path = "backend/models/face_recognition_sface_2021dec.onnx"
    sqlite_path = "backend/models/face_embeddings.sqlite"

    img = cv2.imread(img_path)
    if img is None:
        print("Could not read image:", img_path)
        return []

    h, w = img.shape[:2]
    detector = cv2.FaceDetectorYN.create(detector_path, "", (w, h), score_threshold=0.6)
    detector.setInputSize((w, h))
    _, faces = detector.detect(img)

    recognizer = cv2.FaceRecognizerSF.create(recognizer_path, "")

    if faces is None or len(faces) == 0:
        print("YuNet detected 0 faces in", img_path)
        return []

    # Sort by face area (largest face = attendee)
    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    best_face = faces[0]
    print(f"YuNet detected face: score={best_face[14]:.2f}")

    # Align & crop
    aligned = recognizer.alignCrop(img, best_face)
    feat = recognizer.feature(aligned).flatten()
    feat_norm = np.linalg.norm(feat)

    t0 = time.time()
    conn = sqlite3.connect(sqlite_path)
    c = conn.cursor()
    c.execute("SELECT file_path, feat_blob FROM face_cache")
    rows = c.fetchall()

    photo_scores = {}
    for r_path, r_blob in rows:
        db_feat = np.frombuffer(r_blob, dtype=np.float32)
        cos = np.dot(feat, db_feat) / (feat_norm * np.linalg.norm(db_feat))
        if cos >= min_cosine:
            fname = os.path.basename(r_path)
            if fname not in photo_scores or cos > photo_scores[fname]:
                photo_scores[fname] = float(cos)

    elapsed = (time.time() - t0) * 1000
    print(f"Vector search across {len(rows)} embeddings took {elapsed:.1f} ms")

    sorted_matches = sorted(photo_scores.items(), key=lambda x: x[1], reverse=True)
    print(f"Matches with score >= {min_cosine}: {len(sorted_matches)}")
    for fname, score in sorted_matches[:10]:
        print(f"  {fname}: {score:.4f}")
    return sorted_matches

if __name__ == "__main__":
    match_selfie("backend/models/test_selfie.jpg", min_cosine=0.40)
