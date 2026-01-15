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
import { Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { filiereAPI, studentAPI } from '@/lib/api';

interface Student {
  id: string;
  name: string;
  prenom: string;
  email: string;
  apogee: string;
  filiere?: string;
  filiere_id?: string;
  semester?: number;
  annee_universitaire?: string;
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'late';
  date: string;
  module: string;
}

export default function TeacherAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filieres, setFilieres] = useState<any[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, selectedFiliere, selectedSemester, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch filieres
      const filieresData = await filiereAPI.getAll();
      setFilieres(Array.isArray(filieresData) ? filieresData : []);

      
      const additionalPrograms: any[] = [
        { id: 'CP1', nom: 'CP1' },
        { id: 'CP2', nom: 'CP2' },
        { id: 'GIIA', nom: 'GIIA' },
        { id: 'GPMA', nom: 'GPMA' },
        { id: 'GMSI', nom: 'GMSI' },
      ];
      setFilieres(prev => [...prev, ...additionalPrograms]);

      
      const studentsData = await studentAPI.getAll();
      setStudents(Array.isArray(studentsData) ? studentsData : []);

      
      setAttendanceRecords([]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setStudents([]);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = students;

    
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.apogee.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

   
    if (selectedFiliere && selectedFiliere !== 'all') {
      filtered = filtered.filter((s) => getStudentFiliereId(s) === selectedFiliere);
    }

    
    if (selectedSemester && selectedSemester !== 'all') {
      filtered = filtered.filter((s) => s.semester === parseInt(selectedSemester));
    }

    
    if (selectedYear && selectedYear !== 'all') {
      filtered = filtered.filter((s) => s.annee_universitaire === selectedYear);
    }

    setFilteredStudents(filtered);
  };

  const getAttendanceStatus = (studentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const record = attendanceRecords.find(r => r.studentId === studentId && r.date === today);
    return record?.status || 'not_recorded';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      default:
        return 'Not Recorded';
    }
  };

  const getFiliereName = (filiereId: string) => {
    let filiere = filieres.find(f => f.id === filiereId);
    if (!filiere) {
      filiere = filieres.find(f => f.nom === filiereId);
    }
    return filiere ? filiere.nom : filiereId;
  };

  const getStudentFiliereId = (student: Student) => {
    return student.filiere_id || student.filiere || '';
  };

  
  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, selectedFiliere, selectedSemester, selectedYear]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['enseignant']}>
        <DashboardLayout title="Attendance Tracking" description="Monitor student attendance">
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
        title="Attendance Tracking"
        description="Monitor and track student attendance records"
      >
        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search Students</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Name, email, apogee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filiere Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Program</label>
              <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {filieres.map((filiere) => (
                    <SelectItem key={filiere.id} value={filiere.id}>
                      {filiere.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Semester</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                  <SelectItem value="3">Semester 3</SelectItem>
                  <SelectItem value="4">Semester 4</SelectItem>
                  <SelectItem value="5">Semester 5</SelectItem>
                  <SelectItem value="6">Semester 6</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Academic Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-4">
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedFiliere('all');
                setSelectedSemester('all');
                setSelectedYear('all');
              }}
              variant="outline"
            >
              Reset Filters
            </Button>
          </div>
        </Card>

        {/* Attendance Table */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              Student Attendance ({filteredStudents.length})
            </h3>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No students found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    <th className="table-header">Student</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Apogee</th>
                    <th className="table-header">Program</th>
                    <th className="table-header">Semester</th>
                    <th className="table-header">Today's Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const status = getAttendanceStatus(student.id);
                    return (
                      <tr key={student.id} className="table-row border-b border-border">
                        <td className="table-cell font-medium">
                          {student.prenom} {student.name}
                        </td>
                        <td className="table-cell text-sm">{student.email}</td>
                        <td className="table-cell font-mono text-sm">{student.apogee}</td>
                        <td className="table-cell">
                          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                            {getFiliereName(getStudentFiliereId(student))}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                            Semester {student.semester || 'N/A'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span className="text-sm font-medium">{getStatusText(status)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
