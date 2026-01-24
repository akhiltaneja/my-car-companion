import { useState } from 'react';
import { Camera, User, Car, Mail, LogOut, Loader2, Plus, Trash2, Star, Fuel, Pencil } from 'lucide-react';
import { UserProfile, Vehicle, FUEL_TYPES } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { AddVehicleForm } from './AddVehicleForm';
import { EditVehicleForm } from './EditVehicleForm';

interface SettingsProps {
  profile: UserProfile | null;
  expenseCount: number;
  vehicles: Vehicle[];
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  onUpdateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<{ error: Error | null }>;
  onDeleteVehicle: (id: string) => Promise<{ error: Error | null }>;
  onSetDefaultVehicle: (id: string) => Promise<{ error: Error | null }>;
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function Settings({ 
  profile, 
  expenseCount, 
  vehicles,
  onUpdateProfile, 
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onSetDefaultVehicle,
}: SettingsProps) {
  const { signOut } = useAuth();
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [name, setName] = useState(profile?.name || '');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

  const handleSaveName = () => {
    onUpdateProfile({ name });
  };

  const handleSetDefault = async (id: string) => {
    await onSetDefaultVehicle(id);
  };

  const getFuelLabel = (fuelType: string) => {
    return FUEL_TYPES.find(f => f.value === fuelType)?.label || fuelType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange/30 to-background pb-24">
      <div className="pt-10 pb-6 px-5">
        <h1 className="text-3xl font-black text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile & vehicles</p>
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
                onBlur={handleSaveName}
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

        {/* Vehicles Section */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border-2 border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center">
                <Car className="w-4 h-4 text-foreground" />
              </div>
              <h3 className="font-bold text-foreground">My Vehicles</h3>
            </div>
            <button
              onClick={() => setShowAddVehicle(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-mint rounded-xl border-2 border-foreground text-xs font-bold shadow-brutal-sm hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                <Car className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No vehicles added yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first vehicle to start tracking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div 
                  key={vehicle.id}
                  className={`relative rounded-xl border-2 p-4 ${
                    vehicle.is_default 
                      ? 'border-mint bg-gradient-to-br from-mint/30 to-emerald-50' 
                      : 'border-border bg-muted/50'
                  }`}
                >
                  {vehicle.is_default && (
                    <div className="absolute -top-2 -right-2 bg-mint rounded-full p-1 border-2 border-foreground">
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-black text-foreground">
                        {vehicle.manufacturer} {vehicle.model}
                      </h4>
                      {vehicle.variant && (
                        <p className="text-xs text-muted-foreground">{vehicle.variant}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs bg-card px-2 py-1 rounded-lg border">
                          <Fuel className="w-3 h-3" />
                          {getFuelLabel(vehicle.fuel_type)}
                        </span>
                        {vehicle.cubic_capacity && (
                          <span className="text-xs bg-card px-2 py-1 rounded-lg border">
                            {vehicle.cubic_capacity}cc
                          </span>
                        )}
                        {vehicle.purchase_year && (
                          <span className="text-xs bg-card px-2 py-1 rounded-lg border">
                            {months[((vehicle.purchase_month || 1) - 1)]} {vehicle.purchase_year}
                          </span>
                        )}
                      </div>
                      {Number(vehicle.on_road_price) > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          On-road: ₹{(Number(vehicle.on_road_price) / 100000).toFixed(2)}L
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {!vehicle.is_default && (
                        <button
                          onClick={() => handleSetDefault(vehicle.id)}
                          className="p-2 text-muted-foreground hover:text-mint hover:bg-mint/20 rounded-lg transition-colors"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingVehicle(vehicle)}
                        className="p-2 text-muted-foreground hover:text-lavender hover:bg-lavender/20 rounded-lg transition-colors"
                        title="Edit vehicle"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteVehicle(vehicle.id)}
                        className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <AddVehicleForm
          onAdd={onAddVehicle}
          onClose={() => setShowAddVehicle(false)}
        />
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <EditVehicleForm
          vehicle={editingVehicle}
          onUpdate={onUpdateVehicle}
          onClose={() => setEditingVehicle(null)}
        />
      )}
    </div>
  );
}
