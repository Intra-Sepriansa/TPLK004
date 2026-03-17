import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/tugas_data.dart';
import '../providers/tugas_provider.dart';

class TugasDetailScreen extends ConsumerStatefulWidget {
  const TugasDetailScreen({super.key, required this.id});

  final int id;

  @override
  ConsumerState<TugasDetailScreen> createState() => _TugasDetailScreenState();
}

class _TugasDetailScreenState extends ConsumerState<TugasDetailScreen> with TickerProviderStateMixin {
  late final TextEditingController _contentCtrl;
  late final TextEditingController _chatCtrl;
  bool _showSubmitPanel = false;

  @override
  void initState() {
    super.initState();
    _contentCtrl = TextEditingController();
    _chatCtrl = TextEditingController();
    Future.microtask(() => ref.read(tugasDetailProvider.notifier).loadDetail(widget.id));
  }

  @override
  void dispose() {
    _contentCtrl.dispose();
    _chatCtrl.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    await ref.read(tugasDetailProvider.notifier).loadDetail(widget.id);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(tugasDetailProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      body: state.isLoading && state.data == null
          ? _buildShimmer(isDark)
          : state.errorMessage != null && state.data == null
              ? _buildError(state.errorMessage!, isDark)
              : state.data != null
                  ? _buildContent(state.data!, isDark, state)
                  : _buildShimmer(isDark),
    );
  }

  Widget _buildContent(TugasDetailData data, bool isDark, TugasDetailState state) {
    final tugas = data.tugas;
    final submission = data.submission;

    return RefreshIndicator(
      onRefresh: _refresh,
      color: AppColors.indigo600,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          _DetailHeader(
            onBack: () => context.pop(),
            tugas: tugas,
          ),
          const SizedBox(height: 16),
          _sectionTitle('Deskripsi Tugas'),
          _glassCard(
            isDark,
            child: Text(
              tugas.deskripsi,
              style: TextStyle(fontSize: 13, color: isDark ? Colors.white70 : Colors.black87),
            ),
          ),
          if (tugas.instruksi != null && tugas.instruksi!.trim().isNotEmpty) ...[
            const SizedBox(height: 16),
            _sectionTitle('Instruksi Pengerjaan'),
            _glassCard(
              isDark,
              icon: Icons.assignment_rounded,
              iconColor: const Color(0xFF10B981),
              child: Text(
                tugas.instruksi!,
                style: TextStyle(fontSize: 13, color: isDark ? Colors.white70 : Colors.black87),
              ),
            ),
          ],
          const SizedBox(height: 16),
          _sectionTitle('Status Pengumpulan'),
          _buildSubmissionStatus(submission, tugas, isDark),
          const SizedBox(height: 16),
          _sectionTitle('Form Submit Tugas'),
          _buildSubmitPanel(isDark, tugas, state),
          const SizedBox(height: 16),
          _sectionTitle('Diskusi & Tanya Jawab'),
          _buildDiskusiList(data.diskusi, isDark),
          const SizedBox(height: 12),
          _buildChatInput(isDark),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildSubmissionStatus(TugasSubmission? submission, TugasDetail tugas, bool isDark) {
    if (submission == null) {
      return _glassCard(
        isDark,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _badge('Belum Submit', const Color(0xFFF59E0B)),
            const SizedBox(height: 8),
            Text('Anda belum mengumpulkan tugas ini.', style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black54)),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => setState(() => _showSubmitPanel = true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.indigo600,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Submit Sekarang'),
            ),
          ],
        ),
      );
    }

    final statusColor = submission.status == 'graded' ? const Color(0xFF10B981) : const Color(0xFF3B82F6);

