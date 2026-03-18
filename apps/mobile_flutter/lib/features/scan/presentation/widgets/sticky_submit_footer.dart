import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Clean Sticky bottom submit bar.
class StickySubmitFooter extends StatelessWidget {
  final bool tokenDone;
  final bool selfieDone;
  final bool locationDone;
  final bool submitSuccess;
  final bool consentAccepted;
  final bool canSubmit;
  final bool isSubmitting;
  final String? submitMessage;
  final int progressCount;
  final VoidCallback onSubmit;
  final VoidCallback onStartNewSession;

  const StickySubmitFooter({
    super.key,
    required this.tokenDone,
    required this.selfieDone,
    required this.locationDone,
    required this.submitSuccess,
    required this.consentAccepted,
    required this.canSubmit,
    required this.isSubmitting,
    this.submitMessage,
    required this.progressCount,
    required this.onSubmit,
    required this.onStartNewSession,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        24,
        20,
        24,
        20 + MediaQuery.of(context).padding.bottom,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey[200]!, width: 1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 24,
            offset: const Offset(0, -8),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Message
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Text(
              submitSuccess
                  ? (submitMessage ?? 'Absensi berhasil dikirim!')
                  : canSubmit
                      ? 'Semua syarat terpenuhi. Klik untuk mengirim absensi.'
                      : (!consentAccepted)
                          ? 'Silahkan berikan izin lokasi dan kamera sebelum mulai'
                          : 'Selesaikan verifikasi absensi di atas untuk lanjut',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                fontWeight: submitSuccess || canSubmit ? FontWeight.w600 : FontWeight.w500,
                color: submitSuccess
                    ? AppColors.emerald500
                    : canSubmit
                        ? Colors.grey[800]
                        : Colors.grey[500],
              ),
            ),
          ),
          
          // Submit button
          if (submitSuccess)
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onStartNewSession,
                icon: const Icon(Icons.add_circle_outline, size: 18),
                label: const Text('Mulai sesi baru'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(50),
                  ),
                  side: BorderSide(color: AppColors.primary.withOpacity(0.3)),
                ),
              ),
            )
          else
            SizedBox(
              width: double.infinity,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(50),
                  gradient: canSubmit
                      ? const LinearGradient(
                          colors: [
                            Color(0xFF0284C7),
                            Color(0xFF06B6D4),
                            Color(0xFF10B981),
                          ],
                        )
                      : LinearGradient(
                          colors: [Colors.grey[200]!, Colors.grey[300]!],
                        ),
                  boxShadow: canSubmit
                      ? [
                          BoxShadow(
                            color: const Color(0xFF06B6D4).withOpacity(0.4),
                            blurRadius: 20,
                            offset: const Offset(0, 6),
                          ),
                        ]
                      : [],
                ),
                child: ElevatedButton.icon(
                  onPressed: canSubmit && !isSubmitting ? onSubmit : null,
                  icon: isSubmitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.send_rounded, size: 18),
                  label: Text(
                    isSubmitting ? 'Mengirim...' : 'Kirim Absensi',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    foregroundColor: canSubmit ? Colors.white : Colors.grey[500],
                    disabledBackgroundColor: Colors.transparent,
                    disabledForegroundColor: Colors.grey[500],
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(50),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
