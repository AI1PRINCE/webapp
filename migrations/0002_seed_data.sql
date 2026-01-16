-- Insert default regions
INSERT OR IGNORE INTO regions (code, name, currency, tax_rate, duties_included, free_shipping_threshold) VALUES
  ('US', 'United States', 'USD', 0.08, 1, 100.00),
  ('EU', 'European Union', 'EUR', 0.20, 1, 150.00),
  ('UK', 'United Kingdom', 'GBP', 0.20, 1, 120.00),
  ('CA', 'Canada', 'CAD', 0.13, 1, 150.00),
  ('AU', 'Australia', 'AUD', 0.10, 0, 200.00),
  ('JP', 'Japan', 'JPY', 0.10, 0, 15000.00),
  ('ROW', 'Rest of World', 'USD', 0.00, 0, 0.00);

-- Insert default shipping methods
-- US Shipping
INSERT OR IGNORE INTO shipping_methods (region_id, name, description, base_cost, estimated_days_min, estimated_days_max) VALUES
  (1, 'Standard Shipping', '5-7 business days', 8.00, 5, 7),
  (1, 'Express Shipping', '2-3 business days', 18.00, 2, 3),
  (1, 'Overnight Shipping', 'Next business day', 35.00, 1, 1);

-- EU Shipping
INSERT OR IGNORE INTO shipping_methods (region_id, name, description, base_cost, estimated_days_min, estimated_days_max) VALUES
  (2, 'Standard Shipping', '7-10 business days', 12.00, 7, 10),
  (2, 'Express Shipping', '3-5 business days', 25.00, 3, 5);

-- UK Shipping
INSERT OR IGNORE INTO shipping_methods (region_id, name, description, base_cost, estimated_days_min, estimated_days_max) VALUES
  (3, 'Standard Shipping', '5-7 business days', 10.00, 5, 7),
  (3, 'Express Shipping', '2-3 business days', 20.00, 2, 3);

-- CA Shipping
INSERT OR IGNORE INTO shipping_methods (region_id, name, description, base_cost, estimated_days_min, estimated_days_max) VALUES
  (4, 'Standard Shipping', '7-10 business days', 12.00, 7, 10),
  (4, 'Express Shipping', '3-5 business days', 22.00, 3, 5);

-- AU Shipping
INSERT OR IGNORE INTO shipping_methods (region_id, name, description, base_cost, estimated_days_min, estimated_days_max) VALUES
  (5, 'Standard Shipping', '10-14 business days', 15.00, 10, 14),
  (5, 'Express Shipping', '5-7 business days', 30.00, 5, 7);

-- JP Shipping
INSERT OR IGNORE INTO shipping_methods (region_id, name, description, base_cost, estimated_days_min, estimated_days_max) VALUES
  (6, 'Standard Shipping', '7-10 business days', 1500.00, 7, 10),
  (6, 'Express Shipping', '3-5 business days', 3000.00, 3, 5);

-- ROW Shipping
INSERT OR IGNORE INTO shipping_methods (region_id, name, description, base_cost, estimated_days_min, estimated_days_max) VALUES
  (7, 'International Standard', '14-21 business days', 20.00, 14, 21),
  (7, 'International Express', '7-10 business days', 40.00, 7, 10);

-- Insert sample admin user (password: admin123 - CHANGE THIS!)
INSERT OR IGNORE INTO admin_users (username, email, password_hash, role) VALUES
  ('admin', 'admin@example.com', '$2a$10$rKxZvF5BhQkpUjKjF5ZwDuH5kJ9vF5ZwDuH5kJ9vF5ZwDuH5kJ9vF', 'admin');

-- Insert sample drop: Current Drop
INSERT OR IGNORE INTO drops (name, slug, description, status, launch_date, hero_image, story_content, teaser_content, is_featured) VALUES
  ('Summer Collection 2026', 'summer-2026', 'Fresh styles for the summer season', 'current', datetime('now'), 
   '/static/images/drops/summer-2026-hero.jpg',
   'Our Summer 2026 collection brings vibrant colors and lightweight fabrics perfect for the season.',
   'Launching our most anticipated summer collection yet. Limited quantities available.',
   1);

-- Insert sample drop: Coming Soon
INSERT OR IGNORE INTO drops (name, slug, description, status, launch_date, hero_image, story_content, teaser_content, is_featured) VALUES
  ('Fall Collection 2026', 'fall-2026', 'Cozy essentials for autumn', 'coming_soon', datetime('now', '+30 days'),
   '/static/images/drops/fall-2026-hero.jpg',
   'Embrace the changing seasons with our Fall 2026 collection featuring rich earth tones and premium materials.',
   'Coming soon: Our fall collection launches next month. Be the first to know.',
   0);

-- Insert sample drop: Past Drop
INSERT OR IGNORE INTO drops (name, slug, description, status, launch_date, end_date, hero_image, story_content) VALUES
  ('Spring Collection 2026', 'spring-2026', 'Spring essentials', 'past', datetime('now', '-60 days'), datetime('now', '-30 days'),
   '/static/images/drops/spring-2026-hero.jpg',
   'Our Spring 2026 collection featured fresh designs that sold out quickly.');

