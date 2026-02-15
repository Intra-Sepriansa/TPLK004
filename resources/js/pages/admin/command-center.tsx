import { Head } from '@inertiajs/react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  Activity, AlertTriangle, Users, TrendingUp, 
  Bell, Trophy, Target, Zap, CheckCircle, XCircle,
  Clock, BarChart3, Shield, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animated counter hook
  const useCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (!mounted) return;
      let startTime: number;
      let animationFrame: number;
      
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        setCount(Math.floor(progress * end));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, mounted]);
    
    return count;
  };

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <>
      <Head title="Command Center" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 relative overflow-hidden">
        {/* Floating Particles Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <motion.div 
          className="max-w-7xl mx-auto space-y-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header with Animated Gradient */}
          <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
          >
            {/* Animated Gradient Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            />
            
            {/* Glow orbs */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: 1,
              }}
              className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            />

            <div className="relative flex items-center justify-between">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Sparkles className="w-10 h-10" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-bold">
                      Command Center
                    </h1>
                    <p className="text-blue-100 mt-1">
                      Real-time system monitoring and control
                    </p>
                  </div>
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                  <motion.div 
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  <span className="text-sm font-medium">
                    System Online
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Critical Alerts */}
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-2 border-red-500/50 bg-red-500/5 overflow-hidden relative">
                  {/* Animated warning stripe */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </motion.div>
                      Active Alerts ({alerts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {alerts.map((alert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
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
                            <motion.a
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              href={alert.action_url}
                              className="px-3 py-1 text-sm font-medium rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
                            >
                              View
                            </motion.a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Students */}
            <motion.div
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                z: 50,
                boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 relative overflow-hidden">
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <Users className="w-4 h-4" />
                    </motion.div>
                    Students
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <motion.div 
                    className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                  >
                    {useCounter(stats.students.total)}
                  </motion.div>
                  <div className="mt-4 space-y-2">
                    <motion.div 
                      className="flex justify-between text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <span className="text-slate-600 dark:text-slate-400">Active Today</span>
                      <span className="font-semibold">{useCounter(stats.students.active_today, 1500)}</span>
                    </motion.div>
                    <motion.div 
                      className="flex justify-between text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <span className="text-slate-600 dark:text-slate-400">Online Now</span>
                      <motion.span 
                        className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1"
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <motion.div
                          className="w-1.5 h-1.5 bg-green-500 rounded-full"
                          animate={{
                            opacity: [1, 0.3, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                        />
                        {useCounter(stats.students.online_now, 1500)}
                      </motion.span>
                    </motion.div>
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
        </motion.div>
      </div>
    </>
  );
}
