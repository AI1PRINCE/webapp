import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Bindings, Drop, Product, ProductVariant, Region, CartItem } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware for all API routes
app.use('/*', cors())

// ===== UTILITY FUNCTIONS =====

// Get client region from CF headers
function getClientRegion(c: any): string {
  const country = c.req.header('CF-IPCountry') || 'US'
  const regionMap: Record<string, string> = {
    'US': 'US', 'CA': 'CA', 'GB': 'UK', 'AU': 'AU', 'JP': 'JP',
    'FR': 'EU', 'DE': 'EU', 'IT': 'EU', 'ES': 'EU', 'NL': 'EU',
    'BE': 'EU', 'AT': 'EU', 'SE': 'EU', 'DK': 'EU', 'PL': 'EU'
  }
  return regionMap[country] || 'ROW'
}

// Currency exchange rates (mock - in production use real API)
const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0, 'EUR': 0.92, 'GBP': 0.79, 'CAD': 1.36, 
  'AUD': 1.52, 'JPY': 149.50
}

function convertPrice(amount: number, fromCurrency: string, toCurrency: string): number {
  const usdAmount = amount / EXCHANGE_RATES[fromCurrency]
  return Math.round(usdAmount * EXCHANGE_RATES[toCurrency] * 100) / 100
}

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// ===== API ROUTES =====

// Get all drops by status
app.get('/drops/:status', async (c) => {
  const status = c.req.param('status')
  const validStatuses = ['current', 'past', 'coming_soon']
  
  if (!validStatuses.includes(status)) {
    return c.json({ error: 'Invalid status' }, 400)
  }

  const drops = await c.env.DB.prepare(`
    SELECT * FROM drops 
    WHERE status = ? 
    ORDER BY 
      CASE WHEN status = 'current' THEN 0 
           WHEN status = 'coming_soon' THEN 1 
           ELSE 2 END,
      launch_date DESC
  `).bind(status).all()

  return c.json(drops.results)
})

// Get single drop by slug
app.get('/drop/:slug', async (c) => {
  const slug = c.req.param('slug')
  const drop = await c.env.DB.prepare('SELECT * FROM drops WHERE slug = ?')
    .bind(slug).first()
  
  if (!drop) {
    return c.json({ error: 'Drop not found' }, 404)
  }

  // Get products for this drop
  const products = await c.env.DB.prepare(`
    SELECT p.*, 
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
      (SELECT MIN(base_price + price_adjustment) FROM product_variants WHERE product_id = p.id) as min_price,
      (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id) as total_stock
    FROM products p
    WHERE p.drop_id = ? AND p.is_active = 1
    ORDER BY p.created_at DESC
  `).bind(drop.id).all()

  return c.json({ drop, products: products.results })
})

// Get all products with filters
app.get('/products', async (c) => {
  const category = c.req.query('category')
  const drop_id = c.req.query('drop_id')
  const search = c.req.query('search')
  
  let query = `
    SELECT p.*, 
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
      (SELECT MIN(base_price + price_adjustment) FROM product_variants WHERE product_id = p.id) as min_price,
      (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id) as total_stock
    FROM products p
    WHERE p.is_active = 1
  `
  const params: any[] = []
  
  if (category) {
    query += ' AND p.category = ?'
    params.push(category)
  }
  
  if (drop_id) {
    query += ' AND p.drop_id = ?'
    params.push(drop_id)
  }
  
  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }
  
  query += ' ORDER BY p.created_at DESC'
  
  const products = await c.env.DB.prepare(query).bind(...params).all()
  return c.json(products.results)
})

