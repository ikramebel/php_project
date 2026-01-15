import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { annonceAPI } from '@/lib/api';

interface AbsenceStat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface Annonce {
  id: string;
  titre: string;
  contenu: string;
  datepublication: string;
  enseignant: {
    name: string;
    prenom: string;
  };
}

interface AbsenceStat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function StudentDashboard() {
  const [absenceStats, setAbsenceStats] = useState<AbsenceStat[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        setAbsenceStats([
          {
            label: 'Absences Justifiées',
            value: 2,
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Absences Non Justifiées',
            value: 3,
            icon: <XCircle className="w-6 h-6" />,
            color: 'bg-red-100 text-red-600',
          },
          {
            label: 'Total des Absences',
            value: 5,
            icon: <AlertCircle className="w-6 h-6" />,
            color: 'bg-amber-100 text-amber-600',
          },
          {
            label: 'Taux de Présence',
            value: 94,
            icon: <BookOpen className="w-6 h-6" />,
            color: 'bg-blue-100 text-blue-600',
          },
        ]);

        // Fetch announcements
        const annoncesData = await annonceAPI.getAll();
        setAnnonces(annoncesData.annonces.slice(0, 5)); 
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['etudiant']}>
      <DashboardLayout
        title="Student Dashboard"
        description="View your absences, modules, and course materials"
      >
        {/* Absence Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {absenceStats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}{stat.label === 'Attendance Rate' ? '%' : ''}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6">
          {/* My Modules */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Mes Modules</h3>
            <div className="space-y-4">
              {[
                { name: 'Structures de Données', teacher: 'Prof. Ahmed Alaoui', progress: 75 },
                { name: 'Développement Web', teacher: 'Prof. Fatima Bennani', progress: 82 },
                { name: 'Conception de Bases de Données', teacher: 'Prof. Mohammed Chraibi', progress: 68 },
              ].map((module, index) => (
                <div key={index} className="pb-4 border-b border-border last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{module.name}</p>
                      <p className="text-xs text-muted-foreground">{module.teacher}</p>
                    </div>
                    <span className="text-xs font-bold text-primary">{module.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${module.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Announcements */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Annonces Récentes</h3>
          <div className="space-y-4">
            {annonces.length > 0 ? (
              annonces.map((annonce) => (
                <div key={annonce.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{annonce.titre}</p>
                    <p className="text-xs text-muted-foreground mb-2">{annonce.contenu}</p>
                    <p className="text-xs text-muted-foreground">
                      {annonce.enseignant.name} {annonce.enseignant.prenom}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucune annonce récente</p>
            )}
          </div>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
