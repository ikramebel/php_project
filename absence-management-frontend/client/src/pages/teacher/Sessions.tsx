import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QrCode, Play, Square, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { filiereAPI, moduleAPI, studentAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Filiere {
  id: string;
  nom: string;
}

interface Module {
  id: string;
  nom: string;
  filiere_id: string;
}

interface Student {
  id: string;
  name: string;
  prenom: string;
  email: string;
  apogee: string;
  filiere: string;
  semester: number;
  annee_universitaire: string;
}

const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026'];
const SEMESTERS = [1, 2, 3, 4, 5, 6];
const PROGRAMS = ['CP1', 'CP2', 'GIIA', 'GPMA', 'INDUS', 'GATE', 'GMSI', 'GTR'];

export default function TeacherSessions() {
  const { user } = useAuth();
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [allTeacherModules, setAllTeacherModules] = useState<Module[]>([]); // Store all teacher modules
  const [modules, setModules] = useState<Module[]>([]); // Filtered modules for display
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStudents, setSessionStudents] = useState<Student[]>([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  useEffect(() => {
    console.log('Component mounted, user:', user);
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedFiliere && selectedSemester && selectedYear) {
      fetchStudentsForSession();
    }
  }, [selectedFiliere, selectedSemester, selectedYear]);

  useEffect(() => {
    if (selectedFiliere) {
      filterModulesByFiliere(selectedFiliere);
      setSelectedModule(''); // Reset module selection when filiere changes
    } else {
      // Show all teacher modules when no filiere is selected
      setModules(allTeacherModules);
      setSelectedModule(''); // Reset module selection
    }
  }, [selectedFiliere, allTeacherModules]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filieresData = await filiereAPI.getAll();
      setFilieres(Array.isArray(filieresData) ? filieresData : []);

      // Add CP1 and CP2 as additional programs
      const additionalPrograms: Filiere[] = [
        { id: 'CP1', nom: 'CP1' },
        { id: 'CP2', nom: 'CP2' }
      ];
      setFilieres(prev => [...prev, ...additionalPrograms]);

      // Fetch modules for the current teacher
      if (user && user.role === 'enseignant') {
        const modulesData = await moduleAPI.getByEnseignant(user.id);
        const teacherModules = Array.isArray(modulesData) ? modulesData : [];
        setAllTeacherModules(teacherModules);
        setModules(teacherModules); // Initially show all teacher modules
        console.log('Loaded teacher modules:', teacherModules);
      } else {
        console.log('User not found or not teacher:', user);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Fallback to mock data if API fails
      const mockModules = [
        { id: '1', nom: 'Mathematics', filiere_id: 'GIIA' },
        { id: '2', nom: 'Physics', filiere_id: 'GIIA' },
        { id: '3', nom: 'Computer Science', filiere_id: 'GIIA' },
        { id: '4', nom: 'Data Structures', filiere_id: 'GIIA' },
        { id: '5', nom: 'Chemistry', filiere_id: 'CP1' },
        { id: '6', nom: 'Biology', filiere_id: 'CP1' },
        { id: '7', nom: 'Statistics', filiere_id: 'CP2' },
        { id: '8', nom: 'Programming', filiere_id: 'CP2' },
      ];
      setAllTeacherModules(mockModules);
      setModules(mockModules);
      console.log('Using mock modules:', mockModules);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForSession = async () => {
    try {
      // Fetch students by filiere, semester, and year
      const studentsData = await studentAPI.getAll() as Student[];
      const filteredStudents = studentsData.filter(student =>
        student.filiere === selectedFiliere &&
        student.semester === parseInt(selectedSemester) &&
        student.annee_universitaire === selectedYear
      );
      setSessionStudents(filteredStudents);
      console.log('Students for session:', filteredStudents);
    } catch (error) {
      console.error('Failed to fetch students for session:', error);
      // Fallback to mock data
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'Alaoui',
          prenom: 'Ahmed',
          email: 'ahmed.alaoui@uca.ac.ma',
          apogee: 'A123456',
          filiere: selectedFiliere,
          semester: parseInt(selectedSemester),
          annee_universitaire: selectedYear,
        },
        {
          id: '2',
          name: 'Bennani',
          prenom: 'Fatima',
          email: 'fatima.bennani@uca.ac.ma',
          apogee: 'A123457',
          filiere: selectedFiliere,
          semester: parseInt(selectedSemester),
          annee_universitaire: selectedYear,
        },
      ];
      setSessionStudents(mockStudents);
    }
  };

  const filterModulesByFiliere = (filiereId: string) => {
    console.log('Filtering modules for filiere:', filiereId);
    console.log('All teacher modules:', allTeacherModules);

    // Filter modules by selected filiere from the stored teacher modules
    const filteredModules = allTeacherModules.filter(module => module.filiere_id === filiereId);
    console.log('Filtered modules for filiere', filiereId, ':', filteredModules);
    setModules(filteredModules);
  };

  const startSession = () => {
    console.log('Start session called with:', {
      selectedFiliere,
      selectedModule,
      selectedYear,
      selectedSemester,
      sessionTitle,
      modules: modules.length,
      sessionStudents: sessionStudents.length
    });

    if (!selectedFiliere || !selectedModule || !selectedYear || !selectedSemester || !sessionTitle.trim()) {
      alert('Please select filiere, module, year, semester and enter session title');
      return;
    }

    // Generate QR code data (in a real app, this would be a unique session ID)
    const sessionData = {
      filiereId: selectedFiliere,
      moduleId: selectedModule,
      year: selectedYear,
      semester: selectedSemester,
      title: sessionTitle,
      timestamp: Date.now(),
      teacherId: user?.id || 'current-teacher-id',
      studentIds: sessionStudents.map(s => s.id), // All students in this session
    };

    // Generate QR code URL (using a QR code service)
    const qrData = btoa(JSON.stringify(sessionData));
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
    setIsSessionActive(true);
    setAttendanceMarked(false);
  };

  const stopSession = async () => {
    if (isSessionActive && !attendanceMarked) {
      // Mark all students as absent except those who scanned the QR code
      await markAttendanceForAllStudents();
    }

    setIsSessionActive(false);
    setQrCode(null);
    setAttendanceMarked(true);
  };

  const markAttendanceForAllStudents = async () => {
    try {
      // In a real implementation, this would call an API to mark attendance
      // For now, we'll simulate the attendance marking
      console.log('Marking attendance for all students in session:', sessionStudents);

      // Here you would typically send a request to mark all students as absent
      // and then mark present students who scanned the QR code

      // For demonstration, we'll just log the attendance
      const attendanceData = sessionStudents.map(student => ({
        studentId: student.id,
        sessionId: 'current-session-id',
        status: 'absent', // Default to absent, would be updated when QR is scanned
        timestamp: new Date().toISOString(),
      }));

      console.log('Attendance data:', attendanceData);

      // In a real app, you'd call something like:
      // await attendanceAPI.markBulkAttendance(attendanceData);

    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['enseignant']}>
        <DashboardLayout title="Sessions" description="Manage class sessions">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['enseignant']}>
      <DashboardLayout
        title="Sessions"
        description="Create and manage class sessions with QR code attendance"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Session Configuration</h3>

            <div className="space-y-4">
              {/* Filiere Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Program</label>
                <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {filieres.map((filiere) => (
                      <SelectItem key={filiere.id} value={filiere.id}>
                        {filiere.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Academic Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEARS.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Semester</label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((semester) => (
                      <SelectItem key={semester} value={semester.toString()}>
                        Semester {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Module Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Module</label>
                <Select
                  value={selectedModule}
                  onValueChange={setSelectedModule}
                  disabled={modules.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Session Title</label>
                <Input
                  type="text"
                  placeholder="e.g., Lecture 1: Introduction"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                />
              </div>

              {/* Students Count */}
              {sessionStudents.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {sessionStudents.length} students enrolled in this session
                    </span>
                  </div>
                </div>
              )}

              {/* Session Controls */}
              <div className="pt-4">
                {!isSessionActive ? (
                  <Button
                    onClick={startSession}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!selectedFiliere || !selectedModule || !selectedYear || !selectedSemester || !sessionTitle.trim()}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Session
                  </Button>
                ) : (
                  <Button
                    onClick={stopSession}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Session & Mark Attendance
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* QR Code Display & Student List */}
          <div className="space-y-6">
            {/* QR Code Display */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Attendance QR Code</h3>

              {isSessionActive && qrCode ? (
                <div className="text-center">
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Session Active</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Students can scan this QR code to mark their attendance
                    </p>
                  </div>

                  <div className="flex justify-center mb-4">
                    <img
                      src={qrCode}
                      alt="Attendance QR Code"
                      className="border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p><strong>Program:</strong> {filieres.find(f => f.id === selectedFiliere)?.nom || selectedFiliere}</p>
                    <p><strong>Module:</strong> {modules.find(m => m.id === selectedModule)?.nom || 'Not selected'}</p>
                    <p><strong>Year:</strong> {selectedYear}</p>
                    <p><strong>Semester:</strong> {selectedSemester}</p>
                    <p><strong>Title:</strong> {sessionTitle}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Configure and start a session to generate the attendance QR code
                  </p>
                </div>
              )}
            </Card>

            {/* Students in Session */}
            {sessionStudents.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Students in Session ({sessionStudents.length})
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sessionStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">
                          {student.prenom} {student.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground">Apogee: {student.apogee}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isSessionActive ? (
                          <span className="text-xs text-muted-foreground">Not started</span>
                        ) : attendanceMarked ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-xs">Absent</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isSessionActive && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      When session ends, all students will be marked as absent unless they scanned the QR code.
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}