import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Sticky bottom submit bar with progress dots and gradient button.
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
        20,
        16,
        20,
        16 + MediaQuery.of(context).padding.bottom,
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
          // Progress dots
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _ProgressDot(done: tokenDone, label: 'QR'),
              _DotDivider(done: tokenDone),
              _ProgressDot(done: selfieDone, label: 'Selfie'),
              _DotDivider(done: selfieDone),
              _ProgressDot(done: locationDone, label: 'Lokasi'),
              _DotDivider(done: locationDone),
              _ProgressDot(done: submitSuccess, label: 'Submit'),
            ],
          ),
          const SizedBox(height: 8),
          // Badges
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(50),
                  color: AppColors.primary.withOpacity(0.1),
                ),
                child: Text(
                  '$progressCount/4 selesai',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(50),
                  color: consentAccepted
                      ? AppColors.emerald500.withOpacity(0.1)
                      : Colors.grey[200],
                ),
                child: Text(
                  consentAccepted ? 'Consent aktif' : 'Consent belum aktif',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: consentAccepted ? AppColors.emerald500 : Colors.grey[500],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Message
          Text(
            submitSuccess
                ? (submitMessage ?? 'Absensi berhasil dikirim!')
                : canSubmit
                    ? 'Semua data siap. Klik untuk mengirim absensi.'
                    : 'Lengkapi seluruh langkah sebelum mengirim.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: submitSuccess
                  ? AppColors.emerald500
                  : canSubmit
                      ? Colors.grey[800]
                      : Colors.grey[500],
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
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
                          colors: [Colors.grey[300]!, Colors.grey[400]!],
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
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.transparent,
                    disabledForegroundColor: Colors.white.withOpacity(0.6),
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

class _ProgressDot extends StatelessWidget {
  final bool done;
  final String label;

  const _ProgressDot({required this.done, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: done ? AppColors.emerald500 : Colors.grey[300],
          ),
          child: done
              ? const Icon(Icons.check, size: 10, color: Colors.white)
              : null,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w600,
            color: done ? AppColors.emerald500 : Colors.grey[400],
          ),
        ),
      ],
    );
  }
}

class _DotDivider extends StatelessWidget {
  final bool done;

  const _DotDivider({required this.done});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 2,
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(2),
        color: done ? AppColors.emerald500 : Colors.grey[300],
      ),
    );
  }
}
