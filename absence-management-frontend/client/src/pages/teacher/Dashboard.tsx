import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, MessageSquare, Users, Calendar } from 'lucide-react';
import { Link } from 'wouter';

export default function TeacherDashboard() {
  return (
    <ProtectedRoute allowedRoles={['enseignant']}>
      <DashboardLayout
        title="Teacher Dashboard"
        description="Manage your classes, attendance, and announcements"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sessions Management */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Sessions</h3>
                <p className="text-sm text-muted-foreground">Manage class sessions</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Select program and module, then generate QR code for attendance
            </p>
            <Link href="/teacher/sessions">
              <Button className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Sessions
              </Button>
            </Link>
          </Card>

          {/* Announcements */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Announcements</h3>
                <p className="text-sm text-muted-foreground">Post announcements</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Create announcements for students or teachers
            </p>
            <Link href="/teacher/announcements">
              <Button className="w-full" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Manage Announcements
              </Button>
            </Link>
          </Card>

          {/* Attendance Tracking */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Attendance</h3>
                <p className="text-sm text-muted-foreground">Track student attendance</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              View and monitor student attendance records
            </p>
            <Link href="/teacher/attendance">
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                View Attendance
              </Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
