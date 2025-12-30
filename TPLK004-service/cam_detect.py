import os
import sys

import cv2
from dotenv import load_dotenv
from ultralytics import YOLO


def resolve_device() -> str:
    device = os.getenv("DEVICE", "").strip()
    if device:
        return device
    try:
        import torch

        mps = getattr(torch.backends, "mps", None)
        if mps is not None and mps.is_available():
            return "mps"
    except Exception:
        pass
    return "cpu"


def open_camera(index: int) -> cv2.VideoCapture:
    if sys.platform == "darwin":
        cap = cv2.VideoCapture(index, cv2.CAP_AVFOUNDATION)
        if cap.isOpened():
            return cap
    return cv2.VideoCapture(index)


def resolve_class_name(names: object, cls_id: int) -> str:
    if isinstance(names, dict):
        return str(names.get(cls_id, cls_id))
    if isinstance(names, (list, tuple)) and cls_id < len(names):
        return str(names[cls_id])
    return str(cls_id)


def box_area(box: object) -> float:
    x1, y1, x2, y2 = box
    return abs((x2 - x1) * (y2 - y1))


def main() -> None:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    load_dotenv(os.path.join(base_dir, ".env"))

    model_path = os.getenv("MODEL_PATH", "models/best.pt")
    if not os.path.isabs(model_path):
        model_path = os.path.join(base_dir, model_path)
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")

    conf = float(os.getenv("CONF", "0.25"))
    imgsz = int(os.getenv("IMGSZ", "640"))
    device = resolve_device()
    max_detections = int(os.getenv("MAX_DETECTIONS", "1"))
    target_class_env = os.getenv("TARGET_CLASS_ID", "0").strip()
    target_class_id = int(target_class_env) if target_class_env else None
    min_box_area = float(os.getenv("MIN_BOX_AREA", "0"))
    pick_strategy = os.getenv("PICK_STRATEGY", "conf").strip().lower()

    model = YOLO(model_path)
    cam_index = int(os.getenv("CAM_INDEX", "0"))
    cap = open_camera(cam_index)
    if not cap.isOpened():
        raise RuntimeError(
            "Camera tidak bisa dibuka. Pastikan izin kamera aktif untuk Terminal/VS Code."
        )

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        results = model.predict(
            frame,
            imgsz=imgsz,
            conf=conf,
            device=device,
            verbose=False,
        )
        result = results[0]
        output = frame

        if result.boxes is not None and len(result.boxes) > 0:
            boxes = result.boxes.xyxy.cpu().numpy()
            confs = result.boxes.conf.cpu().numpy()
            classes = result.boxes.cls.cpu().numpy().astype(int)
            indices = list(range(len(confs)))

            if target_class_id is not None:
                indices = [i for i in indices if classes[i] == target_class_id]

            if indices:
                if pick_strategy == "area":
                    indices.sort(key=lambda i: box_area(boxes[i]), reverse=True)
                else:
                    indices.sort(key=lambda i: confs[i], reverse=True)
                if max_detections > 0:
                    indices = indices[:max_detections]

                output = frame.copy()
                for i in indices:
                    x1, y1, x2, y2 = boxes[i]
                    x1, x2 = sorted((x1, x2))
                    y1, y2 = sorted((y1, y2))
                    if min_box_area and (x2 - x1) * (y2 - y1) < min_box_area:
                        continue
                    x1 = max(int(x1), 0)
                    y1 = max(int(y1), 0)
                    x2 = max(int(x2), 0)
                    y2 = max(int(y2), 0)
                    label = f"{resolve_class_name(result.names, classes[i])} {confs[i]:.2f}"
                    cv2.rectangle(output, (x1, y1), (x2, y2), (255, 0, 0), 2)
                    cv2.putText(
                        output,
                        label,
                        (x1, max(y1 - 10, 0)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (255, 0, 0),
                        2,
                    )

        cv2.imshow("Deteksi", output)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
