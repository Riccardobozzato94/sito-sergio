export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: number;
          name: string;
          phone: string | null;
          email: string | null;
          notes: string;
          loyalty_points: number;
          is_vip: boolean;
          total_orders: number;
          total_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          name: string;
          phone?: string | null;
          email?: string | null;
          notes?: string;
          loyalty_points?: number;
          is_vip?: boolean;
          total_orders?: number;
          total_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          phone?: string | null;
          email?: string | null;
          notes?: string;
          loyalty_points?: number;
          is_vip?: boolean;
          total_orders?: number;
          total_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: number;
          customer_id: number | null;
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          delivery_method: 'pickup' | 'courier' | 'reservation';
          subtotal: number;
          shipping: number;
          total: number;
          pickup_time: string | null;
          notes: string | null;
          whatsapp_sent: boolean;
          whatsapp_message_id: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: never;
          customer_id?: number | null;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          delivery_method: 'pickup' | 'courier' | 'reservation';
          subtotal: number;
          shipping?: number;
          total: number;
          pickup_time?: string | null;
          notes?: string | null;
          whatsapp_sent?: boolean;
          whatsapp_message_id?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Insert: {
          id?: never;
          order_id: number;
          product_id: number;
          quantity: number;
          unit_price: number;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      products: {
        Row: {
          id: number;
          name: string;
          slug: string;
          description: string;
          category: 'pane' | 'dolci' | 'specialita' | 'salato' | 'stagionale';
          price: number;
          unit: string;
          image_url: string | null;
          is_available: boolean;
          is_featured: boolean;
          allergens: string[];
          stock_weight_kg: number | null;
          low_stock_threshold_kg: number;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      inventory: {
        Row: {
          id: number;
          product_id: number;
          date: string;
          quantity_in_kg: number;
          quantity_sold_kg: number;
          wasted_kg: number;
          restocked_kg: number;
          notes: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['inventory']['Insert']>;
      };
      promotions: {
        Row: {
          id: number;
          title: string;
          description: string;
          discount_pct: number;
          valid_from: string;
          valid_to: string;
          is_active: boolean;
          product_ids: number[] | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['promotions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['promotions']['Insert']>;
      };
      analytics_daily: {
        Row: {
          date: string;
          total_orders: number;
          total_revenue: number;
          avg_order_value: number;
          new_customers: number;
          completed_orders: number;
          cancelled_orders: number;
        };
        Insert: Database['public']['Tables']['analytics_daily']['Row'];
        Update: Partial<Database['public']['Tables']['analytics_daily']['Row']>;
      };
      crm_users: {
        Row: {
          id: string;
          role: 'admin' | 'staff' | 'viewer';
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['crm_users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['crm_users']['Insert']>;
      };
    };
    Functions: {
      search_products: {
        Args: { p_query: string };
        Returns: {
          id: number;
          name: string;
          slug: string;
          description: string;
          category: string;
          price: number;
          image_url: string | null;
          is_available: boolean;
          similarity: number;
        }[];
      };
      search_customers: {
        Args: { p_query: string };
        Returns: {
          id: number;
          name: string;
          phone: string | null;
          email: string | null;
          loyalty_points: number;
          is_vip: boolean;
          total_orders: number;
          total_spent: number;
          similarity: number;
        }[];
      };
    };
  };
}
