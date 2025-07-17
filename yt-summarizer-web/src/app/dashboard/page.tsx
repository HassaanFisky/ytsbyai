"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { getSummaries } from "@/lib/api";
import SummaryCard from "@/components/SummaryCard";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface Summary {
  id: string;
  summary: string;
  url: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const token = user ? await user.getIdToken() : undefined;
        const { data } = await getSummaries(token);
        setSummaries(data);
      } catch (err: any) {
        toast.error("Failed to load summaries");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  if (!user) return <p className="text-center mt-10">Please login to view your dashboard.</p>;

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-semibold">Your Summaries</h1>
      {loading ? (
        <p>Loading...</p>
      ) : summaries.length === 0 ? (
        <p>No summaries yet. Try <a href="/summary" className="underline">creating one</a>.</p>
      ) : (
        summaries.map((s) => (
          <SummaryCard key={s.id} summary={s.summary} url={s.url} createdAt={s.created_at} />
        ))
      )}
    </div>
  );
}