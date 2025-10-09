import { bloomLog, formatCountdown } from "@/lib/utils";
import { Timer } from "@/types";
import { useEffect, useMemo, useState } from "react";

interface DisputeTimerProps {
  disputeTimer: Timer;
}

export default function DisputeTimer({ disputeTimer }: DisputeTimerProps) {
  const isActive = true;

  // Calculate end time
  const endTime = useMemo(() => {
    return (
      (Number(disputeTimer?.startTime ?? 0) +
        Number(disputeTimer?.standardVotingDuration ?? 0) +
        Number(disputeTimer?.extendDuration ?? 0)) *
      1000
    );
  }, [disputeTimer]);

  const totalVotingDuration = useMemo(() => {
    return (
      Number(disputeTimer?.standardVotingDuration ?? 0) +
      Number(disputeTimer?.extendDuration ?? 0)
    );
  }, [disputeTimer]);
  
  const totalVotingDurationInMinutes = totalVotingDuration / 60

  bloomLog('total voting duration', totalVotingDuration)

  // Countdown state
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(endTime - Date.now(), 0)
  );

  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMinutes = (remainingMs / 1000 * 100);

  bloomLog("Remaining hours: ", remainingHours)

  bloomLog("Remaining Minutes: ", remainingMinutes)

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        const next = endTime - Date.now();
        return next > 0 ? next : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, isActive]);

  bloomLog("Total duration in minutes:", totalVotingDurationInMinutes)

  const getStatusColor = (minutes: number) => {
    if (minutes <= remainingMinutes * (1 / 3))
      return { stripe: "bg-red-500", badge: "bg-red-500/30 text-red-500" };
    if (minutes <= remainingMinutes * (2 / 3))
      return {
        stripe: "bg-yellow-400",
        badge: "bg-yellow-400/30 text-yellow-400",
      };
    return { stripe: "bg-green-500", badge: "bg-green-500/30 text-green-500" };
  };

  const { stripe, badge } = getStatusColor(totalVotingDurationInMinutes);

  return (
    <div>
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge}`}>
        {formatCountdown(remainingMs)}
      </span>
    </div>
  );
}
