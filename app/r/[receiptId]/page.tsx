"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ReceiptRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const receiptId = params.receiptId as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!receiptId) return;

    fetch(`/api/reviews/${encodeURIComponent(receiptId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.report?.id) {
          router.replace(`/report/${data.report.id}`);
        } else if (data.reportId) {
          router.replace(`/report/${data.reportId}`);
        } else {
          router.replace(`/report/${receiptId}`);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load report");
        router.replace(`/report/${receiptId}`);
      });
  }, [receiptId, router]);

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center font-mono">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mx-auto mb-4" />
        <p className="text-xs text-zinc-500">Redirecting to verified diagnostic report...</p>
        {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