    return _glassCard(
      isDark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _badge(submission.status.toUpperCase(), statusColor),
          const SizedBox(height: 8),
          if (submission.fileName != null) _metaRow(Icons.attach_file_rounded, submission.fileName!),
          if (submission.submittedAt != null) _metaRow(Icons.schedule_rounded, 'Dikumpulkan ${submission.submittedAt}'),
          if (submission.gradedAt != null) _metaRow(Icons.check_circle_rounded, 'Dinilai ${submission.gradedAt}'),
          const SizedBox(height: 8),
          if (submission.grade != null)
            Text('Nilai: ${submission.grade} / ${tugas.maxGrade}', style: const TextStyle(fontWeight: FontWeight.w700)),
          if (submission.feedback != null) ...[
            const SizedBox(height: 6),
            Text('Feedback: ${submission.feedback}', style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black54)),
          ],
          const SizedBox(height: 10),
          OutlinedButton(
            onPressed: () => setState(() => _showSubmitPanel = true),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.indigo600,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Update Submission'),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitPanel(bool isDark, TugasDetail tugas, TugasDetailState state) {
    return AnimatedCrossFade(
      duration: const Duration(milliseconds: 250),
      crossFadeState: _showSubmitPanel ? CrossFadeState.showFirst : CrossFadeState.showSecond,
      firstChild: _glassCard(
        isDark,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (tugas.isOverdue) ...[
              _warningBox('Tugas melewati deadline. Penalty ${tugas.latePenaltyPercent}% akan diterapkan.'),
              const SizedBox(height: 12),
            ],
            TextField(
              controller: _contentCtrl,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Tulis jawaban atau ringkasan pengerjaan...',
                filled: true,
                fillColor: isDark ? const Color(0xFF111827) : const Color(0xFFF8FAFC),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: isDark ? Colors.white10 : Colors.black12),
                ),
              ),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: () => _showFilePickerInfo(context),
              icon: const Icon(Icons.upload_file_rounded),
              label: const Text('Pilih File (PDF/DOCX)'),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: state.isSubmitting
                        ? null
                        : () => ref.read(tugasDetailProvider.notifier).submitTugas(
                              id: widget.id,
                              content: _contentCtrl.text.trim().isEmpty ? null : _contentCtrl.text.trim(),
                            ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.indigo600,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: state.isSubmitting ? const CircularProgressIndicator() : const Text('Submit'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _showSubmitPanel = false),
                    child: const Text('Batal'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      secondChild: _glassCard(
        isDark,
        child: Row(
          children: [
            const Icon(Icons.info_outline, color: AppColors.indigo600),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Tap untuk membuka form submit tugas dengan upload file & jawaban.',
                style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black54),
              ),
            ),
            TextButton(
              onPressed: () => setState(() => _showSubmitPanel = true),
              child: const Text('Buka'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiskusiList(List<TugasDiskusi> items, bool isDark) {
    if (items.isEmpty) {
      return _glassCard(
        isDark,
        child: const Text('Belum ada diskusi. Mulai bertanya di bawah.'),
      );
    }

    return Column(
      children: items.map((item) {
        final isMine = item.isMine;
        final bubbleColor = isMine ? const [Color(0xFF6366F1), Color(0xFF8B5CF6)] : [Colors.white, Colors.white];
        return Align(
          alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(12),
            constraints: const BoxConstraints(maxWidth: 320),
            decoration: BoxDecoration(
              gradient: isMine
                  ? LinearGradient(colors: bubbleColor)
                  : null,
              color: isMine ? null : (isDark ? const Color(0xFF111827) : Colors.white),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isMine ? Colors.transparent : (isDark ? Colors.white10 : Colors.black12)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.06),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _avatar(item.senderName, item.senderType),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        item.senderName,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: isMine ? Colors.white : (isDark ? Colors.white : Colors.black87),
                        ),
                      ),
                    ),
                    if (item.isPinned) const Icon(Icons.push_pin_rounded, size: 14, color: Colors.amber),
                  ],
                ),
                if (item.replyTo != null) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isMine ? Colors.white.withValues(alpha: 0.15) : (isDark ? Colors.white10 : Colors.black12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '${item.replyTo!.senderName}: ${item.replyTo!.pesan}',
                      style: TextStyle(fontSize: 10, color: isMine ? Colors.white70 : Colors.black54),
                    ),
                  ),
                ],
                const SizedBox(height: 6),
                Text(
                  item.pesan,
                  style: TextStyle(fontSize: 12, color: isMine ? Colors.white : (isDark ? Colors.white70 : Colors.black87)),
                ),
                const SizedBox(height: 6),
                Text(
                  item.timeAgo,
                  style: TextStyle(fontSize: 10, color: isMine ? Colors.white70 : (isDark ? Colors.white54 : Colors.black45)),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildChatInput(bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _chatCtrl,
                minLines: 1,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Tulis pertanyaan atau komentar...',
                  border: InputBorder.none,
                ),
              ),
            ),
            const SizedBox(width: 6),
            IconButton(
              onPressed: () {
                final text = _chatCtrl.text.trim();
                if (text.isEmpty) return;
                _chatCtrl.clear();
                ref.read(tugasDetailProvider.notifier).sendMessage(
                      id: widget.id,
                      pesan: text,
                      visibility: 'public',
                    );
              },
              icon: const Icon(Icons.send_rounded, color: AppColors.indigo600),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
    );
  }

  Widget _glassCard(bool isDark, {required Widget child, IconData? icon, Color? iconColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.06),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (icon != null) ...[
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: iconColor?.withValues(alpha: 0.15) ?? Colors.white10,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor ?? AppColors.indigo600, size: 18),
              ),
              const SizedBox(width: 12),
            ],
            Expanded(child: child),
          ],
        ),
      ),
    );
  }

  Widget _badge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.6)),
      ),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color)),
    );
  }

  Widget _metaRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 14, color: Colors.grey),
          const SizedBox(width: 6),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }

  Widget _warningBox(String text) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFFEE2E2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_rounded, color: Color(0xFFEF4444), size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 11, color: Color(0xFFB91C1C)))),
        ],
      ),
    );
  }

  Widget _avatar(String name, String role) {
    Color color;
    switch (role) {
      case 'admin':
        color = const Color(0xFFEF4444);
        break;
      case 'dosen':
        color = const Color(0xFF8B5CF6);
        break;
      default:
        color = const Color(0xFF10B981);
    }
    final initials = name.isNotEmpty ? name.trim().split(' ').map((e) => e[0]).take(2).join().toUpperCase() : '?';
    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [color, color.withValues(alpha: 0.6)]),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Center(
        child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
      ),
    );
  }

  Widget _buildError(String message, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, color: isDark ? Colors.white70 : Colors.red, size: 40),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: _refresh, child: const Text('Coba Lagi')),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmer(bool isDark) {
    return Shimmer.fromColors(
      baseColor: isDark ? const Color(0xFF1E293B) : Colors.grey[300]!,
      highlightColor: isDark ? const Color(0xFF334155) : Colors.grey[100]!,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(height: 240, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24))),
          const SizedBox(height: 16),
          Container(height: 120, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20))),
          const SizedBox(height: 12),
          Container(height: 160, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20))),
        ],
      ),
    );
  }

  void _showFilePickerInfo(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Upload File'),
          content: const Text('Integrasi file picker akan menggunakan API upload tugas. Saat ini pilih file via implementasi tambahan.'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
          ],
        );
      },
    );
  }
}

