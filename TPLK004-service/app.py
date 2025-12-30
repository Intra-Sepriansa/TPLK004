import asyncio
import io
import os
import time
from typing import Any, Dict, Optional

from fastapi import FastAPI, File, Header, HTTPException, Query, UploadFile
from PIL import Image

try:
    import torch
    from ultralytics import YOLO
except Exception as exc:  # pragma: no cover - runtime dependency issue
    torch = None
    YOLO = None
    _IMPORT_ERROR = exc
else:
    _IMPORT_ERROR = None

APP_NAME = "detector-service"
MODEL_PATH = os.getenv("MODEL_PATH", "models/yolov8m.pt")
DEFAULT_CONF = float(os.getenv("CONF", "0.25"))
DEFAULT_IOU = float(os.getenv("IOU", "0.45"))
DEFAULT_IMGSZ = int(os.getenv("IMGSZ", "640"))
API_KEY = os.getenv("API_KEY", "")
MAX_IMAGE_BYTES = int(os.getenv("MAX_IMAGE_BYTES", str(8 * 1024 * 1024)))
INFER_CONCURRENCY = max(1, int(os.getenv("INFER_CONCURRENCY", "1")))
DEVICE_OVERRIDE = os.getenv("DEVICE", "")

app = FastAPI(title=APP_NAME)
model = None
model_device = None
semaphore = asyncio.Semaphore(INFER_CONCURRENCY)


def resolve_device() -> str:
    if DEVICE_OVERRIDE:
        return DEVICE_OVERRIDE
    if torch is not None:
        mps = getattr(torch.backends, "mps", None)
        if mps is not None and mps.is_available():
            return "mps"
    return "cpu"


def ensure_dependencies() -> None:
    if YOLO is None:
        raise RuntimeError(f"Missing dependencies: {_IMPORT_ERROR}")


def verify_api_key(x_api_key: Optional[str]) -> None:
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


def class_name_lookup(names: Any, cls_id: int) -> str:
    if isinstance(names, dict):
        return str(names.get(cls_id, cls_id))
    if isinstance(names, (list, tuple)) and cls_id < len(names):
        return str(names[cls_id])
    return str(cls_id)


@app.on_event("startup")
def load_model() -> None:
    global model, model_device
    ensure_dependencies()
    model_device = resolve_device()
    model = YOLO(MODEL_PATH)


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "device": model_device,
        "model_path": MODEL_PATH,
    }


@app.post("/infer")
async def infer(
    file: UploadFile = File(...),
    conf: Optional[float] = Query(None, ge=0, le=1),
    iou: Optional[float] = Query(None, ge=0, le=1),
    imgsz: Optional[int] = Query(None, ge=32, le=2048),
    x_api_key: Optional[str] = Header(None),
) -> Dict[str, Any]:
    verify_api_key(x_api_key)
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Unsupported content type")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty upload")
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image too large")

    try:
        image = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image") from exc

    image_width, image_height = image.size
    conf_value = DEFAULT_CONF if conf is None else conf
    iou_value = DEFAULT_IOU if iou is None else iou
    imgsz_value = DEFAULT_IMGSZ if imgsz is None else imgsz

    started = time.monotonic()
    async with semaphore:
        results = await asyncio.to_thread(
            model.predict,
            source=image,
            conf=conf_value,
            iou=iou_value,
            imgsz=imgsz_value,
            device=model_device,
            verbose=False,
        )
    latency_ms = round((time.monotonic() - started) * 1000, 2)

    result = results[0]
    detections = []
    if result.boxes is not None and len(result.boxes) > 0:
        boxes = result.boxes.xyxy.cpu().numpy()
        confs = result.boxes.conf.cpu().numpy()
        classes = result.boxes.cls.cpu().numpy().astype(int)
        for box, score, cls_id in zip(boxes, confs, classes):
            detections.append(
                {
                    "class_id": int(cls_id),
                    "class_name": class_name_lookup(result.names, int(cls_id)),
                    "confidence": float(score),
                    "box": {
                        "x1": float(box[0]),
                        "y1": float(box[1]),
                        "x2": float(box[2]),
                        "y2": float(box[3]),
                    },
                }
            )

    return {
        "model": os.path.basename(MODEL_PATH),
        "device": model_device,
        "image": {
            "width": image_width,
            "height": image_height,
            "bytes": len(content),
        },
        "params": {
            "conf": conf_value,
            "iou": iou_value,
            "imgsz": imgsz_value,
        },
        "detections": detections,
        "latency_ms": latency_ms,
    }
