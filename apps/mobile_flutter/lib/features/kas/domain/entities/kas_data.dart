// All Uang Kas entities.

// ── KasRecord ──
class KasRecord {
  final int id;
  final double amount;
  final String status;
  final String periodDate;
  final String periodDisplay;
  final String description;
  final String category;

  const KasRecord({
    required this.id,
    required this.amount,
    required this.status,
    required this.periodDate,
    required this.periodDisplay,
    required this.description,
    required this.category,
  });
}

// ── PersonalStats ──
class PersonalStats {
  final double totalPaid;
  final double totalUnpaid;
  final int paidCount;
  final int unpaidCount;

  const PersonalStats({
    required this.totalPaid,
    required this.totalUnpaid,
    required this.paidCount,
    required this.unpaidCount,
  });

  double get paymentRate {
    final total = paidCount + unpaidCount;
    return total > 0 ? (paidCount / total) * 100 : 0;
  }
}

// ── ClassSummary ──
class ClassSummary {
  final double totalBalance;
  final double totalIncome;
  final double totalExpense;

  const ClassSummary({
    required this.totalBalance,
    required this.totalIncome,
    required this.totalExpense,
  });
}

// ── FinancialIntelligence ──
class BehaviorScore {
  final int early;
  final int ontime;
  final int late;

  const BehaviorScore({required this.early, required this.ontime, required this.late});
}

class FinancialIntelligence {
  final int healthScore;
  final String healthCategory;
  final int paymentStreak;
  final int longestStreak;
  final String behaviorType;
  final BehaviorScore behaviorScore;
  final List<String> insights;
  final List<String> recommendations;

  const FinancialIntelligence({
    required this.healthScore,
    required this.healthCategory,
    required this.paymentStreak,
    required this.longestStreak,
    required this.behaviorType,
    required this.behaviorScore,
    required this.insights,
    required this.recommendations,
  });
}

// ── PaymentPrediction ──
class CashFlowForecast {
  final String month;
  final double predictedBalance;
  final double predictedIncome;
  final double predictedExpense;

  const CashFlowForecast({
    required this.month,
    required this.predictedBalance,
    required this.predictedIncome,
    required this.predictedExpense,
  });
}

class PaymentPrediction {
  final String nextPaymentDate;
  final String confidenceLevel;
  final String riskLevel;
  final List<String> riskFactors;
  final String optimalPaymentDate;
  final List<CashFlowForecast> cashFlowForecast;

  const PaymentPrediction({
    required this.nextPaymentDate,
    required this.confidenceLevel,
    required this.riskLevel,
    required this.riskFactors,
    required this.optimalPaymentDate,
    required this.cashFlowForecast,
  });
}

// ── PaymentPlanning ──
class PaymentCalendar {
  final String date;
  final double amount;
  final String status;
  final String description;

  const PaymentCalendar({
    required this.date,
    required this.amount,
    required this.status,
    required this.description,
  });
}

class Budget {
  final double monthly;
  final double spent;
  final double remaining;
  final double percentage;

  const Budget({
    required this.monthly,
    required this.spent,
    required this.remaining,
    required this.percentage,
  });
}

class SavingsGoal {
  final double target;
  final double current;
  final double percentage;
  final String estimatedCompletion;

  const SavingsGoal({
    required this.target,
    required this.current,
    required this.percentage,
    required this.estimatedCompletion,
  });
}

class Installment {
  final double totalAmount;
  final int installmentCount;
  final double amountPerInstallment;
  final int paidInstallments;
  final int remainingInstallments;

  const Installment({
    required this.totalAmount,
    required this.installmentCount,
    required this.amountPerInstallment,
    required this.paidInstallments,
    required this.remainingInstallments,
  });
}

class PaymentPlanning {
  final List<PaymentCalendar> calendar;
  final Budget budget;
  final SavingsGoal savingsGoal;
  final List<Installment> installments;

  const PaymentPlanning({
    required this.calendar,
    required this.budget,
    required this.savingsGoal,
    required this.installments,
  });
}

// ── Gamification ──
class Achievement {
  final String id;
  final String name;
  final String description;
  final String icon;
  final bool unlocked;
  final String? unlockedAt;
  final int progress;
  final int target;

  const Achievement({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.unlocked,
    this.unlockedAt,
    required this.progress,
    required this.target,
  });
}

class Leaderboard {
  final int rank;
  final int totalParticipants;
  final String category;
  final int score;

  const Leaderboard({
    required this.rank,
    required this.totalParticipants,
    required this.category,
    required this.score,
  });
}

class RewardPoints {
  final int total;
  final int earned;
  final int spent;
  final double multiplier;

