import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, User, GraduationCap, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { moduleAPI, filiereAPI } from '@/lib/api';

interface Module {
  id: string;
  nom: string;
  filiere: {
    id: string;
    nom: string;
  };
  enseignant: {
    id: string;
    user: {
      name: string;
      prenom: string;
    };
  };
}

interface Filiere {
  id: string;
  nom: string;
}

export default function AdminModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiliere, setSelectedFiliere] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesResponse, filieresResponse] = await Promise.all([
          moduleAPI.getAll(),
          filiereAPI.getAll()
        ]);
        setModules(modulesResponse.data || []);
        setFilieres(filieresResponse || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [modules, selectedFiliere]);

  const applyFilters = () => {
    let filtered = modules;

    if (selectedFiliere && selectedFiliere !== 'all') {
      filtered = filtered.filter((module) => module.filiere?.id === selectedFiliere);
    }

    setFilteredModules(filtered);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout title="Module Management" description="Manage modules and course assignments">
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
        title="Module Management"
        description="Manage modules and course assignments"
      >
        {/* Filter Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filiere */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Filière</label>
              <Select value={selectedFiliere} onValueChange={setSelectedFiliere}>
                <SelectTrigger>
                  <SelectValue placeholder="All Filières" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Filières</SelectItem>
                  {filieres.map((filiere) => (
                    <SelectItem key={filiere.id} value={filiere.id}>
                      {filiere.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Button
                onClick={() => setSelectedFiliere('all')}
                variant="outline"
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <Card key={module.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{module.nom}</h3>
                </div>
                <Badge variant="secondary">{module.filiere?.nom || 'N/A'}</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Filière:</span>
                  <span className="font-medium">{module.filiere?.nom || 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Professeur:</span>
                  <span className="font-medium">
                    {module.enseignant?.user?.prenom} {module.enseignant?.user?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
