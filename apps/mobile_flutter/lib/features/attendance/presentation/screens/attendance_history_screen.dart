import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../home/data/datasources/home_remote_datasource.dart';
import '../../../../core/di/injection.dart';
import '../providers/attendance_provider.dart';
import '../widgets/riwayat_header_widget.dart';
import '../widgets/attendance_stats_card.dart';
import '../widgets/attendance_chart_widget.dart';
import '../widgets/attendance_filter_bar.dart';
import '../widgets/attendance_list_item.dart';
import '../widgets/attendance_calendar_view.dart';
import '../widgets/attendance_timeline_view.dart';
import '../widgets/ai_insights_widget.dart';
import 'attendance_detail_screen.dart';
import 'rekapan_screen.dart';

class AttendanceHistoryScreen extends ConsumerStatefulWidget {
  const AttendanceHistoryScreen({super.key});

  @override
  ConsumerState<AttendanceHistoryScreen> createState() =>
      _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState
    extends ConsumerState<AttendanceHistoryScreen> {
  final _scrollController = ScrollController();
  String _userName = '';
  String _userNim = '';
  bool _isExporting = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    Future.microtask(() {
      ref.read(attendanceHistoryProvider.notifier).loadInitial();
      _loadProfile();
    });
  }

  Future<void> _loadProfile() async {
    try {
      final homeDs = getIt<HomeRemoteDataSource>();
      final data = await homeDs.fetchFullDashboard();
      if (mounted) {
        setState(() {
          _userName = data.profile.name;
          _userNim = data.profile.nim;
        });
      }
    } catch (_) {
      // Fallback: leave defaults
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(attendanceHistoryProvider.notifier).loadMore();
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  // ── PDF Export for all records ──
  Future<void> _exportAllPdf() async {
    if (_isExporting) return;
    setState(() => _isExporting = true);

    try {
      final state = ref.read(attendanceHistoryProvider);
      final records = state.allItems.isNotEmpty ? state.allItems : state.items;
      final stats = state.stats;

      if (records.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Tidak ada data untuk di-export')),
          );
        }
        return;
      }

      final pdf = pw.Document();
      final now = DateTime.now();
      final printTime = DateFormat('dd MMMM yyyy, HH:mm', 'id_ID').format(now);
      final printDateOnly = DateFormat('dd MMMM yyyy', 'id_ID').format(now);

      // ── Page 1: Summary ──
      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(24),
          build: (pw.Context ctx) {
            // Course summary
            final Map<String, List<int>> courseMap = {};
            for (final r in records) {
              final key = r.mataKuliah;
              courseMap.putIfAbsent(key, () => [0, 0, 0, 0]); // present, late, rejected, total
              courseMap[key]![3]++;
              final s = r.status.toLowerCase();
              if (s == 'present' || s == 'hadir') courseMap[key]![0]++;
              else if (s == 'late' || s == 'terlambat') courseMap[key]![1]++;
              else if (s == 'rejected' || s == 'ditolak') courseMap[key]![2]++;
            }

            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                // Title
                pw.Container(
                  width: double.infinity,
                  padding: const pw.EdgeInsets.all(20),
                  decoration: pw.BoxDecoration(
                    color: PdfColor.fromHex('#1976D2'),
                    borderRadius: pw.BorderRadius.circular(12),
                  ),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('LAPORAN RIWAYAT KEHADIRAN',
                          style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold, color: PdfColors.white)),
                      pw.SizedBox(height: 4),
                      pw.Text('Universitas Pamulang • Yayasan Sasmita Jaya',
                          style: const pw.TextStyle(fontSize: 11, color: PdfColors.white)),
                    ],
                  ),
                ),

                pw.SizedBox(height: 12),

