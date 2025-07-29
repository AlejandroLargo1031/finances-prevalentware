export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
}

export interface Movement {
  id: string;
  amount: number;
  concept: string;
  date: Date;
  type: 'INCOME' | 'EXPENSE';
  userId: string;
  user?: User;
  createdAt: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  phone: string | null;
};


export interface ChartData {
  month: string;
  income: number;
  expense: number;
}

export interface Report {
  balance: number;
  chartData: ChartData[];
  totalMovements: number;
  recentMovements: Movement[];
} 