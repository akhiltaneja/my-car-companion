import { useState } from 'react';
import { Camera, User, Car, CalendarDays, Mail, LogOut, Loader2 } from 'lucide-react';
import { UserProfile, CAR_BRANDS } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface SettingsProps {
  profile: UserProfile | null;
  expenseCount: number;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export function Settings({ profile, expenseCount, onUpdateProfile }: SettingsProps) {
  const { signOut } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [carBrand, setCarBrand] = useState(profile?.car_brand || '');
  const [carName, setCarName] = useState(profile?.car_name || '');
  const [purchaseMonth, setPurchaseMonth] = useState(profile?.purchase_month || new Date().getMonth() + 1);
  const [purchaseYear, setPurchaseYear] = useState(profile?.purchase_year || new Date().getFullYear());
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

  const handleSave = () => {
    onUpdateProfile({
      name,
      car_brand: carBrand,
      car_name: carName,
      purchase_month: purchaseMonth,
      purchase_year: purchaseYear,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange/30 to-background pb-24">
      <div className="pt-10 pb-6 px-5">
        <h1 className="text-3xl font-black text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Profile Picture Card */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border-2 border-border">
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-orange bg-gradient-to-br from-orange/60 to-amber-100">
              {profile?.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Camera className="w-10 h-10 text-foreground/50" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">{profile?.email}</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border-2 border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-foreground" />
            </div>
            <h3 className="font-bold text-foreground">Personal Info</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSave}
                placeholder="Enter your name"
                className="input-brutal text-sm h-12"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="input-brutal text-sm h-12 pl-10 bg-muted cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border-2 border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-foreground" />
            </div>
            <h3 className="font-bold text-foreground">Vehicle Info</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Car Brand</label>
              <select
                value={carBrand}
                onChange={(e) => {
                  setCarBrand(e.target.value);
                  onUpdateProfile({ car_brand: e.target.value });
                }}
                className="input-brutal text-sm h-12"
              >
                <option value="">Select brand</option>
                {CAR_BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Car Model</label>
              <input
                type="text"
                value={carName}
                onChange={(e) => setCarName(e.target.value)}
                onBlur={handleSave}
                placeholder="e.g., Swift Dzire"
                className="input-brutal text-sm h-12"
              />
            </div>

            {/* Purchase Date moved under Vehicle Info */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Purchase Date</label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={purchaseMonth}
                  onChange={(e) => {
                    setPurchaseMonth(parseInt(e.target.value));
                    onUpdateProfile({ purchase_month: parseInt(e.target.value) });
                  }}
                  className="input-brutal text-sm h-12"
                >
                  {months.map((month, i) => (
                    <option key={month} value={i + 1}>{month}</option>
                  ))}
                </select>
                <select
                  value={purchaseYear}
                  onChange={(e) => {
                    setPurchaseYear(parseInt(e.target.value));
                    onUpdateProfile({ purchase_year: parseInt(e.target.value) });
                  }}
                  className="input-brutal text-sm h-12"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-orange to-amber-400 rounded-2xl p-5 border-2 border-foreground shadow-brutal">
          <p className="text-sm font-medium text-foreground/80">Total Entries</p>
          <p className="text-4xl font-black text-foreground mt-1">{expenseCount}</p>
          <p className="text-xs text-foreground/60 mt-1">Synced to your account</p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-card rounded-2xl p-4 shadow-sm border-2 border-border flex items-center justify-center gap-2 font-bold text-rose-500 hover:bg-rose-50 transition-colors"
        >
          {isLoggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              Sign Out
            </>
          )}
        </button>
      </div>
    </div>
  );
}