                // Meta
                pw.Container(
                  padding: const pw.EdgeInsets.all(12),
                  decoration: pw.BoxDecoration(
                    color: PdfColor.fromHex('#F1F5F9'),
                    borderRadius: pw.BorderRadius.circular(8),
                    border: pw.Border.all(color: PdfColor.fromHex('#E2E8F0')),
                  ),
                  child: pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text('Nama: $_userName', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
                          pw.Text('NIM: $_userNim', style: const pw.TextStyle(fontSize: 10)),
                        ],
                      ),
                      pw.Text('Dicetak: $printTime', style: const pw.TextStyle(fontSize: 10)),
                    ],
                  ),
                ),

                pw.SizedBox(height: 16),

                // Stats Summary
                if (stats != null) ...[
                  pw.Text('RINGKASAN KEHADIRAN', style: pw.TextStyle(fontSize: 13, fontWeight: pw.FontWeight.bold)),
                  pw.SizedBox(height: 8),
                  pw.Row(
                    children: [
                      _pdfStatBox('Total Sesi', '${stats.total}', '#3B82F6'),
                      pw.SizedBox(width: 8),
                      _pdfStatBox('Hadir', '${stats.present}', '#10B981'),
                      pw.SizedBox(width: 8),
                      _pdfStatBox('Terlambat', '${stats.late}', '#F59E0B'),
                      pw.SizedBox(width: 8),
                      _pdfStatBox('Tidak Hadir', '${stats.absent}', '#F43F5E'),
                      pw.SizedBox(width: 8),
                      _pdfStatBox('Tingkat', '${stats.presentRate.toStringAsFixed(1)}%', '#6366F1'),
                    ],
                  ),
                  pw.SizedBox(height: 16),
                ],

                // Course Summary Table
                pw.Text('RINGKASAN PER MATA KULIAH', style: pw.TextStyle(fontSize: 13, fontWeight: pw.FontWeight.bold)),
                pw.SizedBox(height: 8),
                pw.Table(
                  border: pw.TableBorder.all(color: PdfColor.fromHex('#E2E8F0')),
                  columnWidths: {
                    0: const pw.FlexColumnWidth(3),
                    1: const pw.FlexColumnWidth(1),
                    2: const pw.FlexColumnWidth(1),
                    3: const pw.FlexColumnWidth(1),
                    4: const pw.FlexColumnWidth(1),
                    5: const pw.FlexColumnWidth(1),
                  },
                  children: [
                    pw.TableRow(
                      decoration: pw.BoxDecoration(color: PdfColor.fromHex('#1976D2')),
                      children: ['Mata Kuliah', 'Total', 'Hadir', 'Terlambat', 'Ditolak', 'Rate']
                          .map((h) => pw.Padding(
                                padding: const pw.EdgeInsets.all(6),
                                child: pw.Text(h,
                                    style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: PdfColors.white)),
                              ))
                          .toList(),
                    ),
                    ...courseMap.entries.map((e) {
                      final attended = e.value[0] + e.value[1];
                      final rate = e.value[3] > 0 ? (attended / e.value[3] * 100).toStringAsFixed(0) : '0';
                      return pw.TableRow(
                        children: [
                          e.key,
                          '${e.value[3]}',
                          '${e.value[0]}',
                          '${e.value[1]}',
                          '${e.value[2]}',
                          '$rate%',
                        ]
                            .map((c) => pw.Padding(
                                  padding: const pw.EdgeInsets.all(6),
                                  child: pw.Text(c, style: const pw.TextStyle(fontSize: 9)),
                                ))
                            .toList(),
                      );
                    }),
                  ],
                ),

                pw.Spacer(),

                // Footer
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(children: [
                      pw.Text('Mengetahui,', style: const pw.TextStyle(fontSize: 10)),
                      pw.Text('Petugas Akademik', style: const pw.TextStyle(fontSize: 10)),
                      pw.SizedBox(height: 40),
                      pw.Container(width: 120, decoration: const pw.BoxDecoration(border: pw.Border(bottom: pw.BorderSide(color: PdfColors.grey800)))),
                      pw.SizedBox(height: 4),
                      pw.Text('(................................)', style: const pw.TextStyle(fontSize: 9)),
                    ]),
                    pw.Column(children: [
                      pw.Text('Tangerang Selatan, $printDateOnly', style: const pw.TextStyle(fontSize: 10)),
                      pw.Text('Mahasiswa', style: const pw.TextStyle(fontSize: 10)),
                      pw.SizedBox(height: 40),
                      pw.Container(width: 120, decoration: const pw.BoxDecoration(border: pw.Border(bottom: pw.BorderSide(color: PdfColors.grey800)))),
                      pw.SizedBox(height: 4),
                      pw.Text('(................................)', style: const pw.TextStyle(fontSize: 9)),
                    ]),
                  ],
                ),
                pw.SizedBox(height: 8),
                pw.Center(
                  child: pw.Text('Dokumen ini dibuat otomatis dari Sistem Absensi Mahasiswa UNPAM',
                      style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey500)),
                ),
              ],
            );
          },
        ),
      );

      // ── Page 2+: Detail Table ──
      final int perPage = 25;
      for (int pageIdx = 0; pageIdx < (records.length / perPage).ceil(); pageIdx++) {
        final pageRecords = records.skip(pageIdx * perPage).take(perPage).toList();
        pdf.addPage(
          pw.Page(
            pageFormat: PdfPageFormat.a4.landscape,
            margin: const pw.EdgeInsets.all(20),
            build: (pw.Context ctx) {
              return pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('DETAIL RIWAYAT KEHADIRAN',
                          style: pw.TextStyle(fontSize: 13, fontWeight: pw.FontWeight.bold)),
                      pw.Text('Halaman ${pageIdx + 2}', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600)),
                    ],
                  ),
                  pw.SizedBox(height: 10),
                  pw.Table(
                    border: pw.TableBorder.all(color: PdfColor.fromHex('#E2E8F0')),
                    columnWidths: {
                      0: const pw.FlexColumnWidth(0.5),
                      1: const pw.FlexColumnWidth(1.2),
                      2: const pw.FlexColumnWidth(2.5),
                      3: const pw.FlexColumnWidth(0.8),
                      4: const pw.FlexColumnWidth(1),
                      5: const pw.FlexColumnWidth(0.8),
                      6: const pw.FlexColumnWidth(1),
                    },
                    children: [
                      pw.TableRow(
                        decoration: pw.BoxDecoration(color: PdfColor.fromHex('#1976D2')),
                        children: ['No', 'Tanggal', 'Mata Kuliah', 'Pertemuan', 'Waktu', 'Status', 'Jarak']
                            .map((h) => pw.Padding(
                                  padding: const pw.EdgeInsets.all(5),
                                  child: pw.Text(h,
                                      style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.white)),
                                ))
                            .toList(),
                      ),
                      ...pageRecords.asMap().entries.map((entry) {
                        final i = entry.key;
                        final r = entry.value;
                        String dateStr = r.date;
                        try {
                          dateStr = DateFormat('dd/MM/yyyy').format(DateTime.parse(r.date));
                        } catch (_) {}

                        final statusLabel = _getStatusLabel(r.status);

                        return pw.TableRow(
                          decoration: i % 2 == 1 ? pw.BoxDecoration(color: PdfColor.fromHex('#F8FAFC')) : null,
                          children: [
                            '${pageIdx * perPage + i + 1}',
                            dateStr,
                            r.mataKuliah,
                            '#${r.meetingNumber ?? "?"}',
                            r.checkIn ?? '-',
                            statusLabel,
                            r.distance != null ? '${r.distance!.round()}m' : '-',
                          ]
                              .map((c) => pw.Padding(
                                    padding: const pw.EdgeInsets.all(5),
                                    child: pw.Text(c, style: const pw.TextStyle(fontSize: 8)),
                                  ))
                              .toList(),
                        );
                      }),
                    ],
                  ),
                  pw.Spacer(),
                  pw.Center(
                    child: pw.Text(
                        '$_userName • NIM: $_userNim • Dicetak: $printTime',
                        style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey500)),
                  ),
                ],
              );
            },
          ),
        );
      }

      if (mounted) {
        await Printing.layoutPdf(
          onLayout: (PdfPageFormat format) async => pdf.save(),
          name: 'Riwayat_Kehadiran_${_userName.replaceAll(' ', '_')}_${DateFormat('yyyyMMdd').format(now)}',
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal export PDF: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isExporting = false);
    }
  }

  pw.Widget _pdfStatBox(String label, String value, String hexColor) {
    return pw.Expanded(
      child: pw.Container(
        padding: const pw.EdgeInsets.all(10),
        decoration: pw.BoxDecoration(
          color: PdfColor.fromHex('#F1F5F9'),
          borderRadius: pw.BorderRadius.circular(8),
          border: pw.Border.all(color: PdfColor.fromHex('#E2E8F0')),
        ),
        child: pw.Column(
          children: [
            pw.Text(value, style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold, color: PdfColor.fromHex(hexColor))),
            pw.SizedBox(height: 2),
            pw.Text(label, style: const pw.TextStyle(fontSize: 8)),
          ],
        ),
      ),
    );
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'present':
      case 'hadir':
        return 'Hadir';
      case 'late':
      case 'terlambat':
        return 'Terlambat';
      case 'rejected':
      case 'ditolak':
        return 'Ditolak';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(attendanceHistoryProvider);
    final notifier = ref.read(attendanceHistoryProvider.notifier);
    final records = state.filteredItems;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: () async => notifier.loadInitial(),
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: RiwayatHeaderWidget(
                nama: _userName,
                nim: _userNim,
                onRefresh: () => notifier.loadInitial(),
                onExport: () {
                  if (_isExporting) return;
                  _exportAllPdf();
                },
                onRekapan: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const RekapanScreen()),
                  );
                },
              ),
            ),

            // Content padding
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: 16),

                  // Stats & Streak
                  if (state.stats != null) ...[
                    AttendanceStatsCard(stats: state.stats!),
                    const SizedBox(height: 16),
                  ],

                  // Charts
                  if (state.allItems.isNotEmpty) ...[
                    AttendanceChartWidget(records: state.allItems),
                    const SizedBox(height: 16),
                  ],

                  // Filter Bar
                  AttendanceFilterBar(
                    state: state,
                    onSearchChanged: notifier.setSearchQuery,
                    onStatusChanged: notifier.setStatusFilter,
                    onCourseChanged: notifier.setCourseFilter,
                    onViewModeChanged: notifier.setViewMode,
                    onReset: () {
                      notifier.setSearchQuery('');
                      notifier.setStatusFilter('all');
                      notifier.setCourseFilter('all');
                      notifier.setSelectedDate(null);
                    },
                  ),
                  const SizedBox(height: 16),

                  // View Mode Content
                  if (state.viewMode == 'calendar') ...[
                    AttendanceCalendarView(
                      records: state.allItems.isNotEmpty ? state.allItems : state.items,
                      selectedDate: state.selectedDate,
                      onDateSelected: notifier.setSelectedDate,
                    ),
                    const SizedBox(height: 12),
                    // Filtered list below calendar
                    _buildSectionHeader('Daftar Kehadiran', '${records.length} data'),
                    const SizedBox(height: 8),
                  ],

                  if (state.viewMode == 'timeline') ...[
                    AttendanceTimelineView(records: records),
                  ],
                ]),
              ),
            ),

            // List View (shown in 'list' mode or below calendar)
            if (state.viewMode != 'timeline')
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: state.viewMode == 'list'
                    ? SliverToBoxAdapter(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSectionHeader('Daftar Kehadiran',
                                '${records.length} dari ${state.allItems.isNotEmpty ? state.allItems.length : state.items.length}'),
                            const SizedBox(height: 8),
                          ],
                        ),
                      )
                    : const SliverToBoxAdapter(child: SizedBox.shrink()),
              ),

            if (state.viewMode != 'timeline')
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      if (index >= records.length) {
                        if (state.isLoading) {
                          return const Padding(
                            padding: EdgeInsets.all(20),
                            child: Center(child: CircularProgressIndicator()),
                          );
                        }
                        return null;
                      }
                      final record = records[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: AttendanceListItem(
                          attendance: record,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => AttendanceDetailScreen(record: record),
                            ),
                          ),
                        ),
                      );
                    },
                    childCount: records.length + (state.isLoading ? 1 : 0),
                  ),
                ),
              ),

            // Analytics sections (below list)
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  if (records.isEmpty && !state.isLoading) ...[
                    Container(
                      padding: const EdgeInsets.all(40),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.inbox, size: 56, color: AppColors.textSecondary.withValues(alpha: 0.3)),
                            const SizedBox(height: 12),
                            Text('Belum ada data', style: TextStyle(color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),

                  // AI Insights
                  if (state.allItems.length >= 5) ...[
                    AiInsightsWidget(records: state.allItems),
                    const SizedBox(height: 16),
                  ],

                  // Error
                  if (state.errorMessage != null)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.rose500.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.error, color: AppColors.rose500),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              state.errorMessage!,
                              style: TextStyle(color: AppColors.rose500, fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 80), // bottom safe area
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, String count) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          Text(count, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
