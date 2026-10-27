import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import dbStore from './data/store';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SvgHeart, SvgLogOut, SvgSettings, SvgUsers, SvgSparkles } from './components/icons';

// Import Pages
import PresetGallery from './pages/PresetGallery';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import InvitationEditor from './pages/InvitationEditor';
import InvitationView from './pages/InvitationView';
import PrintInvitationView from './pages/PrintInvitationView';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Note: loading state is already handled by AuthProvider which gates children rendering.
  // By the time ProtectedRoute renders, loading is guaranteed to be false.

  if (!currentUser) {
    // Redirect to login page but save current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Role not authorized, redirect to appropriate default dashboard
    return currentUser.role === 'admin' 
      ? <Navigate to="/admin" replace /> 
      : <Navigate to="/customer" replace />;
  }

  return children;
}

// Global Header Layout (Wraps all pages except Invitation View)
function AppLayout({ children }) {
  const { currentUser, logout, isAdmin, isCustomer } = useAuth();
  const location = useLocation();
  const [brandSettings, setBrandSettings] = useState(() => dbStore.getBrandSettings());

  useEffect(() => {
    const handleSync = () => {
      setBrandSettings(dbStore.getBrandSettings());
    };
    window.addEventListener("db_synced", handleSync);
    return () => window.removeEventListener("db_synced", handleSync);
  }, []);

  // Dynamically update document body background color & CSS variable
  const appBgColor = brandSettings?.appBgColor || '#FFF9F2';
  const appBgGradient = brandSettings?.appBgGradient || '';
  const appBgOverlayUrl = brandSettings?.appBgOverlayUrl || '';
  const appBgOverlayOpacity = brandSettings?.appBgOverlayOpacity !== undefined ? brandSettings.appBgOverlayOpacity : 0.35;
  const appBgOverlayRepeat = brandSettings?.appBgOverlayRepeat || 'repeat';
  const appBgOverlayBlendMode = brandSettings?.appBgOverlayBlendMode || 'normal';

  useEffect(() => {
    document.documentElement.style.setProperty('--app-bg-color', appBgColor);
    document.body.style.backgroundColor = appBgColor;
    if (appBgGradient) {
      document.body.style.backgroundImage = appBgGradient;
    } else {
      document.body.style.backgroundImage = 'none';
    }
  }, [appBgColor, appBgGradient]);

  // Hide header on client invite, editor, and printable PDF pages
  const normalizedPath = (location.pathname || '').toLowerCase();
  const isInvitePage = normalizedPath.startsWith('/invite');
  const isEditorPage = normalizedPath.startsWith('/admin/editor');
  const isPrintPage = normalizedPath.startsWith('/print');

  if (isInvitePage || isEditorPage || isPrintPage) {
    return <>{children}</>;
  }

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-500"
      style={{
        backgroundColor: appBgColor,
        backgroundImage: appBgGradient || undefined
      }}
    >
      {/* Floating Ambient Background Orbs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[#D6AD61]/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-200px] w-[500px] h-[500px] rounded-full bg-[#F9E8E5]/40 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-200px] left-[15%] w-[700px] h-[700px] rounded-full bg-[#F7EFE5]/50 blur-[150px] pointer-events-none z-0" />

      {/* Admin Custom Clipart / Pattern Overlay Layer */}
      {appBgOverlayUrl && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
          style={{
            backgroundImage: `url("${appBgOverlayUrl}")`,
            opacity: appBgOverlayOpacity !== undefined ? appBgOverlayOpacity : 0.35,
            backgroundRepeat: appBgOverlayRepeat === 'repeat' ? 'repeat' : 'no-repeat',
            backgroundSize: appBgOverlayRepeat === 'repeat' ? 'auto' : appBgOverlayRepeat === 'no-repeat-cover' ? 'cover' : 'contain',
            backgroundPosition: 
              appBgOverlayRepeat === 'top-right-contain' ? 'top right' : 
              appBgOverlayRepeat === 'bottom-right-contain' ? 'bottom right' : 
              'center center',
            mixBlendMode: appBgOverlayBlendMode || 'normal'
          }}
        />
      )}

      {/* Elegant Fine Gold Border Frame */}
      <div className="fixed inset-2 sm:inset-4 border border-[#C49A4A]/20 rounded-[18px] sm:rounded-[28px] pointer-events-none z-10" />

      {/* SaaS Branding Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#FFFEFB]/90 py-3.5 px-6 border-b border-[#E9DCCB] shadow-sm flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          {brandSettings?.logoUrl ? (
            <div className={`w-9 h-9 flex items-center justify-center overflow-hidden border border-[#C49A4A]/40 shadow-sm ${
              brandSettings.logoShape === 'circle' ? 'rounded-full' : brandSettings.logoShape === 'square' ? 'rounded-none' : 'rounded-xl'
            } bg-[#FFFEFB] group-hover:border-[#C49A4A] transition shrink-0`}>
              <img
                src={brandSettings.logoUrl}
                alt={brandSettings.brandName || "Logo"}
                className="w-full h-full object-cover transition transform group-hover:scale-110"
              />
            </div>
          ) : (
            <div className="p-1.5 rounded-full bg-[#F9E8E5] border border-[#E9C9BD] group-hover:border-[#D86F7E] transition">
              <SvgHeart className="w-5 h-5 text-[#8D414D] animate-pulse" fill="rgba(141, 65, 77, 0.2)" />
            </div>
          )}
          <span className="font-cinzel tracking-wider text-sm font-bold text-[#513321] group-hover:text-[#382416] transition">
            {brandSettings?.brandName || "DS ENVITES"}
          </span>
        </Link>

        {/* Navigation & Auth (Extreme Right Top of Screen - Req #4) */}
        <div className="flex items-center space-x-4">
          <nav className="hidden sm:flex items-center space-x-2.5">
            <Link 
              to="/" 
              className={`header-nav-btn ${location.pathname === '/' ? 'active' : ''}`}
            >
              Browse Designs
            </Link>

            {isAdmin && (
              <Link 
                to="/admin" 
                className={`header-nav-btn ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                Admin Dashboard
              </Link>
            )}

            {isCustomer && (
              <Link 
                to="/customer" 
                className={`header-nav-btn ${location.pathname === '/customer' ? 'active' : ''}`}
              >
                My Portal
              </Link>
            )}
          </nav>

          {/* User actions */}
          {currentUser ? (
            <div className="flex items-center space-x-3 border-l border-[#E9DCCB] pl-4">
              <button
                onClick={logout}
                className="px-3.5 py-2 bg-[#F9E8E5] hover:bg-[#F2D5D1] text-[#8D414D] border border-[#E9C9BD] rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer"
                title="Logout Session"
              >
                <SvgLogOut className="w-3.5 h-3.5 text-[#8D414D]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 border-l border-[#E9DCCB] pl-4">
              <Link
                to="/login"
                className="px-4 py-2 bg-[#D6AD61] hover:bg-[#C49A4A] text-[#382416] hover:text-white border border-[#C49A4A] text-xs font-bold uppercase tracking-widest rounded-xl shadow transition"
              >
                Login / Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Pages Container */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-[10px] text-slate-500 tracking-wider">
        <p>© {new Date().getFullYear()} DS Envites Platform. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public Preset Browsing Gallery (Landing) */}
            <Route path="/" element={<PresetGallery />} />
            
            {/* Secure Login & Registration */}
            <Route path="/login" element={<LoginPage />} />

            {/* Customer Dashboard Portal */}
            <Route 
              path="/customer" 
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Management Dashboard */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Customisation Editor */}
            <Route 
              path="/admin/editor" 
              element={
                <ProtectedRoute allowedRoles={["admin", "customer"]}>
                  <InvitationEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/editor/:id" 
              element={
                <ProtectedRoute allowedRoles={["admin", "customer"]}>
                  <InvitationEditor />
                </ProtectedRoute>
              } 
            />

            {/* Shared Client Facing Invitation Link View */}
            <Route path="/invite/:id" element={<InvitationView />} />
            <Route path="/invitation/:id" element={<InvitationView />} />

            {/* Printable PDF Live Design View */}
            <Route path="/print" element={<PrintInvitationView />} />
            <Route path="/print/:id" element={<PrintInvitationView />} />

            {/* Catch all redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
