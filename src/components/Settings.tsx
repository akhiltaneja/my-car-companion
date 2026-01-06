import { useState, useRef } from 'react';
import { Camera, Download, FileJson, FileSpreadsheet } from 'lucide-react';
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

export function Settings({ profile, expenseCount, onUpdateProfile, onExportJSON, onExportCSV }: SettingsProps) {
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
    <div className="min-h-screen bg-pink pb-24">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your data</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Profile Section */}
        <div className="card-brutal p-5 animate-slide-up">
          <h3 className="font-bold mb-4">Your Profile</h3>
          
          {/* Profile Picture */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full border-3 border-foreground overflow-hidden
                       bg-stat-lavender hover:opacity-80 transition-opacity"
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Camera className="w-8 h-8 text-muted-foreground" />
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
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSave}
                placeholder="Enter your name"
                className="input-brutal"
              />
            </div>

            {/* Car Brand */}
            <div>
              <label className="block text-sm font-bold mb-2">Car Brand</label>
              <select
                value={carBrand}
                onChange={(e) => {
                  setCarBrand(e.target.value);
                  onUpdateProfile({ carBrand: e.target.value });
                }}
                className="input-brutal"
              >
                <option value="">Select brand</option>
                {CAR_BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Car Name */}
            <div>
              <label className="block text-sm font-bold mb-2">Car Model/Name</label>
              <input
                type="text"
                value={carName}
                onChange={(e) => setCarName(e.target.value)}
                onBlur={handleSave}
                placeholder="e.g., Swift Dzire"
                className="input-brutal"
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-bold mb-2">Purchase Date</label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={purchaseMonth}
                  onChange={(e) => {
                    setPurchaseMonth(parseInt(e.target.value));
                    onUpdateProfile({ purchaseMonth: parseInt(e.target.value) });
                  }}
                  className="input-brutal"
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
                  className="input-brutal"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Your Data */}
        <div className="card-brutal p-5 animate-slide-up">
          <h3 className="font-bold mb-4">Your Data</h3>
          <div className="stat-card bg-stat-yellow text-center py-6">
            <p className="text-4xl font-black">{expenseCount}</p>
            <p className="text-sm font-medium text-muted-foreground">entries stored locally</p>
          </div>
        </div>

        {/* Export Data */}
        <div className="card-brutal p-5 animate-slide-up">
          <h3 className="font-bold mb-2">Export Data</h3>
          <p className="text-sm text-muted-foreground mb-4">Download your data for backup</p>
          
          <div className="space-y-3">
            <button
              onClick={onExportJSON}
              className="w-full flex items-center justify-between p-4 rounded-xl 
                       border-2 border-foreground bg-stat-lavender
                       hover:shadow-brutal-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <FileJson className="w-5 h-5" />
                <span className="font-bold">Export as JSON</span>
              </div>
              <span className="text-sm font-medium px-3 py-1 bg-card rounded-full border border-foreground">
                Full Backup
              </span>
            </button>

            <button
              onClick={onExportCSV}
              className="w-full flex items-center justify-between p-4 rounded-xl 
                       border-2 border-foreground bg-stat-mint
                       hover:shadow-brutal-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5" />
                <span className="font-bold">Export as CSV</span>
              </div>
              <span className="text-sm font-medium px-3 py-1 bg-card rounded-full border border-foreground">
                Spreadsheet
              </span>
            </button>
          </div>
        </div>

        {/* About */}
        <div className="card-brutal p-5 animate-slide-up">
          <h3 className="font-bold mb-4">About</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">App</span>
              <span className="font-bold">Mileage Mate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="px-2 py-0.5 bg-stat-peach rounded-full font-bold border border-foreground">
                v1.0.0
              </span>
            </div>
            <div className="pt-3 border-t border-foreground/10">
              <p className="text-muted-foreground">
                A simple fuel tracking app for your vehicle.
                Data is stored locally and works offline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
