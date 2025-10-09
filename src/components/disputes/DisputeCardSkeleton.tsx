// components/DisputeCardSkeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";

const DisputeCardSkeleton: React.FC = () => {
  return (
    <Card className="relative w-full animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 pb-16 shadow-2xl backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between p-0">
        <div className="h-7 w-40 rounded-md bg-slate-700"></div>
        <div className="h-6 w-20 rounded-full bg-slate-700"></div>
      </CardHeader>
      <CardContent className="mt-4 space-y-4 p-0">
        <div className="h-4 w-3/4 rounded-md bg-slate-700"></div>
        <div className="rounded-xl bg-slate-900/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="h-8 w-1/2 rounded-md bg-slate-700"></div>
            <div className="h-5 w-5 rounded-full bg-slate-600"></div>
            <div className="h-8 w-1/2 rounded-md bg-slate-700"></div>
          </div>
          <div className="my-3 border-t border-slate-700/50"></div>
          <div className="flex justify-between">
            <div className="h-6 w-1/3 rounded-md bg-slate-700"></div>
            <div className="h-6 w-1/3 rounded-md bg-slate-700"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default DisputeCardSkeleton;