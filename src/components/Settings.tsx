import { useState, useRef } from 'react';
import { Camera, User, Car, CalendarDays } from 'lucide-react';
import { UserProfile, CAR_BRANDS } from '@/types';

interface SettingsProps {
  profile: UserProfile;
  expenseCount: number;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export function Settings({ profile, expenseCount, onUpdateProfile }: SettingsProps) {
  const [name, setName] = useState(profile.name);
  const [carBrand, setCarBrand] = useState(profile.carBrand);
  const [carName, setCarName] = useState(profile.carName);
  const [purchaseMonth, setPurchaseMonth] = useState(profile.purchaseMonth);
  const [purchaseYear, setPurchaseYear] = useState(profile.purchaseYear);
  const [profilePic, setProfilePic] = useState(profile.profilePicture);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePic(base64);
        onUpdateProfile({ profilePicture: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateProfile({
      name,
      carBrand,
      carName,
      purchaseMonth,
      purchaseYear,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-24">
      <div className="pt-10 pb-6 px-5">
        <h1 className="text-3xl font-black text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Profile Picture Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
          <div className="flex flex-col items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-amber-200 
                       bg-gradient-to-br from-amber-100 to-orange-100 hover:border-amber-300 transition-colors"
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Camera className="w-10 h-10 text-amber-400" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />
            </button>
            <p className="text-xs text-slate-400 mt-3">Tap to change photo</p>
          </div>
        </div>

        {/* User Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800">Personal Info</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSave}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 
                         focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300
                         text-sm font-medium placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Car Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-bold text-slate-800">Vehicle Info</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Car Brand</label>
              <select
                value={carBrand}
                onChange={(e) => {
                  setCarBrand(e.target.value);
                  onUpdateProfile({ carBrand: e.target.value });
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 
                         focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300
                         text-sm font-medium"
              >
                <option value="">Select brand</option>
                {CAR_BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Car Model</label>
              <input
                type="text"
                value={carName}
                onChange={(e) => setCarName(e.target.value)}
                onBlur={handleSave}
                placeholder="e.g., Swift Dzire"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 
                         focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300
                         text-sm font-medium placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Purchase Date */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-800">Purchase Date</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <select
              value={purchaseMonth}
              onChange={(e) => {
                setPurchaseMonth(parseInt(e.target.value));
                onUpdateProfile({ purchaseMonth: parseInt(e.target.value) });
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 
                       focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300
                       text-sm font-medium"
            >
              {months.map((month, i) => (
                <option key={month} value={i + 1}>{month}</option>
              ))}
            </select>
            <select
              value={purchaseYear}
              onChange={(e) => {
                setPurchaseYear(parseInt(e.target.value));
                onUpdateProfile({ purchaseYear: parseInt(e.target.value) });
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 
                       focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300
                       text-sm font-medium"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl p-5 text-white">
          <p className="text-sm font-medium opacity-90">Total Entries</p>
          <p className="text-4xl font-black mt-1">{expenseCount}</p>
          <p className="text-xs opacity-75 mt-1">Stored locally on your device</p>
        </div>
      </div>
    </div>
  );
}
