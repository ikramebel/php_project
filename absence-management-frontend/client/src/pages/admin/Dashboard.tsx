import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, BarChart3, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface KPI {
  label: string;
  value: number | string;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiRequest('/dashboard/stats');
        setKpis([
          {
            label: 'Total Students',
            value: data.totalStudents,
            change: '+5% from last month', // You can calculate real changes if needed
            icon: <Users className="w-6 h-6" />,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Total Teachers',
            value: data.totalTeachers,
            change: '+2% from last month',
            icon: <BookOpen className="w-6 h-6" />,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Active Programs',
            value: data.totalPrograms,
            change: 'CP1, CP2, GIIA, GPMA, INDUS, GATE, GMSI, GTR',
            icon: <BarChart3 className="w-6 h-6" />,
            color: 'bg-amber-100 text-amber-600',
          },
          {
            label: 'Avg Attendance',
            value: data.avgAttendance,
            change: '+1.2% from last week',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-purple-100 text-purple-600',
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Fallback to mock data
        setKpis([
          {
            label: 'Total Students',
            value: 1250,
            change: '+5% from last month',
            icon: <Users className="w-6 h-6" />,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Total Teachers',
            value: 85,
            change: '+2% from last month',
            icon: <BookOpen className="w-6 h-6" />,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Active Programs',
            value: 8,
            change: 'CP1, CP2, GIIA, GPMA, INDUS, GATE, GMSI, GTR',
            icon: <BarChart3 className="w-6 h-6" />,
            color: 'bg-amber-100 text-amber-600',
          },
          {
            label: 'Avg Attendance',
            value: '92.5%',
            change: '+1.2% from last week',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-purple-100 text-purple-600',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout
        title="Admin Dashboard"
        description="Overview of the absence management system"
      >
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">{kpi.label}</p>
                  <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                  {kpi.change && (
                    <p className="text-xs text-muted-foreground mt-2">{kpi.change}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts and Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Reports</h3>
            <p className="text-sm text-muted-foreground mb-4">Generate and view detailed reports</p>
            <Button asChild className="w-full">
              <a href="/admin/reports">View Reports</a>
            </Button>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center gap-4 pb-4 border-b border-border last:border-b-0">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-foreground">{item}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Activity {item}</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Attendance Rate</span>
                  <span className="text-sm font-bold text-primary">92.5%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '92.5%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Data Integrity</span>
                  <span className="text-sm font-bold text-primary">99.8%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '99.8%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">System Health</span>
                  <span className="text-sm font-bold text-primary">100%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
