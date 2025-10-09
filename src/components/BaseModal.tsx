"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import React from "react";

// Props definition remains the same
interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  loading?: boolean;
  type?: "confirm" | "success" | "error";
}

// Helper object to manage styles and icons based on the modal type
const modalVariants = {
  confirm: {
    icon: AlertTriangle,
    iconColor: "text-emerald-400",
    glowColor: "bg-emerald-500/15",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-emerald-400",
    glowColor: "bg-emerald-500/15",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700",
  },
  error: {
    icon: XCircle,
    iconColor: "text-red-400",
    glowColor: "bg-red-500/15",
    buttonClass: "bg-red-600 hover:bg-red-700",
  },
};

export default function BaseModal({
  open,
  onClose,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  loading = false,
  type = "confirm",
}: BaseModalProps) {
  const variant = modalVariants[type];
  const IconComponent = variant.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 p-0 shadow-lg backdrop-blur-sm ">
        {/* Dynamic Aurora Glow */}
        <div className={`absolute -top-1/4 left-1/2 -z-10 h-1/2 w-full -translate-x-1/2 rounded-full ${variant.glowColor} blur-3xl`}></div>

        <div className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
        {/* 1. Icon Section for Immediate Visual Feedback */}
        <div className="rounded-full bg-slate-800 p-3 border border-slate-700">
        <IconComponent className={`h-10 w-10 ${variant.iconColor}`} />
        </div>

        {/* 2. Cleaner Header and Description Layout */}
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-white text-center">
            {title}
          </DialogTitle>
          <div className="flex-1 overflow-y-auto py-4 text-sm flex flex-col items-center text-center scrollbar-none">
            {description && (
              <DialogDescription asChild>
                <div className="text-white/70 break-all whitespace-pre-wrap">
                  {description}
                </div>
              </DialogDescription>
            )}
          </div>
        </DialogHeader>

        {/* 3. Fully Responsive Footer */}
        <DialogFooter className="mt-4 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          {type === "confirm" && (
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
            >
              {cancelText}
            </Button>
          )}
          {onConfirm && (
            <Button
              onClick={onConfirm}
              disabled={loading}
              className={variant.buttonClass}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Please wait..." : confirmText}
            </Button>
          )}
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import React from "react";

// interface BaseModalProps {
//   open: boolean;
//   onClose: () => void;
//   title: string;
//   description?: React.ReactNode; // JSX/component allowed
//   confirmText?: string;
//   cancelText?: string;
//   onConfirm?: () => void;
//   loading?: boolean;
//   type?: "confirm" | "success" | "error";
// }

// export default function BaseModal({
//   open,
//   onClose,
//   title,
//   description,
//   confirmText = "Confirm",
//   cancelText = "Cancel",
//   onConfirm,
//   loading = false,
//   type = "confirm",
// }: BaseModalProps) {
//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="bg-slate-900 text-white rounded-2xl max-w-md w-full max-h-[80vh] shadow-xl flex flex-col animate-scale-up overflow-hidden">
//         <DialogHeader>
//           <DialogTitle className="text-lg font-bold">{title}</DialogTitle>

//           <div className="flex-1 overflow-y-auto py-4 text-sm flex flex-col items-center text-center scrollbar-none">
//             {description && (
//               <DialogDescription asChild>
//                 <div className="text-white/70 break-words whitespace-pre-wrap">
//                   {description}
//                 </div>
//               </DialogDescription>
//             )}
//           </div>
//         </DialogHeader>

//         <DialogFooter className="flex space-x-2">
//           {type === "confirm" && (
//             <Button
//               variant="outline"
//               onClick={onClose}
//               className="bg-slate-800 hover:bg-slate-700"
//             >
//               {cancelText}
//             </Button>
//           )}

//           {onConfirm && (
//             <Button
//               onClick={onConfirm}
//               disabled={loading}
//               className={
//                 type === "success"
//                   ? "bg-emerald-600 hover:bg-emerald-700"
//                   : type === "error"
//                   ? "bg-red-600 hover:bg-red-700"
//                   : "bg-emerald-600 hover:bg-emerald-700"
//               }
//             >
//               {loading ? "Please wait..." : confirmText}
//             </Button>
//           )}
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
