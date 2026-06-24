import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/dialog";
import { QrCode } from "lucide-react";

export function KioskQrDialog() {
  // Use the current window origin + /kiosk
  const kioskUrl = typeof window !== "undefined" ? `${window.location.origin}/kiosk` : "";

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          <QrCode className="h-4 w-4 mr-2" />
          Kiosk QR Code
        </Button>
      </ModalTrigger>
      <ModalContent className="sm:max-w-md text-center">
        <div className="mb-4">
          <ModalTitle className="text-center text-2xl">Self Check-in Kiosk</ModalTitle>
          <ModalDescription className="text-center mt-2">
            Scan this code or navigate to the URL below on a tablet to open the patient kiosk.
          </ModalDescription>
        </div>
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            {kioskUrl && (
              <QRCodeSVG 
                value={kioskUrl} 
                size={240} 
                level="M" 
                includeMargin={false} 
              />
            )}
          </div>
          <p className="font-mono text-sm bg-muted px-4 py-2 rounded-md break-all">
            {kioskUrl}
          </p>
        </div>
      </ModalContent>
    </Modal>
  );
}
