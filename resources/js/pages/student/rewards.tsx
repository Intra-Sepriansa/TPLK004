import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Gift, ShoppingCart, Award, Star, 
  Package, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'badge': return 'from-yellow-500 to-yellow-600';
      case 'privilege': return 'from-purple-500 to-purple-600';
      case 'physical': return 'from-blue-500 to-blue-600';
      case 'digital': return 'from-green-500 to-green-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-500/50';
      case 'approved': return 'bg-blue-500/10 text-blue-600 border-blue-500/50';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/50';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/50';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/50';
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
    <>
      <Head title="Rewards Store" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Rewards Store
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Redeem your points for amazing rewards
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">Your Points</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-6 h-6 text-yellow-500" />
                <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {myPoints}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Available Rewards */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              Available Rewards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward, index) => {
                const gradientClass = getTypeColor(reward.type);
                const affordable = canAfford(reward.cost_points);

                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`overflow-hidden hover:shadow-xl transition-all ${
                      !affordable ? 'opacity-50' : ''
                    }`}>
                      <div className={`h-40 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                        {reward.image_url ? (
                          <img 
                            src={reward.image_url} 
                            alt={reward.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Gift className="w-16 h-16 text-white/50" />
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{reward.name}</CardTitle>
                          <Badge variant="outline" className="capitalize">
                            {reward.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          {reward.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {reward.stock !== null && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400">Stock</span>
                              <span className="font-semibold">{reward.stock} left</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-500" />
                              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {reward.cost_points}
                              </span>
                            </div>
                            <Button
                              onClick={() => handleRedeem(reward)}
                              disabled={!affordable || !reward.is_available}
                              className={`${
                                affordable && reward.is_available
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                  : ''
                              }`}
                            >
                              {!affordable ? 'Not Enough Points' : 'Redeem'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* My Redemptions */}
          {myRedemptions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                My Redemptions
              </h2>
              <div className="grid gap-4">
                {myRedemptions.map((redemption, index) => (
                  <motion.div
                    key={redemption.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-purple-500/10">
                              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{redemption.reward.name}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                  <Clock className="w-4 h-4" />
                                  {new Date(redemption.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                                  <Star className="w-4 h-4" />
                                  {redemption.points_spent} points
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(redemption.status)} border`}>
                            {redemption.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {rewards.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Gift className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No rewards available
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                Check back later for new rewards
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Are you sure you want to redeem <strong>{selectedReward.name}</strong>?
              </p>
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Cost:</span>
                  <span className="font-semibold">{selectedReward.cost_points} points</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Points:</span>
                  <span className="font-semibold">{myPoints} points</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>After Redemption:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {myPoints - selectedReward.cost_points} points
                  </span>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmRedeem}>
                  Confirm Redemption
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
