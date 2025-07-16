import React, { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

interface AIPlaybackMemoryPlayerProps {
  url: string;
  memoryKey?: string; // Optional: custom key for localStorage
  onTimeUpdate?: (current: number, last: number) => void;
  onSummaryRequest?: (last: number, current: number) => void;
}

const getMemoryKey = (url: string, customKey?: string) => {
  if (customKey) return customKey;
  // Use video ID as key
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? `yt-memory-${match[1]}` : `yt-memory-generic`;
};

const AIPlaybackMemoryPlayer: React.FC<AIPlaybackMemoryPlayerProps> = ({
  url,
  memoryKey,
  onTimeUpdate,
  onSummaryRequest,
}) => {
  // Using `any` to avoid type mismatch between value and type imports in react-player.
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  // Load memory from localStorage
  useEffect(() => {
    const key = getMemoryKey(url, memoryKey);
    const memory = localStorage.getItem(key);
    if (memory) {
      try {
        const { last, current } = JSON.parse(memory);
        setLastTimestamp(last || 0);
        setCurrentTime(current || 0);
      } catch {}
    }
  }, [url, memoryKey]);

  // Save memory to localStorage
  useEffect(() => {
    if (!ready) return;
    const key = getMemoryKey(url, memoryKey);
    localStorage.setItem(
      key,
      JSON.stringify({ last: lastTimestamp, current: currentTime })
    );
    if (onTimeUpdate) onTimeUpdate(currentTime, lastTimestamp);
  }, [currentTime, lastTimestamp, url, memoryKey, ready, onTimeUpdate]);

  // Seek to last position on ready
  const handleReady = () => {
    setReady(true);
    if (playerRef.current && lastTimestamp > 0) {
      playerRef.current.seekTo(lastTimestamp, 'seconds');
    }
  };

  // Handle play/pause/seek
  const handlePlay = () => setPlaying(true);
  const handlePause = () => setPlaying(false);
  const handleSeek = (seconds: number) => {
    setLastTimestamp(currentTime);
    setCurrentTime(seconds);
    if (onSummaryRequest) onSummaryRequest(lastTimestamp, seconds);
  };
  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };
  const handleDuration = (d: number) => setDuration(d);

  // For AI prompt integration
  const getAIPrompt = () => {
    return `Summarize what happened in the YouTube video between ${lastTimestamp}s and ${currentTime}s. Be short and precise.`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <ReactPlayer
        ref={playerRef}
        url={url}
        controls
        playing={playing}
        onPlay={handlePlay}
        onPause={handlePause}
        // @ts-ignore - react-player typings are not fully compatible
        onSeek={handleSeek}
        // @ts-ignore - react-player typings are not fully compatible
        onProgress={handleProgress}
        onReady={handleReady}
        onDuration={handleDuration}
        width="100%"
        height="360px"
      />
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border text-sm text-gray-700">
        <div><b>Current Time:</b> {currentTime.toFixed(1)}s</div>
        <div><b>Last Timestamp:</b> {lastTimestamp.toFixed(1)}s</div>
        <div><b>Duration:</b> {duration.toFixed(1)}s</div>
        <div className="mt-2"><b>AI Prompt:</b> <code>{getAIPrompt()}</code></div>
      </div>
    </div>
  );
};

export default AIPlaybackMemoryPlayer; 