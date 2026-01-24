import { useState } from 'react';
import { X, Save, Car } from 'lucide-react';
import { Vehicle, FuelType, FUEL_TYPES, CAR_BRANDS } from '@/types';

interface EditVehicleFormProps {
  vehicle: Vehicle;
  onUpdate: (id: string, updates: Partial<Vehicle>) => Promise<{ error: Error | null }>;
  onClose: () => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export function EditVehicleForm({ vehicle, onUpdate, onClose }: EditVehicleFormProps) {
  const [manufacturer, setManufacturer] = useState(vehicle.manufacturer);
  const [model, setModel] = useState(vehicle.model);
  const [variant, setVariant] = useState(vehicle.variant || '');
  const [fuelType, setFuelType] = useState<FuelType>(vehicle.fuel_type);
  const [engineNumber, setEngineNumber] = useState(vehicle.engine_number || '');
  const [chassisNumber, setChassisNumber] = useState(vehicle.chassis_number || '');
  const [cubicCapacity, setCubicCapacity] = useState(vehicle.cubic_capacity?.toString() || '');
  const [numberOfCylinders, setNumberOfCylinders] = useState(vehicle.number_of_cylinders?.toString() || '');
  const [purchaseMonth, setPurchaseMonth] = useState(vehicle.purchase_month || new Date().getMonth() + 1);
  const [purchaseYear, setPurchaseYear] = useState(vehicle.purchase_year || currentYear);
  const [onRoadPrice, setOnRoadPrice] = useState(vehicle.on_road_price?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manufacturer || !model) return;

    setIsSubmitting(true);
    const { error } = await onUpdate(vehicle.id, {
      manufacturer,
      model,
      variant: variant || undefined,
      fuel_type: fuelType,
      engine_number: engineNumber || undefined,
      chassis_number: chassisNumber || undefined,
      cubic_capacity: cubicCapacity ? parseInt(cubicCapacity) : undefined,
      number_of_cylinders: numberOfCylinders ? parseInt(numberOfCylinders) : undefined,
      purchase_month: purchaseMonth,
      purchase_year: purchaseYear,
      on_road_price: parseFloat(onRoadPrice) || 0,
    });

    setIsSubmitting(false);
    if (!error) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-card border-b-2 border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-lavender rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black">Edit Vehicle</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Manufacturer & Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Manufacturer *</label>
              <select
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="input-brutal text-sm h-12"
                required
              >
                <option value="">Select</option>
                {CAR_BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Model *</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., Swift"
                className="input-brutal text-sm h-12"
                required
              />
            </div>
          </div>

          {/* Variant & Fuel Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Variant</label>
              <input
                type="text"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                placeholder="e.g., ZXi+"
                className="input-brutal text-sm h-12"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="input-brutal text-sm h-12"
              >
                {FUEL_TYPES.map(ft => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Engine & Chassis Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Engine Number</label>
              <input
                type="text"
                value={engineNumber}
                onChange={(e) => setEngineNumber(e.target.value)}
                placeholder="Engine number"
                className="input-brutal text-sm h-12"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Chassis Number</label>
              <input
                type="text"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                placeholder="Chassis number"
                className="input-brutal text-sm h-12"
              />
            </div>
          </div>

          {/* CC & Cylinders */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Cubic Capacity (cc)</label>
              <input
                type="number"
                value={cubicCapacity}
                onChange={(e) => setCubicCapacity(e.target.value)}
                placeholder="e.g., 1197"
                className="input-brutal text-sm h-12"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Cylinders</label>
              <input
                type="number"
                value={numberOfCylinders}
                onChange={(e) => setNumberOfCylinders(e.target.value)}
                placeholder="e.g., 4"
                className="input-brutal text-sm h-12"
              />
            </div>
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Purchase Date</label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={purchaseMonth}
                onChange={(e) => setPurchaseMonth(parseInt(e.target.value))}
                className="input-brutal text-sm h-12"
              >
                {months.map((month, i) => (
                  <option key={month} value={i + 1}>{month}</option>
                ))}
              </select>
              <select
                value={purchaseYear}
                onChange={(e) => setPurchaseYear(parseInt(e.target.value))}
                className="input-brutal text-sm h-12"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* On Road Price */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-muted-foreground">On-Road Price (₹)</label>
            <input
              type="number"
              value={onRoadPrice}
              onChange={(e) => setOnRoadPrice(e.target.value)}
              placeholder="Total price including registration, insurance"
              className="input-brutal text-sm h-12"
            />
            <p className="text-xs text-muted-foreground mt-1">Used to calculate total ownership cost per km</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !manufacturer || !model}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : 'Update Vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
}
