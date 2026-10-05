import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StudentPanel from "./pages/StudentPanel";
import TeacherPanel from "./pages/TeacherPanel";
import { useAuth } from "./context/AuthContext";

function RoleBasedDashboard() {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ textAlign: "center", marginTop: "3rem" }}>Loading...</p>;

  if (user?.role === "student") {
    return <StudentPanel />;
  } else if (user?.role === "teacher" || user?.role === "admin") {
    return <TeacherPanel />;
  } else {
    return <Dashboard />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
