import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/attendance.dart';

class AttendanceListItem extends StatelessWidget {
  const AttendanceListItem({
    super.key,
    required this.attendance,
    this.onTap,
  });

  final AttendanceEntity attendance;
  final VoidCallback? onTap;

  static const _statusConfig = {
    'present': ('Hadir', Color(0xFF10B981), Icons.check_circle),
    'hadir': ('Hadir', Color(0xFF10B981), Icons.check_circle),
    'absent': ('Tidak Hadir', Color(0xFFF43F5E), Icons.cancel),
    'alpha': ('Tidak Hadir', Color(0xFFF43F5E), Icons.cancel),
    'late': ('Terlambat', Color(0xFFF59E0B), Icons.access_time),
    'terlambat': ('Terlambat', Color(0xFFF59E0B), Icons.access_time),
    'pending': ('Pending', Color(0xFF0EA5E9), Icons.info_outline),
    'rejected': ('Ditolak', Color(0xFFF43F5E), Icons.cancel),
  };

  @override
  Widget build(BuildContext context) {
    final config = _statusConfig[attendance.status] ??
        ('Unknown', AppColors.textSecondary, Icons.help_outline);
    final label = config.$1;
    final color = config.$2;
    final icon = config.$3;

    String dateFormatted = attendance.date;
    try {
      final dt = DateTime.parse(attendance.date);
      dateFormatted = DateFormat('EEE, d MMM', 'id_ID').format(dt);
    } catch (_) {}

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.6),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            // Status Icon
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 20, color: color),
            ),
            const SizedBox(width: 12),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    attendance.mataKuliah,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      if (attendance.meetingNumber != null) ...[
                        Text(
                          'Pertemuan ${attendance.meetingNumber}',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                        Text(' • ',
                            style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      ],
                      Text(
                        dateFormatted,
                        style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          label,
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color),
                        ),
                      ),
                      if (attendance.checkIn != null) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.access_time, size: 10, color: AppColors.textSecondary),
                              const SizedBox(width: 3),
                              Text(
                                attendance.checkIn!,
                                style: TextStyle(fontSize: 10, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ],
                      if (attendance.selfieUrl != null) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.camera_alt, size: 10, color: AppColors.textSecondary),
                              const SizedBox(width: 3),
                              Text(
                                'Bukti',
                                style: TextStyle(fontSize: 10, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, size: 20, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }
}
