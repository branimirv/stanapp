export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          default_currency: string;
          language: 'en' | 'hr';
          theme: 'light' | 'dark' | 'system';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          default_currency?: string;
          language?: 'en' | 'hr';
          theme?: 'light' | 'dark' | 'system';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          default_currency?: string;
          language?: 'en' | 'hr';
          theme?: 'light' | 'dark' | 'system';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      properties: {
        Row: {
          id: string;
          user_id: string;
          parent_property_id: string | null;
          type: 'apartment' | 'house' | 'garage' | 'other';
          usage_status: 'rented' | 'personal_use' | 'vacant';
          name: string;
          address: string;
          floor: number | null;
          area_sqm: number | null;
          rent_amount: number;
          currency: string | null;
          notes: string | null;
          photo_url: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          parent_property_id?: string | null;
          type?: 'apartment' | 'house' | 'garage' | 'other';
          usage_status?: 'rented' | 'personal_use' | 'vacant';
          name: string;
          address: string;
          floor?: number | null;
          area_sqm?: number | null;
          rent_amount?: number;
          currency?: string | null;
          notes?: string | null;
          photo_url?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          parent_property_id?: string | null;
          type?: 'apartment' | 'house' | 'garage' | 'other';
          usage_status?: 'rented' | 'personal_use' | 'vacant';
          name?: string;
          address?: string;
          floor?: number | null;
          area_sqm?: number | null;
          rent_amount?: number;
          currency?: string | null;
          notes?: string | null;
          photo_url?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'properties_parent_property_id_fkey';
            columns: ['parent_property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'properties_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      tenants: {
        Row: {
          id: string;
          property_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          contract_start: string;
          contract_end: string | null;
          deposit_amount: number;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          contract_start: string;
          contract_end?: string | null;
          deposit_amount?: number;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          contract_start?: string;
          contract_end?: string | null;
          deposit_amount?: number;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tenants_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      expense_categories: {
        Row: {
          id: string;
          key: string;
          icon: string;
          color: string;
        };
        Insert: {
          id?: string;
          key: string;
          icon: string;
          color: string;
        };
        Update: {
          id?: string;
          key?: string;
          icon?: string;
          color?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          property_id: string;
          category_id: string;
          amount: number;
          currency: string | null;
          is_recurring: boolean;
          billing_date: string;
          due_date: string | null;
          paid_at: string | null;
          receipt_photo_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          category_id: string;
          amount: number;
          currency?: string | null;
          is_recurring?: boolean;
          billing_date: string;
          due_date?: string | null;
          paid_at?: string | null;
          receipt_photo_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          category_id?: string;
          amount?: number;
          currency?: string | null;
          is_recurring?: boolean;
          billing_date?: string;
          due_date?: string | null;
          paid_at?: string | null;
          receipt_photo_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'expenses_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'expense_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expenses_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      rent_payments: {
        Row: {
          id: string;
          property_id: string;
          tenant_id: string;
          amount: number;
          currency: string | null;
          payment_date: string | null;
          period_month: number;
          period_year: number;
          status: 'pending' | 'paid' | 'late' | 'partial';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          tenant_id: string;
          amount: number;
          currency?: string | null;
          payment_date?: string | null;
          period_month: number;
          period_year: number;
          status?: 'pending' | 'paid' | 'late' | 'partial';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          tenant_id?: string;
          amount?: number;
          currency?: string | null;
          payment_date?: string | null;
          period_month?: number;
          period_year?: number;
          status?: 'pending' | 'paid' | 'late' | 'partial';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rent_payments_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'rent_payments_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database['public'];
type PublicTables = PublicSchema['Tables'];

export type Tables<T extends keyof PublicTables> = PublicTables[T]['Row'];
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]['Insert'];
export type TablesUpdate<T extends keyof PublicTables> = PublicTables[T]['Update'];
