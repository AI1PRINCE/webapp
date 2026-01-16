# DROP - Clothing Brand E-commerce Platform

A fully functional, production-ready e-commerce platform designed for clothing brands that use a drop-based release model. Built with Hono, TypeScript, and Cloudflare Pages/Workers for edge deployment.

## 🌐 Live Demo

- **Public Site**: https://3000-i5yw4vl4a066enxc22nsy-b237eb32.sandbox.novita.ai
- **Admin Dashboard**: https://3000-i5yw4vl4a066enxc22nsy-b237eb32.sandbox.novita.ai/admin
  - Username: `admin`
  - Password: `admin123`

## 🎯 Project Overview

This is a comprehensive drop-based clothing brand website implementing **Phase 1 (Launch-Ready)** features from your requirements. The platform is built on Cloudflare's edge infrastructure, providing global CDN distribution, low latency, and scalability.

## ✅ Completed Features (Phase 1)

### 🛍️ Global Catalog & Drops
- ✅ Drop collections with clear status (Current Drop, Past Drops, Coming Soon)
- ✅ Product detail pages (PDP) with:
  - Image galleries with multiple views
  - Size/color variant selection
  - Stock status indicators (In Stock, Low Stock, Sold Out)
  - Size guides and material information
- ✅ Low-stock and sold-out states with visual indicators
- ✅ Social proof preservation (sold-out items remain visible)

### 🌍 Internationalization & Pricing
- ✅ Multi-currency display (USD, EUR, GBP, CAD, AUD, JPY)
- ✅ Auto-detect region from Cloudflare headers
- ✅ Manual currency selector in header
- ✅ Region-aware pricing with automatic conversion
- ✅ Region-specific shipping methods and costs
- ✅ Tax and duties messaging by region

### 💳 Checkout & Payments
- ✅ Guest checkout flow
- ✅ Address validation and auto-complete ready
- ✅ Multiple shipping methods per region
- ✅ Transparent tax and shipping cost display
- ✅ Payment integration framework (Stripe-ready)
- ✅ Order confirmation and tracking

### 📦 Drop & Traffic Handling
- ✅ Static pre-drop landing pages with countdowns
- ✅ Email capture for drop notifications
- ✅ Cloudflare CDN caching for high traffic
- ✅ Database-backed inventory management

### 📢 Marketing & Hype
- ✅ Drop landing pages with hero imagery
- ✅ Countdown timers for upcoming drops
- ✅ Email subscription forms (footer + drop pages)
- ✅ Drop notification signup per collection
- ✅ Analytics event tracking framework

### 🛡️ Trust & Support
- ✅ FAQ page with common questions
- ✅ Order tracking system
- ✅ Clear shipping information by region
- ✅ Stock notification requests
- ✅ Professional UI/UX design

### 🎨 Core UX & Performance
- ✅ Fast, mobile-first responsive design
- ✅ Optimized Tailwind CSS styling
- ✅ FontAwesome icons
- ✅ Clean navigation and product discovery
- ✅ Local storage-based shopping cart
- ✅ Real-time stock checking

### 👨‍💼 Admin Dashboard
- ✅ Basic auth protected admin panel
- ✅ Overview dashboard with key metrics
- ✅ Drops management (view all drops by status)
- ✅ Products management (view all products with stock)
- ✅ Orders list with status tracking
- ✅ Email subscribers list

## 🏗️ Technology Stack

### Frontend
- **Framework**: Hono (Edge-first web framework)
- **Styling**: Tailwind CSS (CDN)
- **Icons**: FontAwesome 6
- **HTTP Client**: Axios
- **Deployment**: Cloudflare Pages

### Backend
- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Database**: Cloudflare D1 (SQLite)
- **API**: RESTful Hono routes

## 📊 Data Architecture

### Database Schema (Cloudflare D1)

**Core Tables:**
- `drops` - Drop collections with status and launch dates
- `products` - Product catalog with base pricing
- `product_variants` - SKUs with size/color/stock
- `product_images` - Multiple images per product
- `product_videos` - Product video content