// Get single product by slug with full details
app.get('/product/:slug', async (c) => {
  const slug = c.req.param('slug')
  const currency = c.req.query('currency') || 'USD'
  
  const product = await c.env.DB.prepare('SELECT * FROM products WHERE slug = ?')
    .bind(slug).first<Product>()
  
  if (!product) {
    return c.json({ error: 'Product not found' }, 404)
  }

  // Get images
  const images = await c.env.DB.prepare(`
    SELECT * FROM product_images 
    WHERE product_id = ? 
    ORDER BY is_primary DESC, display_order ASC
  `).bind(product.id).all()

  // Get videos
  const videos = await c.env.DB.prepare(`
    SELECT * FROM product_videos 
    WHERE product_id = ? 
    ORDER BY display_order ASC
  `).bind(product.id).all()

  // Get variants with stock info
  const variants = await c.env.DB.prepare(`
    SELECT * FROM product_variants 
    WHERE product_id = ? AND is_active = 1
    ORDER BY 
      CASE size 
        WHEN 'XS' THEN 1 
        WHEN 'S' THEN 2 
        WHEN 'M' THEN 3 
        WHEN 'L' THEN 4 
        WHEN 'XL' THEN 5 
        ELSE 99 
      END, size
  `).bind(product.id).all()

  // Convert prices if needed
  const convertedVariants = variants.results.map((v: any) => ({
    ...v,
    converted_price: convertPrice(
      product.base_price + v.price_adjustment, 
      product.currency, 
      currency
    ),
    stock_status: v.stock_quantity === 0 ? 'sold_out' : 
                  v.stock_quantity <= v.low_stock_threshold ? 'low_stock' : 'in_stock'
  }))

  // Get drop info if associated
  let drop = null
  if (product.drop_id) {
    drop = await c.env.DB.prepare('SELECT * FROM drops WHERE id = ?')
      .bind(product.drop_id).first()
  }

  return c.json({
    product: {
      ...product,
      converted_price: convertPrice(product.base_price, product.currency, currency)
    },
    images: images.results,
    videos: videos.results,
    variants: convertedVariants,
    drop
  })
})

// Get regions
app.get('/regions', async (c) => {
  const regions = await c.env.DB.prepare(
    'SELECT * FROM regions WHERE is_active = 1 ORDER BY name'
  ).all()
  return c.json(regions.results)
})

// Get shipping methods by region
app.get('/shipping/:region_code', async (c) => {
  const region_code = c.req.param('region_code')
  
  const region = await c.env.DB.prepare(
    'SELECT * FROM regions WHERE code = ? AND is_active = 1'
  ).bind(region_code).first()
  
  if (!region) {
    return c.json({ error: 'Region not found' }, 404)
  }

  const methods = await c.env.DB.prepare(`
    SELECT * FROM shipping_methods 
    WHERE region_id = ? AND is_active = 1
    ORDER BY base_cost ASC
  `).bind(region.id).all()

  return c.json({ region, methods: methods.results })
})

// Subscribe to newsletter
app.post('/subscribe', async (c) => {
  const { email, name, source } = await c.req.json()
  
  if (!email || !email.includes('@')) {
    return c.json({ error: 'Invalid email' }, 400)
  }

  try {
    await c.env.DB.prepare(`
      INSERT INTO email_subscribers (email, name, source) 
      VALUES (?, ?, ?)
    `).bind(email, name || null, source || 'website').run()

    return c.json({ success: true, message: 'Subscribed successfully' })
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint')) {
      return c.json({ success: true, message: 'Already subscribed' })
    }
    return c.json({ error: 'Subscription failed' }, 500)
  }
})

// Subscribe to drop notification
app.post('/drop-notify/:drop_id', async (c) => {
  const drop_id = c.req.param('drop_id')
  const { email } = await c.req.json()
  
  if (!email || !email.includes('@')) {
    return c.json({ error: 'Invalid email' }, 400)
  }

  try {
    await c.env.DB.prepare(`
      INSERT INTO drop_notifications (email, drop_id) 
      VALUES (?, ?)
    `).bind(email, drop_id).run()

    return c.json({ success: true, message: 'You will be notified' })
  } catch (error) {
    return c.json({ success: true, message: 'Already registered' })
  }
})

// Request stock notification
app.post('/stock-notify', async (c) => {
  const { email, variant_id } = await c.req.json()
  
  if (!email || !variant_id) {
    return c.json({ error: 'Email and variant_id required' }, 400)
  }

  try {
    await c.env.DB.prepare(`
      INSERT INTO stock_notifications (email, variant_id) 
      VALUES (?, ?)
    `).bind(email, variant_id).run()

    return c.json({ success: true, message: 'You will be notified when back in stock' })
  } catch (error) {
    return c.json({ success: true, message: 'Already registered' })
  }
})

