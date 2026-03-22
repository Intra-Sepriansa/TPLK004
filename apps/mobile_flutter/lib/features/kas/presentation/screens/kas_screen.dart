import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/empty_state_widget.dart';
import '../../domain/entities/kas_data.dart';
import '../providers/kas_provider.dart';


class KasScreen extends ConsumerStatefulWidget {
  const KasScreen({super.key});

  @override
  ConsumerState<KasScreen> createState() => _KasScreenState();
}

class _KasScreenState extends ConsumerState<KasScreen> with TickerProviderStateMixin {
  late final AnimationController _gradientCtrl;
  late final AnimationController _floatCtrl;
  String _clock = '';
  Timer? _clockTimer;
  int _historyTab = 0; // 0 = riwayat, 1 = pengeluaran
  final _rp = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    _gradientCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 5))..repeat(reverse: true);
    _floatCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 3))..repeat(reverse: true);
    _updateClock();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) => _updateClock());
    Future.microtask(() => ref.read(kasProvider.notifier).loadDashboard());
  }

  void _updateClock() {
    if (!mounted) return;
    setState(() => _clock = DateFormat('HH:mm:ss').format(DateTime.now()));
  }

  @override
  void dispose() {
    _clockTimer?.cancel();
    _gradientCtrl.dispose();
    _floatCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(kasProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      body: state.isLoading && state.data == null
          ? const Center(child: CircularProgressIndicator())
          : state.errorMessage != null && state.data == null
              ? _buildError(state.errorMessage!, isDark)
              : state.data != null
                  ? _buildContent(state.data!, isDark)
                  : const Center(child: CircularProgressIndicator()),
    );
  }

  Widget _buildContent(KasDashboardData data, bool isDark) {
    return RefreshIndicator(
      onRefresh: () => ref.read(kasProvider.notifier).loadDashboard(),
      color: AppColors.indigo600,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          _buildHeader(data, isDark),
          const SizedBox(height: 16),
          _buildStatsCards(data.personalStats, isDark),
          const SizedBox(height: 20),
          _buildFinancialIntelligence(data.financialIntelligence, isDark),
          const SizedBox(height: 20),
          _buildPredictiveAnalytics(data.paymentPrediction, isDark),
          const SizedBox(height: 20),
          _buildReminders(data.reminderSettings, data.upcomingReminders, isDark),
          const SizedBox(height: 20),
          _buildBudgetPlanner(data.paymentPlanning, isDark),
          const SizedBox(height: 20),
          _buildSocialSnapshot(data.socialFeatures, isDark),
          const SizedBox(height: 20),
          _buildClassSummary(data.classSummary, isDark),
          const SizedBox(height: 20),
          _buildTransactionHistory(data.kasRecords, data.recentExpenses, isDark),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  // ══════════ HEADER ══════════
  Widget _buildHeader(KasDashboardData data, bool isDark) {
    final paymentRate = data.personalStats.paymentRate;

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primaryDark,
            AppColors.primary,
            AppColors.primaryLight,
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
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Batik pattern
          Positioned.fill(
            child: Transform.scale(
              scale: 1.1,
              child: Opacity(
                opacity: 0.06,
                child: Image.asset(
                  'assets/images/batik_pattern.png',
                  fit: BoxFit.cover,
                  errorBuilder: (c, e, s) => const SizedBox.shrink(),
                ),
              ),
            ),
          ),
          // Content
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top bar
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => context.pop(),
                        child: const Padding(
                          padding: EdgeInsets.all(8.0),
                          child: Icon(Icons.arrow_back_rounded, color: Colors.white, size: 26),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('💰 Keuangan Kelas', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                            Text('Uang Kas Saya', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                          ],
                        ),
                      ),
                      Text(_clock, style: const TextStyle(color: Colors.white70, fontSize: 13, fontFamily: 'monospace')),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Info row
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(data.mahasiswa.nama, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text(data.mahasiswa.nim, style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 13)),
                          ],
                        ),
                      ),
                      // Payment Rate badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withOpacity(0.2)),
                        ),
                        child: Text(
                          '${paymentRate.toStringAsFixed(0)}% Lunas',
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                        ),
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

  // ══════════ SECTION 2: Stats Cards ══════════
  Widget _buildStatsCards(PersonalStats stats, bool isDark) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(child: _statCard(
            'Total Sudah Bayar', stats.totalPaid, Icons.check_circle_rounded,
            const [Color(0xFF10B981), Color(0xFF059669)], '${stats.paidCount} pertemuan', isDark,
          )),
          const SizedBox(width: 12),
          Expanded(child: _statCard(
            'Total Belum Bayar', stats.totalUnpaid, Icons.schedule_rounded,
            const [Color(0xFFEF4444), Color(0xFFDC2626)], '${stats.unpaidCount} pertemuan', isDark,
            warning: stats.unpaidCount > 0,
          )),
        ],
      ),
    );
  }

  Widget _statCard(String title, double amount, IconData icon, List<Color> gradient, String subtitle, bool isDark, {bool warning = false}) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? Colors.white10 : Colors.black.withOpacity(0.05)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: gradient),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: Colors.white, size: 22),
          ),
          const SizedBox(height: 12),
          Text(title, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: isDark ? Colors.white54 : AppColors.textSecondary)),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(_rp.format(amount), style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppColors.textPrimary)),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(warning ? Icons.warning_amber_rounded : Icons.arrow_upward_rounded, size: 14, color: gradient[0]),
              const SizedBox(width: 4),
              Expanded(child: Text(subtitle, style: TextStyle(fontSize: 11, color: gradient[0], fontWeight: FontWeight.w500), overflow: TextOverflow.ellipsis)),
            ],
          ),
        ],
      ),
    );
  }

  // ══════════ SECTION 3: Financial Intelligence ══════════
  Widget _buildFinancialIntelligence(FinancialIntelligence fi, bool isDark) {
    final healthColor = fi.healthCategory == 'excellent' ? const Color(0xFF10B981)
        : fi.healthCategory == 'good' ? const Color(0xFF3B82F6)
        : fi.healthCategory == 'fair' ? const Color(0xFFF59E0B)
        : const Color(0xFFEF4444);
    final riskColor = fi.behaviorType == 'early' ? const Color(0xFF10B981)
        : fi.behaviorType == 'ontime' ? const Color(0xFF3B82F6)
        : fi.behaviorType == 'late' ? const Color(0xFFEF4444)
        : const Color(0xFFF59E0B);
    final total = fi.behaviorScore.early + fi.behaviorScore.ontime + fi.behaviorScore.late;
    final earlyPct = total > 0 ? fi.behaviorScore.early / total : 0.0;
    final ontimePct = total > 0 ? fi.behaviorScore.ontime / total : 0.0;
    final latePct = total > 0 ? fi.behaviorScore.late / total : 0.0;

    return _sectionCard(
      icon: Icons.psychology_rounded,
      gradient: const [Color(0xFF6366F1), Color(0xFF9333EA)],
      title: 'Financial Intelligence',
      subtitle: 'Analisis kecerdasan finansial Anda',
      isDark: isDark,
      child: Column(
        children: [
          // Health + streak row
          Row(children: [
            Expanded(child: _miniCard(isDark, child: Column(children: [
              SizedBox(
                width: 70, height: 70,
                child: CustomPaint(
                  painter: _HealthScorePainter(fi.healthScore / 100, healthColor),
                  child: Center(child: Text('${fi.healthScore}', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: healthColor))),
                ),
              ),
              const SizedBox(height: 6),
              Text('Health Score', style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : AppColors.textSecondary)),
              Text(fi.healthCategory.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: healthColor)),
            ]))),
            const SizedBox(width: 10),
            Expanded(child: _miniCard(isDark, child: Column(children: [
              const Text('🔥', style: TextStyle(fontSize: 28)),
              const SizedBox(height: 4),
              Text('${fi.paymentStreak}', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppColors.textPrimary)),
              Text('Streak', style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : AppColors.textSecondary)),
              Text('Terpanjang: ${fi.longestStreak}', style: TextStyle(fontSize: 10, color: isDark ? Colors.white38 : Colors.grey)),
            ]))),
          ]),
          const SizedBox(height: 12),
          // Behavior + Risk
          Row(children: [
            Expanded(child: _miniCard(isDark, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Behavior', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : AppColors.textSecondary)),
              const SizedBox(height: 8),
              _behaviorBar('Early', earlyPct, const Color(0xFF10B981), isDark),
              const SizedBox(height: 4),
              _behaviorBar('On-time', ontimePct, const Color(0xFF3B82F6), isDark),
              const SizedBox(height: 4),
              _behaviorBar('Late', latePct, const Color(0xFFEF4444), isDark),
            ]))),
            const SizedBox(width: 10),
            Expanded(child: _miniCard(isDark, child: Column(children: [
              Icon(Icons.shield_rounded, size: 30, color: riskColor),
              const SizedBox(height: 6),
              Text(fi.behaviorType.toUpperCase(), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: riskColor)),
              Text('Payment Style', style: TextStyle(fontSize: 10, color: isDark ? Colors.white54 : AppColors.textSecondary)),
            ]))),
          ]),
          if (fi.insights.isNotEmpty) ...[
            const SizedBox(height: 12),
            _bulletList('💡 Insights', fi.insights, isDark),
          ],
          if (fi.recommendations.isNotEmpty) ...[
            const SizedBox(height: 8),
            _bulletList('📋 Rekomendasi', fi.recommendations, isDark),
          ],
        ],
      ),
    );
  }

  // ══════════ SECTION 4: Predictive Analytics ══════════
  Widget _buildPredictiveAnalytics(PaymentPrediction pp, bool isDark) {
    return _sectionCard(
      icon: Icons.trending_up_rounded,
      gradient: const [Color(0xFF38BDF8), Color(0xFF6366F1)],
      title: 'Predictive Analytics',
      subtitle: 'Prediksi dan arus kas',
      isDark: isDark,
      child: Column(
        children: [
          Row(children: [
            Expanded(child: _infoChip('Prediksi Bayar', pp.nextPaymentDate, Icons.calendar_today_rounded, const Color(0xFF6366F1), isDark)),
            const SizedBox(width: 8),
            Expanded(child: _infoChip('Tgl Optimal', pp.optimalPaymentDate, Icons.star_rounded, const Color(0xFF10B981), isDark)),
          ]),
          const SizedBox(height: 8),
          _infoChip('Risiko', '${pp.riskLevel.toUpperCase()} • ${pp.riskFactors.isEmpty ? "Stabil" : pp.riskFactors.join(", ")}', Icons.warning_rounded,
              pp.riskLevel == 'low' ? const Color(0xFF10B981) : pp.riskLevel == 'medium' ? const Color(0xFFF59E0B) : const Color(0xFFEF4444), isDark),
          if (pp.cashFlowForecast.isNotEmpty) ...[
            const SizedBox(height: 12),
            _cashFlowTable(pp.cashFlowForecast, isDark),
          ],
        ],
      ),
    );
  }

  Widget _cashFlowTable(List<CashFlowForecast> forecast, bool isDark) {
    final headerStyle = TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : AppColors.textSecondary);
    final cellStyle = TextStyle(fontSize: 11, color: isDark ? Colors.white : AppColors.textPrimary);
    return Container(
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: isDark ? Colors.white10 : Colors.black.withOpacity(0.06))),
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey.withOpacity(0.06), borderRadius: const BorderRadius.vertical(top: Radius.circular(11))),
            child: Row(children: [
              Expanded(flex: 2, child: Text('Bulan', style: headerStyle)),
              Expanded(flex: 2, child: Text('Saldo', style: headerStyle, textAlign: TextAlign.right)),
              Expanded(flex: 2, child: Text('Income', style: headerStyle, textAlign: TextAlign.right)),
              Expanded(flex: 2, child: Text('Expense', style: headerStyle, textAlign: TextAlign.right)),
            ]),
          ),
          ...forecast.take(4).map((f) => Padding(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: Row(children: [
              Expanded(flex: 2, child: Text(f.month, style: cellStyle)),
              Expanded(flex: 2, child: Text(_rp.format(f.predictedBalance), style: cellStyle, textAlign: TextAlign.right)),
              Expanded(flex: 2, child: Text(_rp.format(f.predictedIncome), style: cellStyle.copyWith(color: const Color(0xFF10B981)), textAlign: TextAlign.right)),
              Expanded(flex: 2, child: Text(_rp.format(f.predictedExpense), style: cellStyle.copyWith(color: const Color(0xFFEF4444)), textAlign: TextAlign.right)),
            ]),
          )),
        ],
      ),
    );
  }

  // ══════════ SECTION 6: Smart Reminders ══════════
  Widget _buildReminders(ReminderSettings settings, List<UpcomingReminder> reminders, bool isDark) {
    return _sectionCard(
      icon: Icons.notifications_active_rounded,
      gradient: const [Color(0xFFD946EF), Color(0xFFEC4899)],
      title: 'Smart Reminders',
      subtitle: 'Pengingat pembayaran cerdas',
      isDark: isDark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 6, runSpacing: 6,
            children: settings.channels.entries.map((e) {
              final active = e.value;
              return Container(
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: active ? const Color(0xFF10B981).withOpacity(0.15) : (isDark ? Colors.white10 : Colors.grey.withOpacity(0.1)),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: active ? const Color(0xFF10B981).withOpacity(0.3) : Colors.transparent),
                ),
                child: Text(e.key, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: active ? const Color(0xFF10B981) : (isDark ? Colors.white38 : Colors.grey))),
              );
            }).toList(),
          ),
          const SizedBox(height: 10),
          ...reminders.take(3).map((r) => Padding(
            padding: EdgeInsets.only(bottom: 6),
            child: Row(children: [
              Icon(Icons.circle, size: 8, color: r.status == 'sent' ? const Color(0xFF10B981) : const Color(0xFFF59E0B)),
              const SizedBox(width: 8),
              Expanded(child: Text(r.message, style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : AppColors.textPrimary), overflow: TextOverflow.ellipsis)),
            ]),
          )),
        ],
      ),
    );
  }

  // ══════════ SECTION 7: Budget Planner ══════════
  Widget _buildBudgetPlanner(PaymentPlanning planning, bool isDark) {
    final b = planning.budget;
    final s = planning.savingsGoal;
    return _sectionCard(
      icon: Icons.savings_rounded,
      gradient: const [Color(0xFF10B981), Color(0xFF0D9488)],
      title: 'Budget Planner',
      subtitle: 'Perencanaan keuangan Anda',
      isDark: isDark,
      child: Column(
        children: [
          _miniCard(isDark, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Budget Bulanan', style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : AppColors.textSecondary)),
            const SizedBox(height: 4),
            Text(_rp.format(b.monthly), style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppColors.textPrimary)),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: b.percentage / 100,
                backgroundColor: isDark ? Colors.white10 : Colors.grey.withOpacity(0.15),
                color: b.percentage > 80 ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 4),
            Text('Spent: ${b.percentage.toStringAsFixed(0)}% • Remaining ${_rp.format(b.remaining)}', style: TextStyle(fontSize: 10, color: isDark ? Colors.white38 : Colors.grey)),
          ])),
          const SizedBox(height: 10),
          _miniCard(isDark, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text('Savings Goal', style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : AppColors.textSecondary)),
              const Spacer(),
              Text('ETA: ${s.estimatedCompletion}', style: TextStyle(fontSize: 10, color: isDark ? Colors.white38 : Colors.grey)),
            ]),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: s.percentage / 100,
                backgroundColor: isDark ? Colors.white10 : Colors.grey.withOpacity(0.15),
                color: const Color(0xFF6366F1),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 4),
            Text('${_rp.format(s.current)} / ${_rp.format(s.target)}', style: TextStyle(fontSize: 10, color: isDark ? Colors.white38 : Colors.grey)),
          ])),
        ],
      ),
    );
  }

  // ══════════ SECTION 8: Social Snapshot ══════════
  Widget _buildSocialSnapshot(SocialFeatures sf, bool isDark) {
    final cs = sf.classStats;
    final pc = sf.peerComparison;
    return _sectionCard(
      icon: Icons.trending_up_rounded,
      gradient: const [Color(0xFF38BDF8), Color(0xFF6366F1)],
      title: 'Social Snapshot',
      subtitle: 'Perbandingan dengan kelas',
      isDark: isDark,
      child: Row(
        children: [
          Expanded(child: _miniCard(isDark, child: Column(children: [
            Text('${cs.paymentRate.toStringAsFixed(0)}%', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppColors.textPrimary)),
            Text('Payment Rate Kelas', style: TextStyle(fontSize: 10, color: isDark ? Colors.white54 : AppColors.textSecondary)),
            const SizedBox(height: 4),
            Text('${cs.paidStudents}/${cs.totalStudents} mahasiswa', style: TextStyle(fontSize: 10, color: isDark ? Colors.white38 : Colors.grey)),
          ]))),
          const SizedBox(width: 10),
          Expanded(child: _miniCard(isDark, child: Column(children: [
            Text('#${pc.yourRank}', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppColors.textPrimary)),
            Text('dari ${pc.totalPeers} peers', style: TextStyle(fontSize: 10, color: isDark ? Colors.white54 : AppColors.textSecondary)),
            const SizedBox(height: 4),
            Text('Top ${pc.percentile.toStringAsFixed(0)}%', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF10B981))),
          ]))),
        ],
      ),
    );
  }

  // ══════════ SECTION 10: Class Summary ══════════
  Widget _buildClassSummary(ClassSummary cs, bool isDark) {
    return _sectionCard(
      icon: Icons.account_balance_rounded,
      gradient: const [Color(0xFF6366F1), Color(0xFF9333EA)],
      title: 'Saldo Kas Kelas',
      subtitle: 'Ringkasan keuangan kelas',
      isDark: isDark,
      child: Row(
        children: [
          Expanded(child: _summaryCard('Saldo', cs.totalBalance, Icons.bolt_rounded, const [Color(0xFF6366F1), Color(0xFF06B6D4)], isDark)),
          const SizedBox(width: 8),
          Expanded(child: _summaryCard('Masuk', cs.totalIncome, Icons.trending_up_rounded, const [Color(0xFF10B981), Color(0xFF0D9488)], isDark)),
          const SizedBox(width: 8),
          Expanded(child: _summaryCard('Keluar', cs.totalExpense, Icons.trending_down_rounded, const [Color(0xFFF43F5E), Color(0xFFEA580C)], isDark)),
        ],
      ),
    );
  }

  Widget _summaryCard(String label, double amount, IconData icon, List<Color> gradient, bool isDark) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white10 : Colors.black.withOpacity(0.04)),
      ),
      child: Column(children: [
        ShaderMask(
          shaderCallback: (b) => LinearGradient(colors: gradient).createShader(b),
          child: Icon(icon, color: Colors.white, size: 24),
        ),
        const SizedBox(height: 6),
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(_rp.format(amount), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppColors.textPrimary)),
        ),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(fontSize: 10, color: isDark ? Colors.white54 : AppColors.textSecondary)),
      ]),
    );
  }

  // ══════════ SECTION 11: Transaction History ══════════
  Widget _buildTransactionHistory(List<KasRecord> records, List<Expense> expenses, bool isDark) {
    return _sectionCard(
      icon: Icons.receipt_long_rounded,
      gradient: const [Color(0xFF6366F1), Color(0xFF9333EA)],
      title: 'Riwayat Transaksi',
      subtitle: 'Pembayaran & pengeluaran',
      isDark: isDark,
      child: Column(
        children: [
          // Tab switcher
          Row(children: [
            Expanded(child: GestureDetector(
              onTap: () => setState(() => _historyTab = 0),
              child: Container(
                padding: EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: _historyTab == 0 ? const Color(0xFF6366F1) : (isDark ? Colors.white.withOpacity(0.05) : Colors.grey.withOpacity(0.08)),
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Text('Pembayaran', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _historyTab == 0 ? Colors.white : (isDark ? Colors.white54 : AppColors.textSecondary))),
              ),
            )),
            const SizedBox(width: 8),
            Expanded(child: GestureDetector(
              onTap: () => setState(() => _historyTab = 1),
              child: Container(
                padding: EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: _historyTab == 1 ? const Color(0xFF6366F1) : (isDark ? Colors.white.withOpacity(0.05) : Colors.grey.withOpacity(0.08)),
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Text('Pengeluaran', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _historyTab == 1 ? Colors.white : (isDark ? Colors.white54 : AppColors.textSecondary))),
              ),
            )),
          ]),
          const SizedBox(height: 12),
          // Content
          if (_historyTab == 0)
            records.isEmpty
                ? _emptyState('Belum ada riwayat pembayaran', isDark)
                : Column(children: records.take(10).map((r) => _paymentItem(r, isDark)).toList())
          else
            expenses.isEmpty
                ? _emptyState('Belum ada data pengeluaran', isDark)
                : Column(children: expenses.take(10).map((e) => _expenseItem(e, isDark)).toList()),
        ],
      ),
    );
  }

  Widget _paymentItem(KasRecord r, bool isDark) {
    final paid = r.status == 'paid';
    return Padding(
      padding: EdgeInsets.only(bottom: 8),
      child: Row(children: [
        Container(
          width: 36, height: 36,
          decoration: BoxDecoration(
            color: (paid ? const Color(0xFF10B981) : const Color(0xFFEF4444)).withOpacity(0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(paid ? Icons.check_circle_rounded : Icons.schedule_rounded, size: 18, color: paid ? const Color(0xFF10B981) : const Color(0xFFEF4444)),
        ),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(r.description.isNotEmpty ? r.description : 'Kas mingguan', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: isDark ? Colors.white : AppColors.textPrimary), overflow: TextOverflow.ellipsis),
          Text(r.periodDisplay, style: TextStyle(fontSize: 10, color: isDark ? Colors.white38 : Colors.grey)),
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(_rp.format(r.amount), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppColors.textPrimary)),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: (paid ? const Color(0xFF10B981) : const Color(0xFFEF4444)).withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(paid ? 'Lunas' : 'Belum', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: paid ? const Color(0xFF10B981) : const Color(0xFFEF4444))),
          ),
        ]),
      ]),
    );
  }

  Widget _expenseItem(Expense e, bool isDark) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8),
      child: Row(children: [
        Container(
          width: 36, height: 36,
          decoration: BoxDecoration(color: const Color(0xFFEF4444).withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.arrow_downward_rounded, size: 18, color: Color(0xFFEF4444)),
        ),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(e.description, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: isDark ? Colors.white : AppColors.textPrimary), overflow: TextOverflow.ellipsis),
          Text(e.periodDisplay, style: TextStyle(fontSize: 10, color: isDark ? Colors.white38 : Colors.grey)),
        ])),
        Text('-${_rp.format(e.amount)}', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFFEF4444))),
      ]),
    );
  }

  // ══════════ COMMON HELPERS ══════════
  Widget _sectionCard({required IconData icon, required List<Color> gradient, required String title, required String subtitle, required bool isDark, required Widget child}) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: isDark ? Colors.white10 : Colors.black.withOpacity(0.05)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 16, offset: Offset(0, 4))],
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            ShaderMask(
              shaderCallback: (b) => LinearGradient(colors: gradient).createShader(b),
              child: Icon(icon, color: Colors.white, size: 22),
            ),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppColors.textPrimary)),
              Text(subtitle, style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : AppColors.textSecondary)),
            ])),
          ]),
          const SizedBox(height: 16),
          child,
        ]),
      ),
    );
  }

  Widget _miniCard(bool isDark, {required Widget child}) {
    return Container(
      padding: EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white10 : Colors.black.withOpacity(0.04)),
      ),
      child: child,
    );
  }

  Widget _infoChip(String label, String value, IconData icon, Color color, bool isDark) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Row(children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 8),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: TextStyle(fontSize: 10, color: isDark ? Colors.white54 : AppColors.textSecondary)),
          Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.white : AppColors.textPrimary), overflow: TextOverflow.ellipsis),
        ])),
      ]),
    );
  }

  Widget _behaviorBar(String label, double pct, Color color, bool isDark) {
    return Row(children: [
      SizedBox(width: 50, child: Text(label, style: TextStyle(fontSize: 9, color: isDark ? Colors.white38 : Colors.grey))),
      Expanded(child: ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: LinearProgressIndicator(value: pct, backgroundColor: isDark ? Colors.white10 : Colors.grey.withOpacity(0.12), color: color, minHeight: 5),
      )),
      const SizedBox(width: 6),
      SizedBox(width: 28, child: Text('${(pct * 100).toStringAsFixed(0)}%', textAlign: TextAlign.right, style: TextStyle(fontSize: 9, color: isDark ? Colors.white54 : Colors.grey))),
    ]);
  }

  Widget _bulletList(String title, List<String> items, bool isDark) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : AppColors.textPrimary)),
      const SizedBox(height: 4),
      ...items.take(3).map((i) => Padding(
        padding: EdgeInsets.only(bottom: 2),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('• ', style: TextStyle(color: isDark ? Colors.white38 : Colors.grey)),
          Expanded(child: Text(i, style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : AppColors.textSecondary))),
        ]),
      )),
    ]);
  }

  Widget _emptyState(String msg, bool isDark) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 20),
      child: EmptyStateWidget(
        imagePath: 'assets/images/empty_no_kas.png',
        title: 'Tidak Ada Data',
        subtitle: msg,
        imageSize: 120, // smaller size since it's inside a tab
      ),
    );
  }

  Widget _buildError(String message, bool isDark) {
    return EmptyStateWidget.noData(
      message: message,
      onRetry: () => ref.read(kasProvider.notifier).loadDashboard(),
    );
  }
}

// ── Custom Painter — Circular Health Score ──
class _HealthScorePainter extends CustomPainter {
  final double progress;
  final Color color;

  _HealthScorePainter(this.progress, this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 6;
    final bg = Paint()..color = color.withOpacity(0.15)..style = PaintingStyle.stroke..strokeWidth = 6..strokeCap = StrokeCap.round;
    final fg = Paint()..color = color..style = PaintingStyle.stroke..strokeWidth = 6..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, bg);
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), -math.pi / 2, 2 * math.pi * progress, false, fg);
  }

  @override
  bool shouldRepaint(covariant _HealthScorePainter oldDelegate) => oldDelegate.progress != progress || oldDelegate.color != color;
}
