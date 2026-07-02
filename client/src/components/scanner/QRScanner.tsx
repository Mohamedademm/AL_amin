import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export function QRScanner({ open, onClose, onScan }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      // Small timeout to allow the modal DOM to be fully painted before attaching
      setTimeout(() => {
        try {
          scannerRef.current = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1,
            },
            /* verbose= */ false
          );

          scannerRef.current.render(
            (text) => {
              if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
              }
              onScan(text);
              onClose();
            },
            (err) => {
              // Ignore frequent frame-level errors, only log
            }
          );
        } catch (e: any) {
          setError(e.message || "Failed to initialize scanner");
        }
      }, 100);
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [open, onClose, onScan]);

  return (
    <Modal open={open} onClose={onClose} title="Scanner un produit">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Placez le code-barres ou QR code du produit au centre du cadre pour le scanner.
        </p>
        
        {/* Container for the scanner */}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div id="qr-reader" className="w-full"></div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </Modal>
  );
}