// Track analytics event
app.post('/analytics', async (c) => {
  const { event_type, product_id, variant_id, drop_id, data } = await c.req.json()
  const region_code = getClientRegion(c)
  const session_id = c.req.header('x-session-id') || 'anonymous'

  await c.env.DB.prepare(`
    INSERT INTO analytics_events 
    (event_type, product_id, variant_id, drop_id, region_code, session_id, data_json) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    event_type, 
    product_id || null, 
    variant_id || null, 
    drop_id || null,
    region_code,
    session_id,
    JSON.stringify(data || {})
  ).run()

  return c.json({ success: true })
})

// Create order (simplified - in production integrate with Stripe)
app.post('/orders', async (c) => {
  const {
    customer_email,
    items,
    shipping_address,
    billing_address,
    shipping_method_id,
    currency
  } = await c.req.json()

  if (!customer_email || !items || items.length === 0 || !shipping_address) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  // Calculate totals
  let subtotal = 0
  for (const item of items) {
    const variant = await c.env.DB.prepare(
      'SELECT * FROM product_variants WHERE id = ?'
    ).bind(item.variant_id).first<ProductVariant>()
    
    if (!variant || variant.stock_quantity < item.quantity) {
      return c.json({ error: `Insufficient stock for variant ${item.variant_id}` }, 400)
    }
    
    const product = await c.env.DB.prepare(
      'SELECT * FROM products WHERE id = ?'
    ).bind(variant.product_id).first<Product>()
    
    subtotal += (product!.base_price + variant.price_adjustment) * item.quantity
  }

  // Get shipping cost
  let shipping_cost = 0
  if (shipping_method_id) {
    const method = await c.env.DB.prepare(
      'SELECT * FROM shipping_methods WHERE id = ?'
    ).bind(shipping_method_id).first<any>()
    shipping_cost = method?.base_cost || 0
  }

  // Get tax rate from region
  const region = await c.env.DB.prepare(
    'SELECT * FROM regions WHERE code = ?'
  ).bind(shipping_address.country_code).first<Region>()
  
  const tax_rate = region?.tax_rate || 0
  const tax_amount = subtotal * tax_rate
  const total_amount = subtotal + shipping_cost + tax_amount

  // Create order
  const order_number = generateOrderNumber()
  
  const orderResult = await c.env.DB.prepare(`
    INSERT INTO orders (
      order_number, customer_email, status, subtotal, shipping_cost, 
      tax_amount, total_amount, currency, payment_status, shipping_method_id,
      shipping_address_json, billing_address_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    order_number, customer_email, 'pending', subtotal, shipping_cost,
    tax_amount, total_amount, currency, 'pending', shipping_method_id,
    JSON.stringify(shipping_address), JSON.stringify(billing_address || shipping_address)
  ).run()

  const order_id = orderResult.meta.last_row_id

  // Create order items and update stock
  for (const item of items) {
    const variant = await c.env.DB.prepare(
      'SELECT * FROM product_variants WHERE id = ?'
    ).bind(item.variant_id).first<ProductVariant>()
    
    const product = await c.env.DB.prepare(
      'SELECT * FROM products WHERE id = ?'
    ).bind(variant!.product_id).first<Product>()
    
    const unit_price = product!.base_price + variant!.price_adjustment
    const total_price = unit_price * item.quantity

    await c.env.DB.prepare(`
      INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(order_id, variant!.product_id, item.variant_id, item.quantity, unit_price, total_price).run()

    // Update stock
    await c.env.DB.prepare(`
      UPDATE product_variants 
      SET stock_quantity = stock_quantity - ? 
      WHERE id = ?
    `).bind(item.quantity, item.variant_id).run()
  }

  return c.json({
    success: true,
    order_number,
    order_id,
    total_amount,
    currency
  })
})

// Get order by order number
app.get('/order/:order_number', async (c) => {
  const order_number = c.req.param('order_number')
  
  const order = await c.env.DB.prepare(
    'SELECT * FROM orders WHERE order_number = ?'
  ).bind(order_number).first()
  
  if (!order) {
    return c.json({ error: 'Order not found' }, 404)
  }

  const items = await c.env.DB.prepare(`
    SELECT oi.*, p.name as product_name, p.slug as product_slug,
           pv.size, pv.color, pv.sku
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN product_variants pv ON oi.variant_id = pv.id
    WHERE oi.order_id = ?
  `).bind(order.id).all()

  return c.json({
    ...order,
    shipping_address: JSON.parse(order.shipping_address_json as string),
    items: items.results
  })
})

export default app
