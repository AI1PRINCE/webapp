import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Bindings } from './types'
import api from './api'
import admin from './admin'

const app = new Hono<{ Bindings: Bindings }>()

// Mount API routes
app.route('/api', api)

// Mount Admin routes
app.route('/admin', admin)

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ===== HTML LAYOUTS & COMPONENTS =====

const layout = (title: string, content: string, scripts: string = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Drop Brand</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .badge { @apply inline-block px-2 py-1 text-xs font-semibold rounded; }
        .badge-low-stock { @apply bg-orange-100 text-orange-800; }
        .badge-sold-out { @apply bg-red-100 text-red-800; }
        .badge-in-stock { @apply bg-green-100 text-green-800; }
        .btn { @apply px-6 py-3 font-semibold rounded-lg transition-all duration-200; }
        .btn-primary { @apply bg-black text-white hover:bg-gray-800; }
        .btn-secondary { @apply bg-gray-200 text-gray-800 hover:bg-gray-300; }
        .btn-disabled { @apply bg-gray-300 text-gray-500 cursor-not-allowed; }
        .product-card { @apply bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300; }
        .countdown { @apply text-4xl font-bold tabular-nums; }
        .sticky-cart { position: sticky; bottom: 20px; z-index: 50; }
    </style>
</head>
<body class="bg-gray-50">
    ${header()}
    ${content}
    ${footer()}
    ${scripts}
</body>
</html>
`

const header = () => `
<header class="bg-white border-b sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-8">
                <a href="/" class="text-2xl font-bold">DROP</a>
                <nav class="hidden md:flex space-x-6">
                    <a href="/drops/current" class="text-gray-700 hover:text-black">Current Drop</a>
                    <a href="/drops/coming-soon" class="text-gray-700 hover:text-black">Coming Soon</a>
                    <a href="/drops/past" class="text-gray-700 hover:text-black">Archive</a>
                    <a href="/products" class="text-gray-700 hover:text-black">All Products</a>
                </nav>
            </div>
            <div class="flex items-center space-x-4">
                <div class="relative">
                    <select id="currency-selector" class="bg-gray-100 border-0 rounded-lg px-3 py-2 text-sm">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                        <option value="JPY">JPY</option>
                    </select>
                </div>
                <a href="/cart" class="relative">
                    <i class="fas fa-shopping-bag text-xl"></i>
                    <span id="cart-count" class="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
                </a>
            </div>
        </div>
    </div>
</header>
`

const footer = () => `
<footer class="bg-black text-white mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <h3 class="text-xl font-bold mb-4">DROP</h3>
                <p class="text-gray-400 text-sm">Limited edition drops. <br>Exclusive designs.</p>
            </div>
            <div>
                <h4 class="font-semibold mb-4">Shop</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                    <li><a href="/drops/current" class="hover:text-white">Current Drop</a></li>
                    <li><a href="/drops/coming-soon" class="hover:text-white">Coming Soon</a></li>
                    <li><a href="/drops/past" class="hover:text-white">Archive</a></li>
                    <li><a href="/products" class="hover:text-white">All Products</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-semibold mb-4">Support</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                    <li><a href="/faq" class="hover:text-white">FAQ</a></li>
                    <li><a href="/shipping" class="hover:text-white">Shipping</a></li>
                    <li><a href="/returns" class="hover:text-white">Returns</a></li>
                    <li><a href="/tracking" class="hover:text-white">Track Order</a></li>
                    <li><a href="/contact" class="hover:text-white">Contact</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-semibold mb-4">Stay Updated</h4>
                <p class="text-sm text-gray-400 mb-4">Get notified about new drops</p>
                <form id="newsletter-form" class="flex">
                    <input type="email" placeholder="Your email" 
                        class="flex-1 px-4 py-2 bg-gray-800 border-0 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-white">
                    <button type="submit" class="bg-white text-black px-4 py-2 rounded-r-lg hover:bg-gray-200">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </form>
            </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 flex justify-between items-center text-sm text-gray-400">
            <p>&copy; 2026 DROP Brand. All rights reserved.</p>
            <div class="flex space-x-6">
                <a href="#" class="hover:text-white"><i class="fab fa-instagram"></i></a>
                <a href="#" class="hover:text-white"><i class="fab fa-twitter"></i></a>
                <a href="#" class="hover:text-white"><i class="fab fa-tiktok"></i></a>
            </div>
        </div>
    </div>
</footer>
<script>
// Newsletter subscription
document.getElementById('newsletter-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = e.target.querySelector('input').value
    try {
        const response = await axios.post('/api/subscribe', { email, source: 'footer' })
        alert(response.data.message || 'Subscribed successfully!')
        e.target.reset()
    } catch (error) {
        alert('Subscription failed. Please try again.')
    }
})

// Cart count management
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const count = cart.reduce((sum, item) => sum + item.quantity, 0)
    const badge = document.getElementById('cart-count')
    if (badge) badge.textContent = count
}
updateCartCount()

