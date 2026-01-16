import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import type { Bindings } from './types'

const admin = new Hono<{ Bindings: Bindings }>()

// Basic auth middleware (username: admin, password: admin123)
// In production, use proper authentication
admin.use('/*', basicAuth({
  username: 'admin',
  password: 'admin123',
  realm: 'Admin Dashboard'
}))

// ===== ADMIN DASHBOARD HOME =====
admin.get('/', async (c) => {
  const stats = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as count FROM products').first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM orders').first(),
    c.env.DB.prepare('SELECT SUM(total_amount) as total FROM orders WHERE payment_status = ?').bind('paid').first(),
    c.env.DB.prepare('SELECT COUNT(*) as count FROM email_subscribers').first(),
  ])

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="min-h-screen">
        <!-- Header -->
        <header class="bg-white border-b">
            <div class="px-6 py-4">
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold">Admin Dashboard</h1>
                    <div class="flex items-center gap-4">
                        <a href="/" target="_blank" class="text-blue-600 hover:underline">
                            <i class="fas fa-external-link-alt mr-2"></i>View Site
                        </a>
                    </div>
                </div>
            </div>
        </header>

        <div class="flex">
            <!-- Sidebar -->
            <aside class="w-64 bg-white border-r min-h-screen">
                <nav class="p-4">
                    <a href="/admin" class="block px-4 py-3 rounded-lg bg-gray-100 font-semibold mb-2">
                        <i class="fas fa-home mr-3"></i>Dashboard
                    </a>
                    <a href="/admin/drops" class="block px-4 py-3 rounded-lg hover:bg-gray-100 mb-2">
                        <i class="fas fa-fire mr-3"></i>Drops
                    </a>
                    <a href="/admin/products" class="block px-4 py-3 rounded-lg hover:bg-gray-100 mb-2">
                        <i class="fas fa-box mr-3"></i>Products
                    </a>
                    <a href="/admin/orders" class="block px-4 py-3 rounded-lg hover:bg-gray-100 mb-2">
                        <i class="fas fa-shopping-cart mr-3"></i>Orders
                    </a>
                    <a href="/admin/subscribers" class="block px-4 py-3 rounded-lg hover:bg-gray-100 mb-2">
                        <i class="fas fa-envelope mr-3"></i>Subscribers
                    </a>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 p-8">
                <h2 class="text-3xl font-bold mb-8">Overview</h2>
                
                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg border">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Products</p>
                                <p class="text-3xl font-bold mt-2">${stats[0]?.count || 0}</p>
                            </div>
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-box text-blue-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg border">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Orders</p>
                                <p class="text-3xl font-bold mt-2">${stats[1]?.count || 0}</p>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-shopping-cart text-green-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg border">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Revenue</p>
                                <p class="text-3xl font-bold mt-2">$${(stats[2]?.total || 0).toFixed(0)}</p>
                            </div>
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-dollar-sign text-purple-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg border">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Subscribers</p>
                                <p class="text-3xl font-bold mt-2">${stats[3]?.count || 0}</p>
                            </div>
                            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-envelope text-orange-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white p-6 rounded-lg border">
                    <h3 class="text-xl font-bold mb-4">Quick Actions</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a href="/admin/drops/new" class="block p-4 border-2 border-dashed rounded-lg hover:border-blue-500 text-center">
                            <i class="fas fa-plus-circle text-3xl text-blue-500 mb-2"></i>
                            <p class="font-semibold">Create New Drop</p>
                        </a>
                        <a href="/admin/products/new" class="block p-4 border-2 border-dashed rounded-lg hover:border-green-500 text-center">
                            <i class="fas fa-plus-circle text-3xl text-green-500 mb-2"></i>
                            <p class="font-semibold">Add New Product</p>
                        </a>
                        <a href="/admin/orders" class="block p-4 border-2 border-dashed rounded-lg hover:border-purple-500 text-center">
                            <i class="fas fa-list text-3xl text-purple-500 mb-2"></i>
                            <p class="font-semibold">View Orders</p>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    </div>
