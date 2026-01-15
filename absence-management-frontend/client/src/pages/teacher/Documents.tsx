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
import { Upload, File, Trash2, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { filiereAPI, moduleAPI, documentsAPI } from '@/lib/api';
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

interface DocumentFile {
  id: string;
  titre: string;
  url: string;
  dateupload: string;
  enseignant_id: number;
}

const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026'];
const SEMESTERS = [1, 2, 3, 4, 5, 6];

export default function TeacherDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchModulesByFiliere(selectedFiliere);
  }, [selectedFiliere, modules]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filieresData = await filiereAPI.getAll();
      setFilieres(Array.isArray(filieresData) ? filieresData : []);

      
      const additionalPrograms: Filiere[] = [
        { id: 'CP1', nom: 'CP1' },
        { id: 'CP2', nom: 'CP2' }
      ];
      setFilieres(prev => [...prev, ...additionalPrograms]);

      
      if (user && user.role === 'enseignant') {
        try {
          const modulesData = await moduleAPI.getByEnseignant(user.enseignant_id);
          const teacherModules = Array.isArray(modulesData) ? modulesData : [];
          setModules(teacherModules);
          setFilteredModules(teacherModules); // Initially show all teacher modules
        } catch (error) {
          console.warn('Failed to fetch modules from API:', error);
          setModules([]);
          setFilteredModules([]);
        }
      }

      
      if (user && user.role === 'enseignant') {
        try {
          const documentsData = await documentsAPI.getByTeacher(user.id);
          setDocuments(Array.isArray(documentsData) ? documentsData : []);
        } catch (error) {
          console.warn('Failed to fetch documents from API:', error);
          setDocuments([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModulesByFiliere = (filiereId: string) => {
    
    if (filiereId) {
      const filtered = modules.filter(module => module.filiere_id === filiereId);
      setFilteredModules(filtered);
    } else {
      setFilteredModules(modules); 
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedFiliere || !selectedModule || !selectedSemester || !selectedYear) {
      alert('Please select all required fields and a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('filiere_id', selectedFiliere);
      formData.append('module_id', selectedModule);
      formData.append('semester', selectedSemester);
      formData.append('annee_universitaire', selectedYear);
      formData.append('teacher_id', user?.id || '');

      
      const result = await documentsAPI.upload(formData);
      console.log('File uploaded successfully:', result);

      
      if (user && user.role === 'enseignant') {
        const documentsData = await documentsAPI.getByTeacher(user.id);
        setDocuments(Array.isArray(documentsData) ? documentsData : []);
      }

      
      setSelectedFile(null);
      setSelectedFiliere('');
      setSelectedModule('');
      setSelectedSemester('');
      setSelectedYear('');
    } catch (error) {
      console.error('Failed to upload file:', error);
      
      const newDocument: DocumentFile = {
        id: Date.now().toString(),
        name: selectedFile.name,
        url: '#',
        filiere_id: selectedFiliere,
        module_id: selectedModule,
        semester: parseInt(selectedSemester),
        annee_universitaire: selectedYear,
        uploaded_at: new Date().toISOString().split('T')[0]
      };
      setDocuments(prev => [...prev, newDocument]);
      setSelectedFile(null);
      setSelectedFiliere('');
      setSelectedModule('');
      setSelectedSemester('');
      setSelectedYear('');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      await documentsAPI.delete(documentId);
      
      if (user && user.role === 'enseignant') {
        const documentsData = await documentsAPI.getByTeacher(user.id);
        setDocuments(Array.isArray(documentsData) ? documentsData : []);
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    }
  };

  const filteredDocuments = documents.filter(doc =>
    (!selectedFiliere || doc.filiere_id === selectedFiliere) &&
    (!selectedModule || doc.module_id === selectedModule) &&
    (!selectedSemester || doc.semester === parseInt(selectedSemester)) &&
    (!selectedYear || doc.annee_universitaire === selectedYear)
  );

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['enseignant']}>
        <DashboardLayout title="Course Documents" description="Upload and manage course materials">
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
        title="Course Documents"
        description="Upload and manage course materials for specific classes"
      >
        {/* Upload Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Upload Document</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Filiere Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Program</label>
              <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
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

            {/* Module Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Module</label>
              <Select
                value={selectedModule}
                onValueChange={setSelectedModule}
                disabled={!selectedFiliere}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
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

            {/* Semester Selection */}
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

            {/* Year Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Academic Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
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

            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">File</label>
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              />
            </div>

            {/* Upload Button */}
            <div className="flex items-end">
              <Button
                onClick={handleFileUpload}
                disabled={uploading || !selectedFile}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Documents List */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              Course Documents ({filteredDocuments.length})
            </h3>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No documents found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-foreground">{document.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {document.annee_universitaire} • Semester {document.semester} • Uploaded {document.uploaded_at}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDocument(document.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
