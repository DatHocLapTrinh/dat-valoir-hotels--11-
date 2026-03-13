
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, Phone, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserDatabase } from '../context/UserContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (role: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login } = useAuth();
  const { addUser } = useUserDatabase();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  // Reset State on Open
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setError('');
      setSuccessMessage('');
      // Keep email if pre-filled, but clear password
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsProcessing(true);

    // Basic Validation
    if (!email.includes('@') || !email.includes('.')) {
        setError('Please enter a valid email address.');
        setIsProcessing(false);
        return;
    }
    if (password.length < 5) {
        setError('Password must be at least 5 characters.');
        setIsProcessing(false);
        return;
    }
    if (isSignUp && (!name || !phone)) {
        setError('Please fill in all registration fields.');
        setIsProcessing(false);
        return;
    }

    try {
        if (isSignUp) {
            // --- REGISTRATION FLOW ---
            
            // Add to Unified Database
            addUser({
                name: name,
                email: email,
                phone: phone,
                role: 'CUSTOMER',
                password: password // Sent for hashing
            });

            // Simulate UX Delay
            setTimeout(() => {
                setIsProcessing(false);
                setIsSignUp(false); // Switch to Login Tab
                
                // UX OPTIMIZATION: Keep email filled, clear password
                setSuccessMessage(`Welcome, ${name.split(' ')[0]}! Please verify your password to sign in.`);
                setPassword(''); 
            }, 800);

        } else {
            // --- LOGIN FLOW ---
            const user = await login(email, password); 
            
            if (onLoginSuccess) onLoginSuccess(user.role);
            
            setIsProcessing(false);
            // Full Reset
            setEmail('');
            setPassword('');
            setName('');
            setPhone('');
            setSuccessMessage('');
            onClose();
        }
    } catch (err: any) {
        setError(err.message || 'Authentication failed.');
        setIsProcessing(false);
    }
  };

  const toggleMode = () => {
      setIsSignUp(!isSignUp);
      setError('');
      setSuccessMessage('');
      // When switching, keep email if user typed it, but clear others
      setPassword('');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]" onClick={onClose}></div>
      
      <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-[450px] rounded-sm shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out]">
        
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20">
            <X size={20} />
        </button>

        <div className="p-8 sm:p-12">
            <div className="text-center mb-8">
                <span className="text-luxury-gold text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">
                    {isSignUp ? 'Registration' : 'Secure Access'}
                </span>
                <h2 className="text-3xl font-['Playfair_Display'] text-white">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-500 text-xs mt-2">
                    {isSignUp ? 'Join the Dat Valoir membership.' : 'Enter your credentials to manage your bookings.'}
                </p>
            </div>
            
            {/* Success Notification */}
            {successMessage && !isSignUp && (
                <div className="mb-6 p-3 bg-green-900/20 border border-green-500/30 rounded flex items-center gap-3 text-green-400 text-xs animate-[fadeIn_0.5s]">
                    <CheckCircle size={16} />
                    <span>{successMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                    <div className="space-y-4 animate-[slideDown_0.3s_ease-out]">
                        <div className="group relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                className="w-full bg-[#111] border border-white/10 rounded-sm py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="group relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Phone Number" 
                                className="w-full bg-[#111] border border-white/10 rounded-sm py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all text-sm"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="group relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full bg-[#111] border border-white/10 rounded-sm py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="group relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                    <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Password" 
                        className="w-full bg-[#111] border border-white/10 rounded-sm py-4 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs justify-center p-2 bg-red-900/10 border border-red-900/30 rounded animate-[shake_0.4s_ease-in-out]">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-yellow-700 to-yellow-600 text-white font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                    {isProcessing ? (
                        <span className="animate-pulse">Processing...</span>
                    ) : (
                        <>
                            {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-500 text-xs">
                    {isSignUp ? "Already have an account?" : "New to Dat Valoir?"}
                    <button 
                        onClick={toggleMode}
                        className="text-white ml-2 underline decoration-yellow-500/50 hover:text-yellow-500 hover:decoration-yellow-500 transition-all font-bold"
                    >
                        {isSignUp ? "Sign In" : "Create Account"}
                    </button>
                </p>
            </div>
        </div>
        
        {/* Footer info */}
        <div className="bg-[#050505] p-4 text-center border-t border-white/5">
             <p className="text-[9px] text-gray-600 uppercase tracking-widest">
                 Authorized Access Only | Dat Valoir Security
             </p>
        </div>

      </div>
    </div>
  );
};

export default LoginModal;
