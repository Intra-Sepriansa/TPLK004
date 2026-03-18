import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../attendance/domain/entities/active_session.dart';
import '../../../attendance/presentation/providers/attendance_provider.dart';
import '../providers/scan_notifier.dart';

class ActiveSessionsListWidget extends ConsumerWidget {
  const ActiveSessionsListWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeSessionsAsync = ref.watch(activeSessionsProvider);

    return activeSessionsAsync.when(
      data: (sessions) {
        return _SessionContextCard(
          sessions: sessions,
          isLoading: false,
        );
      },
      loading: () => const _SessionContextCard(sessions: [], isLoading: true),
      error: (error, stack) {
        debugPrint('ActiveSessionsError: $error');
        return const _SessionContextCard(sessions: [], isLoading: false);
      },
    );
  }
}

class _SessionContextCard extends StatelessWidget {
  final List<ActiveSessionEntity> sessions;
  final bool isLoading;

  const _SessionContextCard({required this.sessions, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    final isEmpty = sessions.isEmpty && !isLoading;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Ikon dalam kotak rounded
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Center(
                  child: Icon(
                    Icons.qr_code_scanner_rounded, 
                    color: AppColors.primary,
                    size: 24,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              // Teks Header
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SESSION CONTEXT',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2,
                        color: Colors.grey[500],
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      isEmpty ? 'Belum ada sesi aktif' : 'Sesi Aktif Saat Ini',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      isEmpty 
                        ? 'Saat dosen membuka absensi, daftar matkul aktif akan muncul di kartu ini.'
                        : 'Pilih matkul di bawah ini untuk melihat jadwal sesinya.',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[600],
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          if (isLoading)
            const _LoadingSkeleton()
          else if (isEmpty)
            // Tampilan Kosong (Empty State)
            Container(
              width: double.infinity,
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              decoration: BoxDecoration(
                color: Colors.grey[50], // Abu-abu sangat terang
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Icon(
                        Icons.schedule_rounded,
                        color: Colors.grey[400],
                        size: 36,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Belum Ada Absensi Aktif',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Mahasiswa bisa kembali lagi saat\ndosen sudah membuka QR untuk mata\nkuliah yang sedang berjalan.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey[600],
                      height: 1.6,
                    ),
                  ),
                ],
              ),
            )
          else
            // Daftar Sesi Horizontal
            SizedBox(
              height: 160,
              child: ListView.separated(
                clipBehavior: Clip.none,
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.only(right: 4),
                itemCount: sessions.length,
                separatorBuilder: (context, index) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  return _ActiveSessionCard(session: sessions[index]);
                },
              ),
            ),
        ],
      ),
    );
  }
}

class _ActiveSessionCard extends ConsumerWidget {
  final ActiveSessionEntity session;

  const _ActiveSessionCard({required this.session});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isSubmitted = session.alreadySubmitted;
    final themeColor = isSubmitted ? AppColors.emerald500 : AppColors.primary;
    final bgColor = isSubmitted ? AppColors.emerald500.withOpacity(0.1) : AppColors.primary.withOpacity(0.1);

    return Container(
      width: 260,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: themeColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: isSubmitted
              ? null
              : () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Arahkan kamera ke QR kode untuk ${session.courseName}'),
                      behavior: SnackBarBehavior.floating,
                      backgroundColor: AppColors.textPrimary,
                    ),
                  );
                },
          child: Padding(
            padding: EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: bgColor,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Pertemuan ${session.meetingNumber}',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: themeColor,
                        ),
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.divider.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.schedule, size: 10, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            '${session.startAt ?? '-'} - ${session.endAt ?? '-'}',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  session.courseName,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  session.dosenName ?? 'Dosen',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const Spacer(),
                Row(
                  children: [
                    Icon(
                      isSubmitted ? Icons.check_circle : Icons.qr_code_scanner,
                      size: 14,
                      color: isSubmitted ? AppColors.emerald500 : AppColors.textSecondary,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        isSubmitted
                            ? (session.attendanceLabel ?? 'Sudah Hadir')
                            : 'Belum Absen',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isSubmitted ? AppColors.emerald500 : AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _LoadingSkeleton extends StatelessWidget {
  const _LoadingSkeleton();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 160,
      child: ListView.separated(
        clipBehavior: Clip.none,
        scrollDirection: Axis.horizontal,
        itemCount: 2,
        separatorBuilder: (context, index) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          return Container(
            width: 260,
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(width: 80, height: 20, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(4))),
                    const Spacer(),
                    Container(width: 60, height: 16, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(4))),
                  ],
                ),
                const SizedBox(height: 16),
                Container(width: 180, height: 18, color: Colors.grey[300]),
                const SizedBox(height: 8),
                Container(width: 120, height: 14, color: Colors.grey[300]),
                const Spacer(),
                Container(width: 100, height: 14, color: Colors.grey[300]),
              ],
            ),
          );
        },
      ),
    );
  }
}
