'use client';

import { useUserModeConditional } from '@/context/UserModeContext';
import TeenHeader from './modes/TeenHeader';
import ProNav from './modes/ProNav';
import ADHDNav from './modes/ADHDNav';

export default function UserModeExample() {
  const { isTeen, isPro, isADHD } = useUserModeConditional();

  // Dynamic summary tone based on user mode
  const summaryTone = isTeen ? 'fun-casual' : isPro ? 'deep-insightful' : 'clear-focus';

  // Dynamic summary prompt based on user mode
  const getSummaryPrompt = () => {
    if (isTeen) {
      return "Give me a fun, casual summary that's easy to understand! Use emojis and keep it light! 😊";
    } else if (isPro) {
      return "Provide a comprehensive, insightful analysis with key takeaways and business implications.";
    } else if (isADHD) {
      return "Create a clear, focused summary with bullet points and simple language.";
    } else {
      return "Generate a clear and concise summary of the content.";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Conditional UI based on user mode */}
      {isTeen && <TeenHeader />}
      {isPro && <ProNav />}
      {isADHD && <ADHDNav />}

      {/* Dynamic content based on user mode */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          {isTeen ? '🎉 Your Summary' : isPro ? '📊 Analysis Report' : '📝 Summary'}
        </h2>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Current Mode:</h3>
            <p className="text-sm text-gray-600">
              {isTeen && "Teen Mode - Fun and casual experience"}
              {isPro && "Pro Mode - Professional and detailed"}
              {isADHD && "ADHD Mode - Clear and focused"}
              {!isTeen && !isPro && !isADHD && "Default Mode - Standard experience"}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Summary Tone:</h3>
            <p className="text-sm text-blue-700">{summaryTone}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Summary Prompt:</h3>
            <p className="text-sm text-green-700">{getSummaryPrompt()}</p>
          </div>

          {/* Example of conditional styling */}
          <div className={`p-4 rounded-lg ${
            isTeen ? 'bg-gradient-to-r from-pink-100 to-purple-100' :
            isPro ? 'bg-gradient-to-r from-blue-100 to-indigo-100' :
            isADHD ? 'bg-gradient-to-r from-orange-100 to-red-100' :
            'bg-gradient-to-r from-gray-100 to-slate-100'
          }`}>
            <h3 className="font-semibold mb-2">Dynamic Styling</h3>
            <p className="text-sm">
              This section adapts its appearance based on your selected user mode!
            </p>
          </div>
        </div>
      </div>

      {/* Example of conditional functionality */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Mode-Specific Features</h3>
        
        {isTeen && (
          <div className="space-y-2">
            <p className="text-purple-600">✨ Social sharing buttons</p>
            <p className="text-purple-600">🎵 Background music options</p>
            <p className="text-purple-600">📱 Mobile-optimized interface</p>
          </div>
        )}

        {isPro && (
          <div className="space-y-2">
            <p className="text-blue-600">📊 Detailed analytics</p>
            <p className="text-blue-600">💼 Export to PDF/Word</p>
            <p className="text-blue-600">🔗 Integration with business tools</p>
          </div>
        )}

        {isADHD && (
          <div className="space-y-2">
            <p className="text-orange-600">🎯 Focus timer</p>
            <p className="text-orange-600">📝 Simplified text display</p>
            <p className="text-orange-600">🔊 Audio narration</p>
          </div>
        )}

        {!isTeen && !isPro && !isADHD && (
          <div className="space-y-2">
            <p className="text-gray-600">📖 Standard reading mode</p>
            <p className="text-gray-600">⚙️ Basic customization</p>
            <p className="text-gray-600">💾 Save summaries</p>
          </div>
        )}
      </div>
    </div>
  );
} 