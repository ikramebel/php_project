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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, Search, Filter, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { studentAPI, filiereAPI } from '@/lib/api';

interface Student {
  id: string;
  name: string;
  prenom: string;
  email: string;
  apogee: string;
  filiere: any; 
  filiere_id?: string;
  semester: number;
  annee_universitaire: string;
}

interface Filiere {
  id: string;
  nom: string;
  description?: string;
  semestre: number;
  annee_universitaire: string;
  departement: {
    id: string;
    nom: string;
  };
}

const FILIERES = ['CP1', 'CP2', 'GIIA', 'GPMA', 'INDUS', 'GATE', 'GMSI', 'GTR'];
const SEMESTERS = [1, 2, 3, 4, 5, 6];
const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026'];

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  
  useEffect(() => {
    fetchData();
  }, []);

  
  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, selectedFiliere, selectedSemester, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const filieresData = await filiereAPI.getAll();
      console.log('Filieres data:', filieresData);
      setFilieres(Array.isArray(filieresData) ? filieresData : []);

      
      try {
        const data = await studentAPI.getAll() as any;
        console.log('Students data:', data);
        setStudents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.warn('Failed to fetch students from API:', error);
        setStudents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFiliereName = (filiereId: string) => {
    console.log('Looking for filiere with id:', filiereId, 'in filieres:', filieres);
    let filiere = filieres.find(f => f.id === filiereId);
    if (!filiere) {
      filiere = filieres.find(f => f.nom === filiereId);
    }
    const result = filiere ? filiere.nom : filiereId; 
    console.log('Found filiere:', filiere, 'returning:', result);
    return result;
  };

  const applyFilters = () => {
    let filtered = students;

    // Search filter
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
      filtered = filtered.filter((s) => {
        const filiereId = s.filiere_id || (s.filiere && typeof s.filiere === 'object' ? s.filiere.id : s.filiere);
        if (!filiereId) return false;
        const studentFiliere = getFiliereName(filiereId);
        return studentFiliere === selectedFiliere;
      });
    }

    
    if (selectedSemester && selectedSemester !== 'all') {
      filtered = filtered.filter((s) => s.semester === parseInt(selectedSemester));
    }

    
    if (selectedYear && selectedYear !== 'all') {
      filtered = filtered.filter((s) => s.annee_universitaire === selectedYear);
    }

    setFilteredStudents(filtered);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (student: Student) => {
    setDeletingStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingStudent) return;

    try {
      setIsDeleting(true);
      await studentAPI.delete(deletingStudent.id);
      setStudents(students.filter((s) => s.id !== deletingStudent.id));
      toast.success('Student deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingStudent(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;

    try {
      setIsSaving(true);
      await studentAPI.update(editingStudent.id, {
        name: editingStudent.name,
        prenom: editingStudent.prenom,
        email: editingStudent.email,
        apogee: editingStudent.apogee,
      });
      setStudents(students.map((s) => (s.id === editingStudent.id ? editingStudent : s)));
      toast.success('Student updated successfully');
      setIsEditDialogOpen(false);
      setEditingStudent(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update student');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout
        title="Student Management"
        description="Manage and filter students by program, semester, and academic year"
      >
        {/* Filter Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search</label>
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

            {/* Filiere */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Program</label>
              <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {filieres.map((f) => (
                    <SelectItem key={f.id} value={f.nom}>
                      {f.nom}
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
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {SEMESTERS.map((s) => (
                    <SelectItem key={s} value={s.toString()}>
                      Semester {s}
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
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {ACADEMIC_YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFiliere('');
                  setSelectedSemester('');
                  setSelectedYear('');
                }}
                variant="outline"
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Students Table */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              Students ({filteredStudents.length})
            </h3>
            <Button className="bg-primary hover:opacity-90 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Student
            </Button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No students found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    <th className="table-header">Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Apogee</th>
                    <th className="table-header">Program</th>
                    <th className="table-header">Semester</th>
                    <th className="table-header">Year</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="table-row border-b border-border">
                      <td className="table-cell font-medium">
                        {student.prenom} {student.name}
                      </td>
                      <td className="table-cell text-sm">{student.email}</td>
                      <td className="table-cell font-mono text-sm">{student.apogee}</td>
                      <td className="table-cell">
                        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                          {student.filiere_id ? getFiliereName(student.filiere_id) : student.filiere && typeof student.filiere === 'object' ? student.filiere.nom : student.filiere || 'N/A'}
                        </span>
                      </td>
                      <td className="table-cell text-center">{student.semester}</td>
                      <td className="table-cell text-sm">{student.annee_universitaire}</td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors duration-150"
                            title="Edit student"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors duration-150"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>Update student information</DialogDescription>
            </DialogHeader>

            {editingStudent && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                  <Input
                    value={editingStudent.prenom}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, prenom: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                  <Input
                    value={editingStudent.name}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <Input
                    value={editingStudent.email}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Apogee</label>
                  <Input
                    value={editingStudent.apogee}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, apogee: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="flex-1 bg-primary hover:opacity-90 text-white flex items-center justify-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditDialogOpen(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Student</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {deletingStudent?.prenom} {deletingStudent?.name}?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(false)}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
