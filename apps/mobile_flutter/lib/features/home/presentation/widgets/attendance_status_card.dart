import 'package:flutter/material.dart';

import '../../domain/entities/today_attendance.dart';

class AttendanceStatusCard extends StatelessWidget {
  const AttendanceStatusCard({super.key, required this.todayAttendance});

  final TodayAttendanceEntity? todayAttendance;

  @override
  Widget build(BuildContext context) {
    if (todayAttendance == null) {
      return Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: const Padding(
          padding: EdgeInsets.all(16),
          child: Text('Belum ada absensi hari ini.'),
        ),
      );
    }

    final status = todayAttendance!.status;
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Status Absensi Hari Ini',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text('Status: $status'),
            if (todayAttendance!.checkIn != null)
              Text('Check-in: ${todayAttendance!.checkIn}'),
            if (todayAttendance!.checkOut != null)
              Text('Check-out: ${todayAttendance!.checkOut}'),
            const SizedBox(height: 8),
            if (todayAttendance!.mataKuliah != null)
              Text(todayAttendance!.mataKuliah!,
                  style: TextStyle(fontWeight: FontWeight.w600)),
            if (todayAttendance!.dosen != null)
              Text(todayAttendance!.dosen!),
            if (todayAttendance!.room != null)
              Text('Ruangan: ${todayAttendance!.room}'),
          ],
        ),
      ),
    );
  }
}
