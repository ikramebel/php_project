import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { filiereAPI, studentAPI } from '@/lib/api';

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

interface FiliereWithCounts extends Filiere {
  studentCount: number;
}

export default function AdminPrograms() {
  const [filieres, setFilieres] = useState<FiliereWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilieresWithCounts = async () => {
      try {
        const filieresData = await filiereAPI.getAll() as Filiere[];
        const filieresWithCounts = await Promise.all(
          filieresData.map(async (filiere: any) => {
            const students = await studentAPI.getByFiliere(filiere.id) as any[];
            return {
              ...filiere,
              studentCount: students.length,
            };
          })
        );
        setFilieres(filieresWithCounts);
      } catch (error) {
        console.error('Failed to fetch filieres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilieresWithCounts();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout title="Program Management" description="Manage academic programs and filières">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout
        title="Program Management"
        description="Manage academic programs and filières"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filieres.map((filiere) => (
            <Card key={filiere.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{filiere.nom}</h3>
                  <p className="text-sm text-muted-foreground">{filiere.description}</p>
                </div>
                <Badge variant="secondary">Semester {filiere.semestre}</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Students:</span>
                  <span className="font-medium">{filiere.studentCount}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Département:</span>
                  <span className="font-medium">{filiere.departement?.nom || 'N/A'}</span>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Academic Year: {filiere.annee_universitaire}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {filieres.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No programs found</p>
          </Card>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
