"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import UploadCard from "@/components/UploadCard";
import SummaryCard from "@/components/SummaryCard";

export default function SummaryPage() {
  const [result, setResult] = useState<any | null>(null);

  return (
    <div className="flex flex-col items-center gap-6">
      <UploadCard onComplete={setResult} />
      {result && <SummaryCard summary={result.summary} url={result.url} createdAt={result.created_at} />}
    </div>
  );
}