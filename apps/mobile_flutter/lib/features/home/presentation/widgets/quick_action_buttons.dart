import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import 'glassmorphic_card.dart';
import 'section_header.dart';

class _QuickAction {
  final String label;
  final IconData icon;
  final List<Color> gradient;
  final VoidCallback? onTap;

  const _QuickAction({
    required this.label,
    required this.icon,
    required this.gradient,
    this.onTap,
  });
}

/// Upgraded quick action buttons — 4 items matching web dashboard quick links.
class QuickActionButtons extends StatelessWidget {
  const QuickActionButtons({
    super.key,
    this.onAbsensi,
    this.onRekapan,
    this.onSelfie,
    this.onProfile,
  });

  final VoidCallback? onAbsensi;
  final VoidCallback? onRekapan;
  final VoidCallback? onSelfie;
  final VoidCallback? onProfile;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final actions = [
      _QuickAction(
        label: 'Absensi',
        icon: Icons.qr_code_scanner,
        gradient: [AppColors.emerald400, AppColors.emerald500],
        onTap: onAbsensi,
      ),
      _QuickAction(
        label: 'Rekapan',
        icon: Icons.description_outlined,
        gradient: [AppColors.sky400, AppColors.sky500],
        onTap: onRekapan,
      ),
      _QuickAction(
        label: 'Bukti Masuk',
        icon: Icons.camera_alt_outlined,
        gradient: [AppColors.violet500, AppColors.purple600],
        onTap: onSelfie,
      ),
      _QuickAction(
        label: 'Profil',
        icon: Icons.person_outline,
        gradient: [AppColors.amber400, AppColors.amber500],
        onTap: onProfile,
      ),
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GlassmorphicCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionHeader(
              title: 'Menu Cepat',
              icon: Icons.apps_rounded,
              gradientColors: const [AppColors.sky400, AppColors.indigo600],
            ),
            const SizedBox(height: 16),
            ...actions.map((a) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: InkWell(
                    onTap: a.onTap,
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.04)
                            : a.gradient.first.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.06)
                              : a.gradient.first.withValues(alpha: 0.12),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(colors: a.gradient),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(a.icon, color: Colors.white, size: 18),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              a.label,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: isDark
                                    ? Colors.white
                                    : AppColors.textPrimary,
                              ),
                            ),
                          ),
                          Icon(
                            Icons.chevron_right,
                            color: isDark
                                ? Colors.white38
                                : AppColors.textSecondary,
                            size: 20,
                          ),
                        ],
                      ),
                    ),
                  ),
                )),
          ],
        ),
      ),
    );
  }
}
