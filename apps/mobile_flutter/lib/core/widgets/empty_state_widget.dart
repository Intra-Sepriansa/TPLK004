import 'package:flutter/material.dart';

/// Reusable empty-state widget with student character illustration.
///
/// Usage:
/// ```dart
/// EmptyStateWidget(
///   imagePath: 'assets/images/empty_no_tugas.png',
///   title: 'Belum Ada Tugas',
///   subtitle: 'Semua tugas sudah selesai! 🎉',
/// )
/// ```
class EmptyStateWidget extends StatelessWidget {
  const EmptyStateWidget({
    super.key,
    required this.imagePath,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
    this.imageSize = 180,
  });

  final String imagePath;
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;
  final double imageSize;

  // ── Prebuilt factories ──

  /// Empty state for Tugas (no assignments)
  factory EmptyStateWidget.noTugas({VoidCallback? onRetry}) => EmptyStateWidget(
        imagePath: 'assets/images/empty_no_tugas.png',
        title: 'Belum Ada Tugas',
        subtitle: 'Saat ini belum ada tugas yang diberikan.\nSantai dulu! 📚',
        actionLabel: onRetry != null ? 'Coba Lagi' : null,
        onAction: onRetry,
      );

  /// Empty state for success / all done
  factory EmptyStateWidget.allDone() => const EmptyStateWidget(
        imagePath: 'assets/images/empty_success.png',
        title: 'Semua Selesai! 🎉',
        subtitle: 'Kerja bagus! Semua tugas sudah diselesaikan.',
      );

  /// Empty state for Kas (no payment data)
  factory EmptyStateWidget.noKas({VoidCallback? onRetry}) => EmptyStateWidget(
        imagePath: 'assets/images/empty_no_kas.png',
        title: 'Belum Ada Data Kas',
        subtitle: 'Belum ada riwayat pembayaran kas.\nHubungi ketua kelas untuk info.',
        actionLabel: onRetry != null ? 'Coba Lagi' : null,
        onAction: onRetry,
      );

  /// Generic empty state (no data available)
  factory EmptyStateWidget.noData({String? message, VoidCallback? onRetry}) => EmptyStateWidget(
        imagePath: 'assets/images/empty_no_data.png',
        title: 'Tidak Ada Data',
        subtitle: message ?? 'Data yang kamu cari belum tersedia.',
        actionLabel: onRetry != null ? 'Coba Lagi' : null,
        onAction: onRetry,
      );

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 32, vertical: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Character illustration
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 600),
              curve: Curves.easeOutBack,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: value,
                  child: Opacity(opacity: value.clamp(0, 1), child: child),
                );
              },
              child: Image.asset(
                imagePath,
                width: imageSize,
                height: imageSize,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => Icon(
                  Icons.sentiment_neutral_rounded,
                  size: 80,
                  color: isDark ? Colors.white38 : Colors.grey[400],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Title
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : const Color(0xFF1E293B),
              ),
            ),

            // Subtitle
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? Colors.white60 : const Color(0xFF64748B),
                  height: 1.5,
                ),
              ),
            ],

            // Action button
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: onAction,
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: Text(actionLabel!),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