// Currency selector
const currencySelector = document.getElementById('currency-selector')
if (currencySelector) {
    currencySelector.value = localStorage.getItem('currency') || 'USD'
    currencySelector.addEventListener('change', (e) => {
        localStorage.setItem('currency', e.target.value)
        window.location.reload()
    })
}
</script>
`

// ===== HOME PAGE =====
app.get('/', async (c) => {
  const currentDrops = await c.env.DB.prepare(`
    SELECT * FROM drops WHERE status = 'current' AND is_featured = 1 
    ORDER BY launch_date DESC LIMIT 1
  `).first()

  const comingSoon = await c.env.DB.prepare(`
    SELECT * FROM drops WHERE status = 'coming_soon' 
    ORDER BY launch_date ASC LIMIT 1
  `).first()

  const content = `
    <main>
        ${currentDrops ? `
        <!-- Hero Section: Featured Current Drop -->
        <section class="relative h-screen bg-cover bg-center" 
            style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${currentDrops.hero_image || '/static/images/hero-default.jpg'}');">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div class="text-white max-w-2xl">
                    <h1 class="text-6xl font-bold mb-4">${currentDrops.name}</h1>
                    <p class="text-xl mb-8">${currentDrops.teaser_content || ''}</p>
                    <a href="/drop/${currentDrops.slug}" class="btn btn-primary text-lg">
                        Shop Now <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>
        </section>
        ` : ''}

        ${comingSoon ? `
        <!-- Coming Soon Section -->
        <section class="bg-black text-white py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-4xl font-bold mb-4">Coming Soon</h2>
                <p class="text-xl mb-8">${comingSoon.name}</p>
                <div class="countdown mb-8" id="countdown" data-launch="${comingSoon.launch_date}">
                    <span id="days">00</span>d 
                    <span id="hours">00</span>h 
                    <span id="minutes">00</span>m 
                    <span id="seconds">00</span>s
                </div>
                <form id="drop-notify-form" class="max-w-md mx-auto flex gap-2">
                    <input type="email" required placeholder="Enter your email" 
                        class="flex-1 px-4 py-3 bg-white text-black rounded-lg">
                    <button type="submit" class="btn btn-primary">Notify Me</button>
                </form>
            </div>
        </section>
        ` : ''}

        <!-- Features Section -->
        <section class="py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <i class="fas fa-shipping-fast text-4xl mb-4"></i>
                        <h3 class="text-xl font-semibold mb-2">Global Shipping</h3>
                        <p class="text-gray-600">Free shipping on orders over threshold</p>
                    </div>
                    <div class="text-center">
                        <i class="fas fa-shield-alt text-4xl mb-4"></i>
                        <h3 class="text-xl font-semibold mb-2">Secure Checkout</h3>
                        <p class="text-gray-600">Safe payment with Stripe</p>
                    </div>
                    <div class="text-center">
                        <i class="fas fa-undo text-4xl mb-4"></i>
                        <h3 class="text-xl font-semibold mb-2">Easy Returns</h3>
                        <p class="text-gray-600">30-day return policy</p>
                    </div>
                </div>
            </div>
        </section>
    </main>
    
    <script>
    // Countdown timer
    ${comingSoon ? `
    function updateCountdown() {
        const launchDate = new Date('${comingSoon.launch_date}').getTime()
        const now = new Date().getTime()
        const distance = launchDate - now
        
        if (distance < 0) {
            document.getElementById('countdown').innerHTML = 'LIVE NOW!'
            return
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        
        document.getElementById('days').textContent = String(days).padStart(2, '0')
        document.getElementById('hours').textContent = String(hours).padStart(2, '0')
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0')
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0')
    }
    updateCountdown()
    setInterval(updateCountdown, 1000)
    
    // Drop notification form
    document.getElementById('drop-notify-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = e.target.querySelector('input').value
        try {
            await axios.post('/api/drop-notify/${comingSoon.id}', { email })
            alert('You will be notified when this drop launches!')
            e.target.reset()
        } catch (error) {
            alert('Failed to register. Please try again.')
        }
    })
    ` : ''}
    </script>
  `

  return c.html(layout('Home', content))
})

// ===== DROPS LISTING PAGE =====
app.get('/drops/:status', async (c) => {
  const status = c.req.param('status')
  const validStatuses = ['current', 'past', 'coming-soon']
  
  if (!validStatuses.includes(status)) {
    return c.redirect('/')
  }

  const dbStatus = status === 'coming-soon' ? 'coming_soon' : status
  const drops = await c.env.DB.prepare(`
    SELECT * FROM drops WHERE status = ? 
    ORDER BY launch_date DESC
  `).bind(dbStatus).all()

  const statusTitles: Record<string, string> = {
    'current': 'Current Drops',
    'past': 'Past Drops',
    'coming-soon': 'Coming Soon'
  }

  const content = `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold mb-8">${statusTitles[status]}</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${drops.results.map((drop: any) => `
                <a href="/drop/${drop.slug}" class="product-card">
                    <div class="aspect-w-16 aspect-h-9 bg-gray-200">
                        <img src="${drop.hero_image || '/static/images/placeholder.jpg'}" 
                            alt="${drop.name}" class="w-full h-64 object-cover">
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-2">${drop.name}</h3>
                        <p class="text-gray-600 mb-4">${drop.description || ''}</p>
                        ${drop.launch_date ? `
                            <p class="text-sm text-gray-500">
                                <i class="far fa-calendar mr-2"></i>
                                ${new Date(drop.launch_date).toLocaleDateString()}
                            </p>
                        ` : ''}
                    </div>
                </a>
            `).join('')}
        </div>
        
        ${drops.results.length === 0 ? `
            <div class="text-center py-20">
                <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                <p class="text-xl text-gray-500">No drops ${status === 'coming-soon' ? 'announced yet' : 'available'}</p>
            </div>
        ` : ''}
    </main>
  `

  return c.html(layout(statusTitles[status], content))
})

