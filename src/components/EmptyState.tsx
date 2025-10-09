// components/EmptyState.tsx
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  Icon: any; // Pass the icon component itself
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  Icon,
  title,
  description,
  actionText,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/50 p-12 text-center">
      <div className="rounded-full bg-slate-800 p-4">
        <Icon className="h-10 w-10 text-slate-600" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-slate-400">{description}</p>
      {actionText && onActionClick && (
        <Button
          onClick={onActionClick}
          className="mt-6 bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;