-- Insert sample products for Summer 2026 drop
INSERT OR IGNORE INTO products (drop_id, name, slug, description, category, base_price, currency, size_guide, material) VALUES
  (1, 'Essential Oversized Tee', 'essential-oversized-tee', 'Premium heavyweight cotton tee with relaxed fit', 'Tops', 45.00, 'USD',
   'True to size. Size up for extra oversized fit.', '100% Premium Cotton, 280gsm'),
  (1, 'Classic Cargo Pants', 'classic-cargo-pants', 'Tactical-inspired cargo pants with adjustable waist', 'Bottoms', 98.00, 'USD',
   'Relaxed fit through thigh, tapered at ankle.', '65% Cotton, 35% Polyester Ripstop'),
  (1, 'Signature Hoodie', 'signature-hoodie', 'Ultra-soft fleece hoodie with embroidered logo', 'Outerwear', 85.00, 'USD',
   'Slightly oversized fit. Size down for fitted look.', '80% Cotton, 20% Polyester Fleece'),
  (1, 'Technical Shorts', 'technical-shorts', 'Lightweight performance shorts with zipper pockets', 'Bottoms', 55.00, 'USD',
   'Athletic fit with elastic waistband.', 'Quick-dry Nylon Blend');

-- Insert product images
INSERT OR IGNORE INTO product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
  (1, '/static/images/products/tee-white-front.jpg', 'Essential Oversized Tee - White - Front', 0, 1),
  (1, '/static/images/products/tee-white-back.jpg', 'Essential Oversized Tee - White - Back', 1, 0),
  (1, '/static/images/products/tee-black-front.jpg', 'Essential Oversized Tee - Black - Front', 2, 0),
  (2, '/static/images/products/cargo-olive-front.jpg', 'Classic Cargo Pants - Olive - Front', 0, 1),
  (2, '/static/images/products/cargo-olive-side.jpg', 'Classic Cargo Pants - Olive - Side', 1, 0),
  (3, '/static/images/products/hoodie-navy-front.jpg', 'Signature Hoodie - Navy - Front', 0, 1),
  (3, '/static/images/products/hoodie-navy-back.jpg', 'Signature Hoodie - Navy - Back', 1, 0),
  (4, '/static/images/products/shorts-black-front.jpg', 'Technical Shorts - Black - Front', 0, 1);

-- Insert product variants (SKUs with size/color combinations)
-- Essential Oversized Tee variants
INSERT OR IGNORE INTO product_variants (product_id, sku, size, color, color_hex, stock_quantity, low_stock_threshold) VALUES
  (1, 'EOT-WH-XS', 'XS', 'White', '#FFFFFF', 50, 10),
  (1, 'EOT-WH-S', 'S', 'White', '#FFFFFF', 120, 15),
  (1, 'EOT-WH-M', 'M', 'White', '#FFFFFF', 150, 15),
  (1, 'EOT-WH-L', 'L', 'White', '#FFFFFF', 100, 15),
  (1, 'EOT-WH-XL', 'XL', 'White', '#FFFFFF', 80, 10),
  (1, 'EOT-BK-XS', 'XS', 'Black', '#000000', 45, 10),
  (1, 'EOT-BK-S', 'S', 'Black', '#000000', 110, 15),
  (1, 'EOT-BK-M', 'M', 'Black', '#000000', 140, 15),
  (1, 'EOT-BK-L', 'L', 'Black', '#000000', 95, 15),
  (1, 'EOT-BK-XL', 'XL', 'Black', '#000000', 75, 10),
  (1, 'EOT-GY-S', 'S', 'Grey', '#808080', 8, 10),
  (1, 'EOT-GY-M', 'M', 'Grey', '#808080', 12, 15),
  (1, 'EOT-GY-L', 'L', 'Grey', '#808080', 5, 15);

-- Classic Cargo Pants variants
INSERT OR IGNORE INTO product_variants (product_id, sku, size, color, color_hex, stock_quantity, low_stock_threshold) VALUES
  (2, 'CCP-OL-28', '28', 'Olive', '#556B2F', 40, 10),
  (2, 'CCP-OL-30', '30', 'Olive', '#556B2F', 90, 15),
  (2, 'CCP-OL-32', '32', 'Olive', '#556B2F', 110, 15),
  (2, 'CCP-OL-34', '34', 'Olive', '#556B2F', 85, 15),
  (2, 'CCP-OL-36', '36', 'Olive', '#556B2F', 60, 10),
  (2, 'CCP-BK-30', '30', 'Black', '#000000', 80, 15),
  (2, 'CCP-BK-32', '32', 'Black', '#000000', 100, 15),
  (2, 'CCP-BK-34', '34', 'Black', '#000000', 75, 15);

-- Signature Hoodie variants
INSERT OR IGNORE INTO product_variants (product_id, sku, size, color, color_hex, stock_quantity, low_stock_threshold) VALUES
  (3, 'SH-NV-S', 'S', 'Navy', '#000080', 70, 15),
  (3, 'SH-NV-M', 'M', 'Navy', '#000080', 120, 20),
  (3, 'SH-NV-L', 'L', 'Navy', '#000080', 95, 20),
  (3, 'SH-NV-XL', 'XL', 'Navy', '#000080', 65, 15),
  (3, 'SH-GY-S', 'S', 'Grey', '#808080', 0, 15),
  (3, 'SH-GY-M', 'M', 'Grey', '#808080', 0, 20),
  (3, 'SH-GY-L', 'L', 'Grey', '#808080', 3, 20);

-- Technical Shorts variants
INSERT OR IGNORE INTO product_variants (product_id, sku, size, color, color_hex, stock_quantity, low_stock_threshold) VALUES
  (4, 'TS-BK-S', 'S', 'Black', '#000000', 60, 10),
  (4, 'TS-BK-M', 'M', 'Black', '#000000', 85, 15),
  (4, 'TS-BK-L', 'L', 'Black', '#000000', 70, 15),
  (4, 'TS-BK-XL', 'XL', 'Black', '#000000', 50, 10);
