import 'package:dio/dio.dart';

import '../../../../core/api/api_endpoints.dart';
import '../../domain/entities/kas_data.dart';

class KasRemoteDataSource {
  final Dio dio;

  KasRemoteDataSource(this.dio);

  /// Fetch the full kas dashboard in a single API call.
  Future<KasDashboardData> fetchDashboard() async {
    final res = await dio.get(ApiEndpoints.kasDashboard);
    final data = res.data as Map<String, dynamic>;
    if (data['success'] != true) {
      throw Exception(data['message'] ?? 'Gagal memuat data kas');
    }
    final d = (data['data'] ?? {}) as Map<String, dynamic>;

    return KasDashboardData(
      mahasiswa: _parseMahasiswa(d['mahasiswa'] as Map<String, dynamic>? ?? {}),
      kasRecords: _parseKasRecords(d['kasRecords'] as List? ?? []),
      personalStats: _parsePersonalStats(d['personalStats'] as Map<String, dynamic>? ?? {}),
      classSummary: _parseClassSummary(d['classSummary'] as Map<String, dynamic>? ?? {}),
      recentExpenses: _parseExpenses(d['recentExpenses'] as List? ?? []),
      financialIntelligence: _parseFinancialIntelligence(d['financialIntelligence'] as Map<String, dynamic>? ?? {}),
      paymentPrediction: _parsePaymentPrediction(d['paymentPrediction'] as Map<String, dynamic>? ?? {}),
      paymentPlanning: _parsePaymentPlanning(d['paymentPlanning'] as Map<String, dynamic>? ?? {}),
      gamification: _parseGamification(d['gamification'] as Map<String, dynamic>? ?? {}),
      socialFeatures: _parseSocialFeatures(d['socialFeatures'] as Map<String, dynamic>? ?? {}),
      reminderSettings: _parseReminderSettings(d['reminderSettings'] as Map<String, dynamic>? ?? {}),
      upcomingReminders: _parseUpcomingReminders(d['upcomingReminders'] as List? ?? []),
      receiptUploadTargets: _parseReceiptTargets(d['receiptUploadTargets'] as List? ?? []),
      receiptWorkflow: _parseReceiptWorkflow(d['receiptWorkflow'] as List? ?? []),
    );
  }

  /// Upload a receipt image.
  Future<Map<String, dynamic>> uploadReceipt({
    required int kasId,
    required String filePath,
  }) async {
    final formData = FormData.fromMap({
      'kas_id': kasId,
      'receipt': await MultipartFile.fromFile(filePath),
    });
    final res = await dio.post(ApiEndpoints.kasReceiptUpload, data: formData);
    return res.data as Map<String, dynamic>;
  }

  // ── Parsers ──

  KasMahasiswaInfo _parseMahasiswa(Map<String, dynamic> json) {
    return KasMahasiswaInfo(
      id: (json['id'] ?? 0) as int,
      nama: (json['nama'] ?? '') as String,
      nim: (json['nim'] ?? '') as String,
    );
  }

