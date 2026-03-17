import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/attendance.dart';

/// Timeline view: groups records by month → day, with expandable sections.
class AttendanceTimelineView extends StatefulWidget {
  const AttendanceTimelineView({super.key, required this.records});

  final List<AttendanceEntity> records;

  @override
  State<AttendanceTimelineView> createState() => _AttendanceTimelineViewState();
}

class _AttendanceTimelineViewState extends State<AttendanceTimelineView> {
  String? _expandedMonth;

  static const _statusColors = {
    'present': Color(0xFF10B981),
    'hadir': Color(0xFF10B981),
    'absent': Color(0xFFF43F5E),
    'alpha': Color(0xFFF43F5E),
    'late': Color(0xFFF59E0B),
    'terlambat': Color(0xFFF59E0B),
    'pending': Color(0xFF0EA5E9),
    'rejected': Color(0xFFF43F5E),
  };

  static const _statusLabels = {
    'present': 'Hadir',
    'hadir': 'Hadir',
    'absent': 'Tidak Hadir',
    'alpha': 'Tidak Hadir',
    'late': 'Terlambat',
    'terlambat': 'Terlambat',
    'pending': 'Pending',
    'rejected': 'Ditolak',
  };

  Map<String, List<_DayGroup>> _buildTimeline() {
    final grouped = <String, Map<String, List<AttendanceEntity>>>{};
    for (final r in widget.records) {
      try {
        final dt = DateTime.parse(r.date);
        final monthKey = DateFormat('MMMM yyyy', 'id_ID').format(dt);
        final dayKey = DateFormat('yyyy-MM-dd').format(dt);
        grouped.putIfAbsent(monthKey, () => {});
        grouped[monthKey]!.putIfAbsent(dayKey, () => []);
        grouped[monthKey]![dayKey]!.add(r);
      } catch (_) {}
    }
    final result = <String, List<_DayGroup>>{};
    for (final entry in grouped.entries) {
      final days = entry.value.entries.map((e) {
        DateTime dt;
        try { dt = DateTime.parse(e.key); } catch (_) { dt = DateTime.now(); }
        return _DayGroup(date: dt, records: e.value);
      }).toList()..sort((a, b) => b.date.compareTo(a.date));
      result[entry.key] = days;
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    final timeline = _buildTimeline();

    if (timeline.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.timeline, size: 48, color: AppColors.textSecondary.withValues(alpha: 0.3)),
              const SizedBox(height: 12),
              Text('Belum ada data', style: TextStyle(color: AppColors.textSecondary)),
            ],
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.indigo500.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.timeline, size: 20, color: AppColors.indigo500),
              ),
              const SizedBox(width: 10),
              const Text(
                'Timeline Kehadiran',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...timeline.entries.map((entry) => _MonthSection(
                month: entry.key,
                days: entry.value,
                expanded: _expandedMonth == entry.key,
                onToggle: () => setState(() {
                  _expandedMonth = _expandedMonth == entry.key ? null : entry.key;
                }),
              )),
        ],
      ),
    );
  }
}

class _DayGroup {
  final DateTime date;
  final List<AttendanceEntity> records;
  const _DayGroup({required this.date, required this.records});
}

class _MonthSection extends StatelessWidget {
  const _MonthSection({
    required this.month,
    required this.days,
    required this.expanded,
    required this.onToggle,
  });

  final String month;
  final List<_DayGroup> days;
  final bool expanded;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onToggle,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppColors.indigo500, AppColors.purple600]),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.calendar_month, size: 18, color: Colors.white),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(month, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      Text('${days.length} hari', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                AnimatedRotation(
                  turns: expanded ? 0.25 : 0,
                  duration: const Duration(milliseconds: 300),
                  child: Icon(Icons.chevron_right, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ),
        AnimatedCrossFade(
          duration: const Duration(milliseconds: 300),
          crossFadeState: expanded ? CrossFadeState.showFirst : CrossFadeState.showSecond,
          firstChild: Padding(
            padding: const EdgeInsets.only(left: 18),
            child: Stack(
              children: [
                Positioned(left: 7, top: 0, bottom: 0, child: Container(width: 2, color: AppColors.indigo500.withValues(alpha: 0.2))),
                Column(
                  children: days.map((day) => _DayItem(day: day)).toList(),
                ),
              ],
            ),
          ),
          secondChild: const SizedBox.shrink(),
        ),
      ],
    );
  }
}

class _DayItem extends StatelessWidget {
  const _DayItem({required this.day});
  final _DayGroup day;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 0, bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 16,
            height: 16,
            margin: const EdgeInsets.only(top: 2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(colors: [AppColors.indigo500, AppColors.purple600]),
              border: Border.all(color: Colors.white, width: 2),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        DateFormat('EEEE, d MMM', 'id_ID').format(day.date),
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.textPrimary),
                      ),
                      Text(
                        '${day.records.length} kehadiran',
                        style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: day.records.map((r) {
                      final color = _AttendanceTimelineViewState._statusColors[r.status] ?? AppColors.textSecondary;
                      final label = _AttendanceTimelineViewState._statusLabels[r.status] ?? r.status;
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          r.mataKuliah.length > 15 ? '${r.mataKuliah.substring(0, 15)}...' : r.mataKuliah,
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color),
                        ),
                      );
                    }).toList(),
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
