import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/upcoming_session.dart';
import 'countdown_timer_widget.dart';
import 'glassmorphic_card.dart';
import 'section_header.dart';

/// Widget showing upcoming attendance sessions with countdown timer.
class UpcomingSessionsWidget extends StatelessWidget {
  const UpcomingSessionsWidget({super.key, required this.sessions});

  final List<UpcomingSessionEntity> sessions;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GlassmorphicCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionHeader(
              title: 'Sesi Mendatang',
              subtitle: '${sessions.length} sesi',
              icon: Icons.calendar_today_outlined,
              gradientColors: const [AppColors.amber400, AppColors.orange600],
            ),
            const SizedBox(height: 16),
            if (sessions.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Center(
                  child: Text(
                    'Tidak ada sesi mendatang.',
                    style: TextStyle(
                      color: isDark ? Colors.white54 : AppColors.textSecondary,
                    ),
                  ),
                ),
              )
            else
              ...sessions.asMap().entries.map((entry) {
                final i = entry.key;
                final s = entry.value;
                final isFirst = i == 0;

                return Padding(
                  padding: EdgeInsets.only(bottom: i < sessions.length - 1 ? 12 : 0),
                  child: Container(
                    padding: EdgeInsets.all(isFirst ? 16 : 12),
                    decoration: BoxDecoration(
                      color: isFirst
                          ? (isDark
                              ? AppColors.amber500.withValues(alpha: 0.1)
                              : AppColors.amber500.withValues(alpha: 0.05))
                          : (isDark
                              ? Colors.white.withValues(alpha: 0.03)
                              : Colors.grey.withValues(alpha: 0.04)),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isFirst
                            ? AppColors.amber500.withValues(alpha: 0.2)
                            : Colors.transparent,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                s.courseName,
                                style: TextStyle(
                                  fontSize: isFirst ? 14 : 13,
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? Colors.white
                                      : AppColors.textPrimary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (isFirst) CountdownTimerWidget(targetDate: s.startAt),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${s.title} • Pertemuan ${s.meetingNumber}',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark
                                ? Colors.white54
                                : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}