// ===== SINGLE DROP PAGE =====
app.get('/drop/:slug', async (c) => {
  const slug = c.req.param('slug')
  const currency = c.req.header('cookie')?.match(/currency=([^;]+)/)?.[1] || 'USD'
  
  const response = await fetch(`${new URL(c.req.url).origin}/api/drop/${slug}`)
  const data = await response.json()
  
  if (!data.drop) {
    return c.redirect('/drops/current')
  }

  const { drop, products } = data

  const content = `
    <main>
        <!-- Drop Hero -->
        <section class="relative h-96 bg-cover bg-center" 
            style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${drop.hero_image || '/static/images/placeholder.jpg'}');">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div class="text-white max-w-2xl">
                    <h1 class="text-5xl font-bold mb-4">${drop.name}</h1>
                    <p class="text-lg">${drop.story_content || drop.description || ''}</p>
                </div>
            </div>
        </section>

        <!-- Products Grid -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="products-grid">
                ${products.map((product: any) => `
                    <a href="/product/${product.slug}" class="product-card group">
                        <div class="relative overflow-hidden">
                            <img src="${product.primary_image || '/static/images/placeholder.jpg'}" 
                                alt="${product.name}" 
                                class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300">
                            ${product.total_stock === 0 ? `
                                <div class="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 text-sm font-semibold rounded">
                                    SOLD OUT
                                </div>
                            ` : product.total_stock <= 20 ? `
                                <div class="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 text-sm font-semibold rounded">
                                    LOW STOCK
                                </div>
                            ` : ''}
                        </div>
                        <div class="p-4">
                            <h3 class="font-semibold text-lg mb-2">${product.name}</h3>
                            <p class="text-gray-600 text-sm mb-2">${product.category || ''}</p>
                            <p class="font-bold">${currency} ${product.min_price?.toFixed(2) || product.base_price?.toFixed(2)}</p>
                        </div>
                    </a>
                `).join('')}
            </div>
            
            ${products.length === 0 ? `
                <div class="text-center py-20">
                    <p class="text-xl text-gray-500">No products available in this drop yet</p>
                </div>
            ` : ''}
        </section>
    </main>
  `

  return c.html(layout(drop.name, content))
})

