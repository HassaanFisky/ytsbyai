"use client";

interface SummaryCardProps {
  title?: string;
  summary: string;
  url?: string;
  createdAt?: string;
}

export default function SummaryCard({ title, summary, url, createdAt }: SummaryCardProps) {
  return (
    <div className="border rounded-lg p-6 bg-card w-full max-w-2xl">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mb-2 block">
          {url}
        </a>
      )}
      <p className="whitespace-pre-line mb-4">{summary}</p>
      {createdAt && <span className="text-xs text-muted-foreground">{new Date(createdAt).toLocaleString()}</span>}
    </div>
  );
}