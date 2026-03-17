import 'package:flutter/material.dart';

import '../../../attendance/domain/entities/attendance.dart';
import '../../../attendance/presentation/widgets/attendance_list_item.dart';

class RecentAttendanceList extends StatelessWidget {
  const RecentAttendanceList({super.key, required this.attendances});

  final List<AttendanceEntity> attendances;

  @override
  Widget build(BuildContext context) {
    if (attendances.isEmpty) {
      return const Text('Belum ada riwayat absensi.');
    }

    return Column(
      children: attendances
          .map((attendance) => AttendanceListItem(attendance: attendance))
          .toList(),
    );
  }
}
