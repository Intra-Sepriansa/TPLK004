import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/attendance.dart';
import '../../domain/entities/course.dart';
import '../providers/attendance_provider.dart';

class AttendanceFilterBar extends StatelessWidget {
  const AttendanceFilterBar({
    super.key,
    required this.state,
    required this.onSearchChanged,
    required this.onStatusChanged,
    required this.onCourseChanged,
    required this.onViewModeChanged,
    required this.onReset,
  });

  final AttendanceHistoryState state;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onStatusChanged;
  final ValueChanged<String> onCourseChanged;
  final ValueChanged<String> onViewModeChanged;
  final VoidCallback onReset;

  bool get _hasActiveFilters =>
      state.searchQuery.isNotEmpty ||
      state.statusFilter != 'all' ||
      state.courseFilter != 'all' ||
      state.selectedDate != null;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search
          Container(
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
            ),
            child: TextField(
              onChanged: onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Cari mata kuliah...',
                hintStyle: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                prefixIcon: Icon(Icons.search, size: 20, color: AppColors.textSecondary),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                suffixIcon: state.searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close, size: 18),
                        onPressed: () => onSearchChanged(''),
                      )
                    : null,
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Status chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _StatusChip('Semua', 'all'),
                _StatusChip('Hadir', 'present', color: AppColors.emerald500),
                _StatusChip('Terlambat', 'late', color: AppColors.amber500),
                _StatusChip('Tidak Hadir', 'absent', color: AppColors.rose500),
                _StatusChip('Pending', 'pending', color: AppColors.sky500),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // View mode toggle + course filter
          Row(
            children: [
              // View toggle
              Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _ViewToggle(Icons.list, 'list'),
                    _ViewToggle(Icons.calendar_month, 'calendar'),
                    _ViewToggle(Icons.timeline, 'timeline'),
                  ],
                ),
              ),
              const Spacer(),
              if (_hasActiveFilters)
                TextButton.icon(
                  onPressed: onReset,
                  icon: const Icon(Icons.close, size: 14),
                  label: const Text('Reset', style: TextStyle(fontSize: 12)),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.textSecondary,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                  ),
                ),
            ],
          ),
          // Active filter chips
          if (_hasActiveFilters) ...[
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: [
                Text('Filter: ', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                if (state.searchQuery.isNotEmpty)
                  _FilterChip('"${state.searchQuery}"'),
                if (state.statusFilter != 'all')
                  _FilterChip(_statusLabel(state.statusFilter)),
                if (state.courseFilter != 'all')
                  _FilterChip(state.courses
                      .firstWhere(
                        (c) => c.id.toString() == state.courseFilter,
                        orElse: () => const CourseEntity(id: 0, name: 'MK'),
                      )
                      .name),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _StatusChip(String label, String value, {Color? color}) {
    final selected = state.statusFilter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () => onStatusChanged(value),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            gradient: selected
                ? LinearGradient(colors: [
                    AppColors.indigo500,
                    AppColors.purple600,
                  ])
                : null,
            color: selected ? null : (color?.withValues(alpha: 0.1) ?? Colors.white.withValues(alpha: 0.4)),
            borderRadius: BorderRadius.circular(20),
            border: selected ? null : Border.all(color: (color ?? AppColors.textSecondary).withValues(alpha: 0.3)),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: selected ? Colors.white : (color ?? AppColors.textSecondary),
            ),
          ),
        ),
      ),
    );
  }

  Widget _ViewToggle(IconData icon, String mode) {
    final selected = state.viewMode == mode;
    return InkWell(
      borderRadius: BorderRadius.circular(10),
      onTap: () => onViewModeChanged(mode),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          gradient: selected
              ? const LinearGradient(colors: [AppColors.indigo500, AppColors.purple600])
              : null,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, size: 18, color: selected ? Colors.white : AppColors.textSecondary),
      ),
    );
  }

  Widget _FilterChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.indigo500.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(label, style: TextStyle(fontSize: 11, color: AppColors.indigo600)),
    );
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'present': return 'Hadir';
      case 'absent': return 'Tidak Hadir';
      case 'late': return 'Terlambat';
      case 'pending': return 'Pending';
      default: return status;
    }
  }
}