  const RewardPoints({
    required this.total,
    required this.earned,
    required this.spent,
    required this.multiplier,
  });
}

class Challenge {
  final String id;
  final String title;
  final String description;
  final String type;
  final int progress;
  final int target;
  final int reward;
  final String deadline;
  final bool completed;

  const Challenge({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.progress,
    required this.target,
    required this.reward,
    required this.deadline,
    required this.completed,
  });
}

class GamificationData {
  final List<Achievement> achievements;
  final Leaderboard leaderboard;
  final RewardPoints rewardPoints;
  final List<Challenge> challenges;

  const GamificationData({
    required this.achievements,
    required this.leaderboard,
    required this.rewardPoints,
    required this.challenges,
  });
}

// ── Social Features ──
class ClassStats {
  final int totalStudents;
  final int paidStudents;
  final int unpaidStudents;
  final double paymentRate;
  final double target;

  const ClassStats({
    required this.totalStudents,
    required this.paidStudents,
    required this.unpaidStudents,
    required this.paymentRate,
    required this.target,
  });
}

class PeerComparison {
  final int yourRank;
  final int totalPeers;
  final double percentile;
  final String category;

  const PeerComparison({
    required this.yourRank,
    required this.totalPeers,
    required this.percentile,
    required this.category,
  });
}

class SocialFeatures {
  final ClassStats classStats;
  final PeerComparison peerComparison;

  const SocialFeatures({
    required this.classStats,
    required this.peerComparison,
  });
}

// ── Reminders ──
class ReminderSettings {
  final bool enabled;
  final Map<String, bool> channels;

  const ReminderSettings({required this.enabled, required this.channels});
}

class UpcomingReminder {
  final int id;
  final String channel;
  final String scheduledAt;
  final String status;
  final String message;

  const UpcomingReminder({
    required this.id,
    required this.channel,
    required this.scheduledAt,
    required this.status,
    required this.message,
  });
}

// ── Receipt ──
class ReceiptUploadTarget {
  final int id;
  final String label;
  final double amount;

  const ReceiptUploadTarget({required this.id, required this.label, required this.amount});
}

class OcrData {
  final double? amount;
  final String? date;
  final String? bankName;
  final double? confidence;

  const OcrData({this.amount, this.date, this.bankName, this.confidence});
}

class ReceiptWorkflowItem {
  final int id;
  final int kasId;
  final String status;
  final String? imageUrl;
  final OcrData? ocrData;
  final double expectedAmount;
  final String kasDescription;
  final String? periodDate;
  final String? createdAt;
  final String? reviewedAt;

  const ReceiptWorkflowItem({
    required this.id,
    required this.kasId,
    required this.status,
    this.imageUrl,
    this.ocrData,
    required this.expectedAmount,
    required this.kasDescription,
    this.periodDate,
    this.createdAt,
    this.reviewedAt,
  });
}

// ── Expense ──
class Expense {
  final int id;
  final double amount;
  final String description;
  final String periodDate;
  final String periodDisplay;
  final String category;

  const Expense({
    required this.id,
    required this.amount,
    required this.description,
    required this.periodDate,
    required this.periodDisplay,
    required this.category,
  });
}

// ── Mahasiswa Info ──
class KasMahasiswaInfo {
  final int id;
  final String nama;
  final String nim;

  const KasMahasiswaInfo({required this.id, required this.nama, required this.nim});
}

// ── Root Dashboard Data ──
class KasDashboardData {
  final KasMahasiswaInfo mahasiswa;
  final List<KasRecord> kasRecords;
  final PersonalStats personalStats;
  final ClassSummary classSummary;
  final List<Expense> recentExpenses;
  final FinancialIntelligence financialIntelligence;
  final PaymentPrediction paymentPrediction;
  final PaymentPlanning paymentPlanning;
  final GamificationData gamification;
  final SocialFeatures socialFeatures;
  final ReminderSettings reminderSettings;
  final List<UpcomingReminder> upcomingReminders;
  final List<ReceiptUploadTarget> receiptUploadTargets;
  final List<ReceiptWorkflowItem> receiptWorkflow;

  const KasDashboardData({
    required this.mahasiswa,
    required this.kasRecords,
    required this.personalStats,
    required this.classSummary,
    required this.recentExpenses,
    required this.financialIntelligence,
    required this.paymentPrediction,
    required this.paymentPlanning,
    required this.gamification,
    required this.socialFeatures,
    required this.reminderSettings,
    required this.upcomingReminders,
    required this.receiptUploadTargets,
    required this.receiptWorkflow,
  });
}
