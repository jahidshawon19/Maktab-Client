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

async function downloadAttendanceReport(startDate, endDate) {
  try {
    const res = await client.get(`/attendance/report-pdf?startDate=${startDate}&endDate=${endDate}`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_Report_${startDate}_to_${endDate}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading report:", err);
    alert("Failed to download report");
  }
}

function RecordingItem({ recording, showStudent, onPlay }) {
  return (
    <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm truncate">{recording.title}</div>
        <div className="text-gray-600 text-xs mt-1 break-words">
          {showStudent && recording.student?.fullName ? `${recording.student.fullName} · ` : ""}
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

export default function TeacherPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("records");
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceStartDate, setAttendanceStartDate] = useState("");
  const [attendanceEndDate, setAttendanceEndDate] = useState("");
  const [selectedRecording, setSelectedRecording] = useState(null);

  useEffect(() => {
    loadRecordings();
    loadStudents();
    loadAttendance();
  }, []);

  function loadAttendance() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const start = thirtyDaysAgo.toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];

    setAttendanceStartDate(start);
    setAttendanceEndDate(end);

    client
      .get(`/attendance/report?startDate=${start}&endDate=${end}`)
      .then((res) => setAttendanceData(res.data))
      .catch((err) => console.error('Error loading attendance:', err));
  }

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

  useEffect(() => {
    if (studentSearch.trim()) {
      const query = studentSearch.toLowerCase();
      const filtered = students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(query) ||
          s.phone.includes(query)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [studentSearch, students]);

  function loadRecordings() {
    client.get("/recordings").then((res) => {
      const sorted = res.data.recordings.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecordings(sorted);
      setFilteredRecordings(sorted);
    });
  }

  function loadStudents() {
    client
      .get("/auth/users?role=student")
      .then((res) => setStudents(res.data.users || []))
      .catch(() => {
        client.get("/recordings").then((res) => {
          const uniqueStudents = {};
          res.data.recordings.forEach((r) => {
            if (r.student && !uniqueStudents[r.student._id]) {
              uniqueStudents[r.student._id] = r.student;
            }
          });
          setStudents(Object.values(uniqueStudents));
        });
      });
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 flex flex-col">
      <div className="flex-1">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">👨‍🏫 Teacher Portal</h1>
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
          onClick={() => setActiveTab("records")}
          className={`px-3 py-2.5 sm:px-6 sm:py-3 border-b-4 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === "records"
              ? "text-blue-500 border-blue-500"
              : "text-gray-600 border-transparent hover:text-blue-500"
          }`}
        >
          📹 <span className="hidden xs:inline">Student </span>Recordings
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-3 py-2.5 sm:px-6 sm:py-3 border-b-4 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === "students"
              ? "text-blue-500 border-blue-500"
              : "text-gray-600 border-transparent hover:text-blue-500"
          }`}
        >
          👥 Students
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-3 py-2.5 sm:px-6 sm:py-3 border-b-4 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === "attendance"
              ? "text-blue-500 border-blue-500"
              : "text-gray-600 border-transparent hover:text-blue-500"
          }`}
        >
          📋 Attendance
        </button>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 md:p-10">
        {/* Student Recordings Tab */}
        {activeTab === "records" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Student Recordings</h2>

            {/* Date Filter */}
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

            {/* Recordings List or Empty State */}
            {filteredRecordings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 opacity-50">📹</div>
                <p className="text-gray-600">
                  {selectedDate ? "No recordings on this date" : "No recordings uploaded yet"}
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-4 font-medium">
                  {filteredRecordings.length} recording{filteredRecordings.length !== 1 ? 's' : ''}
                  {selectedDate && ` on ${new Date(selectedDate).toLocaleDateString()}`}
                </p>
                <ul className="space-y-4">
                  {filteredRecordings.map((r) => (
                    <RecordingItem
                      key={r.id || r._id}
                      recording={r}
                      showStudent
                      onPlay={setSelectedRecording}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">All Students</h2>

            {students.length > 0 && (
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="🔍 Search by name or phone..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                {studentSearch && (
                  <button
                    onClick={() => setStudentSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {students.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 opacity-50">👥</div>
                <p className="text-gray-600">No students found</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 opacity-50">🔍</div>
                <p className="text-gray-600">No students match your search</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-6 font-medium">
                  {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredStudents.map((s) => (
                    <div
                      key={s._id || s.id}
                      className="p-4 sm:p-6 border border-gray-200 rounded-lg bg-gray-50 hover:border-blue-500 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <p className="text-base sm:text-lg font-bold text-gray-900 mb-3 break-words">👤 {s.fullName}</p>
                      <span className="inline-block text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded font-mono tracking-wide">
                        {s.phone}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Student Attendance</h2>

            {/* Date Range Filter */}
            <div className="flex flex-wrap items-end gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-lg mb-6 sm:mb-8">
              <div className="flex-1 min-w-[140px] sm:flex-none">
                <label className="block text-sm font-semibold text-gray-700 mb-2">📅 From:</label>
                <input
                  type="date"
                  value={attendanceStartDate}
                  onChange={(e) => setAttendanceStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div className="flex-1 min-w-[140px] sm:flex-none">
                <label className="block text-sm font-semibold text-gray-700 mb-2">To:</label>
                <input
                  type="date"
                  value={attendanceEndDate}
                  onChange={(e) => setAttendanceEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <button
                onClick={() => loadAttendance()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 hover:-translate-y-0.5 transition-all whitespace-nowrap"
              >
                🔄 Load Report
              </button>
              {attendanceData && Object.keys(attendanceData).length > 0 && (
                <button
                  onClick={() => downloadAttendanceReport(attendanceStartDate, attendanceEndDate)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                >
                  📄 Download PDF
                </button>
              )}
            </div>

            {/* Attendance Table or Empty State */}
            {!attendanceData || Object.keys(attendanceData).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 opacity-50">📋</div>
                <p className="text-gray-600">No attendance data available</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg -mx-4 sm:mx-0">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-gray-700">Student Name</th>
                      <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-gray-700">Phone</th>
                      <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-center font-semibold text-gray-700">Present</th>
                      <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-center font-semibold text-gray-700">Absent</th>
                      <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-center font-semibold text-gray-700">Total</th>
                      <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-center font-semibold text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(attendanceData).map((record) => {
                      const total = record.present + record.absent;
                      const percentage = total > 0 ? ((record.present / total) * 100).toFixed(1) : 0;
                      let badgeClass = "bg-red-100 text-red-700";
                      if (percentage >= 80) badgeClass = "bg-green-100 text-green-700";
                      else if (percentage >= 60) badgeClass = "bg-yellow-100 text-yellow-700";

                      return (
                        <tr key={record.student.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-3 py-2.5 sm:px-4 sm:py-3 font-semibold text-gray-900">{record.student.fullName}</td>
                          <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-600 font-mono text-xs">{record.student.phone}</td>
                          <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-center text-green-600 font-semibold">{record.present}</td>
                          <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-center text-red-600 font-semibold">{record.absent}</td>
                          <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-center text-blue-600 font-semibold">{total}</td>
                          <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-center">
                            <span className={`inline-block px-3 py-1 rounded-md font-semibold text-xs ${badgeClass}`}>
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
      </div>

      <Footer />
    </div>
  );
}
