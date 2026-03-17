import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/scan_enums.dart';
import '../providers/scan_state.dart';

class AbsensiHeaderWidget extends StatefulWidget {
  final ScanAbsensiState scanState;
  final String studentName;
  final String? avatarUrl;
  final VoidCallback onBack;
  final VoidCallback onRefresh;
  final VoidCallback onHistory;
  final ValueChanged<bool> onConsentChanged;

  const AbsensiHeaderWidget({
    super.key,
    required this.scanState,
    required this.studentName,
    this.avatarUrl,
    required this.onBack,
    required this.onRefresh,
    required this.onHistory,
    required this.onConsentChanged,
  });

  @override
  State<AbsensiHeaderWidget> createState() => _AbsensiHeaderWidgetState();
}

class _AbsensiHeaderWidgetState extends State<AbsensiHeaderWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _gradientController;
  late Timer _clockTimer;
  String _timeString = '';
  String _dateString = '';

  @override
  void initState() {
    super.initState();
    _gradientController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..repeat(reverse: true);
    _updateClock();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) => _updateClock());
  }

  void _updateClock() {
    final now = DateTime.now();
    final days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    final months = [
      '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    setState(() {
      _timeString = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
      _dateString = '${days[now.weekday % 7]}, ${now.day} ${months[now.month]} ${now.year}';
    });
  }

  String get _dynamicDescription {
    final s = widget.scanState;
    if (s.detectedSession != null) {
      return 'QR terhubung ke ${s.detectedSession!.mataKuliah ?? 'sesi aktif'}. Lanjutkan selfie dan lokasi untuk menyelesaikan absensi.';
    }
    if (s.submitSuccess) {
      return 'Absensi berhasil tercatat. Kamu bisa keluar atau mulai sesi baru.';
    }
    if (s.cameraPhase == CameraPhase.scanning) {
      return 'Arahkan kamera ke QR code dosen untuk memulai proses absensi.';
    }
    return 'Sistem absensi berbasis QR code dinamis. Scan QR, verifikasi selfie, dan validasi lokasi dalam satu flow.';
  }

  String get _initials {
    final parts = widget.studentName.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts.isNotEmpty ? parts[0][0].toUpperCase() : '?';
  }

  @override
  void dispose() {
    _gradientController.dispose();
    _clockTimer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Get time and date strings
    final DateTime now = DateTime.now();
    final String timeString = DateFormat.Hm().format(now);
    final String dateString = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(now);
    final String initials = widget.studentName.split(' ').map((e) => e[0]).take(2).join().toUpperCase();

    return AnimatedBuilder(
      animation: _gradientController, // Using _gradientController as per original class definition
      builder: (context, child) {
        final double t = _gradientController.value; // Using _gradientController as per original class definition
        return Container(
          clipBehavior: Clip.antiAlias,
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primaryDark,
                AppColors.primary,
                AppColors.primaryLight.withOpacity(0.8),
              ],
            ),
            borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(28),
              bottomRight: Radius.circular(28),
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Stack(
            children: [
              // Batik pattern overlay
              Positioned.fill(
                child: Opacity(
                  opacity: 0.06,
                  child: Transform.scale(
                    scale: 1.3, // Prevent edges from showing during translate
                    child: Transform.translate(
                      offset: Offset(t * 20 - 10, t * 10 - 5),
                      child: Image.asset(
                        'assets/images/batik_pattern.png',
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                      ),
                    ),
                  ),
                ),
              ),
              // Content
              SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Avatar + Name + Clock row
                      Row(
                        children: [
                          // Avatar
                          Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withOpacity(0.2),
                              border: Border.all(color: Colors.white.withOpacity(0.3), width: 2),
                            ),
                            child: widget.avatarUrl != null
                                ? ClipOval(
                                    child: Image.network(
                                      widget.avatarUrl!,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Center(
                                        child: Text(initials,
                                            style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 20,
                                                fontWeight: FontWeight.bold)),
                                      ),
                                    ),
                                  )
                                : Center(
                                    child: Text(initials,
                                        style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold)),
                                  ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Selamat datang,',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.8),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  widget.studentName,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          // Clock
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withOpacity(0.2)),
                            ),
                            child: Column(
                              children: [
                                Text(timeString,
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold)),
                                const SizedBox(height: 2),
                                Text(dateString,
                                    style: TextStyle(
                                        color: Colors.white.withOpacity(0.7),
                                        fontSize: 9)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Title + description
                      const Text(
                        'Absensi Mahasiswa',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _dynamicDescription,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 13,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Consent checkbox
                      _ConsentSection(
                        accepted: widget.scanState.consentAccepted,
                        onChanged: widget.onConsentChanged,
                      ),
                      const SizedBox(height: 12),
                      // Permission pills
                      Row(
                        children: [
                          _PermissionPill(
                            label: 'Camera',
                            granted: widget.scanState.cameraPermissionGranted,
                          ),
                          const SizedBox(width: 8),
                          _PermissionPill(
                            label: 'Location',
                            granted: widget.scanState.locationPermissionGranted,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool filled;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    this.filled = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: filled ? Colors.white : Colors.transparent,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: filled ? null : Border.all(color: Colors.white.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: filled ? AppColors.primary : Colors.white),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: filled ? AppColors.primary : Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ConsentSection extends StatelessWidget {
  final bool accepted;
  final ValueChanged<bool> onChanged;

  const _ConsentSection({required this.accepted, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: accepted ? Colors.white.withOpacity(0.3) : Colors.amber.withOpacity(0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SizedBox(
                width: 24,
                height: 24,
                child: Checkbox(
                  value: accepted,
                  onChanged: (v) => onChanged(v ?? false),
                  activeColor: Colors.white,
                  checkColor: AppColors.primary,
                  side: BorderSide(color: Colors.white.withOpacity(0.5)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Saya setuju menggunakan kamera dan lokasi untuk proses absensi.',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              if (accepted)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.emerald500.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Aktif',
                    style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.only(left: 34),
            child: Text(
              'Data hanya dipakai untuk verifikasi QR, selfie, dan geofence kehadiran.',
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 11,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PermissionPill extends StatelessWidget {
  final String label;
  final bool granted;

  const _PermissionPill({required this.label, required this.granted});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: granted
            ? AppColors.emerald500.withOpacity(0.2)
            : Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: granted
              ? AppColors.emerald500.withOpacity(0.4)
              : Colors.white.withOpacity(0.2),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            granted ? Icons.check_circle : Icons.circle_outlined,
            size: 14,
            color: granted ? AppColors.emerald400 : Colors.white.withOpacity(0.5),
          ),
          const SizedBox(width: 6),
          Text(
            '$label: ${granted ? 'Diizinkan' : 'Belum dicek'}',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: granted ? Colors.white : Colors.white.withOpacity(0.6),
            ),
          ),
        ],
      ),
    );
  }
}
