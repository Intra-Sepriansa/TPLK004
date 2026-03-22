import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';

/// Riwayat header widget — same pattern as HeroHeaderWidget
class RiwayatHeaderWidget extends StatefulWidget {
  const RiwayatHeaderWidget({
    super.key,
    required this.nama,
    required this.nim,
    this.onRefresh,
    this.onExport,
    this.onRekapan,
  });

  final String nama;
  final String nim;
  final VoidCallback? onRefresh;
  final VoidCallback? onExport;
  final VoidCallback? onRekapan;

  @override
  State<RiwayatHeaderWidget> createState() => _RiwayatHeaderWidgetState();
}

class _RiwayatHeaderWidgetState extends State<RiwayatHeaderWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _gradientController;
  late Timer _clockTimer;
  DateTime _currentTime = DateTime.now();

  @override
  void initState() {
    super.initState();
    _gradientController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..repeat(reverse: true);
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _currentTime = DateTime.now());
    });
  }

  @override
  void dispose() {
    _gradientController.dispose();
    _clockTimer.cancel();
    super.dispose();
  }

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }

  @override
  Widget build(BuildContext context) {
    final timeStr = DateFormat.Hm().format(_currentTime);
    final dateStr =
        DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(_currentTime);

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
            AppColors.primaryLight,
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
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Static Batik Background
          Positioned.fill(
            child: Opacity(
              opacity: 0.06,
              child: Transform.scale(
                scale: 1.1,
                child: Image.asset(
                  'assets/images/batik_pattern.png',
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                ),
              ),
            ),
          ),

              // Content
              SafeArea(
                bottom: false,
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Avatar + Name + Clock
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Avatar
                          Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color:
                                  Colors.white.withOpacity(0.2),
                              border: Border.all(
                                color:
                                    Colors.white.withOpacity(0.4),
                                width: 2,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                _getInitials(widget.nama),
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 22,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Riwayat Kehadiran',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.white
                                        .withOpacity(0.8),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  widget.nama,
                                  style: TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          // Clock
                          Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color:
                                  Colors.white.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color:
                                    Colors.white.withOpacity(0.2),
                              ),
                            ),
                            child: Text(
                              timeStr,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        dateStr,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                      const SizedBox(height: 4),
                      // NIM badge
                      Container(
                        margin: EdgeInsets.only(top: 4),
                        padding: EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white
                                    .withOpacity(0.6),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'NIM: ${widget.nim}',
                              style: TextStyle(
                                fontSize: 12,
                                fontFamily: 'monospace',
                                color: Colors.white
                                    .withOpacity(0.8),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Action buttons
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _buildButton('Export PDF', Icons.picture_as_pdf_rounded,
                              onTap: widget.onExport),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
  }

  Widget _buildButton(
    String label,
    IconData icon, {
    bool filled = false,
    VoidCallback? onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding:
              EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: filled
                ? Colors.white
                : Colors.white.withOpacity(0.15),
            borderRadius: BorderRadius.circular(12),
            border: filled
                ? null
                : Border.all(
                    color: Colors.white.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 16,
                color: filled ? AppColors.indigo600 : Colors.white,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: filled ? AppColors.indigo600 : Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
