export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <h1 className="text-4xl font-bold text-center">YouTube Video Summarizer</h1>
      <p className="text-center max-w-xl">
        Paste any YouTube video link and get an AI-generated summary in seconds. Sign up to save your summaries and access them anytime.
      </p>
      <a
        href="/summary"
        className="bg-primary text-white px-6 py-3 rounded font-medium"
      >
        Get Started
      </a>
    </div>
  );
}
