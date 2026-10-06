import { useState, useEffect } from 'react';

export default function MediaPlayer({ recording, onClose }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const recordingId = recording._id || recording.id;
  const token = localStorage.getItem('token');
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const streamUrl = `${apiBase}/recordings/${recordingId}/stream?token=${encodeURIComponent(token || '')}`;
  const isAudio = recording.mimeType?.startsWith('audio/');
  const isVideo = recording.mimeType?.startsWith('video/');

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{recording.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(recording.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Player */}
        <div className="p-6 bg-gray-50">
          {isVideo ? (
            <video
              key={streamUrl}
              controls
              className="w-full bg-black rounded-lg"
              onError={(e) => {
                console.error('Video error:', e);
                setError(`Failed to load video: ${e.target.error?.message || 'Unknown error'}`);
              }}
              onLoadStart={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
            >
              <source src={streamUrl} type={recording.mimeType} />
              Your browser does not support the video tag.
            </video>
          ) : isAudio ? (
            <div className="bg-white p-8 rounded-lg">
              <div className="flex items-center justify-center mb-6">
                <div className="text-6xl opacity-50">🎵</div>
              </div>
              <audio
                key={streamUrl}
                controls
                className="w-full"
                onError={(e) => {
                  console.error('Audio error:', e);
                  setError(`Failed to load audio: ${e.target.error?.message || 'Unknown error'}`);
                }}
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
              >
                <source src={streamUrl} type={recording.mimeType} />
                Your browser does not support the audio tag.
              </audio>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Unsupported media type: {recording.mimeType}</p>
            </div>
          )}
          {isLoading && (
            <div className="mt-4 text-center text-gray-600">
              Loading...
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
