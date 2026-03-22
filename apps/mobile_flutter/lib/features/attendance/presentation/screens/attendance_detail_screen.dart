import 'dart:ui';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:http/http.dart' as http;

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/attendance.dart';

/// Full-page attendance detail screen — header matching AbsensiHeaderWidget style
class AttendanceDetailScreen extends StatefulWidget {
  final AttendanceEntity record;

  const AttendanceDetailScreen({super.key, required this.record});

  @override
  State<AttendanceDetailScreen> createState() => _AttendanceDetailScreenState();
}

class _AttendanceDetailScreenState extends State<AttendanceDetailScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _gradientController;
  bool _selfieFullscreen = false;
  bool _isExporting = false;

  static const _statusConfig = {
    'present': ('Hadir', Color(0xFF10B981), Color(0xFF0D9488), Icons.check_circle_rounded),
    'hadir': ('Hadir', Color(0xFF10B981), Color(0xFF0D9488), Icons.check_circle_rounded),
    'absent': ('Tidak Hadir', Color(0xFFF43F5E), Color(0xFFE11D48), Icons.cancel_rounded),
    'alpha': ('Tidak Hadir', Color(0xFFF43F5E), Color(0xFFE11D48), Icons.cancel_rounded),
    'late': ('Terlambat', Color(0xFFF59E0B), Color(0xFFEA580C), Icons.access_time_filled_rounded),
    'terlambat': ('Terlambat', Color(0xFFF59E0B), Color(0xFFEA580C), Icons.access_time_filled_rounded),
    'pending': ('Pending', Color(0xFF0EA5E9), Color(0xFF6366F1), Icons.hourglass_top_rounded),
    'rejected': ('Ditolak', Color(0xFFF43F5E), Color(0xFFE11D48), Icons.error_rounded),
  };

  static const _selfieStatusConfig = {
    'approved': ('Terverifikasi', Color(0xFF10B981), Icons.verified_rounded),
    'pending': ('Menunggu Verifikasi', Color(0xFFF59E0B), Icons.hourglass_top_rounded),
    'rejected': ('Ditolak', Color(0xFFF43F5E), Icons.cancel_rounded),
  };

  @override
  void initState() {
    super.initState();
    _gradientController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _gradientController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final record = widget.record;
    final sc = _statusConfig[record.status] ??
        ('Unknown', AppColors.textSecondary, AppColors.textSecondary, Icons.help_rounded);
    final ss = record.selfieStatus != null ? _selfieStatusConfig[record.selfieStatus] : null;

    String dateFormatted = record.date;
    try {
      final dt = DateTime.parse(record.date);
      dateFormatted = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(dt);
    } catch (_) {}

    String timeFormatted = record.checkIn ?? '-';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // ═══ HEADER — matching AbsensiHeaderWidget style ═══
              SliverToBoxAdapter(
                child: _buildHeader(record, sc, dateFormatted, timeFormatted),
              ),

              // ═══ CONTENT ═══
              SliverPadding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    _buildSelfieCard(record, ss),
                    const SizedBox(height: 16),
                    _buildLocationCard(record),
                    const SizedBox(height: 16),
                    _buildQuickDetails(record, sc, dateFormatted, timeFormatted),
                    const SizedBox(height: 16),
                    _buildSessionInfo(record),
                    const SizedBox(height: 16),
                    if (record.note != null && record.note!.isNotEmpty)
                      _buildNotesCard(record),
                    const SizedBox(height: 80),
                  ]),
                ),
              ),
            ],
          ),

          // Fullscreen selfie overlay
          if (_selfieFullscreen && record.selfieUrl != null)
            _buildFullscreenSelfie(record),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // HEADER — Same style as AbsensiHeaderWidget
  // Blue gradient + batik pattern + rounded bottom
  // ═══════════════════════════════════════════════════════
  Widget _buildHeader(
    AttendanceEntity record,
    (String, Color, Color, IconData) sc,
    String dateFormatted,
    String timeFormatted,
  ) {
    return Container(
      clipBehavior: Clip.antiAlias,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primaryDark,
            AppColors.primary,
            AppColors.primaryLight.withOpacity(0.8),
          ],
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Batik Pattern Overlay
          Positioned.fill(
            child: Opacity(
              opacity: 0.06,
              child: Transform.scale(
                scale: 1.1,
                child: Image.asset(
                  'assets/images/batik_pattern.png',
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                ),
              ),
            ),
          ),
          // Content
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Top Row: Back + Title ──
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: const Padding(
                          padding: EdgeInsets.all(8.0),
                          child: Icon(Icons.arrow_back_rounded, color: Colors.white, size: 26),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Detail Kehadiran',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              record.mataKuliah,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      // Status Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: sc.$2.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withOpacity(0.2)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(sc.$4, size: 16, color: Colors.white),
                            const SizedBox(width: 6),
                            Text(
                              sc.$1,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // ── Description ──
                  Text(
                    'Pertemuan #${record.meetingNumber ?? "?"} — $dateFormatted',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.85),
                      fontSize: 13,
                      height: 1.5,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ── Action Buttons ──
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildActionButton(
                        icon: Icons.picture_as_pdf_rounded,
                        label: _isExporting ? 'Mengexport...' : 'Export PDF',
                        onTap: _isExporting ? null : _exportPdf,
                      ),
                      _buildActionButton(
                        icon: Icons.refresh_rounded,
                        label: 'Refresh',
                        onTap: () {
                          setState(() {});
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    VoidCallback? onTap,
  }) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: Colors.white),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // PDF EXPORT
  // ═══════════════════════════════════════════════════════
  Future<void> _exportPdf() async {
    setState(() => _isExporting = true);

    try {
      final record = widget.record;
      final sc = _statusConfig[record.status] ??
          ('Unknown', AppColors.textSecondary, AppColors.textSecondary, Icons.help_rounded);

      String dateFormatted = record.date;
      try {
        final dt = DateTime.parse(record.date);
        dateFormatted = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(dt);
      } catch (_) {}

      String timeFormatted = record.checkIn ?? '-';

      // Try to load selfie image
      Uint8List? selfieBytes;
      if (record.selfieUrl != null && record.selfieUrl!.isNotEmpty) {
        try {
          final response = await http.get(Uri.parse(record.selfieUrl!));
          if (response.statusCode == 200) {
            selfieBytes = response.bodyBytes;
          }
        } catch (_) {}
      }

      final pdf = pw.Document();
      final now = DateTime.now();
      final printTime = DateFormat('dd MMMM yyyy, HH:mm', 'id_ID').format(now);
      final printDateOnly = DateFormat('dd MMMM yyyy', 'id_ID').format(now);

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(24),
          build: (pw.Context ctx) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                // ── Title Header ──
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
                      pw.Text(
                        'LAPORAN DETAIL KEHADIRAN',
                        style: pw.TextStyle(
                          fontSize: 18,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.white,
                        ),
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text(
                        'Universitas Pamulang • Yayasan Sasmita Jaya',
                        style: const pw.TextStyle(
                          fontSize: 11,
                          color: PdfColors.white,
                        ),
                      ),
                      pw.SizedBox(height: 12),
                      pw.Container(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: pw.BoxDecoration(
                          color: PdfColors.white,
                          borderRadius: pw.BorderRadius.circular(20),
                        ),
                        child: pw.Text(
                          'Status: ${sc.$1}',
                          style: pw.TextStyle(
                            fontSize: 12,
                            fontWeight: pw.FontWeight.bold,
                            color: PdfColor.fromHex('#1976D2'),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                pw.SizedBox(height: 16),

                // ── Meta Bar ──
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
                      pw.Text('ID: ABS-${record.id}', style: const pw.TextStyle(fontSize: 10)),
                      pw.Text('Dicetak: $printTime', style: const pw.TextStyle(fontSize: 10)),
                    ],
                  ),
                ),

                pw.SizedBox(height: 16),

                // ── Main Content Grid ──
                pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    // Left Column: Data
                    pw.Expanded(
                      flex: 3,
                      child: pw.Container(
                        padding: const pw.EdgeInsets.all(16),
                        decoration: pw.BoxDecoration(
                          borderRadius: pw.BorderRadius.circular(8),
                          border: pw.Border.all(color: PdfColor.fromHex('#E2E8F0')),
                        ),
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text(
                              'DATA KEHADIRAN',
                              style: pw.TextStyle(
                                fontSize: 11,
                                fontWeight: pw.FontWeight.bold,
                                letterSpacing: 0.4,
                              ),
                            ),
                            pw.SizedBox(height: 10),
                            _pdfRow('Mata Kuliah', record.mataKuliah),
                            _pdfRow('Pertemuan', '#${record.meetingNumber ?? "?"}'),
                            _pdfRow('Status', sc.$1),
                            _pdfRow('Tanggal', dateFormatted),
                            _pdfRow('Waktu Check-in', timeFormatted),
                            _pdfRow(
                              'Jarak Lokasi',
                              record.distance != null
                                  ? '${record.distance!.round()} meter'
                                  : 'Tidak tersedia',
                            ),
                            _pdfRow(
                              'Koordinat',
                              record.latitude != null && record.longitude != null
                                  ? '${record.latitude!.toStringAsFixed(6)}, ${record.longitude!.toStringAsFixed(6)}'
                                  : 'Tidak tersedia',
                            ),
                            if (record.latitude != null && record.longitude != null)
                              _pdfRow(
                                'Lokasi Maps',
                                'https://www.google.com/maps?q=${record.latitude},${record.longitude}',
                              ),
                            _pdfRow(
                              'Status Selfie',
                              record.selfieStatus == 'approved'
                                  ? 'Terverifikasi'
                                  : record.selfieStatus == 'pending'
                                      ? 'Menunggu Verifikasi'
                                      : record.selfieStatus ?? 'Tidak tersedia',
                            ),
                          ],
                        ),
                      ),
                    ),

                    pw.SizedBox(width: 12),

                    // Right Column: Selfie
                    pw.Expanded(
                      flex: 2,
                      child: pw.Column(
                        children: [
                          pw.Container(
                            padding: const pw.EdgeInsets.all(12),
                            decoration: pw.BoxDecoration(
                              borderRadius: pw.BorderRadius.circular(8),
                              border: pw.Border.all(color: PdfColor.fromHex('#E2E8F0')),
                            ),
                            child: pw.Column(
                              crossAxisAlignment: pw.CrossAxisAlignment.start,
                              children: [
                                pw.Text(
                                  'BUKTI SELFIE',
                                  style: pw.TextStyle(
                                    fontSize: 11,
                                    fontWeight: pw.FontWeight.bold,
                                    letterSpacing: 0.4,
                                  ),
                                ),
                                pw.SizedBox(height: 10),
                                if (selfieBytes != null)
                                  pw.Container(
                                    height: 180,
                                    width: double.infinity,
                                    decoration: pw.BoxDecoration(
                                      borderRadius: pw.BorderRadius.circular(6),
                                      border: pw.Border.all(color: PdfColor.fromHex('#E2E8F0')),
                                    ),
                                    child: pw.ClipRRect(
                                      verticalRadius: 6,
                                      horizontalRadius: 6,
                                      child: pw.Image(
                                        pw.MemoryImage(selfieBytes),
                                        fit: pw.BoxFit.cover,
                                      ),
                                    ),
                                  )
                                else
                                  pw.Container(
                                    height: 180,
                                    width: double.infinity,
                                    decoration: pw.BoxDecoration(
                                      color: PdfColor.fromHex('#F8FAFC'),
                                      borderRadius: pw.BorderRadius.circular(6),
                                      border: pw.Border.all(color: PdfColor.fromHex('#E2E8F0')),
                                    ),
                                    child: pw.Center(
                                      child: pw.Text(
                                        'Bukti selfie tidak tersedia',
                                        style: const pw.TextStyle(
                                          fontSize: 9,
                                          color: PdfColors.grey500,
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                pw.SizedBox(height: 16),

                // ── Catatan ──
                pw.Container(
                  width: double.infinity,
                  padding: const pw.EdgeInsets.all(12),
                  decoration: pw.BoxDecoration(
                    borderRadius: pw.BorderRadius.circular(8),
                    border: pw.Border.all(color: PdfColor.fromHex('#E2E8F0')),
                  ),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        'CATATAN',
                        style: pw.TextStyle(
                          fontSize: 11,
                          fontWeight: pw.FontWeight.bold,
                          letterSpacing: 0.4,
                        ),
                      ),
                      pw.SizedBox(height: 6),
                      pw.Text(
                        record.note ?? 'Tidak ada catatan tambahan.',
                        style: const pw.TextStyle(fontSize: 10),
                      ),
                    ],
                  ),
                ),

                pw.Spacer(),

                // ── Footer — Signature ──
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      children: [
                        pw.Text('Mengetahui,', style: const pw.TextStyle(fontSize: 10)),
                        pw.Text('Petugas Akademik', style: const pw.TextStyle(fontSize: 10)),
                        pw.SizedBox(height: 40),
                        pw.Container(
                          width: 120,
                          decoration: const pw.BoxDecoration(
                            border: pw.Border(
                              bottom: pw.BorderSide(color: PdfColors.grey800),
                            ),
                          ),
                        ),
                        pw.SizedBox(height: 4),
                        pw.Text('(................................)', style: const pw.TextStyle(fontSize: 9)),
                      ],
                    ),
                    pw.Column(
                      children: [
                        pw.Text('Tangerang Selatan, $printDateOnly', style: const pw.TextStyle(fontSize: 10)),
                        pw.Text('Mahasiswa', style: const pw.TextStyle(fontSize: 10)),
                        pw.SizedBox(height: 40),
                        pw.Container(
                          width: 120,
                          decoration: const pw.BoxDecoration(
                            border: pw.Border(
                              bottom: pw.BorderSide(color: PdfColors.grey800),
                            ),
                          ),
                        ),
                        pw.SizedBox(height: 4),
                        pw.Text('(................................)', style: const pw.TextStyle(fontSize: 9)),
                      ],
                    ),
                  ],
                ),

                pw.SizedBox(height: 8),
                pw.Center(
                  child: pw.Text(
                    'Dokumen ini dibuat otomatis dari Sistem Absensi Mahasiswa UNPAM',
                    style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey500),
                  ),
                ),
              ],
            );
          },
        ),
      );

      // Show print/share dialog
      if (mounted) {
        await Printing.layoutPdf(
          onLayout: (PdfPageFormat format) async => pdf.save(),
          name: 'Kehadiran_${record.mataKuliah}_${record.date}',
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal export PDF: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isExporting = false);
      }
    }
  }

  pw.Widget _pdfRow(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 6),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(
            width: 100,
            child: pw.Text(
              label,
              style: pw.TextStyle(
                fontSize: 10,
                fontWeight: pw.FontWeight.bold,
                color: PdfColor.fromHex('#475569'),
              ),
            ),
          ),
          pw.SizedBox(width: 8),
          pw.Expanded(
            child: pw.Text(
              value,
              style: pw.TextStyle(
                fontSize: 10,
                fontWeight: pw.FontWeight.bold,
                color: PdfColor.fromHex('#0F172A'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // SELFIE VIEWER
  // ═══════════════════════════════════════════════════════
  Widget _buildSelfieCard(AttendanceEntity record, (String, Color, IconData)? ss) {
    return _GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader(
            icon: Icons.photo_camera_rounded,
            iconColor: AppColors.emerald500,
            title: 'Bukti Selfie',
            subtitle: ss?.$1 ?? 'Tidak ada',
          ),
          const SizedBox(height: 16),

          GestureDetector(
            onTap: record.selfieUrl != null
                ? () => setState(() => _selfieFullscreen = true)
                : null,
            child: Container(
              height: 280,
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.black.withOpacity(0.05)),
              ),
              clipBehavior: Clip.antiAlias,
              child: record.selfieUrl != null
                  ? Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.network(
                          record.selfieUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _buildNoSelfie(),
                        ),
                        if (ss != null)
                          Positioned(
                            top: 12,
                            right: 12,
                            child: Container(
                              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: ss.$2.withOpacity(0.9),
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [
                                  BoxShadow(
                                    color: ss.$2.withOpacity(0.3),
                                    blurRadius: 10,
                                    offset: Offset(0, 4),
                                  )
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(ss.$3, size: 14, color: Colors.white),
                                  const SizedBox(width: 6),
                                  Text(
                                    ss.$1,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        Positioned(
                          bottom: 12,
                          right: 12,
                          child: Container(
                            padding: EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.4),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.fullscreen_rounded, size: 20, color: Colors.white),
                          ),
                        ),
                      ],
                    )
                  : _buildNoSelfie(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoSelfie() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.image_not_supported_rounded,
              size: 48, color: AppColors.textSecondary.withOpacity(0.2)),
          const SizedBox(height: 12),
          Text(
            'Tidak ada bukti selfie',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary.withOpacity(0.5),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // LOCATION CARD
  // ═══════════════════════════════════════════════════════
  Widget _buildLocationCard(AttendanceEntity record) {
    final hasCoords = record.latitude != null && record.longitude != null;
    return _GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader(
            icon: Icons.location_on_rounded,
            iconColor: AppColors.sky500,
            title: 'Lokasi Absen',
            subtitle: record.distance != null
                ? 'Jarak: ${record.distance!.round()} meter dari zona'
                : 'Jarak tidak tersedia',
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: _MetricTile(
                  label: 'Jarak',
                  value: record.distance != null ? '${record.distance!.round()}m' : '–',
                  color: AppColors.sky500,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _MetricTile(
                  label: 'Latitude',
                  value: record.latitude != null ? record.latitude!.toStringAsFixed(6) : '–',
                  color: AppColors.emerald500,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _MetricTile(
                  label: 'Longitude',
                  value: record.longitude != null ? record.longitude!.toStringAsFixed(6) : '–',
                  color: AppColors.violet500,
                ),
              ),
            ],
          ),

          if (hasCoords) ...[
            const SizedBox(height: 12),
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () {},
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.sky500.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.sky500.withOpacity(0.2)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.map_rounded, size: 16, color: AppColors.sky500),
                      const SizedBox(width: 8),
                      Text(
                        'Lihat di Google Maps',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.sky500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // QUICK DETAILS CARD
  // ═══════════════════════════════════════════════════════
  Widget _buildQuickDetails(
    AttendanceEntity record,
    (String, Color, Color, IconData) sc,
    String dateFormatted,
    String timeFormatted,
  ) {
    return _GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader(
            icon: Icons.info_rounded,
            iconColor: AppColors.indigo500,
            title: 'Detail Verifikasi',
            subtitle: 'Ringkasan data kehadiran',
          ),
          const SizedBox(height: 16),
          _InfoRow(
            icon: Icons.calendar_today_rounded,
            color: AppColors.sky500,
            label: 'Tanggal',
            value: dateFormatted,
          ),
          const SizedBox(height: 10),
          _InfoRow(
            icon: Icons.access_time_filled_rounded,
            color: AppColors.emerald500,
            label: 'Waktu Check-in',
            value: timeFormatted,
          ),
          const SizedBox(height: 10),
          _InfoRow(
            icon: Icons.location_on_rounded,
            color: AppColors.violet500,
            label: 'Jarak Lokasi',
            value: record.distance != null
                ? '${record.distance!.round()} meter'
                : 'Tidak tersedia',
          ),
          const SizedBox(height: 10),
          _InfoRow(
            icon: Icons.verified_rounded,
            color: sc.$2,
            label: 'Status',
            value: sc.$1,
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // SESSION INFO CARD
  // ═══════════════════════════════════════════════════════
  Widget _buildSessionInfo(AttendanceEntity record) {
    return _GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader(
            icon: Icons.school_rounded,
            iconColor: AppColors.sky400,
            title: 'Info Sesi',
            subtitle: 'Detail pertemuan kuliah',
          ),
          const SizedBox(height: 16),
          _SessionRow(label: 'Mata Kuliah', value: record.mataKuliah),
          _SessionRow(label: 'Pertemuan', value: '#${record.meetingNumber ?? "?"}'),
          if (record.courseId != null)
            _SessionRow(label: 'ID Matakuliah', value: '${record.courseId}'),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // NOTES CARD
  // ═══════════════════════════════════════════════════════
  Widget _buildNotesCard(AttendanceEntity record) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.amber500.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.amber500.withOpacity(0.25),
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.amber500.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.amber500.withOpacity(0.2)),
                ),
                child: const Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.amber600),
              ),
              const SizedBox(width: 12),
              const Text(
                'Catatan',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            record.note!,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textPrimary,
              height: 1.6,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // FULLSCREEN SELFIE OVERLAY
  // ═══════════════════════════════════════════════════════
  Widget _buildFullscreenSelfie(AttendanceEntity record) {
    return GestureDetector(
      onTap: () => setState(() => _selfieFullscreen = false),
      child: Container(
        color: Colors.black.withOpacity(0.9),
        child: SafeArea(
          child: Stack(
            children: [
              Center(
                child: InteractiveViewer(
                  minScale: 0.5,
                  maxScale: 4.0,
                  child: Image.network(
                    record.selfieUrl!,
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => const Center(
                      child: Icon(Icons.broken_image_rounded, size: 60, color: Colors.white54),
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: GestureDetector(
                  onTap: () => setState(() => _selfieFullscreen = false),
                  child: Container(
                    padding: EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.close_rounded, size: 24, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════
// REUSABLE WIDGETS
// ═══════════════════════════════════════════════════════

class _GlassCard extends StatelessWidget {
  final Widget child;
  const _GlassCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.8),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: Offset(0, 8),
          )
        ],
      ),
      child: child,
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;

  const _SectionHeader({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: iconColor.withOpacity(0.2)),
          ),
          child: Icon(icon, size: 20, color: iconColor),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _MetricTile extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _MetricTile({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 14),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.color,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withOpacity(0.04),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [color, color.withOpacity(0.7)],
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.25),
                  blurRadius: 8,
                  offset: Offset(0, 4),
                )
              ],
            ),
            child: Icon(icon, size: 20, color: Colors.white),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: color,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SessionRow extends StatelessWidget {
  final String label;
  final String value;

  const _SessionRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
            Flexible(
              child: Text(
                value,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.end,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
