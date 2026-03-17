import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/attendance.dart';

/// Calendar view with colored dots per date
class AttendanceCalendarView extends StatefulWidget {
  const AttendanceCalendarView({
    super.key,
    required this.records,
    this.selectedDate,
    required this.onDateSelected,
  });

  final List<AttendanceEntity> records;
  final DateTime? selectedDate;
  final ValueChanged<DateTime?> onDateSelected;

  @override
  State<AttendanceCalendarView> createState() => _AttendanceCalendarViewState();
}

class _AttendanceCalendarViewState extends State<AttendanceCalendarView> {
  late DateTime _focusedMonth;

  @override
  void initState() {
    super.initState();
    _focusedMonth = widget.selectedDate ?? DateTime.now();
  }

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

  Map<String, List<Color>> _buildDateColors() {
    final map = <String, List<Color>>{};
    for (final r in widget.records) {
      try {
        final dt = DateTime.parse(r.date);
        final key = DateFormat('yyyy-MM-dd').format(dt);
        final color = _statusColors[r.status] ?? AppColors.textSecondary;
        map.putIfAbsent(key, () => []);
        if (!map[key]!.contains(color)) map[key]!.add(color);
      } catch (_) {}
    }
    return map;
  }

  @override
  Widget build(BuildContext context) {
    final dateColors = _buildDateColors();
    final firstDay = DateTime(_focusedMonth.year, _focusedMonth.month, 1);
    final lastDay = DateTime(_focusedMonth.year, _focusedMonth.month + 1, 0);
    final startWeekday = firstDay.weekday % 7; // 0=Sun

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12)],
      ),
      child: Column(
        children: [
          // Month navigation
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left, color: AppColors.textPrimary),
                onPressed: () => setState(() {
                  _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month - 1, 1);
                }),
              ),
              Text(
                DateFormat('MMMM yyyy', 'id_ID').format(_focusedMonth),
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right, color: AppColors.textPrimary),
                onPressed: () => setState(() {
                  _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month + 1, 1);
                }),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Day of week headers
          Row(
            children: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
                .map((d) => Expanded(
                      child: Center(
                        child: Text(d, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 8),
          // Calendar grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 7, childAspectRatio: 1),
            itemCount: startWeekday + lastDay.day,
            itemBuilder: (_, index) {
              if (index < startWeekday) return const SizedBox.shrink();
              final day = index - startWeekday + 1;
              final date = DateTime(_focusedMonth.year, _focusedMonth.month, day);
              final key = DateFormat('yyyy-MM-dd').format(date);
              final colors = dateColors[key];
              final isSelected = widget.selectedDate != null && DateFormat('yyyy-MM-dd').format(widget.selectedDate!) == key;
              final isToday = DateFormat('yyyy-MM-dd').format(DateTime.now()) == key;

              return InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () => widget.onDateSelected(isSelected ? null : date),
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.indigo500.withValues(alpha: 0.15) : null,
                    borderRadius: BorderRadius.circular(8),
                    border: isToday ? Border.all(color: AppColors.indigo500, width: 1.5) : null,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '$day',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isToday ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected ? AppColors.indigo500 : AppColors.textPrimary,
                        ),
                      ),
                      if (colors != null && colors.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: colors.take(3).map((c) => Container(
                            width: 5,
                            height: 5,
                            margin: const EdgeInsets.symmetric(horizontal: 1),
                            decoration: BoxDecoration(shape: BoxShape.circle, color: c),
                          )).toList(),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
          // Show all button when date selected
          if (widget.selectedDate != null) ...[
            const SizedBox(height: 8),
            TextButton.icon(
              onPressed: () => widget.onDateSelected(null),
              icon: const Icon(Icons.clear, size: 14),
              label: const Text('Tampilkan semua tanggal', style: TextStyle(fontSize: 12)),
              style: TextButton.styleFrom(foregroundColor: AppColors.indigo500),
            ),
          ],
          // Legend
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _DotLegend(const Color(0xFF10B981), 'Hadir'),
              const SizedBox(width: 12),
              _DotLegend(const Color(0xFFF59E0B), 'Terlambat'),
              const SizedBox(width: 12),
              _DotLegend(const Color(0xFFF43F5E), 'Tidak Hadir'),
              const SizedBox(width: 12),
              _DotLegend(const Color(0xFF0EA5E9), 'Pending'),
            ],
          ),
        ],
      ),
    );
  }
}

class _DotLegend extends StatelessWidget {
  const _DotLegend(this.color, this.label);
  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 6, height: 6, decoration: BoxDecoration(shape: BoxShape.circle, color: color)),
        const SizedBox(width: 3),
        Text(label, style: TextStyle(fontSize: 9, color: AppColors.textSecondary)),
      ],
    );
  }
}
