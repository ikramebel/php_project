import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Send, Users, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target: 'students' | 'teachers' | 'all';
  createdAt: string;
}

export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'students' | 'teachers' | 'all'>('students');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // In a real app, this would call an API
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        target,
        createdAt: new Date().toISOString(),
      };

      setAnnouncements([newAnnouncement, ...announcements]);

      // Reset form
      setTitle('');
      setContent('');
      setTarget('students');

      toast.success('Announcement posted successfully');
    } catch (error) {
      toast.error('Failed to post announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'students':
        return <Users className="w-4 h-4" />;
      case 'teachers':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTargetColor = (target: string) => {
    switch (target) {
      case 'students':
        return 'bg-blue-100 text-blue-700';
      case 'teachers':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['enseignant']}>
      <DashboardLayout
        title="Announcements"
        description="Post and manage announcements for students and teachers"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Announcement */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create Announcement</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Target Audience</label>
                <Select value={target} onValueChange={(value: 'students' | 'teachers' | 'all') => setTarget(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Students
                      </div>
                    </SelectItem>
                    <SelectItem value="teachers">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Teachers
                      </div>
                    </SelectItem>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        All
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                <Input
                  type="text"
                  placeholder="Announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                <Textarea
                  placeholder="Announcement content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Announcement
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Recent Announcements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Announcements</h3>

            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No announcements yet</p>
                <p className="text-sm text-muted-foreground">Create your first announcement</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{announcement.title}</h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTargetColor(announcement.target)}`}>
                        {getTargetIcon(announcement.target)}
                        {announcement.target}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
