import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Send, Users, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Announcement {
  id: number;
  titre: string;
  contenu: string;
  target?: 'students' | 'teachers' | 'all';
  created_at: string;
}

export default function TeacherAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'students' | 'teachers' | 'all'>('students');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/annonces', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(data.annonces);
      } else {
        toast.error(data.message || 'Failed to load announcements');
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des annonces');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        titre: title.trim(),
        contenu: content.trim(),
        datepublication: new Date().toISOString().split('T')[0], 
        enseignant_id: user?.enseignant_id || 1, 
      };

      const res = await fetch('http://localhost:8000/api/annonces/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Échec de la création de l’annonce');
        return;
      }

      
      setAnnouncements([data.annonce, ...announcements]);

     
      setTitle('');
      setContent('');
      setTarget('students');

      toast.success('Annonce publiée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création de l’annonce');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'students':
        return <Users className="w-4 h-4" />;
      case 'teachers':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTargetColor = (target: string) => {
    switch (target) {
      case 'students':
        return 'bg-blue-100 text-blue-700';
      case 'teachers':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['enseignant']}>
      <DashboardLayout
        title="Annonces"
        description="Publier et gérer les annonces pour les étudiants et enseignants"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire de création */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Créer une annonce</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sélection du public cible */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Public cible</label>
                <Select
                  value={target}
                  onValueChange={(value: 'students' | 'teachers' | 'all') => setTarget(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le public" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Étudiants
                      </div>
                    </SelectItem>
                    <SelectItem value="teachers">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Enseignants
                      </div>
                    </SelectItem>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Tous
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Titre</label>
                <Input
                  type="text"
                  placeholder="Titre de l'annonce"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Contenu</label>
                <Textarea
                  placeholder="Contenu de l'annonce"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Bouton */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <>Publier</>
                )}
              </Button>
            </form>
          </Card>

          {/* Annonces récentes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Annonces récentes</h3>

            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Aucune annonce pour l'instant</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{announcement.titre}</h4>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTargetColor(
                          announcement.target || 'all'
                        )}`}
                      >
                        {getTargetIcon(announcement.target || 'all')}
                        {announcement.target || 'all'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{announcement.contenu}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(announcement.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
