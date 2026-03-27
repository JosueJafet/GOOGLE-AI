import React, { useState } from 'react';
import { User, Camera, Moon, Sun, Monitor, Check, Loader2 } from 'lucide-react';
import { auth, updateProfile } from '../firebase';
import { Theme } from '../types';
import { cn } from '../lib/utils';

interface SettingsProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onProfileUpdate: () => void;
}

export default function Settings({ theme, onThemeChange, onProfileUpdate }: SettingsProps) {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    setMessage(null);

    try {
      await updateProfile(user, {
        displayName,
        photoURL
      });
      onProfileUpdate();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12">
      <header>
        <h2 className="text-3xl md:text-5xl font-light tracking-tight">Settings</h2>
        <p className="text-text-dim text-sm mt-2">Personalize your Zenith Flow experience.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Profile Section */}
        <section className="space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-text-main/5 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-text-main/60" />
            </div>
            <h3 className="text-xl font-light">Profile</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex flex-col items-center space-y-4 p-8 bg-text-main/5 border border-border-main rounded-[40px]">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border-main bg-text-main/5">
                  {photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-text-main/20" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-text-dim font-bold">Profile Picture</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-text-dim font-bold px-1">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-text-main/5 border border-border-main rounded-2xl px-6 py-4 focus:outline-none focus:border-text-main/20 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-text-dim font-bold px-1">Photo URL</label>
                <input 
                  type="url" 
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-text-main/5 border border-border-main rounded-2xl px-6 py-4 focus:outline-none focus:border-text-main/20 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isUpdating}
              className="w-full bg-text-main text-app-bg py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              <span>Save Profile</span>
            </button>

            {message && (
              <p className={cn(
                "text-center text-sm font-medium",
                message.type === 'success' ? "text-emerald-400" : "text-red-400"
              )}>
                {message.text}
              </p>
            )}
          </form>
        </section>

        {/* Appearance Section */}
        <section className="space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-text-main/5 rounded-2xl flex items-center justify-center">
              <Sun className="w-6 h-6 text-text-main/60" />
            </div>
            <h3 className="text-xl font-light">Appearance</h3>
          </div>

          <div className="space-y-4">
            <ThemeOption 
              active={theme === 'dark'} 
              onClick={() => onThemeChange('dark')}
              icon={<Moon className="w-5 h-5" />}
              label="Dark Mode"
              description="Deep blacks and high contrast for focus."
            />
            <ThemeOption 
              active={theme === 'light'} 
              onClick={() => onThemeChange('light')}
              icon={<Sun className="w-5 h-5" />}
              label="Light Mode"
              description="Clean, bright interface for clarity."
            />
            <ThemeOption 
              active={theme === 'system'} 
              onClick={() => onThemeChange('system')}
              icon={<Monitor className="w-5 h-5" />}
              label="System Default"
              description="Matches your device's preferences."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ThemeOption({ active, onClick, icon, label, description }: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  label: string,
  description: string
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-6 p-6 rounded-[32px] border transition-all text-left",
        active 
          ? "bg-text-main text-app-bg border-text-main shadow-xl shadow-text-main/5" 
          : "bg-text-main/5 border-border-main text-text-main hover:border-text-main/10"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center",
        active ? "bg-app-bg/5" : "bg-text-main/5"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className={cn("text-xs mt-0.5", active ? "text-app-bg/60" : "text-text-dim")}>{description}</p>
      </div>
      {active && <Check className="w-5 h-5" />}
    </button>
  );
}
