import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import MediaPlayer from "../components/MediaPlayer";
import Footer from "../components/Footer";

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function formatDateOnly(iso) {
  return new Date(iso).toLocaleDateString();
}

async function downloadRecording(id, filename) {
  const res = await client.get(`/recordings/${id}/download`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function RecordingItem({ recording, onPlay }) {
  return (
    <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm truncate">{recording.title}</div>
        <div className="text-gray-600 text-xs mt-1 break-words">
          {formatSize(recording.size)} · {formatDate(recording.createdAt)}
        </div>
      </div>
      <div className="flex-shrink-0 self-start sm:self-auto flex gap-2">
        <button
          onClick={() => onPlay(recording)}
          className="text-white font-semibold text-xs px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
        >
          ▶ Play
        </button>
        <button
          onClick={() => downloadRecording(recording.id || recording._id, recording.originalName)}
          className="text-blue-500 font-semibold text-xs px-4 py-2 bg-blue-50 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors"
        >
          Download
        </button>
      </div>
    </li>
  );
}

export default function StudentPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upload");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRecording, setSelectedRecording] = useState(null);

  function loadRecordings() {
    client.get("/recordings/mine").then((res) => {
      const sorted = res.data.recordings.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecordings(sorted);
      setFilteredRecordings(sorted);
    });
  }

  useEffect(loadRecordings, []);

  useEffect(() => {
    if (selectedDate) {
      const filtered = recordings.filter(
        (r) => formatDateOnly(r.createdAt) === selectedDate
      );
      setFilteredRecordings(filtered);
    } else {
      setFilteredRecordings(recordings);
    }
  }, [selectedDate, recordings]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Please select a file" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("title", title || file.name);
    formData.append("file", file);

    try {
      await client.post("/recordings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitle("");
      setFile(null);
      setMessage({ type: "success", text: "Recording uploaded successfully" });
      loadRecordings();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Upload failed",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">📚 Student Portal</h1>
          <p className="text-gray-600 text-xs sm:text-sm truncate">Welcome, {user?.fullName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-4 py-2 sm:px-6 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 hover:-translate-y-0.5 transition-all shadow-lg whitespace-nowrap"
        >
          Log out
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8 flex gap-0.5 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("upload")}
          className={`px-3 py-2.5 sm:px-6 sm:py-3 border-b-4 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === "upload"
              ? "text-blue-500 border-blue-500"
              : "text-gray-600 border-transparent hover:text-blue-500"
          }`}
        >
          📤 Upload Recording
        </button>
        <button
          onClick={() => setActiveTab("homework")}
          className={`px-3 py-2.5 sm:px-6 sm:py-3 border-b-4 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === "homework"
              ? "text-blue-500 border-blue-500"
              : "text-gray-600 border-transparent hover:text-blue-500"
          }`}
        >
          📋 My Homework
        </button>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 md:p-10">
        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Upload Recording</h2>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your recording a name..."
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* File Field */}
              <div>
                <label htmlFor="file" className="block text-sm font-semibold text-gray-700 mb-2">
                  Recording File
                </label>
                <input
                  id="file"
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg text-sm cursor-pointer focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-gray-500 text-xs mt-2">Supported: MP3, WAV, OGG, MP4, WebM (Max 200MB)</p>
              </div>

              {/* Messages */}
              {message && (
                <div
                  className={`p-4 rounded-lg text-sm ${
                    message.type === "success"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:-translate-y-0.5"
              >
                {loading ? "Uploading..." : "Upload Recording"}
              </button>
            </form>
          </div>
        )}

        {/* My Homework Tab */}
        {activeTab === "homework" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">My Homework</h2>

            {/* Date Filter - Only show if recordings exist */}
            {recordings.length > 0 && (
              <div className="flex flex-wrap items-end gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-lg mb-6 sm:mb-8">
                <label className="font-semibold text-gray-700 text-sm whitespace-nowrap">📅 Filter by date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 hover:-translate-y-0.5 transition-all"
                  >
                    ✕ Clear filter
                  </button>
                )}
              </div>
            )}

            {/* Recordings List or Empty State */}
            {recordings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 opacity-50">📋</div>
                <p className="text-gray-600">No recordings submitted yet</p>
              </div>
            ) : filteredRecordings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 opacity-50">📅</div>
                <p className="text-gray-600">No recordings on this date</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-4 font-medium">
                  {filteredRecordings.length} recording{filteredRecordings.length !== 1 ? 's' : ''}
                  {selectedDate && ` on ${new Date(selectedDate).toLocaleDateString()}`}
                </p>
                <ul className="space-y-4">
                  {filteredRecordings.map((r) => (
                    <RecordingItem key={r.id || r._id} recording={r} onPlay={setSelectedRecording} />
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {selectedRecording && (
        <MediaPlayer
          recording={selectedRecording}
          onClose={() => setSelectedRecording(null)}
        />
      )}

      <Footer />
    </div>
  );
}
