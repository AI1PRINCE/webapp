export type Bindings = {
  DB: D1Database;
};

export interface Drop {
  id: number;
  name: string;
  slug: string;
  description?: string;
  status: 'coming_soon' | 'current' | 'past';
  launch_date?: string;
  end_date?: string;
  hero_image?: string;
  banner_image?: string;
  story_content?: string;
  teaser_content?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  drop_id?: number;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  base_price: number;
  currency: string;
  size_guide?: string;
  model_info?: string;
  care_instructions?: string;
  material?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVideo {
  id: number;
  product_id: number;
  video_url: string;
  thumbnail_url?: string;
  display_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  size?: string;
  color?: string;
  color_hex?: string;
  price_adjustment: number;
  stock_quantity: number;
  low_stock_threshold: number;
  weight_grams?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: number;
  code: string;
  name: string;
  currency: string;
  tax_rate: number;
  duties_included: boolean;
  free_shipping_threshold?: number;
  is_active: boolean;
  created_at: string;
}

export interface ShippingMethod {
  id: number;
  region_id: number;
  name: string;
  description?: string;
  base_cost: number;
  estimated_days_min?: number;
  estimated_days_max?: number;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  password_hash?: string;
  is_subscribed: boolean;
  preferred_currency: string;
  preferred_region_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id?: number;
  customer_email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_intent_id?: string;
  shipping_method_id?: number;
  shipping_address_json: string;
  billing_address_json?: string;
  tracking_number?: string;
  tracking_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface CartItem {
  variant_id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  product_slug: string;
  size?: string;
  color?: string;
  color_hex?: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
}

export interface Address {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  country_code: string;
}
