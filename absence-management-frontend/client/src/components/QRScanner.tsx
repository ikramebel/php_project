import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  timeoutSeconds: number;
  onError: (error: any) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, timeoutSeconds, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    const startScanning = async () => {
      try {
        const result = await codeReader.current.decodeOnceFromVideoDevice(undefined, videoRef.current!);
        if (result) {
          onScanSuccess(result.getText());
        }
      } catch (err) {
        if (err instanceof NotFoundException) {
          // Continue scanning
        } else {
          onError(err);
        }
      }
    };

    startScanning();

    const timeout = setTimeout(() => {
      codeReader.current.reset();
      onError({ message: 'timeout' });
    }, timeoutSeconds * 1000);

    return () => {
      clearTimeout(timeout);
      codeReader.current.reset();
    };
  }, [onScanSuccess, timeoutSeconds, onError]);

  return (
    <div className="w-full">
      <video ref={videoRef} className="w-full h-64 bg-black rounded" />
      <p className="text-center text-sm text-muted-foreground mt-2">
        Positionnez le code QR devant la caméra
      </p>
    </div>
  );
};

export default QRScanner;
