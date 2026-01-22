import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
  Activity, AlertTriangle, Users, TrendingUp, 
  Bell, Trophy, Target, Zap, CheckCircle, XCircle,
  Clock, BarChart3, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CommandCenterProps {
  stats: {
    students: {
      total: number;
      active_today: number;
      online_now: number;
    };
    attendance: {
      sessions_today: number;
      active_sessions: number;
      attendance_rate: number;
    };
    gamification: {
      challenges_active: number;
      rewards_redeemed_today: number;
      points_awarded_today: number;
    };
    notifications: {
      sent_today: number;
      campaigns_active: number;
    };
    anomalies: {
      critical: number;
      total_unresolved: number;
    };
  };
  alerts: Array<{
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    action_url?: string;
  }>;
  recentActivity: Array<{
    type: string;
    icon: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
}

export default function CommandCenter({ stats, alerts, recentActivity }: CommandCenterProps) {
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-600 dark:text-yellow-400';
      default: return 'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400';
    }
  };

  const getActivityIcon = (icon: string) => {
    const icons: Record<string, any> = {
      'user-check': CheckCircle,
      'trophy': Trophy,
      'bell': Bell,
      'target': Target,
    };
    return icons[icon] || Activity;
  };

  return (
    <>
      <Head title="Command Center" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Command Center
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Real-time system monitoring and control
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  System Online
                </span>
              </div>
            </div>
          </motion.div>

          {/* Critical Alerts */}
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-red-500/50 bg-red-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    Active Alerts ({alerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm mt-1 opacity-80">{alert.message}</p>
                          <p className="text-xs mt-2 opacity-60">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {alert.action_url && (
                          <a
                            href={alert.action_url}
                            className="px-3 py-1 text-sm font-medium rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Students */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.students.total}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Active Today</span>
                      <span className="font-semibold">{stats.students.active_today}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Online Now</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {stats.students.online_now}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Attendance */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.attendance.attendance_rate.toFixed(1)}%
                  </div>
                  <Progress value={stats.attendance.attendance_rate} className="mt-2" />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Sessions Today</span>
                      <span className="font-semibold">{stats.attendance.sessions_today}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Active Now</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {stats.attendance.active_sessions}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gamification */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Gamification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.gamification.points_awarded_today}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Points Today</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Active Challenges</span>
                      <span className="font-semibold">{stats.gamification.challenges_active}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Rewards Redeemed</span>
                      <span className="font-semibold">{stats.gamification.rewards_redeemed_today}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Anomalies */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {stats.anomalies.critical}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Critical Issues</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Total Unresolved</span>
                      <span className="font-semibold">{stats.anomalies.total_unresolved}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Notifications Sent</span>
                      <span className="font-semibold">{stats.notifications.sent_today}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = getActivityIcon(activity.icon);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
