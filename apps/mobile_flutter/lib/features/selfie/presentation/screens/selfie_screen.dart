import 'dart:io';
import 'dart:typed_data';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:path_provider/path_provider.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/models/location_sample.dart';
import '../../../../core/services/fake_gps_detector.dart';
import '../../../../core/services/location_service.dart';
import '../../../attendance/domain/entities/session_info.dart';
import '../../../attendance/domain/repositories/attendance_repository.dart';

class SelfieScreen extends ConsumerStatefulWidget {
  final int sessionId;
  final SessionInfo session;
  final String? qrData;

  const SelfieScreen({
    super.key,
    required this.sessionId,
    required this.session,
    this.qrData,
  });

  @override
  ConsumerState<SelfieScreen> createState() => _SelfieScreenState();
}

class _SelfieScreenState extends ConsumerState<SelfieScreen> {
  CameraController? _cameraController;
  bool _cameraReady = false;
  bool _isDetecting = false;
  bool _isSubmitting = false;
  XFile? _captured;

  final _faceDetector = FaceDetector(
    options: FaceDetectorOptions(
      enableContours: false,
      enableClassification: true,
      enableTracking: true,
      minFaceSize: 0.15,
    ),
  );
  bool _faceValid = false;
  String _faceHint = 'Posisikan wajah di tengah';

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    final cameras = await availableCameras();
    final front = cameras.firstWhere(
      (c) => c.lensDirection == CameraLensDirection.front,
      orElse: () => cameras.first,
    );

    _cameraController = CameraController(
      front,
      ResolutionPreset.high,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.yuv420,
    );

    await _cameraController!.initialize();
    await _cameraController!.startImageStream(_processImage);

    if (mounted) {
      setState(() => _cameraReady = true);
    }
  }

  Future<void> _processImage(CameraImage image) async {
    if (_isDetecting || !_cameraReady) return;
    _isDetecting = true;
    try {
      final input = _toInputImage(image, _cameraController!.description);
      final faces = await _faceDetector.processImage(input);
      if (!mounted) return;

      if (faces.isEmpty) {
        setState(() {
          _faceValid = false;
          _faceHint = 'Wajah tidak terdeteksi';
        });
      } else if (faces.length > 1) {
        setState(() {
          _faceValid = false;
          _faceHint = 'Terdeteksi lebih dari 1 wajah';
        });
      } else {
        setState(() {
          _faceValid = true;
          _faceHint = 'Wajah terdeteksi. Tekan tombol.';
        });
      }
    } catch (_) {
      // ignore detection errors
    } finally {
      _isDetecting = false;
    }
  }

  InputImage _toInputImage(CameraImage image, CameraDescription description) {
    final bytes = image.planes.fold<List<int>>(
      <int>[],
      (previous, plane) => previous..addAll(plane.bytes),
    );
    final size = Size(image.width.toDouble(), image.height.toDouble());
    final rotation = InputImageRotationValue.fromRawValue(
          description.sensorOrientation,
        ) ??
        InputImageRotation.rotation0deg;
    final format = InputImageFormatValue.fromRawValue(image.format.raw) ??
        InputImageFormat.yuv420;
    final metadata = InputImageMetadata(
      size: size,
      rotation: rotation,
      format: format,
      bytesPerRow: image.planes.first.bytesPerRow,
    );
    return InputImage.fromBytes(
      bytes: Uint8List.fromList(bytes),
      metadata: metadata,
    );
  }

  Future<void> _capture() async {
    if (!_faceValid || _cameraController == null) return;
    await _cameraController!.stopImageStream();
    final file = await _cameraController!.takePicture();
    if (!mounted) return;
    setState(() => _captured = file);
  }

  Future<void> _retake() async {
    setState(() => _captured = null);
    await _cameraController?.startImageStream(_processImage);
  }

  Future<File> _compress(XFile file) async {
    final dir = await getTemporaryDirectory();
    final target = '${dir.path}/selfie_${DateTime.now().millisecondsSinceEpoch}.jpg';
    final result = await FlutterImageCompress.compressAndGetFile(
      file.path,
      target,
      quality: 85,
    );
    if (result == null) {
      return File(file.path);
    }
    return File(result.path);
  }

  Future<void> _submit() async {
    if (_captured == null) return;
    setState(() => _isSubmitting = true);
    try {
      final locationService = getIt<LocationService>();
      final fakeGpsDetector = getIt<FakeGpsDetector>();

      final position = await locationService.getCurrentPosition();
      final fakePosition = fakeGpsDetector.evaluatePosition(position);
      if (fakePosition.detected) {
        _showError(fakePosition.reason ?? 'Terdeteksi lokasi tidak valid.');
        return;
      }

      final samples = await locationService.collectSamples();
      if (samples.isEmpty) {
        _showError('Gagal mendapatkan lokasi. Coba lagi.');
        return;
      }
      final fakeSamples = fakeGpsDetector.evaluateSamples(samples);
      if (fakeSamples.detected) {
        _showError(fakeSamples.reason ?? 'Lokasi tidak valid.');
        return;
      }

      final best = _pickBestSample(samples);
      final compressed = await _compress(_captured!);

      final result = await getIt<AttendanceRepository>().submitSelfie(
        filePath: compressed.path,
        sessionId: widget.sessionId,
        qrData: widget.qrData,
        latitude: best.latitude,
        longitude: best.longitude,
        accuracy: best.accuracyM,
        locationSamples: samples.map((s) => s.toJson()).toList(),
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result.message ?? 'Absensi berhasil')),
      );
      Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        _showError(e.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  LocationSample _pickBestSample(List<LocationSample> samples) {
    return samples.reduce((a, b) => a.accuracyM <= b.accuracyM ? a : b);
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Selfie'),
      ),
      body: !_cameraReady
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                if (_cameraController != null && _captured == null)
                  CameraPreview(_cameraController!),
                if (_captured != null)
                  Positioned.fill(
                    child: Image.file(File(_captured!.path), fit: BoxFit.cover),
                  ),
                Positioned(
                  top: 16,
                  left: 16,
                  right: 16,
                  child: Card(
                    color: Colors.black87,
                    child: Padding(
                      padding: EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.session.mataKuliah ?? 'Sesi Absensi',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${widget.session.dosen ?? '-'} • ${widget.session.room ?? '-'}',
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 140,
                  left: 24,
                  right: 24,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: _faceValid ? Colors.green : Colors.orange,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Text(
                      _faceHint,
                      style: TextStyle(color: Colors.white),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 40,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_captured == null)
                        FloatingActionButton(
                          onPressed: _faceValid ? _capture : null,
                          child: const Icon(Icons.camera_alt),
                        )
                      else ...[
                        ElevatedButton(
                          onPressed: _isSubmitting ? null : _retake,
                          child: const Text('Ulangi'),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton(
                          onPressed: _isSubmitting ? null : _submit,
                          child: _isSubmitting
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('Kirim'),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    _faceDetector.close();
    super.dispose();
  }
}
