import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SvgHeart, SvgLock, SvgUsers, SvgSparkles } from '../components/icons';
import Toast from '../components/Toast';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorToast, setErrorToast] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path
  const from = location.state?.from?.pathname || "/";

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resetIdentifier.trim() || !newPassword.trim()) {
      setErrorToast("Please enter your Username/Email and new password");
      return;
    }
    try {
      resetPassword(resetIdentifier.trim(), newPassword.trim());
      setSuccessToast(`Password successfully reset! You can now log in with your new password.`);
      setShowForgotModal(false);
      setUsername(resetIdentifier.trim());
      setPassword(newPassword.trim());
      setResetIdentifier("");
      setNewPassword("");
    } catch (err) {
      setErrorToast(err.message || "Failed to reset password");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorToast("Please fill out all required fields");
      return;
    }

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setErrorToast("Please provide your name");
          return;
        }
        const user = signup(username.trim(), password.trim(), displayName.trim());
        setSuccessToast(`Account created successfully! Welcome, ${user.displayName}`);
        setTimeout(() => {
          navigate("/customer");
        }, 1500);
      } else {
        const user = login(username.trim(), password.trim());
        setSuccessToast(`Welcome back, ${user.displayName}!`);
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/customer");
          }
        }, 1500);
      }
    } catch (err) {
      setErrorToast(err.message || "An error occurred during authentication");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 relative overflow-hidden bg-[var(--bg-app)] text-[var(--text-body)] login-page-container">
      {/* Toast notifications */}
      {errorToast && <Toast message={errorToast} type="error" onClose={() => setErrorToast("")} />}
      {successToast && <Toast message={successToast} type="success" onClose={() => setSuccessToast("")} />}

      {/* Decorative blurry background circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Form Card */}
      <div className="login-card-box w-full max-w-md p-8 rounded-2xl border-2 border-amber-500/40 bg-slate-950/95 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(245,158,11,0.2)] relative z-10 space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex p-3 rounded-full bg-amber-500/15 border border-amber-500/40 shadow-inner">
            <SvgHeart className="w-6 h-6 text-amber-400 animate-pulse" fill="rgba(245, 158, 11, 0.3)" />
          </div>
          <h2 className="font-cinzel text-2xl font-black tracking-wider text-amber-300 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            {isSignUp ? "Create Account" : "Access Platform"}
          </h2>
          <p className="text-xs text-amber-200/95 font-bold tracking-wide leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
            {isSignUp ? "Sign up to customize, preview, and share your dream invitations" : "Login to view your saved designs and live guest RSVPs"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {isSignUp && (
            <div>
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-amber-300 flex items-center space-x-1.5 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                <SvgUsers className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Your Full Name</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-12 px-4 bg-slate-900/80 border border-amber-500/40 rounded-xl text-sm font-bold text-white placeholder-slate-400/80 backdrop-blur-md focus:outline-none focus:border-amber-400 focus:bg-slate-900 focus:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all shadow-inner"
                placeholder="Evelyn Sterling"
                required
              />
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase font-extrabold tracking-wider text-amber-300 flex items-center space-x-1.5 mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              <SvgUsers className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Email / Username</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 px-4 bg-slate-900/80 border border-amber-500/40 rounded-xl text-sm font-bold text-white placeholder-slate-400/80 backdrop-blur-md focus:outline-none focus:border-amber-400 focus:bg-slate-900 focus:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all shadow-inner"
              placeholder="customer"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-amber-300 flex items-center space-x-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                <SvgLock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Password</span>
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] text-amber-300 hover:text-amber-200 font-extrabold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/35 hover:border-amber-400 transition shadow-sm cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-slate-900/80 border border-amber-500/40 rounded-xl text-sm font-bold text-white placeholder-slate-400/80 backdrop-blur-md focus:outline-none focus:border-amber-400 focus:bg-slate-900 focus:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all shadow-inner"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-3 rounded-xl text-xs uppercase tracking-widest font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 shadow-xl hover:shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <SvgSparkles className="w-4 h-4 text-slate-950" />
            <span>{isSignUp ? "Sign Up & Begin" : "Secure Login"}</span>
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center pt-3 border-t border-slate-800/80 text-xs">
          <span className="text-slate-100 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {isSignUp ? "Already have an account?" : "Want to design your own invitation?"}{" "}
          </span>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-amber-300 font-extrabold hover:text-amber-200 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/35 hover:border-amber-400 transition shadow-sm cursor-pointer ml-1 inline-block"
          >
            {isSignUp ? "Login Here" : "Register a Customer Account"}
          </button>
        </div>

        {/* Quick Help */}
        {!isSignUp && (
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-amber-500/30 text-[11px] text-slate-100 space-y-1.5 font-bold shadow-lg">
            <p className="font-extrabold text-amber-300 uppercase tracking-wider text-[10px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              🔑 Quick Demo Credentials:
            </p>
            <p className="flex items-center justify-between text-slate-200">
              <span>Admin Portal:</span>
              <span className="text-amber-300 font-mono font-black bg-slate-950 px-2 py-0.5 rounded border border-amber-500/30">admin / admin123</span>
            </p>
            <p className="flex items-center justify-between text-slate-200">
              <span>Customer Portal:</span>
              <span className="text-amber-300 font-mono font-black bg-slate-950 px-2 py-0.5 rounded border border-amber-500/30">customer / customer123</span>
            </p>
          </div>
        )}
      </div>

      {/* FORGOT PASSWORD RESET MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl border border-amber-500/30 bg-slate-950 text-slate-100 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
            >
              ✕
            </button>

            <div className="space-y-1 pr-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Account Recovery</span>
              <h3 className="font-cinzel text-lg font-bold text-slate-100">Reset Password</h3>
              <p className="text-xs text-slate-400">
                Enter your registered Email or Username to set a new password.
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Email ID or Username *
                </label>
                <input
                  type="text"
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. customer or user@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="Enter new strong password"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-bold uppercase tracking-wider transition shadow-lg"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