  List<KasRecord> _parseKasRecords(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return KasRecord(
        id: (m['id'] ?? 0) as int,
        amount: (m['amount'] as num?)?.toDouble() ?? 0.0,
        status: (m['status'] ?? 'unpaid') as String,
        periodDate: (m['period_date'] ?? '') as String,
        periodDisplay: (m['period_display'] ?? '') as String,
        description: (m['description'] ?? '') as String,
        category: (m['category'] ?? '') as String,
      );
    }).toList();
  }

  PersonalStats _parsePersonalStats(Map<String, dynamic> json) {
    return PersonalStats(
      totalPaid: (json['total_paid'] as num?)?.toDouble() ?? 0.0,
      totalUnpaid: (json['total_unpaid'] as num?)?.toDouble() ?? 0.0,
      paidCount: (json['paid_count'] ?? 0) as int,
      unpaidCount: (json['unpaid_count'] ?? 0) as int,
    );
  }

  ClassSummary _parseClassSummary(Map<String, dynamic> json) {
    return ClassSummary(
      totalBalance: (json['total_balance'] as num?)?.toDouble() ?? 0.0,
      totalIncome: (json['total_income'] as num?)?.toDouble() ?? 0.0,
      totalExpense: (json['total_expense'] as num?)?.toDouble() ?? 0.0,
    );
  }

  List<Expense> _parseExpenses(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return Expense(
        id: (m['id'] ?? 0) as int,
        amount: (m['amount'] as num?)?.toDouble() ?? 0.0,
        description: (m['description'] ?? '') as String,
        periodDate: (m['period_date'] ?? '') as String,
        periodDisplay: (m['period_display'] ?? '') as String,
        category: (m['category'] ?? '') as String,
      );
    }).toList();
  }

  FinancialIntelligence _parseFinancialIntelligence(Map<String, dynamic> json) {
    final bs = (json['behaviorScore'] ?? {}) as Map<String, dynamic>;
    return FinancialIntelligence(
      healthScore: (json['healthScore'] ?? 0) as int,
      healthCategory: (json['healthCategory'] ?? 'fair') as String,
      paymentStreak: (json['paymentStreak'] ?? 0) as int,
      longestStreak: (json['longestStreak'] ?? 0) as int,
      behaviorType: (json['behaviorType'] ?? 'ontime') as String,
      behaviorScore: BehaviorScore(
        early: (bs['early'] ?? 0) as int,
        ontime: (bs['ontime'] ?? 0) as int,
        late: (bs['late'] ?? 0) as int,
      ),
      insights: List<String>.from(json['insights'] ?? []),
      recommendations: List<String>.from(json['recommendations'] ?? []),
    );
  }

  PaymentPrediction _parsePaymentPrediction(Map<String, dynamic> json) {
    final forecast = (json['cashFlowForecast'] as List? ?? []).map((e) {
      final m = e as Map<String, dynamic>;
      return CashFlowForecast(
        month: (m['month'] ?? '') as String,
        predictedBalance: (m['predictedBalance'] as num?)?.toDouble() ?? 0.0,
        predictedIncome: (m['predictedIncome'] as num?)?.toDouble() ?? 0.0,
        predictedExpense: (m['predictedExpense'] as num?)?.toDouble() ?? 0.0,
      );
    }).toList();

    return PaymentPrediction(
      nextPaymentDate: (json['nextPaymentDate'] ?? '-') as String,
      confidenceLevel: (json['confidenceLevel'] ?? 'medium') as String,
      riskLevel: (json['riskLevel'] ?? 'low') as String,
      riskFactors: List<String>.from(json['riskFactors'] ?? []),
      optimalPaymentDate: (json['optimalPaymentDate'] ?? '-') as String,
      cashFlowForecast: forecast,
    );
  }

  PaymentPlanning _parsePaymentPlanning(Map<String, dynamic> json) {
    final cal = (json['calendar'] as List? ?? []).map((e) {
      final m = e as Map<String, dynamic>;
      return PaymentCalendar(
        date: (m['date'] ?? '') as String,
        amount: (m['amount'] as num?)?.toDouble() ?? 0.0,
        status: (m['status'] ?? '') as String,
        description: (m['description'] ?? '') as String,
      );
    }).toList();

    final bJson = (json['budget'] ?? {}) as Map<String, dynamic>;
    final sJson = (json['savingsGoal'] ?? {}) as Map<String, dynamic>;
    final inst = (json['installments'] as List? ?? []).map((e) {
      final m = e as Map<String, dynamic>;
      return Installment(
        totalAmount: (m['totalAmount'] as num?)?.toDouble() ?? 0.0,
        installmentCount: (m['installmentCount'] ?? 0) as int,
        amountPerInstallment: (m['amountPerInstallment'] as num?)?.toDouble() ?? 0.0,
        paidInstallments: (m['paidInstallments'] ?? 0) as int,
        remainingInstallments: (m['remainingInstallments'] ?? 0) as int,
      );
    }).toList();

    return PaymentPlanning(
      calendar: cal,
      budget: Budget(
        monthly: (bJson['monthly'] as num?)?.toDouble() ?? 0.0,
        spent: (bJson['spent'] as num?)?.toDouble() ?? 0.0,
        remaining: (bJson['remaining'] as num?)?.toDouble() ?? 0.0,
        percentage: (bJson['percentage'] as num?)?.toDouble() ?? 0.0,
      ),
      savingsGoal: SavingsGoal(
        target: (sJson['target'] as num?)?.toDouble() ?? 0.0,
        current: (sJson['current'] as num?)?.toDouble() ?? 0.0,
        percentage: (sJson['percentage'] as num?)?.toDouble() ?? 0.0,
        estimatedCompletion: (sJson['estimatedCompletion'] ?? '-') as String,
      ),
      installments: inst,
    );
  }

  GamificationData _parseGamification(Map<String, dynamic> json) {
    final achList = (json['achievements'] as List? ?? []).map((e) {
      final m = e as Map<String, dynamic>;
      return Achievement(
        id: (m['id'] ?? '') as String,
        name: (m['name'] ?? '') as String,
        description: (m['description'] ?? '') as String,
        icon: (m['icon'] ?? '🏆') as String,
        unlocked: (m['unlocked'] ?? false) as bool,
        unlockedAt: m['unlockedAt'] as String?,
        progress: (m['progress'] ?? 0) as int,
        target: (m['target'] ?? 1) as int,
      );
    }).toList();

    final lb = (json['leaderboard'] ?? {}) as Map<String, dynamic>;
    final rp = (json['rewardPoints'] ?? {}) as Map<String, dynamic>;
    final chList = (json['challenges'] as List? ?? []).map((e) {
      final m = e as Map<String, dynamic>;
      return Challenge(
        id: (m['id'] ?? '') as String,
        title: (m['title'] ?? '') as String,
        description: (m['description'] ?? '') as String,
        type: (m['type'] ?? 'weekly') as String,
        progress: (m['progress'] ?? 0) as int,
        target: (m['target'] ?? 1) as int,
        reward: (m['reward'] ?? 0) as int,
        deadline: (m['deadline'] ?? '') as String,
        completed: (m['completed'] ?? false) as bool,
      );
    }).toList();

    return GamificationData(
      achievements: achList,
      leaderboard: Leaderboard(
        rank: (lb['rank'] ?? 0) as int,
        totalParticipants: (lb['totalParticipants'] ?? 0) as int,
        category: (lb['category'] ?? '') as String,
        score: (lb['score'] ?? 0) as int,
      ),
      rewardPoints: RewardPoints(
        total: (rp['total'] ?? 0) as int,
        earned: (rp['earned'] ?? 0) as int,
        spent: (rp['spent'] ?? 0) as int,
        multiplier: (rp['multiplier'] as num?)?.toDouble() ?? 1.0,
      ),
      challenges: chList,
    );
  }

  SocialFeatures _parseSocialFeatures(Map<String, dynamic> json) {
    final cs = (json['classStats'] ?? {}) as Map<String, dynamic>;
    final pc = (json['peerComparison'] ?? {}) as Map<String, dynamic>;
    return SocialFeatures(
      classStats: ClassStats(
        totalStudents: (cs['totalStudents'] ?? 0) as int,
        paidStudents: (cs['paidStudents'] ?? 0) as int,
        unpaidStudents: (cs['unpaidStudents'] ?? 0) as int,
        paymentRate: (cs['paymentRate'] as num?)?.toDouble() ?? 0.0,
        target: (cs['target'] as num?)?.toDouble() ?? 100.0,
      ),
      peerComparison: PeerComparison(
        yourRank: (pc['yourRank'] ?? 0) as int,
        totalPeers: (pc['totalPeers'] ?? 0) as int,
        percentile: (pc['percentile'] as num?)?.toDouble() ?? 0.0,
        category: (pc['category'] ?? '') as String,
      ),
    );
  }

  ReminderSettings _parseReminderSettings(Map<String, dynamic> json) {
    final channels = <String, bool>{};
    if (json['channels'] is Map) {
      (json['channels'] as Map).forEach((k, v) {
        channels[k.toString()] = v == true;
      });
    }
    return ReminderSettings(
      enabled: (json['enabled'] ?? false) as bool,
      channels: channels,
    );
  }

  List<UpcomingReminder> _parseUpcomingReminders(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return UpcomingReminder(
        id: (m['id'] ?? 0) as int,
        channel: (m['channel'] ?? '') as String,
        scheduledAt: (m['scheduled_at'] ?? '') as String,
        status: (m['status'] ?? '') as String,
        message: (m['message'] ?? '') as String,
      );
    }).toList();
  }

  List<ReceiptUploadTarget> _parseReceiptTargets(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      return ReceiptUploadTarget(
        id: (m['id'] ?? 0) as int,
        label: (m['label'] ?? '') as String,
        amount: (m['amount'] as num?)?.toDouble() ?? 0.0,
      );
    }).toList();
  }

  List<ReceiptWorkflowItem> _parseReceiptWorkflow(List list) {
    return list.map((e) {
      final m = e as Map<String, dynamic>;
      OcrData? ocr;
      if (m['ocr_data'] is Map) {
        final o = m['ocr_data'] as Map<String, dynamic>;
        ocr = OcrData(
          amount: (o['amount'] as num?)?.toDouble(),
          date: o['date'] as String?,
          bankName: o['bankName'] as String?,
          confidence: (o['confidence'] as num?)?.toDouble(),
        );
      }
      return ReceiptWorkflowItem(
        id: (m['id'] ?? 0) as int,
        kasId: (m['kas_id'] ?? 0) as int,
        status: (m['status'] ?? 'pending') as String,
        imageUrl: m['image_url'] as String?,
        ocrData: ocr,
        expectedAmount: (m['expected_amount'] as num?)?.toDouble() ?? 0.0,
        kasDescription: (m['kas_description'] ?? '') as String,
        periodDate: m['period_date'] as String?,
        createdAt: m['created_at'] as String?,
        reviewedAt: m['reviewed_at'] as String?,
      );
    }).toList();
  }
}
