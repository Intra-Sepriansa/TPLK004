import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/empty_state_widget.dart';
import '../../domain/entities/tugas_data.dart';

class TugasListWidget extends StatelessWidget {
  const TugasListWidget({
    super.key,
    required this.items,
  });

  final List<TugasItem> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return EmptyStateWidget.noTugas();
    }
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: items.map((item) => _TugasCard(item: item)).toList(),
      ),
    );
  }
}

class _TugasCard extends StatefulWidget {
  const _TugasCard({required this.item});

  final TugasItem item;

  @override
  State<_TugasCard> createState() => _TugasCardState();
}

class _TugasCardState extends State<_TugasCard> with SingleTickerProviderStateMixin {
  late final AnimationController _tapCtrl;

  @override
  void initState() {
    super.initState();
    _tapCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 150), lowerBound: 0.0, upperBound: 0.02);
  }

  @override
  void dispose() {
    _tapCtrl.dispose();
    super.dispose();
  }

  Color _priorityColor(String p) {
    switch (p) {
      case 'tinggi':
        return const Color(0xFFEF4444);
      case 'sedang':
        return const Color(0xFFF59E0B);
      default:
        return const Color(0xFF10B981);
    }
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final priorityColor = _priorityColor(item.prioritas);
    final borderColor = item.isOverdue
        ? const Color(0xFFEF4444)
        : (!item.isRead ? AppColors.indigo600 : (isDark ? Colors.white12 : Colors.black12));

    return AnimatedBuilder(
      animation: _tapCtrl,
      builder: (context, child) {
        final scale = 1 - _tapCtrl.value;
        return Transform.scale(
          scale: scale,
          child: GestureDetector(
            onTapDown: (_) => _tapCtrl.forward(),
            onTapUp: (_) => _tapCtrl.reverse(),
            onTapCancel: () => _tapCtrl.reverse(),
            onTap: () => context.push('/app/tugas/${item.id}'),
            child: Container(
              margin: EdgeInsets.only(bottom: 14),
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: borderColor, width: item.isOverdue ? 1.4 : 1.0),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.28 : 0.08),
                    blurRadius: 18,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _badge(item.jenis, AppColors.indigo600),
                      const SizedBox(width: 6),
                      _badge(item.prioritas.toUpperCase(), priorityColor),
                      const SizedBox(width: 6),
                      if (item.isOverdue) _badge('OVERDUE', const Color(0xFFEF4444)),
                      if (!item.isRead) _badge('BARU', AppColors.indigo600),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    item.judul,
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.deskripsi,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black54),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _meta(Icons.menu_book_rounded, item.course.nama),
                      const SizedBox(width: 12),
                      _meta(Icons.calendar_today_rounded, item.deadlineDisplay),
                      const Spacer(),
                      _meta(Icons.chat_bubble_rounded, '${item.diskusiCount}'),
                      const SizedBox(width: 8),
                      const Icon(Icons.arrow_forward_rounded, size: 18),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _badge(String label, Color color) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withOpacity(0.6)),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color),
      ),
    );
  }

  Widget _meta(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 14, color: Colors.grey),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
