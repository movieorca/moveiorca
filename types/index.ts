export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'admin';
  is_verified: boolean;
  created_at: string;
}

export interface Plan {
  id: number;
  name: string;
  category: 'VPS' | 'RDP' | 'Shared';
  description: string;
  features: string[];
  monthly_price: number;
  ram: string;
  cpu: string;
  storage: string;
  bandwidth: string;
  is_active: boolean;
  sort_order: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  payment_method: 'easypaisa' | 'jazzcash' | 'manual';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  plan_id: number;
  plan_name: string;
  plan_category: string;
  quantity: number;
  price: number;
}

export interface Subscription {
  id: number;
  user_id: number;
  order_id: number;
  plan_id: number;
  plan_name?: string;
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  start_date: string;
  expiry_date: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface RDPCredential {
  id: number;
  subscription_id: number;
  server_ip: string;
  server_port: number;
  username: string;
  password: string;
  additional_info?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Payment {
  id: number;
  order_id: number;
  user_id: number;
  amount: number;
  payment_method: 'easypaisa' | 'jazzcash' | 'manual';
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  plan_id: number;
  quantity: number;
  plan?: Plan;
}

export interface PaymentGatewaySettings {
  id: number;
  gateway: 'easypaisa' | 'jazzcash';
  merchant_id?: string;
  api_key?: string;
  secret_key?: string;
  is_active: boolean;
  is_test_mode: boolean;
  configuration?: any;
}

export interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  activeSubscriptions: number;
  totalRevenue: number;
  recentOrders: Order[];
  recentPayments: Payment[];
}