// ===== PRODUCT DETAIL PAGE =====
app.get('/product/:slug', async (c) => {
  const slug = c.req.param('slug')
  const currency = c.req.header('cookie')?.match(/currency=([^;]+)/)?.[1] || 'USD'
  
  const response = await fetch(`${new URL(c.req.url).origin}/api/product/${slug}?currency=${currency}`)
  const data = await response.json()
  
  if (!data.product) {
    return c.redirect('/products')
  }

  const { product, images, variants } = data

  const content = `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Product Images -->
            <div>
                <div class="mb-4">
                    <img id="main-image" src="${images[0]?.image_url || '/static/images/placeholder.jpg'}" 
                        alt="${product.name}" class="w-full rounded-lg">
                </div>
                <div class="grid grid-cols-4 gap-4">
                    ${images.map((img: any, idx: number) => `
                        <img src="${img.image_url}" alt="${img.alt_text || product.name}" 
                            class="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75 ${idx === 0 ? 'ring-2 ring-black' : ''}"
                            onclick="document.getElementById('main-image').src='${img.image_url}'; 
                                    document.querySelectorAll('.grid img').forEach(i => i.classList.remove('ring-2', 'ring-black')); 
                                    this.classList.add('ring-2', 'ring-black');">
                    `).join('')}
                </div>
            </div>

            <!-- Product Info -->
            <div>
                <h1 class="text-4xl font-bold mb-4">${product.name}</h1>
                <p class="text-2xl font-bold mb-6">${currency} ${product.converted_price.toFixed(2)}</p>
                
                ${product.description ? `
                    <p class="text-gray-600 mb-6">${product.description}</p>
                ` : ''}

                <!-- Size Selection -->
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-3">
                        <label class="font-semibold">Select Size</label>
                        ${product.size_guide ? `
                            <button onclick="alert('${product.size_guide}')" class="text-sm text-blue-600 hover:underline">
                                Size Guide
                            </button>
                        ` : ''}
                    </div>
                    <div class="grid grid-cols-5 gap-2" id="size-selector">
                        ${Array.from(new Set(variants.map((v: any) => v.size))).map((size: any) => {
                          const sizeVariants = variants.filter((v: any) => v.size === size)
                          const hasStock = sizeVariants.some((v: any) => v.stock_quantity > 0)
                          return `
                            <button 
                                class="size-btn py-3 border-2 rounded-lg font-semibold transition-all
                                    ${hasStock ? 'border-gray-300 hover:border-black' : 'border-gray-200 text-gray-400 cursor-not-allowed'}"
                                ${hasStock ? `onclick="selectSize('${size}')"` : 'disabled'}>
                                ${size}
                            </button>
                          `
                        }).join('')}
                    </div>
                </div>

                <!-- Color Selection -->
                <div class="mb-6" id="color-section" style="display: none;">
                    <label class="font-semibold block mb-3">Select Color</label>
                    <div class="flex gap-3" id="color-selector"></div>
                </div>

                <!-- Stock Status -->
                <div id="stock-status" class="mb-6"></div>

                <!-- Add to Cart -->
                <button id="add-to-cart-btn" 
                    class="w-full btn btn-disabled mb-4" disabled>
                    Select Size and Color
                </button>

                ${product.material ? `
                    <div class="border-t pt-6 mt-6">
                        <h3 class="font-semibold mb-2">Material</h3>
                        <p class="text-gray-600 text-sm">${product.material}</p>
                    </div>
                ` : ''}

                ${product.care_instructions ? `
                    <div class="border-t pt-6 mt-6">
                        <h3 class="font-semibold mb-2">Care Instructions</h3>
                        <p class="text-gray-600 text-sm">${product.care_instructions}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    </main>

    <script>
    const variants = ${JSON.stringify(variants)}
    let selectedSize = null
    let selectedColor = null
    let selectedVariant = null

    function selectSize(size) {
        selectedSize = size
        selectedColor = null
        
        // Update size button styles
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.remove('border-black', 'bg-black', 'text-white')
            btn.classList.add('border-gray-300')
        })
        event.target.classList.remove('border-gray-300')
        event.target.classList.add('border-black', 'bg-black', 'text-white')
        
        // Show available colors for this size
        const sizeVariants = variants.filter(v => v.size === size && v.stock_quantity > 0)
        const colors = [...new Set(sizeVariants.map(v => v.color))]
        
        if (colors.length > 1) {
            const colorSection = document.getElementById('color-section')
            const colorSelector = document.getElementById('color-selector')
            colorSection.style.display = 'block'
            colorSelector.innerHTML = colors.map(color => {
                const variant = sizeVariants.find(v => v.color === color)
                return \`
                    <button class="color-btn w-12 h-12 rounded-full border-2 border-gray-300 hover:border-black transition-all"
                        style="background-color: \${variant.color_hex}"
                        title="\${color}"
                        onclick="selectColor('\${color}')">
                    </button>
                \`
            }).join('')
        } else if (colors.length === 1) {
            selectedColor = colors[0]
            document.getElementById('color-section').style.display = 'none'
            updateSelectedVariant()
        }
    }

    function selectColor(color) {
        selectedColor = color
        
        // Update color button styles
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-black')
        })
        event.target.classList.add('ring-2', 'ring-black')
        
        updateSelectedVariant()
    }

    function updateSelectedVariant() {
        if (!selectedSize || !selectedColor) return
        
        selectedVariant = variants.find(v => 
            v.size === selectedSize && v.color === selectedColor
        )
        
        if (selectedVariant) {
            const stockStatus = document.getElementById('stock-status')
            const addBtn = document.getElementById('add-to-cart-btn')
            
            if (selectedVariant.stock_quantity === 0) {
                stockStatus.innerHTML = \`
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p class="font-semibold text-red-800 mb-2">Sold Out</p>
                        <form id="notify-form" class="flex gap-2">
                            <input type="email" placeholder="Get notified when back in stock" 
                                class="flex-1 px-4 py-2 border rounded-lg text-sm" required>
                            <button type="submit" class="btn btn-secondary text-sm">Notify Me</button>
                        </form>
                    </div>
                \`
                addBtn.disabled = true
                addBtn.classList.add('btn-disabled')
                addBtn.classList.remove('btn-primary')
                
                document.getElementById('notify-form').addEventListener('submit', async (e) => {
                    e.preventDefault()
                    const email = e.target.querySelector('input').value
                    try {
                        await axios.post('/api/stock-notify', { 
                            email, 
                            variant_id: selectedVariant.id 
                        })
                        alert('You will be notified when this item is back in stock!')
                        e.target.reset()
                    } catch (error) {
                        alert('Failed to register. Please try again.')
                    }
                })
            } else {
                const status = selectedVariant.stock_status
                const statusText = status === 'low_stock' ? 
                    \`Only \${selectedVariant.stock_quantity} left!\` : 
                    'In Stock'
                const statusClass = status === 'low_stock' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-green-50 border-green-200 text-green-800'
                
                stockStatus.innerHTML = \`
                    <div class="\${statusClass} border rounded-lg p-3">
                        <p class="font-semibold">\${statusText}</p>
                    </div>
                \`
                
                addBtn.disabled = false
                addBtn.classList.remove('btn-disabled')
                addBtn.classList.add('btn-primary')
                addBtn.textContent = 'Add to Cart'
            }
        }
    }

    // Add to cart functionality
    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        if (!selectedVariant) return
        
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        const existingItem = cart.find(item => item.variant_id === selectedVariant.id)
        
        if (existingItem) {
            existingItem.quantity++
        } else {
            cart.push({
                variant_id: selectedVariant.id,
                product_id: ${product.id},
                product_name: '${product.name}',
                product_slug: '${product.slug}',
                size: selectedVariant.size,
                color: selectedVariant.color,
                price: selectedVariant.converted_price,
                quantity: 1,
                image_url: '${images[0]?.image_url || ''}',
                currency: '${currency}'
            })
        }
        
        localStorage.setItem('cart', JSON.stringify(cart))
        updateCartCount()
        
        // Show success message
        const btn = document.getElementById('add-to-cart-btn')
        const originalText = btn.textContent
        btn.textContent = 'Added to Cart! ✓'
        btn.classList.add('bg-green-600')
        setTimeout(() => {
            btn.textContent = originalText
            btn.classList.remove('bg-green-600')
        }, 2000)
    })
    </script>
  `

  return c.html(layout(product.name, content))
})

// ===== SHOPPING CART PAGE =====
app.get('/cart', async (c) => {
  const content = `
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold mb-8">Shopping Cart</h1>
        
        <div id="cart-container">
            <div class="text-center py-20">
                <i class="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                <p class="text-xl text-gray-500">Your cart is empty</p>
                <a href="/products" class="btn btn-primary mt-6 inline-block">Start Shopping</a>
            </div>
        </div>
    </main>

    <script>
    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        const container = document.getElementById('cart-container')
        
        if (cart.length === 0) {
            container.innerHTML = \`
                <div class="text-center py-20">
                    <i class="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                    <p class="text-xl text-gray-500">Your cart is empty</p>
                    <a href="/products" class="btn btn-primary mt-6 inline-block">Start Shopping</a>
                </div>
            \`
            return
        }
        
        const currency = cart[0]?.currency || 'USD'
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        
        container.innerHTML = \`
            <div class="space-y-4 mb-8">
                \${cart.map((item, index) => \`
                    <div class="flex gap-4 bg-white p-4 rounded-lg border">
                        <img src="\${item.image_url}" alt="\${item.product_name}" 
                            class="w-24 h-24 object-cover rounded">
                        <div class="flex-1">
                            <h3 class="font-semibold text-lg">\${item.product_name}</h3>
                            <p class="text-gray-600 text-sm">Size: \${item.size} | Color: \${item.color}</p>
                            <p class="font-semibold mt-2">\${currency} \${item.price.toFixed(2)}</p>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2 border rounded-lg">
                                <button onclick="updateQuantity(\${index}, -1)" 
                                    class="px-3 py-2 hover:bg-gray-100">-</button>
                                <span class="px-3 font-semibold">\${item.quantity}</span>
                                <button onclick="updateQuantity(\${index}, 1)" 
                                    class="px-3 py-2 hover:bg-gray-100">+</button>
                            </div>
                            <button onclick="removeItem(\${index})" 
                                class="text-red-500 hover:text-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                \`).join('')}
            </div>
            
            <div class="bg-gray-50 p-6 rounded-lg">
                <div class="flex justify-between mb-4">
                    <span class="text-lg">Subtotal:</span>
                    <span class="text-lg font-semibold">\${currency} \${subtotal.toFixed(2)}</span>
                </div>
                <p class="text-sm text-gray-600 mb-6">Shipping and taxes calculated at checkout</p>
                <a href="/checkout" class="btn btn-primary w-full block text-center">
                    Proceed to Checkout
                </a>
            </div>
        \`
    }
    
    function updateQuantity(index, change) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        cart[index].quantity += change
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1)
        }
        localStorage.setItem('cart', JSON.stringify(cart))
        updateCartCount()
        renderCart()
    }
    
    function removeItem(index) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        cart.splice(index, 1)
        localStorage.setItem('cart', JSON.stringify(cart))
        updateCartCount()
        renderCart()
    }
    
    renderCart()
    </script>
  `

  return c.html(layout('Shopping Cart', content))
})

// ===== CHECKOUT PAGE =====
app.get('/checkout', async (c) => {
  const regions = await c.env.DB.prepare(
    'SELECT * FROM regions WHERE is_active = 1 ORDER BY name'
  ).all()

  const content = `
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold mb-8">Checkout</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Checkout Form -->
            <div>
                <form id="checkout-form" class="space-y-6">
                    <!-- Contact Information -->
                    <div class="bg-white p-6 rounded-lg border">
                        <h2 class="text-xl font-semibold mb-4">Contact Information</h2>
                        <input type="email" name="email" required 
                            placeholder="Email address" 
                            class="w-full px-4 py-3 border rounded-lg mb-4">
                    </div>

                    <!-- Shipping Address -->
                    <div class="bg-white p-6 rounded-lg border">
                        <h2 class="text-xl font-semibold mb-4">Shipping Address</h2>
                        <div class="grid grid-cols-2 gap-4">
                            <input type="text" name="first_name" required 
                                placeholder="First Name" class="px-4 py-3 border rounded-lg">
                            <input type="text" name="last_name" required 
                                placeholder="Last Name" class="px-4 py-3 border rounded-lg">
                        </div>
                        <input type="text" name="address_line1" required 
                            placeholder="Address" class="w-full px-4 py-3 border rounded-lg mt-4">
                        <input type="text" name="address_line2" 
                            placeholder="Apartment, suite, etc. (optional)" 
                            class="w-full px-4 py-3 border rounded-lg mt-4">
                        <div class="grid grid-cols-2 gap-4 mt-4">
                            <input type="text" name="city" required 
                                placeholder="City" class="px-4 py-3 border rounded-lg">
                            <input type="text" name="state_province" required 
                                placeholder="State/Province" class="px-4 py-3 border rounded-lg">
                        </div>
                        <div class="grid grid-cols-2 gap-4 mt-4">
                            <input type="text" name="postal_code" required 
                                placeholder="Postal Code" class="px-4 py-3 border rounded-lg">
                            <select name="country_code" required id="country-select"
                                class="px-4 py-3 border rounded-lg">
                                <option value="">Select Country</option>
                                ${regions.results.map((r: any) => `
                                    <option value="${r.code}">${r.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <input type="tel" name="phone" required 
                            placeholder="Phone" class="w-full px-4 py-3 border rounded-lg mt-4">
                    </div>

                    <!-- Shipping Method -->
                    <div class="bg-white p-6 rounded-lg border">
                        <h2 class="text-xl font-semibold mb-4">Shipping Method</h2>
                        <div id="shipping-methods" class="space-y-3">
                            <p class="text-gray-500">Select a country to see shipping options</p>
                        </div>
                    </div>

                    <!-- Payment (Simplified) -->
                    <div class="bg-white p-6 rounded-lg border">
                        <h2 class="text-xl font-semibold mb-4">Payment</h2>
                        <p class="text-sm text-gray-600 mb-4">
                            <i class="fas fa-lock mr-2"></i>
                            Secure payment processing (Demo mode)
                        </p>
                        <div class="space-y-4">
                            <input type="text" placeholder="Card Number" 
                                class="w-full px-4 py-3 border rounded-lg" value="4242 4242 4242 4242" disabled>
                            <div class="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="MM/YY" 
                                    class="px-4 py-3 border rounded-lg" value="12/26" disabled>
                                <input type="text" placeholder="CVC" 
                                    class="px-4 py-3 border rounded-lg" value="123" disabled>
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-full text-lg">
                        Complete Order
                    </button>
                </form>
            </div>

            <!-- Order Summary -->
            <div>
                <div class="bg-gray-50 p-6 rounded-lg sticky top-24">
                    <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
                    <div id="order-summary" class="space-y-4"></div>
                </div>
            </div>
        </div>
    </main>

    <script>
    let shippingCost = 0
    let selectedShippingMethod = null
    
    function renderOrderSummary() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        const currency = cart[0]?.currency || 'USD'
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const tax = subtotal * 0.1 // Simplified tax calculation
        const total = subtotal + shippingCost + tax
        
        document.getElementById('order-summary').innerHTML = \`
            <div class="space-y-3 mb-4 pb-4 border-b">
                \${cart.map(item => \`
                    <div class="flex justify-between text-sm">
                        <span>\${item.product_name} (\${item.size}) x \${item.quantity}</span>
                        <span>\${currency} \${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                \`).join('')}
            </div>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span>Subtotal</span>
                    <span>\${currency} \${subtotal.toFixed(2)}</span>
                </div>
                <div class="flex justify-between">
                    <span>Shipping</span>
                    <span>\${shippingCost > 0 ? currency + ' ' + shippingCost.toFixed(2) : 'Calculated at next step'}</span>
                </div>
                <div class="flex justify-between">
                    <span>Tax (estimated)</span>
                    <span>\${currency} \${tax.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>\${currency} \${total.toFixed(2)}</span>
                </div>
            </div>
        \`
    }
    
    // Load shipping methods when country is selected
    document.getElementById('country-select').addEventListener('change', async (e) => {
        const regionCode = e.target.value
        if (!regionCode) return
        
        try {
            const response = await axios.get(\`/api/shipping/\${regionCode}\`)
            const { region, methods } = response.data
            
            const container = document.getElementById('shipping-methods')
            container.innerHTML = methods.map(method => \`
                <label class="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-black">
                    <div class="flex items-center">
                        <input type="radio" name="shipping_method" value="\${method.id}" 
                            data-cost="\${method.base_cost}"
                            class="mr-4">
                        <div>
                            <p class="font-semibold">\${method.name}</p>
                            <p class="text-sm text-gray-600">\${method.description || ''}</p>
                            <p class="text-sm text-gray-600">
                                \${method.estimated_days_min}-\${method.estimated_days_max} business days
                            </p>
                        </div>
                    </div>
                    <span class="font-semibold">\${region.currency} \${method.base_cost.toFixed(2)}</span>
                </label>
            \`).join('')
            
            // Add event listeners to shipping method radios
            document.querySelectorAll('input[name="shipping_method"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    shippingCost = parseFloat(e.target.dataset.cost)
                    selectedShippingMethod = parseInt(e.target.value)
                    renderOrderSummary()
                })
            })
        } catch (error) {
            console.error('Failed to load shipping methods', error)
        }
    })
    
    // Handle form submission
    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const formData = new FormData(e.target)
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        const currency = cart[0]?.currency || 'USD'
        
        if (!selectedShippingMethod) {
            alert('Please select a shipping method')
            return
        }
        
        const shipping_address = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address_line1: formData.get('address_line1'),
            address_line2: formData.get('address_line2'),
            city: formData.get('city'),
            state_province: formData.get('state_province'),
            postal_code: formData.get('postal_code'),
            country_code: formData.get('country_code')
        }
        
        const orderData = {
            customer_email: formData.get('email'),
            items: cart.map(item => ({
                variant_id: item.variant_id,
                quantity: item.quantity
            })),
            shipping_address,
            billing_address: shipping_address,
            shipping_method_id: selectedShippingMethod,
            currency
        }
        
        try {
            const response = await axios.post('/api/orders', orderData)
            localStorage.removeItem('cart')
            updateCartCount()
            window.location.href = \`/order-confirmation?order=\${response.data.order_number}\`
        } catch (error) {
            alert('Order failed: ' + (error.response?.data?.error || 'Please try again'))
        }
    })
    
    renderOrderSummary()
    
    // Redirect if cart is empty
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    if (cart.length === 0) {
        window.location.href = '/cart'
    }
    </script>
  `

  return c.html(layout('Checkout', content))
})

// ===== ORDER CONFIRMATION PAGE =====
app.get('/order-confirmation', async (c) => {
  const orderNumber = c.req.query('order')
  
  if (!orderNumber) {
    return c.redirect('/')
  }

  const content = `
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center mb-8">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check text-4xl text-green-600"></i>
            </div>
            <h1 class="text-4xl font-bold mb-2">Order Confirmed!</h1>
            <p class="text-xl text-gray-600">Thank you for your purchase</p>
        </div>
        
        <div class="bg-white p-8 rounded-lg border">
            <div class="mb-6">
                <p class="text-sm text-gray-600">Order Number</p>
                <p class="text-2xl font-bold">${orderNumber}</p>
            </div>
            
            <p class="text-gray-600 mb-6">
                A confirmation email has been sent to your email address. 
                You can track your order status using the order number above.
            </p>
            
            <div class="flex gap-4">
                <a href="/tracking?order=${orderNumber}" class="btn btn-primary flex-1 text-center">
                    Track Order
                </a>
                <a href="/" class="btn btn-secondary flex-1 text-center">
                    Continue Shopping
                </a>
            </div>
        </div>
    </main>
  `

  return c.html(layout('Order Confirmed', content))
})

// ===== ORDER TRACKING PAGE =====
app.get('/tracking', async (c) => {
  const content = `
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold mb-8">Track Your Order</h1>
        
        <div class="bg-white p-8 rounded-lg border mb-8">
            <form id="tracking-form" class="flex gap-4">
                <input type="text" name="order_number" required 
                    placeholder="Enter your order number (e.g., ORD-XXXXX)" 
                    class="flex-1 px-4 py-3 border rounded-lg">
                <button type="submit" class="btn btn-primary">Track</button>
            </form>
        </div>
        
        <div id="order-details" class="hidden"></div>
    </main>

    <script>
    document.getElementById('tracking-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        const orderNumber = e.target.order_number.value
        
        try {
            const response = await axios.get(\`/api/order/\${orderNumber}\`)
            const order = response.data
            
            const statusColors = {
                pending: 'bg-yellow-100 text-yellow-800',
                processing: 'bg-blue-100 text-blue-800',
                shipped: 'bg-purple-100 text-purple-800',
                delivered: 'bg-green-100 text-green-800',
                cancelled: 'bg-red-100 text-red-800'
            }
            
            document.getElementById('order-details').innerHTML = \`
                <div class="bg-white p-8 rounded-lg border">
                    <div class="mb-6">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <p class="text-sm text-gray-600">Order Number</p>
                                <p class="text-2xl font-bold">\${order.order_number}</p>
                            </div>
                            <span class="px-4 py-2 rounded-lg font-semibold \${statusColors[order.status]}">
                                \${order.status.toUpperCase()}
                            </span>
                        </div>
                        
                        \${order.tracking_number ? \`
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <p class="text-sm font-semibold mb-2">Tracking Number</p>
                                <p class="font-mono">\${order.tracking_number}</p>
                                \${order.tracking_url ? \`
                                    <a href="\${order.tracking_url}" target="_blank" 
                                        class="text-blue-600 hover:underline text-sm mt-2 inline-block">
                                        Track with carrier <i class="fas fa-external-link-alt ml-1"></i>
                                    </a>
                                \` : ''}
                            </div>
                        \` : ''}
                    </div>
                    
                    <div class="border-t pt-6">
                        <h3 class="font-semibold text-lg mb-4">Order Items</h3>
                        <div class="space-y-4">
                            \${order.items.map(item => \`
                                <div class="flex justify-between">
                                    <div>
                                        <p class="font-semibold">\${item.product_name}</p>
                                        <p class="text-sm text-gray-600">
                                            Size: \${item.size} | Color: \${item.color} | Qty: \${item.quantity}
                                        </p>
                                    </div>
                                    <p class="font-semibold">\${order.currency} \${item.total_price.toFixed(2)}</p>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                    
                    <div class="border-t pt-6 mt-6">
                        <div class="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span>\${order.currency} \${order.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="border-t pt-6 mt-6">
                        <h3 class="font-semibold mb-3">Shipping Address</h3>
                        <p class="text-gray-600">
                            \${order.shipping_address.first_name} \${order.shipping_address.last_name}<br>
                            \${order.shipping_address.address_line1}<br>
                            \${order.shipping_address.address_line2 ? order.shipping_address.address_line2 + '<br>' : ''}
                            \${order.shipping_address.city}, \${order.shipping_address.state_province} \${order.shipping_address.postal_code}<br>
                            \${order.shipping_address.country_code}
                        </p>
                    </div>
                </div>
            \`
            document.getElementById('order-details').classList.remove('hidden')
        } catch (error) {
            alert('Order not found. Please check your order number.')
        }
    })
    
    // Auto-load if order number in URL
    const urlParams = new URLSearchParams(window.location.search)
    const orderParam = urlParams.get('order')
    if (orderParam) {
        document.querySelector('input[name="order_number"]').value = orderParam
        document.getElementById('tracking-form').dispatchEvent(new Event('submit'))
    }
    </script>
  `

  return c.html(layout('Track Order', content))
})

// ===== FAQ PAGE =====
app.get('/faq', (c) => {
  const faqs = [
    {
      q: 'When do you restock sold-out items?',
      a: 'Most items are limited edition and won\'t be restocked. However, you can sign up for restock notifications on product pages.'
    },
    {
      q: 'How do drops work?',
      a: 'We release new collections (drops) periodically. Each drop is available for a limited time or until sold out. Subscribe to our newsletter to get notified.'
    },
    {
      q: 'What are your shipping times?',
      a: 'Shipping times vary by location. US orders typically arrive in 5-7 business days. International orders take 7-14 business days.'
    },
    {
      q: 'Do you ship internationally?',
      a: 'Yes! We ship to most countries worldwide. Shipping costs and delivery times vary by destination.'
    },
    {
      q: 'What about customs and duties?',
      a: 'For US, EU, UK, and CA, duties and taxes are included. For other regions, you may be responsible for customs fees.'
    },
    {
      q: 'How does sizing work?',
      a: 'We provide detailed size guides on each product page. Most items run true to size unless otherwise noted.'
    },
    {
      q: 'What is your return policy?',
      a: '30-day returns for unworn items with original tags. Customer pays return shipping unless item is defective.'
    }
  ]

  const content = `
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
        
        <div class="space-y-4">
            ${faqs.map((faq, idx) => `
                <div class="bg-white p-6 rounded-lg border">
                    <button class="flex justify-between items-center w-full text-left"
                        onclick="this.nextElementSibling.classList.toggle('hidden')">
                        <h3 class="font-semibold text-lg pr-8">${faq.q}</h3>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <p class="text-gray-600 mt-4 ${idx === 0 ? '' : 'hidden'}">${faq.a}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="mt-12 bg-gray-50 p-8 rounded-lg text-center">
            <h2 class="text-2xl font-bold mb-4">Still have questions?</h2>
            <p class="text-gray-600 mb-6">Contact our support team</p>
            <a href="/contact" class="btn btn-primary inline-block">Contact Us</a>
        </div>
    </main>
  `

  return c.html(layout('FAQ', content))
})

// ===== ALL PRODUCTS PAGE =====
app.get('/products', async (c) => {
  const products = await c.env.DB.prepare(`
    SELECT p.*, 
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
      (SELECT MIN(base_price + price_adjustment) FROM product_variants WHERE product_id = p.id) as min_price,
      (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id) as total_stock
    FROM products p
    WHERE p.is_active = 1
    ORDER BY p.created_at DESC
  `).all()

  const content = `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold mb-8">All Products</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${products.results.map((product: any) => `
                <a href="/product/${product.slug}" class="product-card group">
                    <div class="relative overflow-hidden">
                        <img src="${product.primary_image || '/static/images/placeholder.jpg'}" 
                            alt="${product.name}" 
                            class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300">
                        ${product.total_stock === 0 ? `
                            <div class="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 text-sm font-semibold rounded">
                                SOLD OUT
                            </div>
                        ` : product.total_stock <= 20 ? `
                            <div class="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 text-sm font-semibold rounded">
                                LOW STOCK
                            </div>
                        ` : ''}
                    </div>
                    <div class="p-4">
                        <h3 class="font-semibold text-lg mb-2">${product.name}</h3>
                        <p class="text-gray-600 text-sm mb-2">${product.category || ''}</p>
                        <p class="font-bold">USD ${product.min_price?.toFixed(2) || product.base_price?.toFixed(2)}</p>
                    </div>
                </a>
            `).join('')}
        </div>
    </main>
  `

  return c.html(layout('All Products', content))
})

export default app