class _DetailHeader extends StatefulWidget {
  const _DetailHeader({required this.onBack, required this.tugas});

  final VoidCallback onBack;
  final TugasDetail tugas;

  @override
  State<_DetailHeader> createState() => _DetailHeaderState();
}

class _DetailHeaderState extends State<_DetailHeader> with SingleTickerProviderStateMixin {
  late final AnimationController _gradientCtrl;
  late Timer _clockTimer;
  String _clock = '';

  @override
  void initState() {
    super.initState();
    _gradientCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 5))..repeat(reverse: true);
    _clock = _timeNow();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _clock = _timeNow());
    });
  }

  @override
  void dispose() {
    _gradientCtrl.dispose();
    _clockTimer.cancel();
    super.dispose();
  }

  String _timeNow() {
    final now = DateTime.now();
    return '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final tugas = widget.tugas;
    return AnimatedBuilder(
      animation: _gradientCtrl,
      builder: (context, child) {
        return Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment(-1.0 + _gradientCtrl.value, -1.0),
              end: Alignment(1.0, 1.0 - _gradientCtrl.value),
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
          ),
          child: Stack(
            children: [
              Positioned.fill(
                child: Opacity(
                  opacity: 0.06,
                  child: Image.asset('assets/images/batik_pattern.png', fit: BoxFit.cover, errorBuilder: (_, __, ___) => const SizedBox.shrink()),
                ),
              ),
              SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          GestureDetector(
                            onTap: widget.onBack,
                            child: const Padding(
                              padding: EdgeInsets.all(8.0),
                              child: Icon(Icons.arrow_back_rounded, color: Colors.white, size: 26),
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text('Detail Tugas', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                          ),
                          Text(_clock, style: const TextStyle(color: Colors.white70, fontSize: 12, fontFamily: 'monospace')),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          _badge(tugas.jenis, Colors.white),
                          _badge(tugas.prioritas.toUpperCase(), Colors.white),
                          if (tugas.isOverdue) _badge('OVERDUE', const Color(0xFFFEE2E2), textColor: const Color(0xFFB91C1C)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        tugas.judul,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          _meta(Icons.menu_book_rounded, tugas.course.nama),
                          const SizedBox(width: 10),
                          _meta(Icons.calendar_today_rounded, tugas.deadlineDisplay),
                          const SizedBox(width: 10),
                          _meta(Icons.person_rounded, tugas.course.dosen ?? '-'),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                          ),
                          child: Column(
                            children: [
                              Text('${tugas.daysUntilDeadline}', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                              const Text('Hari Lagi', style: TextStyle(color: Colors.white70, fontSize: 11)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _badge(String label, Color color, {Color? textColor}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: textColor ?? Colors.white),
      ),
    );
  }

  Widget _meta(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 14, color: Colors.white70),
        const SizedBox(width: 4),
        Text(text, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }
}
