import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/tugas_data.dart';

class TugasFilterWidget extends StatelessWidget {
  const TugasFilterWidget({
    super.key,
    required this.isKelompok,
    required this.courses,
    required this.controller,
    required this.searchQuery,
    required this.selectedCourseId,
    required this.statusFilter,
    required this.onSearchChanged,
    required this.onCourseChanged,
    required this.onStatusChanged,
  });

  final bool isKelompok;
  final List<TugasCourse> courses;
  final TextEditingController controller;
  final String searchQuery;
  final int? selectedCourseId;
  final String statusFilter;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<int?> onCourseChanged;
  final ValueChanged<String> onStatusChanged;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final statusOptions = isKelompok
        ? const [
            _FilterOption('all', 'Semua'),
            _FilterOption('not_joined', 'Belum Gabung'),
            _FilterOption('joined', 'Aktif'),
            _FilterOption('submitted', 'Selesai'),
          ]
        : const [
            _FilterOption('all', 'Semua'),
            _FilterOption('upcoming', 'Mendatang'),
            _FilterOption('overdue', 'Terlewat'),
          ];

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1F2937) : Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isDark ? Colors.white10 : Colors.black12,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.06),
                  blurRadius: 14,
                  offset: Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, color: AppColors.indigo600),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    onChanged: onSearchChanged,
                    controller: controller,
                    style: TextStyle(fontSize: 13),
                    decoration: const InputDecoration(
                      hintText: 'Cari judul tugas atau mata kuliah...',
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF111827) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<int?>(
                isExpanded: true,
                value: selectedCourseId,
                dropdownColor: isDark ? const Color(0xFF0F172A) : Colors.white,
                icon: const Icon(Icons.keyboard_arrow_down_rounded),
                hint: const Text('Semua Mata Kuliah', style: TextStyle(fontSize: 12)),
                items: [
                  const DropdownMenuItem<int?>(
                    value: null,
                    child: Text('Semua Mata Kuliah', style: TextStyle(fontSize: 12)),
                  ),
                  ...courses.map((course) => DropdownMenuItem<int?>(
                        value: course.id,
                        child: Text(course.nama, style: TextStyle(fontSize: 12)),
                      )),
                ],
                onChanged: onCourseChanged,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: statusOptions.map((option) {
              final isActive = option.value == statusFilter;
              return GestureDetector(
                onTap: () => onStatusChanged(option.value),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeInOut,
                  padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.indigo600 : (isDark ? const Color(0xFF111827) : Colors.white),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: isActive ? AppColors.indigo600 : (isDark ? Colors.white12 : Colors.black12),
                    ),
                    boxShadow: isActive
                        ? [
                            BoxShadow(
                              color: AppColors.indigo600.withOpacity(0.3),
                              blurRadius: 12,
                              offset: Offset(0, 6),
                            ),
                          ]
                        : null,
                  ),
                  child: Text(
                    option.label,
                    style: TextStyle(
                      color: isActive ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _FilterOption {
  final String value;
  final String label;

  const _FilterOption(this.value, this.label);
}
