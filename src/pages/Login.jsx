import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import heroImg from "../assets/hero.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ phone, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-auth animate-fadeIn relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-15"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>

      {/* Gradient Fallback */}
      <div className="absolute inset-0 bg-gradient-radial animate-gradientShift"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-slideUp">
        {/* Logo Section */}
        <div className="text-center mb-6 sm:mb-10 animate-slideDown" style={{ animationDelay: '0.1s' }}>
          <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-3 sm:mb-4 bg-white bg-opacity-95 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl border border-white border-opacity-30 animate-float">
            <img src={heroImg} alt="Maktab" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">Maktab</h2>
          <p className="text-sm sm:text-base text-white text-opacity-95 font-semibold tracking-wide drop-shadow">Learning Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white border-opacity-30" style={{ animation: 'slideUp 0.7s ease-out 0.2s both' }}>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600 text-xs sm:text-sm mb-5 sm:mb-6 font-medium">Log in to your account</p>

          {error && (
            <div className="bg-gradient-to-r from-red-400 to-red-600 text-white p-3 rounded-lg text-sm mb-6 shadow-lg animate-slideUp">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Phone Field */}
            <div className="mb-4 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <label htmlFor="phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-xl text-sm bg-white text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white"
                required
              />
            </div>

            {/* Password Field */}
            <div className="mb-6 animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-xl text-sm bg-white text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              className="w-full py-2.5 sm:py-3 bg-gradient-auth text-white rounded-xl font-bold text-sm uppercase tracking-wide transition-all hover:shadow-lg hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg animate-slideUp"
              type="submit"
              disabled={loading}
              style={{ animationDelay: '0.5s' }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-sm text-gray-600 animate-slideUp" style={{ animationDelay: '0.6s' }}>
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 font-bold hover:underline transition-all">
              Create one
            </Link>
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
