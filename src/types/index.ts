export type ExpenseType = 'fuel' | 'insurance' | 'service' | 'toll' | 'challan';

export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid';

export type PetrolPump = 'indian_oil' | 'hp' | 'bharat_petroleum' | 'reliance' | 'shell' | 'other';

export interface BaseExpense {
  id: string;
  user_id: string;
  type: ExpenseType;
  date: string;
  odometer: number;
  total_cost: number;
  notes?: string;
  created_at: string;
  vehicle_id?: string;
}

export interface FuelExpense extends BaseExpense {
  type: 'fuel';
  price_per_liter: number;
  liters: number;
  petrol_pump?: PetrolPump;
}

export interface InsuranceExpense extends BaseExpense {
  type: 'insurance';
  provider_name: string;
  start_date: string;
}

export interface TollExpense extends BaseExpense {
  type: 'toll';
  location: string;
}

export interface ServiceExpense extends BaseExpense {
  type: 'service';
  description: string;
}

export interface ChallanExpense extends BaseExpense {
  type: 'challan';
  description: string;
}

export type Expense = FuelExpense | InsuranceExpense | TollExpense | ServiceExpense | ChallanExpense;

export interface Vehicle {
  id: string;
  user_id: string;
  manufacturer: string;
  model: string;
  variant?: string;
  fuel_type: FuelType;
  engine_number?: string;
  chassis_number?: string;
  cubic_capacity?: number;
  number_of_cylinders?: number;
  purchase_month?: number;
  purchase_year?: number;
  on_road_price: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_picture_url?: string;
  car_brand: string;
  car_name: string;
  purchase_month: number;
  purchase_year: number;
}

export const CAR_BRANDS = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Mahindra',
  'Kia',
  'Toyota',
  'Honda',
  'Volkswagen',
  'Skoda',
  'MG',
  'Renault',
  'Nissan',
  'Ford',
  'Jeep',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Volvo',
  'Lexus',
  'Porsche',
  'Land Rover',
  'Jaguar',
  'Mini',
  'Citroen',
  'Isuzu',
  'Force',
  'Other'
];

export const INSURANCE_PROVIDERS = [
  'ICICI Lombard',
  'HDFC Ergo',
  'Bajaj Allianz',
  'New India Assurance',
  'United India Insurance',
  'National Insurance',
  'Oriental Insurance',
  'Tata AIG',
  'SBI General',
  'Reliance General',
  'Bharti AXA',
  'Cholamandalam MS',
  'IFFCO Tokio',
  'Royal Sundaram',
  'Kotak Mahindra',
  'Liberty General',
  'Magma HDI',
  'Shriram General',
  'Universal Sompo',
  'Acko',
  'Digit Insurance',
  'Other'
];

export const PETROL_PUMPS: { value: PetrolPump; label: string }[] = [
  { value: 'indian_oil', label: 'Indian Oil' },
  { value: 'hp', label: 'HP' },
  { value: 'bharat_petroleum', label: 'Bharat Petroleum' },
  { value: 'reliance', label: 'Reliance Petroleum' },
  { value: 'shell', label: 'Shell' },
  { value: 'other', label: 'Other' },
];

export const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const EXPENSE_COLORS: Record<ExpenseType, string> = {
  fuel: 'bg-fuel',
  insurance: 'bg-insurance',
  service: 'bg-service',
  toll: 'bg-toll',
  challan: 'bg-challan',
};

export const EXPENSE_LABELS: Record<ExpenseType, string> = {
  fuel: 'Fuel',
  insurance: 'Insurance',
  service: 'Service',
  toll: 'Toll',
  challan: 'Challan',
};
