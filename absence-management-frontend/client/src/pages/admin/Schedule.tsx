import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { seanceAPI } from '@/lib/api';

interface Seance {
  id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  salle: string;
  module: {
    id: string;
    nom: string;
  };
  enseignant: {
    id: string;
    name: string;
    prenom: string;
  };
}

export default function AdminSchedule() {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeances = async () => {
      try {
        const data = await seanceAPI.getAll();
        setSeances(data);
      } catch (error) {
        console.error('Failed to fetch seances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeances();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout title="Schedule Management" description="Manage class schedules and timetables">
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
        title="Schedule Management"
        description="Manage class schedules and timetables"
      >
        <div className="space-y-6">
          {seances.map((seance) => (
            <Card key={seance.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{seance.module.nom}</h3>
                  <p className="text-sm text-muted-foreground">with {seance.enseignant.name} {seance.enseignant.prenom}</p>
                </div>
                <Badge variant="outline">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(seance.date).toLocaleDateString()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">
                    {seance.heure_debut} - {seance.heure_fin}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="text-sm">{seance.salle}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{seance.enseignant.name} {seance.enseignant.prenom}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {seances.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No scheduled sessions found</p>
          </Card>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
