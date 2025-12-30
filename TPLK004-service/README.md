# TPLK004-service (YOLO Detector)

Service ini menyediakan endpoint inference YOLO untuk dipanggil internal oleh backend utama.

## Quick start (MacBook M2)
1. `cd TPLK004-service`
2. `python -m venv .venv`
3. `source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `export DEVICE=mps`
6. `export MODEL_PATH=models/yolov8m.pt`
7. `export PYTORCH_ENABLE_MPS_FALLBACK=1`
8. `uvicorn app:app --host 127.0.0.1 --port 9001`

Catatan:
- Jika file model belum ada, Ultralytics akan mencoba download saat pertama kali dipakai.
- Letakkan weights di `TPLK004-service/models/` agar tidak download ulang.

## Endpoint

### GET /health
Cek status service.

### POST /infer
- Content-Type: `multipart/form-data`
- Field: `file`
- Optional query: `conf`, `iou`, `imgsz`
- Optional header: `x-api-key`

Contoh:
```
curl -X POST "http://127.0.0.1:9001/infer" \
  -F "file=@/path/image.jpg"
```

Response berisi daftar deteksi, metadata gambar, dan latency.

## Camera test (local)
Jalankan deteksi langsung dari kamera (tekan `q` untuk keluar).

```
cd TPLK004-service
source .venv/bin/activate
PYTORCH_ENABLE_MPS_FALLBACK=1 python cam_detect.py
```

Script ini membaca konfigurasi dari `.env` (MODEL_PATH, DEVICE, CONF, IMGSZ).

## Konfigurasi (.env)
Gunakan variabel berikut:
- `MODEL_PATH` (default: `models/yolov8m.pt`)
- `DEVICE` (default: auto, prefer `mps` jika tersedia)
- `CONF` (default: 0.25)
- `IOU` (default: 0.45)
- `IMGSZ` (default: 640)
- `API_KEY` (default: kosong)
- `INFER_CONCURRENCY` (default: 1)
- `MAX_IMAGE_BYTES` (default: 8388608)

## Rekomendasi untuk M2
- Gunakan `INFER_CONCURRENCY=1` agar stabil di MPS.
- Downscale ke `imgsz=640` untuk keseimbangan akurasi dan kecepatan.

## Integrasi dengan backend utama
Panggil service ini melalui backend (proxy) untuk menghindari masalah CORS.
