import React from "react";
import { SubmissionStatus } from "@/lib/types/domain";

export const StatusIndicator: React.FC<{
  status: SubmissionStatus | string;
  showText?: boolean;
}> = ({ status, showText = true }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "READY":
      case "DELIVERED":
        return {
          dotClass: "bg-emerald-500",
          text: "Ready",
          textColor: "text-emerald-700",
        };
      case "EVALUATING":
      case "PROCESSING":
      case "VALIDATING":
        return {
          dotClass: "bg-blue-500 animate-pulse",
          text: "Evaluating",
          textColor: "text-blue-700",
        };
      case "PAYMENT_PENDING":
        return {
          dotClass: "bg-amber-500",
          text: "Payment Pending",
          textColor: "text-amber-700",
        };
      case "QUEUED":
      case "UPLOADED":
        return {
          dotClass: "bg-zinc-400",
          text: "Queued",
          textColor: "text-zinc-600",
        };
      case "UPLOAD_FAILED":
      case "PAYMENT_FAILED":
      case "PROCESSING_FAILED":
      case "EVALUATION_FAILED":
      case "VALIDATION_FAILED":
        return {
          dotClass: "bg-rose-500",
          text: "Failed",
          textColor: "text-rose-700",
        };
      default:
        return {
          dotClass: "bg-zinc-400",
          text: status,
          textColor: "text-zinc-600",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
      {showText && <span className={`font-medium ${config.textColor}`}>{config.text}</span>}
    </span>
  );
};
