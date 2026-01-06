export type ExpenseType = 'fuel' | 'insurance' | 'service' | 'toll' | 'challan';

export interface FuelEntry {
  id: string;
  type: 'fuel';
  date: string;
  odometer: number;
  pricePerLiter: number;
  liters: number;
  totalCost: number;
  notes?: string;
  createdAt: string;
}

export interface OtherExpense {
  id: string;
  type: Exclude<ExpenseType, 'fuel'>;
  date: string;
  odometer: number;
  totalCost: number;
  description: string;
  notes?: string;
  createdAt: string;
}

export type Expense = FuelEntry | OtherExpense;

export interface UserProfile {
  name: string;
  profilePicture?: string;
  carBrand: string;
  carName: string;
  purchaseMonth: number;
  purchaseYear: number;
}

export interface AppData {
  expenses: Expense[];
  profile: UserProfile;
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