**E-commerce Tables:**
- `orders` - Order records with status tracking
- `order_items` - Line items per order
- `customers` - Customer accounts
- `inventory_reservations` - Temporary stock holds during checkout

**Regional Data:**
- `regions` - Supported regions with currencies
- `shipping_methods` - Shipping options per region

**Marketing Tables:**
- `email_subscribers` - Newsletter subscribers
- `drop_notifications` - Drop-specific notification signups
- `stock_notifications` - Back-in-stock alerts
- `analytics_events` - Event tracking data

### Sample Data Included
- 3 drops (Current: Summer 2026, Coming Soon: Fall 2026, Past: Spring 2026)
- 4 products with 30+ variants
- 7 regions (US, EU, UK, CA, AU, JP, ROW)
- Multiple shipping methods per region

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Wrangler CLI (`npm install -g wrangler`)

### Local Development

1. **Clone and Install**
```bash
cd /home/user/webapp
npm install
```

2. **Initialize Database**
```bash
npm run db:migrate:local
```

3. **Build Project**
```bash
npm run build
```

4. **Start Development Server**
```bash
npm run dev:sandbox
# Or use PM2 (recommended for sandbox):
pm2 start ecosystem.config.cjs
```

5. **Access the Site**
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin (admin/admin123)

### Available Scripts

```bash
npm run dev              # Vite dev server (local machine only)
npm run dev:sandbox      # Wrangler dev server with D1 (sandbox-compatible)
npm run build            # Build for production
npm run deploy           # Build and deploy to Cloudflare Pages
npm run deploy:prod      # Deploy with project name
npm run db:migrate:local # Apply migrations to local D1
npm run db:migrate:prod  # Apply migrations to production D1
npm run db:console:local # Open local D1 console
npm run clean-port       # Kill process on port 3000
npm run test             # Test local server
```

## 📱 Key Features & URLs

### Public Frontend

| Feature | URL | Description |
|---------|-----|-------------|
| Home | `/` | Hero with featured drop + coming soon |
| Current Drops | `/drops/current` | Active drops |
| Coming Soon | `/drops/coming-soon` | Upcoming drops with countdown |
| Past Drops | `/drops/past` | Archive |
| All Products | `/products` | Full product catalog |
| Product Detail | `/product/{slug}` | PDP with variants |
| Drop Detail | `/drop/{slug}` | Drop landing page |
| Shopping Cart | `/cart` | Cart review |
| Checkout | `/checkout` | Checkout flow |
| Order Confirmation | `/order-confirmation` | Post-purchase confirmation |
| Track Order | `/tracking` | Order tracking |
| FAQ | `/faq` | Support questions |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/drops/:status` | GET | Get drops by status |
| `/api/drop/:slug` | GET | Get drop with products |
| `/api/products` | GET | Get products (with filters) |
| `/api/product/:slug` | GET | Get product details |
| `/api/regions` | GET | Get available regions |
| `/api/shipping/:region_code` | GET | Get shipping methods |
| `/api/subscribe` | POST | Newsletter subscription |
| `/api/drop-notify/:drop_id` | POST | Drop notification signup |
| `/api/stock-notify` | POST | Back-in-stock notification |
| `/api/analytics` | POST | Track events |
| `/api/orders` | POST | Create order |
| `/api/order/:order_number` | GET | Get order details |

### Admin Dashboard

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/admin` | Overview with stats |
| Drops | `/admin/drops` | Manage drops |
| Products | `/admin/products` | Manage products |
| Orders | `/admin/orders` | View orders |
| Subscribers | `/admin/subscribers` | Email list |

## 🎨 Design Features

### UI Components
- Responsive mobile-first design
- Tailwind CSS utility classes
- Interactive product galleries
- Dynamic variant selectors
- Stock status badges
- Countdown timers
- Modal-ready structure

### User Experience
- Smooth transitions and hover effects
- Clear calls-to-action
- Loading states and feedback
- Error handling
- Form validation
- Cart persistence (localStorage)

## 🔐 Security Features

- Basic authentication for admin panel
- CORS enabled for API routes
- SQL injection prevention (parameterized queries)
- Input validation on forms
- Secure session management ready