</body>
</html>
  `

  return c.html(html)
})

// ===== ADMIN DROPS LIST =====
admin.get('/drops', async (c) => {
  const drops = await c.env.DB.prepare(`
    SELECT d.*, 
      (SELECT COUNT(*) FROM products WHERE drop_id = d.id) as product_count
    FROM drops d
    ORDER BY d.created_at DESC
  `).all()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Drops - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="p-8">
        <div class="flex justify-between items-center mb-8">
            <div>
                <a href="/admin" class="text-blue-600 hover:underline mb-2 inline-block">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                </a>
                <h1 class="text-3xl font-bold">Manage Drops</h1>
            </div>
            <a href="/admin/drops/new" class="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
                <i class="fas fa-plus mr-2"></i>Create New Drop
            </a>
        </div>

        <div class="bg-white rounded-lg border">
            <table class="w-full">
                <thead class="border-b">
                    <tr class="text-left">
                        <th class="p-4 font-semibold">Name</th>
                        <th class="p-4 font-semibold">Status</th>
                        <th class="p-4 font-semibold">Launch Date</th>
                        <th class="p-4 font-semibold">Products</th>
                        <th class="p-4 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${drops.results.map((drop: any) => `
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-4">
                                <div class="font-semibold">${drop.name}</div>
                                <div class="text-sm text-gray-600">${drop.slug}</div>
                            </td>
                            <td class="p-4">
                                <span class="px-3 py-1 rounded-full text-sm font-semibold ${
                                  drop.status === 'current' ? 'bg-green-100 text-green-800' :
                                  drop.status === 'coming_soon' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }">
                                    ${drop.status}
                                </span>
                            </td>
                            <td class="p-4 text-sm">${drop.launch_date ? new Date(drop.launch_date).toLocaleDateString() : 'N/A'}</td>
                            <td class="p-4">${drop.product_count}</td>
                            <td class="p-4">
                                <a href="/drop/${drop.slug}" target="_blank" class="text-blue-600 hover:underline mr-4">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="/admin/drops/${drop.id}/edit" class="text-gray-600 hover:text-black">
                                    <i class="fas fa-edit"></i>
                                </a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
  `

  return c.html(html)
})

// ===== ADMIN ORDERS LIST =====
admin.get('/orders', async (c) => {
  const orders = await c.env.DB.prepare(`
    SELECT * FROM orders 
    ORDER BY created_at DESC 
    LIMIT 50
  `).all()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orders - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="p-8">
        <div class="mb-8">
            <a href="/admin" class="text-blue-600 hover:underline mb-2 inline-block">
                <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
            </a>
            <h1 class="text-3xl font-bold">Orders</h1>
        </div>

        <div class="bg-white rounded-lg border">
            <table class="w-full">
                <thead class="border-b">
                    <tr class="text-left">
                        <th class="p-4 font-semibold">Order #</th>
                        <th class="p-4 font-semibold">Customer</th>
                        <th class="p-4 font-semibold">Total</th>
                        <th class="p-4 font-semibold">Status</th>
                        <th class="p-4 font-semibold">Payment</th>
                        <th class="p-4 font-semibold">Date</th>
                        <th class="p-4 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.results.map((order: any) => `
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-4 font-mono text-sm">${order.order_number}</td>
                            <td class="p-4">${order.customer_email}</td>
                            <td class="p-4 font-semibold">${order.currency} ${order.total_amount.toFixed(2)}</td>
                            <td class="p-4">
                                <span class="px-3 py-1 rounded-full text-sm font-semibold ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }">
                                    ${order.status}
                                </span>
                            </td>
                            <td class="p-4">
                                <span class="px-3 py-1 rounded-full text-sm font-semibold ${
                                  order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                  order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }">
                                    ${order.payment_status}
                                </span>
                            </td>
                            <td class="p-4 text-sm">${new Date(order.created_at).toLocaleDateString()}</td>
                            <td class="p-4">
                                <a href="/admin/orders/${order.id}" class="text-blue-600 hover:underline">
                                    View Details
                                </a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            ${orders.results.length === 0 ? `
                <div class="p-12 text-center text-gray-500">
                    <i class="fas fa-shopping-cart text-4xl mb-4"></i>
                    <p>No orders yet</p>
                </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
  `

  return c.html(html)
})

