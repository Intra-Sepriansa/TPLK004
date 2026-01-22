import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart3, LineChart, 
  PieChart, Activity, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsDashboardProps {
  stats: {
    today: {
      attendance_rate: number;
      active_students: number;
      engagement_score: number;
    };
    trends: {
      attendance: Record<string, number>;
      engagement: Record<string, number>;
    };
    anomalies: {
      critical: number;
      total: number;
    };
  };
}

export default function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const attendanceTrend = Object.entries(stats.trends.attendance);
  const engagementTrend = Object.entries(stats.trends.engagement);

  const calculateTrend = (data: [string, number][]) => {
    if (data.length < 2) return 0;
    const first = data[0][1];
    const last = data[data.length - 1][1];
    return ((last - first) / first) * 100;
  };

  const attendanceTrendPercent = calculateTrend(attendanceTrend);
  const engagementTrendPercent = calculateTrend(engagementTrend);

  return (
    <>
      <Head title="Advanced Analytics" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Advanced Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Deep insights and predictive analytics
            </p>
          </motion.div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Attendance Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.today.attendance_rate.toFixed(1)}%
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {attendanceTrendPercent >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          attendanceTrendPercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(attendanceTrendPercent).toFixed(1)}%
                        </span>
                        <span className="text-xs text-slate-500">vs last week</span>
                      </div>
                    </div>
                    <BarChart3 className="w-12 h-12 text-blue-600/20" />
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
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Active Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                        {stats.today.active_students}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Activity className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Today
                        </span>
                      </div>
                    </div>
                    <LineChart className="w-12 h-12 text-green-600/20" />
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
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Engagement Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.today.engagement_score.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {engagementTrendPercent >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          engagementTrendPercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(engagementTrendPercent).toFixed(1)}%
                        </span>
                        <span className="text-xs text-slate-500">vs last week</span>
                      </div>
                    </div>
                    <PieChart className="w-12 h-12 text-purple-600/20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Trends Overview</CardTitle>
                  <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          selectedPeriod === period
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="attendance" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="engagement">Engagement</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="attendance" className="mt-6">
                    <div className="space-y-4">
                      {attendanceTrend.map(([date, value], index) => (
                        <motion.div
                          key={date}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="flex items-center gap-4"
                        >
                          <div className="w-24 text-sm text-slate-600 dark:text-slate-400">
                            {new Date(date).toLocaleDateString('id-ID', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="flex-1">
                            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${value}%` }}
                                transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-3"
                              >
                                <span className="text-xs font-medium text-white">
                                  {value.toFixed(1)}%
                                </span>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="engagement" className="mt-6">
                    <div className="space-y-4">
                      {engagementTrend.map(([date, value], index) => (
                        <motion.div
                          key={date}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="flex items-center gap-4"
                        >
                          <div className="w-24 text-sm text-slate-600 dark:text-slate-400">
                            {new Date(date).toLocaleDateString('id-ID', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="flex-1">
                            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, value * 10)}%` }}
                                transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-end pr-3"
                              >
                                <span className="text-xs font-medium text-white">
                                  {value.toFixed(1)}
                                </span>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Anomalies Alert */}
          {stats.anomalies.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-2 border-red-500/50 bg-red-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    Anomalies Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {stats.anomalies.total}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {stats.anomalies.critical} critical issues require immediate attention
                      </p>
                    </div>
                    <a
                      href="/admin/analytics/anomalies"
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      View Details
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
