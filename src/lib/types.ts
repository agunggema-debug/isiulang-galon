// Shared types for the application

// Type alias for user roles (fixes SonarQube warning)
export type UserRole = "admin" | "wholesale" | "retail";

// Supabase Database Schema Types
export interface SupabaseDatabase {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          email: string;
          password?: string;
          name: string;
          role: UserRole;
          phone: string;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          password?: string;
          name: string;
          role?: UserRole;
          phone?: string;
          address?: string;
        };
        Update: {
          email?: string;
          password?: string;
          name?: string;
          role?: UserRole;
          phone?: string;
          address?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          icon: string;
        };
        Insert: {
          name: string;
          slug: string;
          icon?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          icon?: string;
        };
      };
      products: {
        Row: {
          id: number;
          name: string;
          category_id: number;
          retail_price: number;
          wholesale_price: number;
          stock: number;
          min_wholesale_qty: number;
          unit: string;
          status: string;
          image: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          category_id: number;
          retail_price: number;
          wholesale_price: number;
          stock?: number;
          min_wholesale_qty?: number;
          unit?: string;
          status?: string;
          image?: string;
          description?: string;
        };
        Update: {
          name?: string;
          category_id?: number;
          retail_price?: number;
          wholesale_price?: number;
          stock?: number;
          min_wholesale_qty?: number;
          unit?: string;
          status?: string;
          image?: string;
          description?: string;
        };
      };
      orders: {
        Row: {
          id: number;
          order_number: string;
          user_id: number;
          status: string;
          total_amount: number;
          payment_method: string;
          payment_status: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number;
          quantity: number;
          price: number;
          subtotal: number;
        };
      };
      refill_suppliers: {
        Row: {
          id: number;
          name: string;
          phone: string;
          address: string;
          contact_person: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      refill_schedules: {
        Row: {
          id: number;
          supplier_id: number;
          product_id: number;
          schedule_date: string;
          estimated_time: string;
          quantity: number;
          status: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
      };
      settings: {
        Row: {
          key: string;
          value: string;
        };
      };
    };
  };
}

// Legacy types kept for compatibility
export interface ProductRow {
  id: number;
  name: string;
  category_id: number;
  retail_price: number;
  wholesale_price: number;
  stock: number;
  min_wholesale_qty: number;
  unit: string;
  status: string;
  image: string;
  description: string;
  created_at: string;
  updated_at: string;
  category_name: string;
  category_slug: string;
  category_icon: string;
}

export interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  category: string;
  categorySlug: string;
  categoryIcon: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  minOrder: number;
  status: string;
  unit: string;
}

export interface OrderRow {
  id: number;
  order_number: string;
  user_id: number;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}