import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;

export function ModalContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm" />
      <Dialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/60 bg-card p-6 shadow-panel focus:outline-none",
          className,
        )}
      >
        {children}
        <Dialog.Close className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted">
          <X className="h-4 w-4" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export const ModalTitle = Dialog.Title;
export const ModalDescription = Dialog.Description;
