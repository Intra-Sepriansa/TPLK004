import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/attendance.dart';

/// Premium Record detail bottom sheet — matched with web History detail modal
void showRecordDetailSheet(BuildContext context, AttendanceEntity record) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _RecordDetailContent(record: record),
  );
}

class _RecordDetailContent extends StatefulWidget {
  const _RecordDetailContent({required this.record});
  final AttendanceEntity record;

  @override
  State<_RecordDetailContent> createState() => _RecordDetailContentState();
}

class _RecordDetailContentState extends State<_RecordDetailContent>
    with SingleTickerProviderStateMixin {
  late AnimationController _orbController;

  static const _statusConfig = {
    'present': ('Hadir', Color(0xFF10B981), Icons.check_circle_rounded),
    'hadir': ('Hadir', Color(0xFF10B981), Icons.check_circle_rounded),
    'absent': ('Tidak Hadir', Color(0xFFF43F5E), Icons.cancel_rounded),
    'alpha': ('Tidak Hadir', Color(0xFFF43F5E), Icons.cancel_rounded),
    'late': ('Terlambat', Color(0xFFF59E0B), Icons.access_time_filled_rounded),
    'terlambat': ('Terlambat', Color(0xFFF59E0B), Icons.access_time_filled_rounded),
    'pending': ('Pending', Color(0xFF0EA5E9), Icons.info_rounded),
    'rejected': ('Ditolak', Color(0xFFF43F5E), Icons.error_rounded),
  };

  static const _selfieConfig = {
    'approved': ('Terverifikasi', Color(0xFF10B981), Icons.verified_rounded),
    'pending': ('Menunggu', Color(0xFF0EA5E9), Icons.hourglass_top_rounded),
    'rejected': ('Ditolak', Color(0xFFF43F5E), Icons.cancel_rounded),
  };

  @override
  void initState() {
    super.initState();
    _orbController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();
  }

  @override
  void dispose() {
    _orbController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final record = widget.record;
    final sc = _statusConfig[record.status] ??
        ('Unknown', AppColors.textSecondary, Icons.help_rounded);
    final ss = record.selfieStatus != null ? _selfieConfig[record.selfieStatus] : null;

    String dateFormatted = record.date;
    try {
      final dt = DateTime.parse(record.date);
      dateFormatted = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(dt);
    } catch (_) {}

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (_, controller) => Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.92),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 30,
              spreadRadius: 5,
            )
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            // Floating background orbs (Animated)
            Positioned.fill(
              child: AnimatedBuilder(
                animation: _orbController,
                builder: (context, child) {
                  return Stack(
                    children: [
                      _buildOrb(
                        color: AppColors.primary.withOpacity(0.08),
                        size: 250,
                        top: -50 + (_orbController.value * 20),
                        right: -100 + (_orbController.value * 30),
                        blur: 60,
                      ),
                      _buildOrb(
                        color: AppColors.sky500.withOpacity(0.06),
                        size: 200,
                        bottom: 50 - (_orbController.value * 20),
                        left: -80 + (_orbController.value * 40),
                        blur: 50,
                      ),
                    ],
                  );
                },
              ),
            ),

            // Content
            BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: ListView(
                controller: controller,
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                children: [
                  // Drag handle
                  Center(
                    child: Container(
                      width: 48,
                      height: 5,
                      margin: EdgeInsets.only(bottom: 24),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),

                  // Header with Close Button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Wrap(
                        spacing: 8,
                        children: [
                          _Badge(label: sc.$1, color: sc.$2, icon: sc.$3),
                          if (ss != null)
                            _Badge(label: ss.$1, color: ss.$2, icon: ss.$3),
                        ],
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close_rounded),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.black.withOpacity(0.04),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Course Title
                  Text(
                    record.mataKuliah,
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.indigo500.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'Pertemuan ${record.meetingNumber ?? "?"}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.indigo600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        record.courseId != null ? 'ID: ${record.courseId}' : '',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Selfie Canvas
                  Container(
                    height: 220,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 20,
                          offset: Offset(0, 10),
                        )
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: record.selfieUrl != null
                        ? Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.network(
                                record.selfieUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const _NoSelfie(),
                              ),
                              Positioned(
                                bottom: 12,
                                left: 12,
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: BackdropFilter(
                                    filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                                    child: Container(
                                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                      color: Colors.black.withOpacity(0.3),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(Icons.photo_camera_rounded, size: 14, color: Colors.white),
                                          const SizedBox(width: 6),
                                          const Text(
                                            'BUKTI SELFIE',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w800,
                                              color: Colors.white,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          )
                        : const _NoSelfie(),
                  ),

                  const SizedBox(height: 24),

                  // Metadata Cards (Themed)
                  _DetailCard(
                    icon: Icons.calendar_today_rounded,
                    color: AppColors.sky500,
                    label: 'TANGGAL',
                    value: dateFormatted,
                  ),
                  const SizedBox(height: 12),
                  _DetailCard(
                    icon: Icons.access_time_filled_rounded,
                    color: AppColors.emerald500,
                    label: 'WAKTU CHECK-IN',
                    value: record.checkIn ?? 'Jam tidak tercatat',
                  ),
                  const SizedBox(height: 12),
                  _DetailCard(
                    icon: Icons.location_on_rounded,
                    color: AppColors.violet500,
                    label: 'JARAK LOKASI',
                    value: record.distance != null ? '${record.distance!.round()} Meter dari pusat zona' : 'Koordinat tidak tersedia',
                  ),

                  const SizedBox(height: 16),

                  // Catatan (Web Style)
                  if (record.note != null && record.note!.isNotEmpty)
                    Container(
                      padding: EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.amber500.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: AppColors.amber500.withOpacity(0.2),
                          width: 2,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.sticky_note_2_rounded, size: 16, color: AppColors.amber600),
                              const SizedBox(width: 8),
                              const Text(
                                'CATATAN',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.amber600,
                                  letterSpacing: 1,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            record.note!,
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.amber800,
                              height: 1.5,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 32),

                  // Bottom Action
                  SizedBox(
                    width: double.infinity,
                    child: TextButton(
                      onPressed: () => Navigator.pop(context),
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: AppColors.textPrimary.withOpacity(0.05),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text(
                        'Tutup Detail',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrb({
    required Color color,
    required double size,
    double? top,
    double? bottom,
    double? left,
    double? right,
    required double blur,
  }) {
    return Positioned(
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
        ),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: const SizedBox.shrink(),
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.color, required this.icon});
  final String label;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.2)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 10,
            offset: Offset(0, 4),
          )
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class _NoSelfie extends StatelessWidget {
  const _NoSelfie();
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.03),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image_not_supported_rounded,
                size: 50, color: AppColors.textSecondary.withOpacity(0.2)),
            const SizedBox(height: 12),
            Text(
              'Tidak ada bukti selfie',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary.withOpacity(0.5),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailCard extends StatelessWidget {
  const _DetailCard({
    required this.icon,
    required this.color,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final Color color;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.04),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [color, color.withOpacity(0.7)],
              ),
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.3),
                  blurRadius: 10,
                  offset: Offset(0, 5),
                )
              ],
            ),
            child: Icon(icon, size: 24, color: Colors.white),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: color,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

