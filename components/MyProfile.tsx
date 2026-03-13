
import React, { useState, useEffect } from 'react';
import { User, Mail, Edit2, Check, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MyProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '' // Optional for updates
  });

  useEffect(() => {
      if (user) {
          setFormData({
              name: user.name,
              email: user.email,
              password: ''
          });
      }
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
      setIsSaving(true);
      try {
          // Prepare data to update
          const updates: any = {
              name: formData.name,
              email: formData.email
          };
          // Note: In a real backend, password would be sent to a specific secure endpoint
          
          await updateProfile(updates);
          setIsEditing(false);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
      } catch (e) {
          alert("Failed to update profile");
      } finally {
          setIsSaving(false);
      }
  };

  // Get the first letter of the name for the monogram
  const initial = formData.name ? formData.name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-12 px-6 flex items-center justify-center animate-[fadeIn_0.5s] relative">
      
      {/* Toast Notification */}
      {showToast && (
          <div className="fixed top-24 right-6 z-50 bg-[#1a1a1a] border border-green-500/30 text-white px-6 py-4 rounded shadow-2xl flex items-center gap-3 animate-[slideInRight_0.3s_ease-out]">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"><Check size={14} /></div>
              <p className="text-sm font-bold">Profile Updated Successfully</p>
          </div>
      )}

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
        
        {/* --- LEFT COLUMN: MONOGRAM (Replaces Avatar) --- */}
        <div className="md:col-span-4 flex flex-col items-center">
            
            <div className="relative group transition-all duration-300">
                {/* Monogram Container */}
                <div className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full p-1 border-2 transition-all duration-300 ${isEditing ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'border-white/10'}`}>
                    <div className="w-full h-full rounded-full overflow-hidden relative bg-[#1a1a1a] flex items-center justify-center">
                         {/* Large Initial */}
                         <span className="font-['Playfair_Display'] text-[80px] sm:text-[100px] text-gray-500 font-bold select-none">
                             {initial}
                         </span>
                    </div>
                </div>
                {/* REMOVED: Green Active Status Dot */}
            </div>
            
            <div className="mt-6 text-center">
                {/* Replaced Tier with Generic Member Label */}
                <p className="text-xs text-luxury-gold uppercase tracking-widest font-bold">Valoir Member</p>
                <p className="text-[10px] text-gray-600 mt-1">ID: {user.id}</p>
            </div>
        </div>

        {/* --- RIGHT COLUMN: PERSONAL INFO FORM --- */}
        <div className="md:col-span-8 w-full">
             <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                 <div>
                    <h1 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-white mb-2">Personal Profile</h1>
                    <p className="text-gray-500 text-xs sm:text-sm">Manage your identity and security settings.</p>
                 </div>
                 
                 {/* Action Buttons */}
                 {!isEditing ? (
                     <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-gray-300 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                     >
                         <Edit2 size={14} /> Edit
                     </button>
                 ) : (
                     <div className="flex gap-3">
                        <button 
                            onClick={() => { setIsEditing(false); setFormData({...formData, name: user.name, email: user.email}) }}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 rounded-full text-xs font-bold uppercase tracking-widest text-white hover:bg-yellow-500 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : <><Check size={14} /> Save Changes</>} 
                        </button>
                     </div>
                 )}
             </div>

             <div className="space-y-8 animate-[fadeIn_0.3s]">
                {/* Name Field */}
                <div className="group">
                    <label className={`flex items-center gap-2 text-[10px] uppercase tracking-widest mb-3 transition-colors ${isEditing ? 'text-yellow-500' : 'text-gray-500'}`}>
                        <User size={14} /> Full Name
                    </label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg p-4 text-white focus:border-yellow-500 outline-none transition-all font-medium text-lg placeholder-gray-700"
                            placeholder="Enter your full name"
                        />
                    ) : (
                        <div className="text-2xl font-['Playfair_Display'] text-white">{user.name}</div>
                    )}
                </div>

                {/* Email Field */}
                <div className="group">
                    <label className={`flex items-center gap-2 text-[10px] uppercase tracking-widest mb-3 transition-colors ${isEditing ? 'text-yellow-500' : 'text-gray-500'}`}>
                        <Mail size={14} /> Email Address
                    </label>
                     {isEditing ? (
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg p-4 text-white focus:border-yellow-500 outline-none transition-all font-medium text-lg placeholder-gray-700"
                            placeholder="name@example.com"
                        />
                    ) : (
                        <div className="text-lg text-gray-300 font-light">{user.email}</div>
                    )}
                </div>

                {/* Password Field (Only visible when editing) */}
                {isEditing && (
                     <div className="group animate-[slideDown_0.3s_ease-out]">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest mb-3 text-yellow-500">
                            <Lock size={14} /> Security
                        </label>
                        <input 
                            type="password" 
                            placeholder="Set new password (leave blank to keep current)"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg p-4 text-white focus:border-yellow-500 outline-none transition-all font-medium text-lg placeholder-gray-700"
                        />
                        <p className="text-[10px] text-gray-600 mt-2">
                            Secure password must be at least 8 characters long.
                        </p>
                    </div>
                )}
             </div>
        </div>

      </div>
    </div>
  );
};

export default MyProfile;
