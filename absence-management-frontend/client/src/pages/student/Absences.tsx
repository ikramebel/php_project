import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRScanner } from '@/components/QRScanner';
import { useAuth } from '@/contexts/AuthContext';
import { absenceAPI } from '@/lib/absenceAPI';
import { QrCode, CheckCircle2, XCircle, Loader2, History } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentAbsences() {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeSession, setActiveSession] = useState<null | {
    seance_id: number | string;
    code_qr: string;
    filiere?: string;
    semestre?: string;
    started_at: string;
    duree_seconds: number;
  }>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const fetchActive = async () => {
      try {
        const s = await absenceAPI.getActiveSessionForStudent(user.id);
        if (!mounted) return;
        setActiveSession(s);
      } catch (err: any) {
        console.error('Failed fetching active session', err);
      }
    };
    fetchActive();
    pollRef.current = window.setInterval(fetchActive, 3000);
    return () => {
      mounted = false;
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [user]);

  const getRemainingSeconds = () => {
    if (!activeSession) return 0;
    const end = new Date(activeSession.started_at).getTime() + (activeSession.duree_seconds || 10) * 1000;
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  };

  const handleScanSuccess = async (decodedText: string) => {
    setIsScanning(false);
    setIsSubmitting(true);
    try {
      if (!user) throw new Error('Utilisateur non authentifié');

      let qrData: any;
      try {
        qrData = JSON.parse(decodedText);
      } catch {
        throw new Error('Format de code QR invalide');
      }

      if (!qrData.seance_id || !qrData.code_qr) throw new Error('Format de code QR invalide');

      // ensure session is active and matches scanned seance
      if (!activeSession) throw new Error('Aucune séance active');
      if (String(qrData.seance_id) !== String(activeSession.seance_id)) {
        throw new Error('Ce code QR ne correspond pas à la séance en cours');
      }

      const response = await absenceAPI.markPresence({
        seance_id: qrData.seance_id,
        etudiant_id: user.id,
        code_qr_scanne: qrData.code_qr,
      });

      setLastResult({
        success: true,
        message: response.message || 'Présence enregistrée avec succès !',
      });
      toast.success('Présence validée !');
    } catch (error: any) {
      console.error('Error marking presence:', error);
      setLastResult({
        success: false,
        message: error.message || 'Échec de la validation de présence',
      });
      toast.error(error.message || 'Erreur lors du scan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['etudiant']}>
      <DashboardLayout
        title="Mes Présences & Absences"
        description="Scannez le code QR en classe pour marquer votre présence"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Scanner un Code QR
              </CardTitle>
              <CardDescription>
                {activeSession
                  ? `Séance active — filière: ${activeSession.filiere ?? '--'} · semestre: ${activeSession.semestre ?? '--'} · temps restant: ${getRemainingSeconds()}s`
                  : 'Aucune séance active pour votre filière / semestre.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              {isSubmitting ? (
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Validation de votre présence...</p>
                </div>
              ) : isScanning ? (
                activeSession ? (
                  <div className="w-full space-y-4">
                    <QRScanner
                      onScanSuccess={handleScanSuccess}
                      timeoutSeconds={Math.max(5, getRemainingSeconds())}
                      onError={(err) => {
                        console.error('Scanner error or timeout', err);
                        setIsScanning(false);
                        const errorMessage =
                          err?.message === 'timeout'
                            ? 'Le scan a expiré. Réessayez.'
                            : err?.message || 'Erreur du scanner';
                        setLastResult({ success: false, message: errorMessage });
                        toast.error(err?.message === 'timeout' ? 'Scan expiré' : 'Erreur du scanner');
                      }}
                    />
                    <Button variant="outline" className="w-full" onClick={() => setIsScanning(false)}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground">Aucune séance active — impossible de scanner.</p>
                    <Button className="mt-4" onClick={() => setIsScanning(false)}>
                      Retour
                    </Button>
                  </div>
                )
              ) : lastResult ? (
                <div className="text-center space-y-6">
                  {lastResult.success ? (
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-16 w-16 text-destructive mx-auto" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{lastResult.success ? 'Succès !' : 'Erreur'}</h3>
                    <p className="text-muted-foreground">{lastResult.message}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setLastResult(null);
                      setIsScanning(true);
                    }}
                  >
                    Scanner à nouveau
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="bg-primary/10 p-6 rounded-full inline-block">
                    <QrCode className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-muted-foreground max-w-[250px] mx-auto">
                    {activeSession
                      ? 'Séance active — cliquez pour ouvrir le scanner et scanner le QR fourni par le professeur.'
                      : "Aucune séance active pour l'instant. Attendez que le professeur démarre la séance."}
                  </p>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      if (!activeSession) {
                        toast.error("Aucune séance active pour votre filière / semestre.");
                        return;
                      }
                      setIsScanning(true);
                    }}
                  >
                    Ouvrir le Scanner
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Statistiques de Présence
              </CardTitle>
              <CardDescription>Aperçu de votre assiduité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-100 text-center">
                  <p className="text-sm text-green-600 font-medium">Présences</p>
                  <p className="text-3xl font-bold text-green-700">--</p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-center">
                  <p className="text-sm text-red-600 font-medium">Absences</p>
                  <p className="text-3xl font-bold text-red-700">--</p>
                </div>
              </div>
              <div className="mt-6 p-8 text-center border rounded-lg border-dashed">
                <p className="text-muted-foreground text-sm">L'historique détaillé sera bientôt disponible</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}