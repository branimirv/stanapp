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
          usage_status: 'rented' | 'personal_use' | 'vacant' | 'in_renovation';
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
          usage_status?: 'rented' | 'personal_use' | 'vacant' | 'in_renovation';
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
          usage_status?: 'rented' | 'personal_use' | 'vacant' | 'in_renovation';
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
          user_id: string | null;
          key: string;
          name: string | null;
          icon: string;
          color: string;
          type: 'regular' | 'irregular';
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          key: string;
          name?: string | null;
          icon: string;
          color: string;
          type?: 'regular' | 'irregular';
        };
        Update: {
          id?: string;
          user_id?: string | null;
          key?: string;
          name?: string | null;
          icon?: string;
          color?: string;
          type?: 'regular' | 'irregular';
        };
        Relationships: [
          {
            foreignKeyName: 'expense_categories_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
      property_members: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          role: 'owner' | 'manager' | 'tenant';
          status: 'active' | 'revoked';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          role: 'owner' | 'manager' | 'tenant';
          status?: 'active' | 'revoked';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          user_id?: string;
          role?: 'owner' | 'manager' | 'tenant';
          status?: 'active' | 'revoked';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'property_members_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'property_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      property_invites: {
        Row: {
          id: string;
          batch_id: string;
          property_id: string;
          email: string;
          role: 'owner' | 'manager' | 'tenant';
          invited_by: string;
          token: string;
          status: 'pending' | 'accepted' | 'revoked' | 'expired';
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id?: string;
          property_id: string;
          email: string;
          role: 'owner' | 'manager' | 'tenant';
          invited_by: string;
          token?: string;
          status?: 'pending' | 'accepted' | 'revoked' | 'expired';
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          property_id?: string;
          email?: string;
          role?: 'owner' | 'manager' | 'tenant';
          invited_by?: string;
          token?: string;
          status?: 'pending' | 'accepted' | 'revoked' | 'expired';
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'property_invites_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'property_invites_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      property_status_history: {
        Row: {
          id: string;
          property_id: string;
          status: 'rented' | 'personal_use' | 'vacant' | 'in_renovation';
          started_at: string;
          ended_at: string | null;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          status: 'rented' | 'personal_use' | 'vacant' | 'in_renovation';
          started_at?: string;
          ended_at?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          status?: 'rented' | 'personal_use' | 'vacant' | 'in_renovation';
          started_at?: string;
          ended_at?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'property_status_history_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'property_status_history_changed_by_fkey';
            columns: ['changed_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_property_member: {
        Args: {
          p_property_id: string;
          p_roles?: string[] | null;
        };
        Returns: boolean;
      };
      is_property_owner: {
        Args: {
          p_property_id: string;
        };
        Returns: boolean;
      };
      accept_pending_invites_for_user: {
        Args: Record<string, never>;
        Returns: number;
      };
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
