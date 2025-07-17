"use client";

import { useState } from "react";
import { postSummary } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

interface UploadCardProps {
  onComplete?: (data: any) => void;
}

export default function UploadCard({ onComplete }: UploadCardProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!url) return toast.error("Please enter a YouTube URL");
    try {
      setLoading(true);
      const token = user ? await user.getIdToken() : undefined;
      const { data } = await postSummary(url, token);
      toast.success("Summary generated!");
      setUrl("");
      onComplete?.(data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl border rounded-lg p-6 bg-card flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Summarize YouTube Video</h2>
      <input
        type="text"
        placeholder="Paste YouTube URL here"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border rounded px-3 py-2 w-full"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-primary text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {loading ? "Summarizing..." : "Generate Summary"}
      </button>
    </div>
  );
}