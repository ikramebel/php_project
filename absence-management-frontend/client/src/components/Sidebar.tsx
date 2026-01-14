import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Briefcase,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

function getSidebarItems(role: UserRole): NavItem[] {
  const baseItems: Record<UserRole, NavItem[]> = {
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'Students', href: '/admin/students', icon: <Users className="w-5 h-5" /> },
      { label: 'Teachers', href: '/admin/teachers', icon: <Briefcase className="w-5 h-5" /> },
      { label: 'Programs', href: '/admin/programs', icon: <BookOpen className="w-5 h-5" /> },
      { label: 'Modules', href: '/admin/modules', icon: <FileText className="w-5 h-5" /> },
      { label: 'Schedule', href: '/admin/schedule', icon: <ClipboardList className="w-5 h-5" /> },
      { label: 'Reports', href: '/admin/reports', icon: <BarChart3 className="w-5 h-5" /> },
    ],
    enseignant: [
      { label: 'Dashboard', href: '/teacher/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'My Modules', href: '/teacher/modules', icon: <BookOpen className="w-5 h-5" /> },
      { label: 'Classes', href: '/teacher/classes', icon: <Users className="w-5 h-5" /> },
      { label: 'Attendance', href: '/teacher/attendance', icon: <ClipboardList className="w-5 h-5" /> },
      { label: 'Documents', href: '/teacher/documents', icon: <FileText className="w-5 h-5" /> },
      { label: 'Announcements', href: '/teacher/announcements', icon: <BarChart3 className="w-5 h-5" /> },
      { label: 'Settings', href: '/teacher/settings', icon: <Settings className="w-5 h-5" /> },
    ],
    etudiant: [
      { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'My Absences', href: '/student/absences', icon: <ClipboardList className="w-5 h-5" /> },
      { label: 'My Modules', href: '/student/modules', icon: <BookOpen className="w-5 h-5" /> },
      { label: 'Documents', href: '/student/documents', icon: <FileText className="w-5 h-5" /> },
      { label: 'Announcements', href: '/student/announcements', icon: <BarChart3 className="w-5 h-5" /> },
      { label: 'Settings', href: '/student/settings', icon: <Settings className="w-5 h-5" /> },
    ],
  };

  return baseItems[role] || [];
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const navItems = getSidebarItems(user.role);
  const isActive = (href: string) => location === href;

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const handleNavigation = (href: string) => {
    setLocation(href);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-white p-2 rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-primary text-white flex flex-col transition-transform duration-300 z-40 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">ENSA Safi</h1>
              <p className="text-xs text-white/70">Absence System</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ${
                isActive(item.href)
                  ? 'bg-white/20 border-l-4 border-accent text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-accent text-white text-xs rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="px-4 py-3 bg-white/10 rounded-lg">
            <p className="text-xs text-white/70">Logged in as</p>
            <p className="font-semibold text-sm truncate">{user.name} {user.prenom}</p>
            <p className="text-xs text-white/70 truncate">{user.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
