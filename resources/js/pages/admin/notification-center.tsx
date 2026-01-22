import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Bell, Send, Users, Mail, MessageSquare, 
  Smartphone, TrendingUp, Eye, MousePointer, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Campaign {
  id: number;
  name: string;
  description: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
  template: {
    name: string;
    type: string;
  };
}

interface NotificationCenterProps {
  campaigns: {
    data: Campaign[];
  };
}

export default function NotificationCenter({ campaigns }: NotificationCenterProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_id: '',
    target_type: 'all',
    scheduled_at: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500/10 text-green-600 border-green-500/50';
      case 'sending': return 'bg-blue-500/10 text-blue-600 border-blue-500/50';
      case 'scheduled': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/50';
      case 'draft': return 'bg-slate-500/10 text-slate-600 border-slate-500/50';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'push': return Smartphone;
      case 'sms': return MessageSquare;
      default: return Bell;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/admin/notifications/campaigns', formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData({
          name: '',
          description: '',
          template_id: '',
          target_type: 'all',
          scheduled_at: '',
        });
      },
    });
  };

  return (
    <>
      <Head title="Notification Center" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Smart Notification Center
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage and track all communications
              </p>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Notification Campaign</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Campaign Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Weekly Attendance Reminder"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this campaign"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Target Audience</label>
                    <Select
                      value={formData.target_type}
                      onValueChange={(value) => setFormData({ ...formData, target_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="role">By Role</SelectItem>
                        <SelectItem value="class">By Class</SelectItem>
                        <SelectItem value="custom">Custom Filter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Schedule (Optional)</label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Campaign
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Campaigns List */}
          <div className="grid gap-6">
            {campaigns.data.map((campaign, index) => {
              const TypeIcon = getTypeIcon(campaign.template.type);
              const openRate = campaign.sent_count > 0 
                ? (campaign.opened_count / campaign.sent_count) * 100 
                : 0;
              const clickRate = campaign.sent_count > 0 
                ? (campaign.clicked_count / campaign.sent_count) * 100 
                : 0;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10">
                              <TypeIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{campaign.name}</CardTitle>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {campaign.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(campaign.status)} border`}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Users className="w-4 h-4" />
                            <span className="text-xs">Recipients</span>
                          </div>
                          <p className="text-2xl font-bold">{campaign.total_recipients}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Send className="w-4 h-4" />
                            <span className="text-xs">Sent</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {campaign.sent_count}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Eye className="w-4 h-4" />
                            <span className="text-xs">Open Rate</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {openRate.toFixed(1)}%
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <MousePointer className="w-4 h-4" />
                            <span className="text-xs">Click Rate</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {clickRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Created {new Date(campaign.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit(`/admin/notifications/campaigns/${campaign.id}/stats`)}
                          >
                            View Stats
                          </Button>
                          {campaign.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => router.post(`/admin/notifications/campaigns/${campaign.id}/send`)}
                            >
                              Send Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {campaigns.data.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Bell className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No campaigns yet
              </h3>
              <p className="text-slate-500 dark:text-slate-500 mb-4">
                Create your first notification campaign to get started
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
