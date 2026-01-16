#!/bin/bash

echo "🚀 DROP Brand Deployment Script"
echo "================================"
echo ""

# Check if wrangler is authenticated
echo "📋 Step 1: Checking Wrangler authentication..."
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo "❌ Not authenticated. Please run: npx wrangler login"
    exit 1
fi
echo "✅ Authenticated"
echo ""

# Create D1 database
echo "📋 Step 2: Creating production D1 database..."
echo "Note: If database already exists, this will fail (that's OK)"
npx wrangler d1 create webapp-production
echo ""

# Prompt for database ID
echo "📋 Step 3: Update wrangler.jsonc"
echo "Please update the database_id in wrangler.jsonc with the ID from above"
echo "Press Enter when ready to continue..."
read

# Apply migrations
echo "📋 Step 4: Applying migrations to production database..."
npm run db:migrate:prod
if [ $? -ne 0 ]; then
    echo "❌ Migration failed. Check your database_id in wrangler.jsonc"
    exit 1
fi
echo "✅ Migrations applied"
echo ""

# Build project
echo "📋 Step 5: Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build complete"
echo ""

# Deploy
echo "📋 Step 6: Deploying to Cloudflare Pages..."
npm run deploy:prod
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi
echo ""

echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "Your site should be live at: https://webapp.pages.dev"
echo ""
echo "Next steps:"
echo "1. Visit your site and test functionality"
echo "2. Set up custom domain (optional)"
echo "3. Configure email services (optional)"
echo "4. Set up Stripe for payments (optional)"
echo ""
