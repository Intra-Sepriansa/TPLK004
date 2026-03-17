import 'package:flutter/material.dart';

import '../../domain/entities/tugas_data.dart';

class TugasStatsWidget extends StatelessWidget {
  const TugasStatsWidget({
    super.key,
    required this.isKelompok,
    this.tugasStats,
    this.kelompokStats,
  });

  final bool isKelompok;
  final TugasStats? tugasStats;
  final TugasKelompokStats? kelompokStats;

  @override
  Widget build(BuildContext context) {
    final items = isKelompok
        ? [
            _StatItem('Total Tugas', Icons.groups_rounded, const [Color(0xFF6366F1), Color(0xFF8B5CF6)], '${kelompokStats?.total ?? 0}'),
            _StatItem('Belum Gabung', Icons.person_add_rounded, const [Color(0xFFF59E0B), Color(0xFFF97316)], '${kelompokStats?.notJoined ?? 0}'),
            _StatItem('Sedang Berjalan', Icons.trending_up_rounded, const [Color(0xFF10B981), Color(0xFF14B8A6)], '${kelompokStats?.activeGroups ?? 0}'),
            _StatItem('Sudah Selesai', Icons.check_circle_rounded, const [Color(0xFF3B82F6), Color(0xFF22D3EE)], '${kelompokStats?.completed ?? 0}'),
          ]
        : [
            _StatItem('Total Tugas', Icons.assignment_rounded, const [Color(0xFF6366F1), Color(0xFF3B82F6)], '${tugasStats?.total ?? 0}'),
            _StatItem('Mendatang', Icons.schedule_rounded, const [Color(0xFF10B981), Color(0xFF14B8A6)], '${tugasStats?.upcoming ?? 0}'),
            _StatItem('Terlewat', Icons.warning_rounded, const [Color(0xFFF43F5E), Color(0xFFEF4444)], '${tugasStats?.overdue ?? 0}'),
            _StatItem('Belum Dibaca', Icons.mark_email_unread_rounded, const [Color(0xFFF59E0B), Color(0xFFF97316)], '${tugasStats?.unread ?? 0}'),
          ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 12,
        runSpacing: 12,
        children: items.map((item) => _StatCard(item: item)).toList(),
      ),
    );
  }
}

class _StatItem {
  final String label;
  final IconData icon;
  final List<Color> colors;
  final String value;

  const _StatItem(this.label, this.icon, this.colors, this.value);
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.item});

  final _StatItem item;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: (MediaQuery.of(context).size.width - 16 * 2 - 12) / 2,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: item.colors,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: item.colors.first.withValues(alpha: 0.35),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(item.icon, color: Colors.white, size: 18),
          ),
          const SizedBox(height: 12),
          Text(
            item.value,
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w700,
              shadows: [
                Shadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.2),
                  blurRadius: 6,
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            item.label,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.9),
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
