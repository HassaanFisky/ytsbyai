"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Youtube } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function YoutubeSummaryPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSummary("");
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await axios.post(
        "http://localhost:8000/summary",
        { youtube_url: youtubeUrl },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setSummary(response.data.summary);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || err.message || "Failed to fetch summary."
      );
      toast.error(err?.response?.data?.detail || "Failed to fetch summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-2 py-8 dark:bg-black">
      <Card className="w-full max-w-md shadow-lg border border-border bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
            <Youtube className="text-red-500" />
            YouTube Summarizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="url"
              placeholder="Paste YouTube URL here..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={loading}
              className="w-full"
              required
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              variant="default"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" /> Summarizing...
                </span>
              ) : (
                "Summarize"
              )}
            </Button>
          </form>
          {error && (
            <div className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}
          {summary && !error && (
            <div className="mt-6 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-border text-sm whitespace-pre-line">
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">Summary:</span>
              <br />
              <span className="text-zinc-900 dark:text-zinc-100">{summary}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 