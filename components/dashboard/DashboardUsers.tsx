
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, User, Star, MoreVertical, X, Check, Filter, UserX, AlertTriangle } from 'lucide-react';
import { useUserDatabase, UserProfile } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';

const DashboardUsers: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useUserDatabase();
  const { user: currentUser } = useAuth();
  const { bookings } = useBooking();
  
  const isAdmin = currentUser?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'STAFF'>(isAdmin ? 'STAFF' : 'CUSTOMERS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  
  // Delete Confirmation State
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string, role: string} | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      role: 'CUSTOMER' as 'CUSTOMER' | 'STAFF' | 'ADMIN'
  });

  // --- FILTERING & COMPUTING SPENT ---
  const displayedUsers = useMemo(() => {
      return users.filter(u => {
          // 1. Role Filter
          if (activeTab === 'STAFF' && (u.role === 'CUSTOMER')) return false;
          if (activeTab === 'CUSTOMERS' && (u.role !== 'CUSTOMER')) return false;
          
          // 2. Search Filter
          const search = searchTerm.toLowerCase();
          return (
              u.name.toLowerCase().includes(search) ||
              u.email.toLowerCase().includes(search) ||
              u.phone.includes(search)
          );
      }).map(u => {
          if (u.role === 'CUSTOMER') {
              const spent = bookings
                  .filter(b => b.userId === u.email && b.status !== 'CANCELLED')
                  .reduce((acc, curr) => acc + parseInt(curr.totalPrice?.replace(/[^0-9]/g, '') || '0', 10), 0);
              return { ...u, spent };
          }
          return u;
      });
  }, [users, activeTab, searchTerm, bookings]);

  // --- ACTIONS ---
  const handleOpenAdd = () => {
      setEditingUser(null);
      setFormData({ name: '', email: '', phone: '', role: activeTab === 'STAFF' ? 'STAFF' : 'CUSTOMER' });
      setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserProfile) => {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, phone: user.phone, role: user.role });
      setIsModalOpen(true);
  };

  // STEP 1: Initiate Delete (Open Modal)
  const initiateDelete = (e: React.MouseEvent<HTMLButtonElement>, user: UserProfile) => {
      e.stopPropagation(); // Stop clicking on the card

      // Safety Checks
      if (user.id === 'u-admin') {
          setActionError("Protected Action: The System Administrator account cannot be removed.");
          return;
      }
      if (currentUser && user.id === currentUser.id) {
          setActionError("Action Denied: You cannot delete your own active account.");
          return;
      }

      // Open the custom confirmation modal
      setUserToDelete({ id: user.id, name: user.name, role: user.role });
  };

  // STEP 2: Confirm Delete (Execute Logic)
  const confirmDelete = () => {
      if (userToDelete) {
          deleteUser(userToDelete.id);
          setUserToDelete(null); // Close modal
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingUser) {
          updateUser(editingUser.id, formData);
      } else {
          try {
            addUser(formData);
          } catch (error: any) {
              setActionError(error.message);
              return;
          }
      }
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s]">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-['Playfair_Display'] text-white">User Management</h2>
            <p className="text-xs text-gray-500 mt-1">Manage access and profiles for {isAdmin ? 'staff and guests' : 'guests'}.</p>
          </div>

          {isAdmin && (
              <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
                  <button 
                    onClick={() => setActiveTab('STAFF')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all ${activeTab === 'STAFF' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                      Staff
                  </button>
                  <button 
                    onClick={() => setActiveTab('CUSTOMERS')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all ${activeTab === 'CUSTOMERS' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                      Guests
                  </button>
              </div>
          )}
      </div>

      {/* TOOLBAR */}
      <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                    type="text" 
                    placeholder={`Search ${activeTab === 'STAFF' ? 'staff' : 'guests'} by name, email...`}
                    className="w-full bg-[#111] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
          </div>
          
          <button 
            onClick={handleOpenAdd}
            className="px-6 py-2.5 bg-yellow-600 text-white hover:bg-yellow-500 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
          >
              <Plus size={16} /> 
              Add {activeTab === 'STAFF' ? 'Staff' : 'Guest'}
          </button>
      </div>

      {/* DATA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedUsers.map((u) => (
              <div key={u.id} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 group hover:border-white/20 transition-all relative flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-lg font-bold ${u.role === 'ADMIN' ? 'bg-red-900/20 text-red-500' : u.role === 'STAFF' ? 'bg-blue-900/20 text-blue-500' : 'bg-yellow-900/20 text-yellow-500'}`}>
                                    {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">{u.name}</h3>
                                <div className="text-xs text-gray-500">{u.role}</div>
                            </div>
                        </div>
                        <div className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${u.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-500'}`}>
                            {u.status}
                        </div>
                    </div>

                    <div className="space-y-3 py-4 border-t border-white/5">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <User size={14} className="shrink-0" />
                            <span className="truncate">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <Filter size={14} className="shrink-0" /> 
                            <span>{u.phone}</span>
                        </div>
                        {u.role === 'CUSTOMER' && (
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Star size={14} className="shrink-0 text-yellow-500" />
                                    <span>Spent: ${u.spent || 0}</span>
                            </div>
                        )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(u);
                        }}
                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors"
                      >
                          <Edit2 size={12} /> Edit
                      </button>
                      <button 
                        onClick={(e) => initiateDelete(e, u)}
                        className="px-4 bg-red-900/10 hover:bg-red-900/30 text-red-500 rounded transition-colors flex items-center justify-center"
                        title="Delete User"
                      >
                          <Trash2 size={16} />
                      </button>
                  </div>
              </div>
          ))}
          {displayedUsers.length === 0 && (
              <div className="col-span-full p-12 text-center text-gray-500 border border-white/5 rounded-xl border-dashed flex flex-col items-center justify-center">
                  <UserX size={48} className="mb-4 opacity-50" />
                  <p>No users found matching your criteria.</p>
              </div>
          )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-[#111] border border-white/10 w-full max-w-md rounded-xl p-8 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                <h3 className="text-xl font-['Playfair_Display'] text-white mb-6">
                    {editingUser ? 'Edit User Profile' : `Add New ${activeTab === 'STAFF' ? 'Staff' : 'Guest'}`}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Full Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-yellow-500 outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Email Address</label>
                        <input 
                            required
                            type="email" 
                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-yellow-500 outline-none"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Phone Number</label>
                        <input 
                            type="text" 
                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-yellow-500 outline-none"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    
                    {/* Role Selection (Only Admin can change roles) */}
                    {isAdmin && (
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">System Role</label>
                            <select 
                                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-yellow-500 outline-none"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                            >
                                <option value="CUSTOMER">Customer (Guest)</option>
                                <option value="STAFF">Staff (Concierge)</option>
                                <option value="ADMIN">Admin (Director)</option>
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded font-bold text-xs uppercase tracking-widest">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold text-xs uppercase tracking-widest">
                            {editingUser ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {userToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={() => setUserToDelete(null)}></div>
              <div className="relative bg-[#0a0a0a] border border-red-500/30 w-full max-w-sm rounded-xl p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                  <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                      <AlertTriangle size={32} className="text-red-500" />
                  </div>
                  
                  <div className="text-center mb-6">
                      <h3 className="text-xl font-['Playfair_Display'] text-white mb-2">Confirm Deletion</h3>
                      <p className="text-gray-400 text-sm">
                          Are you sure you want to delete <span className="text-white font-bold">{userToDelete.name}</span>? 
                      </p>
                      <p className="text-red-400/80 text-xs mt-2 bg-red-900/10 py-2 px-3 rounded border border-red-900/30">
                          This action cannot be undone and will remove all associated data.
                      </p>
                  </div>

                  <div className="flex gap-3">
                      <button 
                        onClick={() => setUserToDelete(null)}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded font-bold text-xs uppercase tracking-widest transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmDelete}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-colors"
                      >
                          Yes, Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- ACTION ERROR MODAL --- */}
      {actionError && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={() => setActionError(null)}></div>
              <div className="relative bg-[#0a0a0a] border border-red-500/30 w-full max-w-sm rounded-xl p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                  <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                      <Shield size={32} className="text-red-500" />
                  </div>
                  
                  <div className="text-center mb-6">
                      <h3 className="text-xl font-['Playfair_Display'] text-white mb-2">Action Denied</h3>
                      <p className="text-gray-400 text-sm">
                          {actionError}
                      </p>
                  </div>

                  <div className="flex gap-3">
                      <button 
                        onClick={() => setActionError(null)}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded font-bold text-xs uppercase tracking-widest transition-colors"
                      >
                          Dismiss
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default DashboardUsers;
