import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
  Trophy, Target, Calendar, Award, 
  TrendingUp, Clock, CheckCircle2, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Challenge {
  challenge: {
    id: number;
    title: string;
    description: string;
    type: string;
    category: string;
    target_value: number;
    reward_points: number;
    starts_at: string;
    ends_at: string;
  };
  progress: {
    current_value: number;
    is_completed: boolean;
    completed_at: string | null;
  } | null;
  percentage: number;
  is_completed: boolean;
}

interface ChallengesProps {
  challenges: Challenge[];
}

export default function Challenges({ challenges }: ChallengesProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'attendance': return 'from-blue-500 to-blue-600';
      case 'streak': return 'from-orange-500 to-orange-600';
      case 'social': return 'from-purple-500 to-purple-600';
      case 'academic': return 'from-green-500 to-green-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attendance': return CheckCircle2;
      case 'streak': return TrendingUp;
      case 'social': return Trophy;
      case 'academic': return Award;
      default: return Target;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'special': return 'Special';
      default: return type;
    }
  };

  const activeChallenges = challenges.filter(c => !c.is_completed);
  const completedChallenges = challenges.filter(c => c.is_completed);

  return (
    <>
      <Head title="Challenges" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Challenges
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Complete challenges to earn points and badges
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {activeChallenges.length}
                      </p>
                    </div>
                    <Target className="w-12 h-12 text-blue-600/20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {completedChallenges.length}
                      </p>
                    </div>
                    <CheckCircle2 className="w-12 h-12 text-green-600/20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Points</p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {completedChallenges.reduce((sum, c) => sum + c.challenge.reward_points, 0)}
                      </p>
                    </div>
                    <Trophy className="w-12 h-12 text-purple-600/20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Active Challenges
              </h2>
              <div className="grid gap-6">
                {activeChallenges.map((item, index) => {
                  const CategoryIcon = getCategoryIcon(item.challenge.category);
                  const gradientClass = getCategoryColor(item.challenge.category);
                  const daysLeft = Math.ceil(
                    (new Date(item.challenge.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <motion.div
                      key={item.challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientClass}`}>
                                <CategoryIcon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-xl">{item.challenge.title}</CardTitle>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {item.challenge.description}
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                  <Badge variant="outline">
                                    {getTypeLabel(item.challenge.type)}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {item.challenge.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                <Trophy className="w-4 h-4" />
                                <span className="font-bold">{item.challenge.reward_points}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">points</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400">Progress</span>
                              <span className="font-semibold">
                                {item.progress?.current_value || 0} / {item.challenge.target_value}
                              </span>
                            </div>
                            <Progress value={item.percentage} className="h-3" />
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span>{daysLeft} days left</span>
                              </div>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {item.percentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Challenges */}
          {completedChallenges.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Completed Challenges
              </h2>
              <div className="grid gap-4">
                {completedChallenges.map((item, index) => {
                  const CategoryIcon = getCategoryIcon(item.challenge.category);
                  const gradientClass = getCategoryColor(item.challenge.category);

                  return (
                    <motion.div
                      key={item.challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                    >
                      <Card className="opacity-75 hover:opacity-100 transition-opacity">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientClass} opacity-50`}>
                                <CategoryIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{item.challenge.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  Completed {new Date(item.progress!.completed_at!).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                <Trophy className="w-4 h-4" />
                                <span className="font-bold">+{item.challenge.reward_points}</span>
                              </div>
                              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {challenges.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Lock className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No challenges available
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                Check back later for new challenges
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
