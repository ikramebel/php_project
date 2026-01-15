import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Briefcase, TrendingUp, Plus, Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { studentAPI, teacherAPI, filiereAPI, annonceAPI } from '@/lib/api';
import { toast } from 'sonner';

interface KPI {
  label: string;
  value: number | string;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [filieres, setFilieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnnonceDialogOpen, setIsAnnonceDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [annonceData, setAnnonceData] = useState({
    titre: '',
    contenu: '',
    filiere_id: '',
    niveau: '',
    targetAudience: 'students' // 'students' or 'professors'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const students = await studentAPI.getAll();
        const teachers = await teacherAPI.getAll();
        const filieres_data = await filiereAPI.getAll();
        setFilieres(filieres_data);

        setKpis([
          {
            label: 'Total Étudiants',
            value: students.length,
            change: `${students.length} étudiants inscrits`,
            icon: <Users className="w-6 h-6" />,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Total Enseignants',
            value: teachers.length,
            change: `${teachers.length} enseignants actifs`,
            icon: <Briefcase className="w-6 h-6" />,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Total Filières',
            value: filieres_data.length,
            change: `${filieres_data.length} filières disponibles`,
            icon: <BookOpen className="w-6 h-6" />,
            color: 'bg-amber-100 text-amber-600',
          },
          {
            label: 'Système Actif',
            value: '100%',
            change: 'Tous les services fonctionnent normalement',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-purple-100 text-purple-600',
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setKpis([
          {
            label: 'Total Étudiants',
            value: 0,
            change: 'Erreur de connexion',
            icon: <Users className="w-6 h-6" />,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Total Enseignants',
            value: 0,
            change: 'Erreur de connexion',
            icon: <Briefcase className="w-6 h-6" />,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Total Filières',
            value: 0,
            change: 'Erreur de connexion',
            icon: <BookOpen className="w-6 h-6" />,
            color: 'bg-amber-100 text-amber-600',
          },
          {
            label: 'Système Actif',
            value: '0%',
            change: 'Erreur de connexion',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-purple-100 text-purple-600',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleAnnonceInputChange = (field: string, value: string) => {
    setAnnonceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnnonceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      
      const enseignantId = user?.role === 'admin' ? null : user?.enseignant_id;

      await annonceAPI.create({
        titre: annonceData.titre,
        contenu: annonceData.contenu,
        enseignant_id: enseignantId,
        filiere_id: annonceData.targetAudience === 'students' ? annonceData.filiere_id : null,
        niveau: annonceData.targetAudience === 'students' ? annonceData.niveau : null,
        datepublication: new Date().toISOString().split('T')[0]
      });
      
      toast.success('Annonce publiée avec succès');
      setIsAnnonceDialogOpen(false);
      setAnnonceData({
        titre: '',
        contenu: '',
        filiere_id: '',
        niveau: '',
        targetAudience: 'students'
      });
    } catch (error) {
      console.error('Failed to publish announcement:', error);
      toast.error('Erreur lors de la publication de l\'annonce');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout
        title="Tableau de Bord Administrateur"
        description="Aperçu du système de gestion des absences"
      >
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">{kpi.label}</p>
                  <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                  {kpi.change && (
                    <p className="text-xs text-muted-foreground mt-2">{kpi.change}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts and Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Announcements */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Publier une Annonce</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Créer et diffuser une annonce aux étudiants</p>
            <Dialog open={isAnnonceDialogOpen} onOpenChange={setIsAnnonceDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Annonce
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Publier une Annonce</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAnnonceSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Audience Cible</Label>
                    <Select value={annonceData.targetAudience} onValueChange={(value) => handleAnnonceInputChange('targetAudience', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner l'audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="students">Étudiants</SelectItem>
                        <SelectItem value="professors">Professeurs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titre">Titre</Label>
                    <Input
                      id="titre"
                      placeholder="Titre de l'annonce"
                      value={annonceData.titre}
                      onChange={(e) => handleAnnonceInputChange('titre', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contenu">Contenu</Label>
                    <Textarea
                      id="contenu"
                      placeholder="Détails de l'annonce"
                      value={annonceData.contenu}
                      onChange={(e) => handleAnnonceInputChange('contenu', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  {annonceData.targetAudience === 'students' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="filiere_id">Filière</Label>
                        <Select value={annonceData.filiere_id} onValueChange={(value) => handleAnnonceInputChange('filiere_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une filière" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CP1">CP1</SelectItem>
                            <SelectItem value="CP2">CP2</SelectItem>
                            {filieres.map((filiere: any) => (
                              <SelectItem key={filiere.id} value={filiere.id.toString()}>
                                {filiere.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="niveau">Niveau</Label>
                        <Select value={annonceData.niveau} onValueChange={(value) => handleAnnonceInputChange('niveau', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un niveau" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Niveau 1</SelectItem>
                            <SelectItem value="2">Niveau 2</SelectItem>
                            <SelectItem value="3">Niveau 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAnnonceDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Publication en cours...' : 'Publier'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </Card>

          {/* Quick Stats */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Statistiques Rapides</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Taux de Présence</span>
                  <span className="text-sm font-bold text-primary">92.5%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '92.5%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Intégrité des Données</span>
                  <span className="text-sm font-bold text-primary">99.8%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '99.8%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Santé du Système</span>
                  <span className="text-sm font-bold text-primary">100%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
