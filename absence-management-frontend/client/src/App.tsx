import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";


import Login from "./pages/Login";
import NotFound from "./pages/NotFound";


import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminTeachers from "./pages/admin/Teachers";
import AdminPrograms from "./pages/admin/Programs";
import AdminModules from "./pages/admin/Modules";
import AdminSchedule from "./pages/admin/Schedule";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";


import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherSessions from "./pages/teacher/Sessions";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherAnnouncements from "./pages/teacher/Announcements";


import StudentDashboard from "./pages/student/Dashboard";
import StudentAbsences from "./pages/student/Absences";
import StudentModules from "./pages/student/Modules";
import StudentDocuments from "./pages/student/Documents";
import StudentAnnouncements from "./pages/student/Announcements";
import StudentSettings from "./pages/student/Settings";
import ScanPresence from "./pages/student/ScanPresence";

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login" component={Login} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/students" component={AdminStudents} />
      <Route path="/admin/teachers" component={AdminTeachers} />
      <Route path="/admin/programs" component={AdminPrograms} />
      <Route path="/admin/modules" component={AdminModules} />
      <Route path="/admin/schedule" component={AdminSchedule} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/settings" component={AdminSettings} />

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" component={TeacherDashboard} />
      <Route path="/teacher/sessions" component={TeacherSessions} />
      <Route path="/teacher/attendance" component={TeacherAttendance} />
      <Route path="/teacher/announcements" component={TeacherAnnouncements} />

      {/* Student Routes */}
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/absences" component={StudentAbsences} />
      <Route path="/student/modules" component={StudentModules} />
      <Route path="/student/documents" component={StudentDocuments} />
      <Route path="/student/announcements" component={StudentAnnouncements} />
      <Route path="/student/settings" component={StudentSettings} />
      <Route path="/student/scan-presence" component={ScanPresence} />

      {/* Default and 404 Routes */}
      <Route path="/" component={Login} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