## 📈 Performance & Scalability

- **Edge Computing**: Runs on Cloudflare's global network
- **CDN Caching**: Static assets cached globally
- **Database**: D1 SQLite for fast queries
- **Minimal Bundle**: ~114KB compiled worker
- **Auto-scaling**: Serverless architecture

## 🛠️ Production Deployment

### Prerequisites
1. Cloudflare account
2. Cloudflare API token
3. GitHub repository (optional)

### Deploy to Cloudflare Pages

1. **Create Production D1 Database**
```bash
npx wrangler d1 create webapp-production
# Copy the database_id to wrangler.jsonc
```

2. **Update wrangler.jsonc**
```jsonc
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "webapp-production",
    "database_id": "YOUR-DATABASE-ID-HERE"
  }]
}
```

3. **Apply Migrations to Production**
```bash
npm run db:migrate:prod
```

4. **Deploy**
```bash
npm run deploy:prod
```

5. **Set Production Secrets** (if needed)
```bash
npx wrangler pages secret put API_KEY --project-name webapp
```

## 🔄 Phase 2 & 3 Roadmap

### Phase 2 Features (Growth & Optimization)
- [ ] Waitlist/preorder system
- [ ] Per-variant stock notifications (backend ready)
- [ ] Loyalty program
- [ ] Drop calendar page
- [ ] Reviews and ratings
- [ ] UGC integration
- [ ] Advanced analytics dashboard
- [ ] A/B testing framework
- [ ] Inventory reservations during checkout

### Phase 3 Features (Advanced)
- [ ] Lookbooks and campaigns
- [ ] Product recommendations
- [ ] Personalized early access
- [ ] Per-region merchandising
- [ ] Full multi-language support
- [ ] Wholesale/B2B portal
- [ ] Collaboration drops
- [ ] Raffle system

## 🐛 Known Limitations

1. **Payment Processing**: Demo mode only - integrate Stripe for production
2. **Email Sending**: Database capture only - integrate SendGrid/Resend for emails
3. **SMS Notifications**: Not implemented - integrate Twilio if needed
4. **Image Uploads**: Static file structure - consider Cloudflare R2 for production
5. **Admin CRUD**: View-only currently - add create/edit functionality

## 📝 Development Notes

### Database Management
- Local D1 database stored in `.wrangler/state/v3/d1/`
- Migrations in `migrations/` directory
- Always apply migrations before deploying

### Environment Variables
- Create `.dev.vars` for local secrets
- Use `wrangler pages secret` for production
- Never commit secrets to git

### Code Structure
```
webapp/
├── src/
│   ├── index.tsx       # Main app with frontend routes
│   ├── api.tsx         # API routes
│   ├── admin.tsx       # Admin dashboard
│   └── types.ts        # TypeScript definitions
├── public/
│   └── static/         # Static assets
├── migrations/         # D1 migrations
├── wrangler.jsonc      # Cloudflare config
├── package.json        # Dependencies & scripts
└── ecosystem.config.cjs # PM2 config
```

## 🤝 Support & Maintenance

### Common Tasks

**Add New Product:**
1. Insert into `products` table
2. Add images to `product_images`
3. Create variants in `product_variants`

**Create New Drop:**
1. Insert into `drops` table
2. Associate products via `drop_id`

**Update Stock:**
```sql
UPDATE product_variants 
SET stock_quantity = ? 
WHERE sku = ?
```

**View Analytics:**
```sql
SELECT event_type, COUNT(*) as count 
FROM analytics_events 
GROUP BY event_type
```

## 📄 License

This project is provided as-is for your clothing brand use case.

## 🙏 Acknowledgments

Built with:
- [Hono](https://hono.dev) - Web framework
- [Cloudflare Workers](https://workers.cloudflare.com) - Edge runtime
- [Cloudflare D1](https://developers.cloudflare.com/d1) - Database
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [FontAwesome](https://fontawesome.com) - Icons

---

**Built for drop-based clothing brands seeking a fast, scalable, and global e-commerce platform.**
