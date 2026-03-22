import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/scan_enums.dart';

/// Location/GPS verification card with metrics grid.
class LocationStatusCard extends StatefulWidget {
  final LocationState locationState;
  final int sampleCount;
  final int requiredSamples;
  final double? accuracy;
  final String locationMessage;
  final double? latitude;
  final double? longitude;
  final bool permissionGranted;
  final VoidCallback onFetchLocation;

  const LocationStatusCard({
    super.key,
    required this.locationState,
    required this.sampleCount,
    required this.requiredSamples,
    this.accuracy,
    required this.locationMessage,
    this.latitude,
    this.longitude,
    required this.permissionGranted,
    required this.onFetchLocation,
  });

  @override
  State<LocationStatusCard> createState() => _LocationStatusCardState();
}

class _LocationStatusCardState extends State<LocationStatusCard> {
  bool _detailsExpanded = false;

  IconData get _statusIcon {
    switch (widget.locationState) {
      case LocationState.idle:
        return Icons.location_on_outlined;
      case LocationState.fetching:
        return Icons.sync_rounded;
      case LocationState.success:
        return Icons.check_circle_outline;
      case LocationState.error:
        return Icons.error_outline_rounded;
    }
  }

  Color get _statusColor {
    switch (widget.locationState) {
      case LocationState.idle:
        return Colors.grey[600]!;
      case LocationState.fetching:
        return AppColors.sky500;
      case LocationState.success:
        return AppColors.emerald500;
      case LocationState.error:
        return AppColors.rose500;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 16,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _statusColor.withOpacity(0.12),
                ),
                child: widget.locationState == LocationState.fetching
                    ? Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: _statusColor,
                          ),
                        ),
                      )
                    : Icon(_statusIcon, color: _statusColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Verifikasi Lokasi',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Pencarian koordinat GPS',
                      style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                    ),
                  ],
                ),
              ),
              // Fetch button
              ElevatedButton.icon(
                onPressed: widget.locationState == LocationState.fetching
                    ? null
                    : widget.onFetchLocation,
                icon: Icon(
                  widget.locationState == LocationState.fetching
                      ? Icons.sync_rounded
                      : widget.locationState == LocationState.success
                          ? Icons.refresh_rounded
                          : Icons.location_searching_rounded,
                  size: 16,
                ),
                label: Text(
                  widget.locationState == LocationState.fetching
                      ? 'Sinkronisasi...'
                      : widget.locationState == LocationState.success
                          ? 'Perbarui'
                          : 'Ambil lokasi',
                  style: TextStyle(fontSize: 12),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _statusColor.withOpacity(0.12),
                  foregroundColor: _statusColor,
                  elevation: 0,
                  padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Description
          Text(
            widget.locationState == LocationState.idle
                ? 'Lokasi akan diambil otomatis setelah kamera selesai.'
                : widget.locationMessage,
            style: TextStyle(
              fontSize: 13,
              color: _statusColor,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          // Metrics grid (2x2)
          Row(
            children: [
              Expanded(
                child: _MetricTile(
                  label: 'SAMPEL',
                  value: '${widget.sampleCount}/${widget.requiredSamples}',
                  tone: widget.sampleCount >= widget.requiredSamples
                      ? _MetricTone.success
                      : _MetricTone.neutral,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _MetricTile(
                  label: 'AKURASI GPS',
                  value: widget.accuracy != null ? '${widget.accuracy!.round()}m' : '-',
                  tone: widget.accuracy != null && widget.accuracy! <= 50
                      ? _MetricTone.success
                      : widget.accuracy != null
                          ? _MetricTone.warning
                          : _MetricTone.neutral,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Coordinate details (expandable)
          InkWell(
            onTap: () => setState(() => _detailsExpanded = !_detailsExpanded),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Detail koordinat',
                      style: TextStyle(fontSize: 13, color: Colors.grey[700]),
                    ),
                  ),
                  Icon(
                    _detailsExpanded ? Icons.expand_less : Icons.expand_more,
                    size: 20,
                    color: Colors.grey[500],
                  ),
                ],
              ),
            ),
          ),
          if (_detailsExpanded)
            Padding(
              padding: EdgeInsets.only(top: 8),
              child: Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  children: [
                    _CoordRow(label: 'Latitude', value: widget.latitude?.toStringAsFixed(6) ?? '-'),
                    const SizedBox(height: 6),
                    _CoordRow(label: 'Longitude', value: widget.longitude?.toStringAsFixed(6) ?? '-'),
                  ],
                ),
              ),
            ),
          // Permission guide
          if (!widget.permissionGranted)
            Padding(
              padding: EdgeInsets.only(top: 12),
              child: Container(
                width: double.infinity,
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.amber500.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.amber500.withOpacity(0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.amber500),
                        const SizedBox(width: 8),
                        const Text('Izin Lokasi Diperlukan',
                            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '1. Buka Pengaturan → Aplikasi\n'
                      '2. Cari aplikasi ini\n'
                      '3. Pilih Izin → Lokasi\n'
                      '4. Pilih "Izinkan sepanjang waktu" atau "Saat digunakan"',
                      style: TextStyle(fontSize: 12, color: Colors.grey[600], height: 1.5),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

enum _MetricTone { neutral, success, warning, error }

class _MetricTile extends StatelessWidget {
  final String label;
  final String value;
  final _MetricTone tone;

  const _MetricTile({
    required this.label,
    required this.value,
    required this.tone,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color textColor;
    Color borderColor;

    switch (tone) {
      case _MetricTone.success:
        bg = AppColors.emerald500.withOpacity(0.06);
        textColor = AppColors.emerald500;
        borderColor = AppColors.emerald500.withOpacity(0.15);
        break;
      case _MetricTone.warning:
        bg = AppColors.amber500.withOpacity(0.06);
        textColor = AppColors.amber500;
        borderColor = AppColors.amber500.withOpacity(0.15);
        break;
      case _MetricTone.error:
        bg = AppColors.rose500.withOpacity(0.06);
        textColor = AppColors.rose500;
        borderColor = AppColors.rose500.withOpacity(0.15);
        break;
      case _MetricTone.neutral:
        bg = Colors.grey[100]!;
        textColor = Colors.grey[700]!;
        borderColor = Colors.grey[200]!;
        break;
    }

    return Container(
      padding: EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w700,
              letterSpacing: 2,
              color: Colors.grey[500],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}

class _CoordRow extends StatelessWidget {
  final String label;
  final String value;

  const _CoordRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[500])),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            fontFamily: 'monospace',
            color: Colors.grey[800],
          ),
        ),
      ],
    );
  }
}
