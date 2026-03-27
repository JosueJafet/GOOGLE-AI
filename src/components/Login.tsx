import React from 'react';
import { Sparkles, LogIn, Github, Chrome } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, doc, setDoc, getDoc, db } from '../firebase';
import { motion } from 'motion/react';

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore, if not create
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: Date.now()
        });
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="h-screen w-full flex bg-app-bg overflow-hidden text-text-main">
      {/* Mobile Header */}
      <div className="lg:hidden absolute top-10 left-10 flex items-center space-x-4 z-20">
        <div className="w-10 h-10 bg-text-main rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-app-bg" />
        </div>
        <h1 className="text-2xl font-light tracking-tighter">Zenith Flow</h1>
      </div>

      {/* Left Side: Cinematic Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse delay-1000" />
        
        <div className="relative z-10 space-y-8 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-text-main rounded-2xl flex items-center justify-center shadow-2xl shadow-text-main/10">
              <Sparkles className="w-10 h-10 text-app-bg" />
            </div>
            <h1 className="text-7xl font-light tracking-tighter leading-none">
              Master Your <br />
              <span className="italic font-serif">Flow State.</span>
            </h1>
            <p className="text-xl text-text-dim font-light leading-relaxed">
              The high-potential operating system for deep work, energy alignment, and peak performance.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex items-center space-x-6 pt-10 border-t border-border-main"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-app-bg bg-text-main/10 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${i+10}/40/40`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <p className="text-sm text-text-dim font-medium tracking-wide">
              JOIN 10,000+ HIGH-PERFORMERS
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-sidebar-bg border-l border-border-main">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-2">
            <h2 className="text-4xl font-light tracking-tight">Get Started</h2>
            <p className="text-text-dim">Sign in to sync your flow across all devices.</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full group relative flex items-center justify-center space-x-4 bg-text-main text-app-bg py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Chrome className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            <button className="w-full flex items-center justify-center space-x-4 bg-text-main/5 border border-border-main text-text-main py-4 rounded-2xl font-bold transition-all hover:bg-text-main/10">
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-main"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-text-dim/50">
              <span className="bg-sidebar-bg px-4 italic">Or use magic link</span>
            </div>
          </div>

          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Email address"
              className="w-full bg-text-main/5 border border-border-main rounded-2xl px-6 py-4 text-text-main placeholder:text-text-dim/20 focus:border-text-main/30 transition-all outline-none"
            />
            <button className="w-full py-4 rounded-2xl font-bold text-text-dim/40 border border-border-main hover:border-text-main/20 transition-all">
              Send Magic Link
            </button>
          </div>

          <p className="text-center text-xs text-text-dim/50 leading-relaxed">
            By continuing, you agree to Zenith Flow's <br />
            <span className="underline cursor-pointer hover:text-text-main transition-colors">Terms of Service</span> and <span className="underline cursor-pointer hover:text-text-main transition-colors">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
