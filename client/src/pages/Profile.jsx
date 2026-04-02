import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import { FiUser, FiLock, FiMail, FiCamera, FiCheck, FiShield } from "react-icons/fi";
import { motion } from "framer-motion";

function Profile() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
    profilePicture: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      setProfileData({
        name: res.data.name || "",
        email: res.data.email || "",
        role: res.data.role || "",
        profilePicture: res.data.profilePicture || ""
      });
    } catch(err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load profile data." });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await API.put("/auth/profile", {
        name: profileData.name,
        email: profileData.email,
        profilePicture: profileData.profilePicture
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
      // Update local storage if needed, but App.jsx drives from token
    } catch(err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Profile update failed." });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if(passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await API.put("/auth/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch(err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Password update failed." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="w-16 h-16 border-4 border-primary-100 dark:border-white/10 border-t-primary-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Your Profile</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and preferences.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-white/5">
            <button
              onClick={() => { setActiveTab("general"); setMessage({type:"", text:""}); }}
              className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              General Info
            </button>
            <button
              onClick={() => { setActiveTab("security"); setMessage({type:"", text:""}); }}
              className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'security' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Security
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'}`}>
                {message.text}
              </div>
            )}

            {activeTab === "general" && (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleProfileUpdate} 
                className="space-y-6"
              >
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
                  <div className="relative group">
                    {profileData.profilePicture ? (
                      <img src={profileData.profilePicture} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 dark:border-white/5" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-slate-50 dark:border-white/5">
                        {profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <button type="button" className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:text-primary-600 transition-colors pointer-events-none">
                      <FiCamera size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Picture</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      We temporarily only support URL based profile pictures. Paste an image URL below to update.
                    </p>
                    <input 
                      type="text"
                      className="mt-3 w-full sm:w-80 px-4 py-2 bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm outline-none"
                      placeholder="https://example.com/avatar.png"
                      value={profileData.profilePicture}
                      onChange={(e) => setProfileData({...profileData, profilePicture: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm outline-none"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="email"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm outline-none"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Role</label>
                    <div className="relative">
                      <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        disabled
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-500 dark:text-slate-400 rounded-xl cursor-not-allowed text-sm outline-none"
                        value={profileData.role}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Roles can only be changed by an Admin.</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-primary-600/20 disabled:opacity-70 text-sm"
                  >
                    {saving ? "Saving..." : <><FiCheck /> Save Changes</>}
                  </button>
                </div>
              </motion.form>
            )}

            {activeTab === "security" && (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handlePasswordUpdate} 
                className="space-y-6 max-w-md"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Current Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm outline-none"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm outline-none"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm outline-none"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={saving}
                    className="flex items-center justify-center w-full gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md disabled:opacity-70 text-sm"
                  >
                    {saving ? "Updating Password..." : <><FiLock /> Update Password</>}
                  </button>
                </div>
              </motion.form>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
