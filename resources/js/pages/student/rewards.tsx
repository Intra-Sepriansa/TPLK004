import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  Gift, Star, Package, Clock, ArrowLeft, Sparkles
} from 'lucide-react';

interface Reward {
  id: number;
  name: string;
  description: string;
  type: string;
  cost_points: number;
  stock: number | null;
  image_url: string | null;
  is_available: boolean;
}

interface Redemption {
  id: number;
  points_spent: number;
  status: string;
  created_at: string;
  reward: Reward;
}

interface RewardsProps {
  rewards: Reward[];
  myRedemptions: Redemption[];
  myPoints: number;
}

export default function Rewards({ rewards, myRedemptions, myPoints }: RewardsProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Animation variants - MATCHING DASHBOARD
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
  } as const;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'badge': return 'from-yellow-400 to-amber-600';
      case 'privilege': return 'from-purple-400 to-violet-600';
      case 'physical': return 'from-blue-400 to-indigo-600';
      case 'digital': return 'from-emerald-400 to-teal-600';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'approved': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  const handleRedeem = (reward: Reward) => {
    setSelectedReward(reward);
    setIsConfirmOpen(true);
  };

  const confirmRedeem = () => {
    if (selectedReward) {
      router.post('/student/rewards/redeem', {
        reward_id: selectedReward.id,
      }, {
        onSuccess: () => {
          setIsConfirmOpen(false);
          setSelectedReward(null);
        },
      });
    }
  };

  const canAfford = (cost: number) => myPoints >= cost;

  return (
    <StudentLayout>
      <Head title="Rewards Store" />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
      >
        {/* ═══════ HERO HEADER — 100% MATCHING DASHBOARD ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% 200%' }}
          />

          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            {/* Tombol Kembali */}
            <motion.button
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.visit('/user/dashboard')}
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </motion.button>

            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                {/* Icon Header */}
                <motion.div
                  className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Gift className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] text-white" />
                </motion.div>
                
                <div className="flex-1 mt-1 sm:mt-0">
                  <motion.p
                    className="text-sm text-indigo-100 font-medium tracking-wide flex items-center justify-center sm:justify-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Toko Hadiah
                  </motion.p>
                  <motion.h1
                    className="text-2xl sm:text-3xl font-bold text-white mt-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Rewards Store
                  </motion.h1>
                  <motion.p
                    className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Tukarkan poin kamu dengan hadiah menarik
                  </motion.p>
                </div>
              </div>

              {/* Points Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10"
              >
                <div className="text-right">
                  <p className="text-white/90 text-xs font-medium uppercase tracking-wider">
                    Poin Kamu
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-6 w-6 text-yellow-300" />
                    <span className="text-3xl font-bold text-white">
                      <AnimatedCounter value={myPoints} />
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ═══════ AVAILABLE REWARDS SECTION ═══════ */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 text-white shadow-lg shadow-purple-500/30">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Hadiah Tersedia
              </h2>
              <p className="text-sm text-neutral-500">
                Pilih hadiah yang ingin kamu tukarkan
              </p>
            </div>
          </div>

          {rewards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {rewards.map((reward, index) => {
                const gradientClass = getTypeColor(reward.type);
                const affordable = canAfford(reward.cost_points);

                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    onHoverStart={() => setHoveredCard(reward.id)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className={cn(
                      "rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden",
                      !affordable && 'opacity-50'
                    )}
                  >
                    {/* Image/Icon Section */}
                    <div className={`h-40 bg-gradient-to-br ${gradientClass} flex items-center justify-center relative overflow-hidden`}>
                      {reward.image_url ? (
                        <img 
                          src={reward.image_url} 
                          alt={reward.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Gift className="h-16 w-16 text-white/50" />
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/20 backdrop-blur text-white border-white/30 capitalize">
                          {reward.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                          {reward.name}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                          {reward.description}
                        </p>
                      </div>

                      {reward.stock !== null && (
                        <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/50">
                          <span className="text-neutral-600 dark:text-neutral-400">Stok Tersisa</span>
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {reward.stock} item
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            <AnimatedCounter value={reward.cost_points} />
                          </span>
                        </div>
                        <Button
                          onClick={() => handleRedeem(reward)}
                          disabled={!affordable || !reward.is_available}
                          className={cn(
                            "rounded-xl",
                            affordable && reward.is_available
                              ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                              : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'
                          )}
                        >
                          {!affordable ? 'Poin Kurang' : 'Tukar'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                <Gift className="h-10 w-10 text-purple-500 dark:text-purple-400" />
              </div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Belum Ada Hadiah
              </p>
              <p className="text-sm text-neutral-500">
                Hadiah akan segera tersedia, cek kembali nanti
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* ═══════ MY REDEMPTIONS SECTION ═══════ */}
        {myRedemptions.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Riwayat Penukaran
                </h2>
                <p className="text-sm text-neutral-500">
                  Hadiah yang sudah kamu tukarkan
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {myRedemptions.map((redemption, index) => (
                <motion.div
                  key={redemption.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 text-white shadow-lg shrink-0">
                        <Package className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                          {redemption.reward.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                            <Clock className="h-4 w-4" />
                            {new Date(redemption.created_at).toLocaleDateString('id-ID')}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                            <Star className="h-4 w-4" />
                            {redemption.points_spent} poin
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(redemption.status)} capitalize shrink-0`}>
                      {redemption.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="rounded-3xl border border-white/20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Konfirmasi Penukaran</DialogTitle>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <p className="text-neutral-600 dark:text-neutral-400">
                Apakah kamu yakin ingin menukar <strong>{selectedReward.name}</strong>?
              </p>
              <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Biaya:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {selectedReward.cost_points} poin
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Poin Kamu:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {myPoints} poin
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-600 dark:text-neutral-400">Setelah Penukaran:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {myPoints - selectedReward.cost_points} poin
                  </span>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setIsConfirmOpen(false)}
                  className="rounded-xl"
                >
                  Batal
                </Button>
                <Button 
                  onClick={confirmRedeem}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  Konfirmasi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
