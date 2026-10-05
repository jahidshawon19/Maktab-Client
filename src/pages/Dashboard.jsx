import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
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

function RecordingItem({ recording, showStudent }) {
  return (
    <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm truncate">{recording.title}</div>
        <div className="text-gray-600 text-xs mt-1 break-words">
          {showStudent && recording.student?.fullName
            ? `${recording.student.fullName} · `
            : ""}
          {formatSize(recording.size)} · {formatDate(recording.createdAt)}
        </div>
      </div>
      <button
        onClick={() => downloadRecording(recording.id || recording._id, recording.originalName)}
        className="flex-shrink-0 self-start sm:self-auto text-blue-500 font-semibold text-xs px-4 py-2 bg-blue-50 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors"
      >
        Download
      </button>
    </li>
  );
}

function StudentDashboard() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function loadRecordings() {
    client.get("/recordings/mine").then((res) => setRecordings(res.data.recordings));
  }

  useEffect(loadRecordings, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    try {
      await client.post("/recordings", formData);
      setTitle("");
      setFile(null);
      e.target.reset();
      setMessage({ type: "success", text: "Recording uploaded successfully" });
      loadRecordings();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Upload failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 md:p-10 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Upload a recording</h2>
        <form className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 min-w-[160px] px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => setFile(e.target.files[0] || null)}
            required
            className="flex-1 min-w-[160px] px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg text-sm cursor-pointer focus:outline-none focus:border-blue-500"
          />
          <button
            className="px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
            type="submit"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
        {message && (
          <div
            className={`mt-4 p-4 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 md:p-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">My recordings</h2>
        {recordings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 opacity-50">📋</div>
            <p className="text-gray-600">No recordings uploaded yet</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {recordings.map((r) => (
              <RecordingItem key={r.id || r._id} recording={r} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function StaffDashboard() {
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    client.get("/recordings").then((res) => setRecordings(res.data.recordings));
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 md:p-10">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Student recordings</h2>
      {recordings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4 opacity-50">📋</div>
          <p className="text-gray-600">No recordings uploaded yet</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {recordings.map((r) => (
            <RecordingItem key={r.id || r._id} recording={r} showStudent />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="max-w-6xl mx-auto mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">
            Welcome, {user?.fullName}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            {user?.phone} · {user?.role}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-4 py-2 sm:px-6 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 hover:-translate-y-0.5 transition-all shadow-lg whitespace-nowrap"
        >
          Log out
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {user?.role === "student" ? <StudentDashboard /> : <StaffDashboard />}
      </div>
    </div>
  );
}