// ===== ADMIN SUBSCRIBERS LIST =====
admin.get('/subscribers', async (c) => {
  const subscribers = await c.env.DB.prepare(`
    SELECT * FROM email_subscribers 
    WHERE is_active = 1
    ORDER BY subscribed_at DESC
  `).all()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscribers - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="p-8">
        <div class="mb-8">
            <a href="/admin" class="text-blue-600 hover:underline mb-2 inline-block">
                <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
            </a>
            <h1 class="text-3xl font-bold">Email Subscribers</h1>
            <p class="text-gray-600 mt-2">Total: ${subscribers.results.length} subscribers</p>
        </div>

        <div class="bg-white rounded-lg border">
            <table class="w-full">
                <thead class="border-b">
                    <tr class="text-left">
                        <th class="p-4 font-semibold">Email</th>
                        <th class="p-4 font-semibold">Name</th>
                        <th class="p-4 font-semibold">Source</th>
                        <th class="p-4 font-semibold">Subscribed Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${subscribers.results.map((sub: any) => `
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-4">${sub.email}</td>
                            <td class="p-4">${sub.name || '-'}</td>
                            <td class="p-4 text-sm">${sub.source || 'website'}</td>
                            <td class="p-4 text-sm">${new Date(sub.subscribed_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            ${subscribers.results.length === 0 ? `
                <div class="p-12 text-center text-gray-500">
                    <i class="fas fa-envelope text-4xl mb-4"></i>
                    <p>No subscribers yet</p>
                </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
  `

  return c.html(html)
})

// ===== ADMIN PRODUCTS LIST =====
admin.get('/products', async (c) => {
  const products = await c.env.DB.prepare(`
    SELECT p.*, 
      (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id) as total_stock,
      (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variant_count,
      d.name as drop_name
    FROM products p
    LEFT JOIN drops d ON p.drop_id = d.id
    ORDER BY p.created_at DESC
  `).all()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="p-8">
        <div class="flex justify-between items-center mb-8">
            <div>
                <a href="/admin" class="text-blue-600 hover:underline mb-2 inline-block">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                </a>
                <h1 class="text-3xl font-bold">Products</h1>
            </div>
            <a href="/admin/products/new" class="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
                <i class="fas fa-plus mr-2"></i>Add Product
            </a>
        </div>

        <div class="bg-white rounded-lg border">
            <table class="w-full">
                <thead class="border-b">
                    <tr class="text-left">
                        <th class="p-4 font-semibold">Product</th>
                        <th class="p-4 font-semibold">Drop</th>
                        <th class="p-4 font-semibold">Category</th>
                        <th class="p-4 font-semibold">Price</th>
                        <th class="p-4 font-semibold">Stock</th>
                        <th class="p-4 font-semibold">Variants</th>
                        <th class="p-4 font-semibold">Status</th>
                        <th class="p-4 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.results.map((product: any) => `
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-4">
                                <div class="font-semibold">${product.name}</div>
                                <div class="text-sm text-gray-600">${product.slug}</div>
                            </td>
                            <td class="p-4 text-sm">${product.drop_name || '-'}</td>
                            <td class="p-4 text-sm">${product.category || '-'}</td>
                            <td class="p-4 font-semibold">${product.currency} ${product.base_price.toFixed(2)}</td>
                            <td class="p-4">
                                <span class="${product.total_stock === 0 ? 'text-red-600' : product.total_stock <= 20 ? 'text-orange-600' : 'text-green-600'} font-semibold">
                                    ${product.total_stock || 0}
                                </span>
                            </td>
                            <td class="p-4">${product.variant_count}</td>
                            <td class="p-4">
                                <span class="px-3 py-1 rounded-full text-sm font-semibold ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                    ${product.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td class="p-4">
                                <a href="/product/${product.slug}" target="_blank" class="text-blue-600 hover:underline mr-4">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="/admin/products/${product.id}/edit" class="text-gray-600 hover:text-black">
                                    <i class="fas fa-edit"></i>
                                </a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
  `

  return c.html(html)
})

export default admin
