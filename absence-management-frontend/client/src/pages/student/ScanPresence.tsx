import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function ScanPresence() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (err) {
      console.log('Permission API not supported');
      setCameraPermission('prompt');
    }
  };

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const startScanning = async () => {
    setScanning(true);
    setError('');
    setMessage('');
    setScannedCode('');

    try {
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        // Close the stream as we just needed to request permission
        stream.getTracks().forEach(track => track.stop());
      } catch (permissionErr) {
        console.error('Camera permission error:', permissionErr);
        setError('❌ Accès à la caméra refusé. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.');
        setScanning(false);
        setCameraPermission('denied');
        return;
      }

      if (scannerRef.current) {
        await scannerRef.current.clear();
      }

      
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          formatsToSupport: ['QR_CODE']
        },
        false
      );

      scannerRef.current = scanner;

      
      scanner.render(
        async (decodedText) => {
          
          console.log('QR Code scanned:', decodedText);
          setScannedCode(decodedText);
          
          
          try {
            await scanner.clear();
          } catch (e) {
            console.error('Error clearing scanner:', e);
          }
          setScanning(false);
          
          
          await marquerPresence(decodedText);
        },
        (errorMessage) => {
          
          if (!errorMessage.includes('NotFoundException')) {
            console.debug('Scan debug:', errorMessage);
          }
        }
      );

    } catch (err) {
      console.error('Error starting scanner:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      
      if (errorMsg.includes('NotAllowedError')) {
        setError('❌ Permission refusée. Veuillez autoriser l\'accès à la caméra.');
        setCameraPermission('denied');
      } else if (errorMsg.includes('NotFoundError')) {
        setError('❌ Aucune caméra détectée sur cet appareil.');
      } else if (errorMsg.includes('NotReadableError')) {
        setError('❌ La caméra est déjà utilisée par une autre application.');
      } else {
        setError('❌ Impossible de démarrer la caméra. Vérifiez les permissions et réessayez.');
      }
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  const marquerPresence = async (codeQr: string) => {
    if (!user || !user.id) {
      setError('❌ Utilisateur non connecté');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/presences/marquer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          code_qr: codeQr,
          etudiant_id: user.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ ' + (data.message || 'Présence marquée avec succès !'));
        setError('');
        
        
        playSuccessSound();
      } else {
        setError('❌ ' + (data.message || 'Erreur lors du marquage de la présence'));
        setMessage('');
        
        
        playErrorSound();
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('❌ Erreur de connexion au serveur. Vérifiez votre connexion internet.');
      setMessage('');
      playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  const playSuccessSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKnl79diFgg1j9f0yn0xBSh+zPLaizsIHGG57OihUxIJR5/h8sFuJAUug8/z2Io3CBppu/Lnm04MDlCp5e/XYhYINY/X9Mp9MQUofszy2os6CB1hu+zqoVQSCUef4PKgbSUGMYLP89iKNwgZabrz6JxODA5Pq+Xv12IWCDaP1/TKfTEFKH3M8tqLOggdYLvs6qFUEglHn+HywG4lBjGCz/PYijcIGWm78+icTgwOT6vl79diFgg2j9f0yn0xBSh9zPLaizsIHWC76+qhVRIJR5/h88FuJQYxgs/y2Ys5CBtpu/PonE4MDlCp5fDXYhYINY/X9Mp9MQUofczy2Ys6CB1gu+zqoVQSCUef4fPBbiQGMYPP8tmLOQgbaLvz6JxODA5Qq+Xw12IWCDaP1/TKfS8GKH7M8tqLOggdYLvr6qFVEghHn+HywG4lBjGCz/LZijkIG2i78+ecTgwOUKvl8NdiFgg2j9f0yn0wBSh9zPLaizoIHWC76+qhVRMIR5/h88FuJQYxgs/y2Yo5CBtou/PnnE4MDlCr5fDXYhYINo/X9Mp9LwUofszyWos6CB1gu+vqoVUSCUae4fPBbiUGMYLP8tmKOQgbaLvz551ODA5Qq+Xw12IWCDaP1/TKfS8FKH3M8tqKOggdYLvr6qFVEghHn+HzwW4lBjGCz/PZijkIG2i78+edTgwOUKvl8NdiFgg2j9f0yn0vBSh9zPLaijoIHWC76+qhVRIJR5/h88FuJQYxgs/y2Yo5CBtou/PnnU4MDlCr5fDXYhYINY/X9Mp9LwUofc8AWgAAAA==');
    audio.play().catch(() => {});
  };

  const playErrorSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAB/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f38=');
    audio.play().catch(() => {});
  };

  const resetScan = () => {
    setScannedCode('');
    setMessage('');
    setError('');
    setLoading(false);
  };

  return (
    <ProtectedRoute allowedRoles={['etudiant']}>
      <DashboardLayout
        title="Scanner la présence"
        description="Scannez le QR code affiché par votre enseignant"
      >
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            {/* Browser/Device Requirements Notice */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Conseils importants</h4>
                  <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                    <li>Utilisez un navigateur à jour (Chrome, Firefox, Safari, Edge)</li>
                    <li>Autorisez l'accès à la caméra quand le navigateur le demande</li>
                    <li>Assurez-vous qu'aucune autre application n'utilise la caméra</li>
                    <li>Bonne luminosité nécessaire pour scanner le QR code</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Scanner le QR Code
              </h2>
              <p className="text-muted-foreground">
                Pointez votre caméra vers le QR code affiché par l'enseignant
              </p>
            </div>

            {/* Camera Permission Warning */}
            {cameraPermission === 'denied' && !scanning && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900">Accès à la caméra refusé</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur pour scanner le QR code.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scanner Area */}
            {!scanning && !scannedCode && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Cliquez sur le bouton ci-dessous pour démarrer le scan
                  </p>
                </div>

                <Button
                  onClick={startScanning}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
                  disabled={cameraPermission === 'denied'}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Démarrer le scan
                </Button>
              </div>
            )}

            {/* Active Scanner */}
            {scanning && (
              <div className="space-y-4">
                <div className="border-2 border-primary rounded-lg overflow-hidden">
                  <div id="qr-reader" className="w-full"></div>
                </div>

                <div className="flex items-center justify-center gap-2 text-primary">
                  <div className="animate-pulse">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Scanner en cours...</span>
                </div>

                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="w-full"
                >
                  Annuler
                </Button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Marquage de la présence en cours...</p>
              </div>
            )}

            {/* Success Message */}
            {message && !loading && (
              <div className="space-y-4">
                <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 text-lg">Présence confirmée !</h4>
                      <p className="text-green-700 text-sm mt-1">{message}</p>
                    </div>
                  </div>
                  
                  {scannedCode && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-xs text-green-600">
                        Code scanné : <span className="font-mono font-semibold">{scannedCode}</span>
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={resetScan}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Scanner un autre QR code
                </Button>
              </div>
            )}

            {/* Error Message */}
            {error && !loading && (
              <div className="space-y-4">
                <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <XCircle className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 text-lg">Erreur</h4>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>

                  {scannedCode && (
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <p className="text-xs text-red-600">
                        Code scanné : <span className="font-mono font-semibold">{scannedCode}</span>
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={resetScan}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            )}

            {/* Instructions */}
            {!scanning && !scannedCode && !loading && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Instructions
                </h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Assurez-vous que le QR code est bien visible sur l'écran de l'enseignant</li>
                  <li>Tenez votre appareil stable pendant le scan</li>
                  <li>Le scan se fait automatiquement dès que le QR code est détecté</li>
                  <li>Votre présence sera marquée immédiatement après le scan</li>
                </ul>
              </div>
            )}
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}