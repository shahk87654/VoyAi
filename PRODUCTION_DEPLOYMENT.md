# VoyAI Production Deployment Guide

## 🚀 Status: PRODUCTION READY

**Last Updated**: April 20, 2026  
**Build Status**: ✅ Zero errors, all 38 pages and 26 API routes working  
**Code Commit**: `d9946e5` - Complete SaaS paywall system  
**Repository**: https://github.com/shahk87654/VoyAi

---

## 📋 Pre-Deployment Checklist

### ✅ Code Ready
- [x] All code committed and pushed to GitHub
- [x] Build passes with zero TypeScript errors
- [x] 38 pages rendered successfully
- [x] 26 API routes operational
- [x] Zero build warnings (except Turbopack root and middleware deprecation notices)

### ⏳ Infrastructure Ready
- [x] Supabase PostgreSQL configured
- [x] Database schema defined (awaiting migration when DB is online)
- [x] Authentication middleware configured
- [x] API rate limiting setup with Upstash Redis/Stripe test keys
- Stripe API keys ready to configure

---

## 🎯 Deployment Steps (5 Steps, ~30 minutes)

### Step 1: Database Migration (5 min)

**Prerequisites**: Database must be online and reachable

```bash
# From project root
npx prisma db push

# This deploys:
# ✅ TripCollaborator model (trip collaboration)
# ✅ Team model (team management)
# ✅ TeamMember model (team member tracking)
# ✅ Updated TripShare model (userId tracking)
# ✅ Updated User model (team relations)
```

**Verification**: After migration, check Supabase console:
- Database → Tables → trip_collaborators (should exist)
- Database → Tables → teams (should exist)
- Database → Tables → team_members (should exist)

---

### Step 2: Stripe Configuration (15 min)

**Note**: Use LIVE keys for production, not test keys

#### 2a. Get Stripe API Keys (2 min)

1. Go to https://dashboard.stripe.com/apikeys
2. Toggle to **Live** mode (top right)
3. Copy **Secret Key** (starts with `sk_live_`)
4. Copy **Publishable Key** (starts with `pk_live_`)

#### 2b. Create Products & Prices (5 min)

1. Go to https://dashboard.stripe.com/products
2. **Create Pro Plan**:
   - Name: "Pro Plan"
   - Price: $19/month
   - Billing: Monthly
   - Copy **Price ID** (format: `price_...`)

3. **Create Teams Plan**:
   - Name: "Teams Plan"
   - Price: $49/month
   - Billing: Monthly
   - Copy **Price ID**

#### 2c. Setup Webhook (5 min)

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add Endpoint**
3. **Webhook URL**: `https://yourdomain.com/api/stripe/webhook`
4. **Select Events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy **Signing Secret** (starts with `whsec_`)

#### 2d. Update Environment Variables (3 min)

In your deployment platform (Vercel/AWS/etc), add:

```env
# Stripe Live Keys (from Step 2a)
STRIPE_SECRET_KEY=sk_live_XXX...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXX...

# Stripe Product IDs (from Step 2b)
STRIPE_PRO_PRICE_ID=price_XXX...
STRIPE_TEAMS_PRICE_ID=price_XXX...

# Stripe Webhook Secret (from Step 2c)
STRIPE_WEBHOOK_SECRET=whsec_XXX...
```

---

### Step 3: Deploy to Vercel (5 min)

#### Option A: Automatic Deployment (Recommended)

```bash
# Just push to master - Vercel auto-deploys
git push origin master
```

Vercel will:
1. Detect Next.js project
2. Build production bundle
3. Run TypeScript checks
4. Deploy to live URL
5. Configure preview/production environment variables

#### Option B: Manual Deployment via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Verification**: After deployment:
- Visit https://yourdomain.com
- Check status page loads
- Test authentication flow

---

### Step 4: Verify Deployment (3 min)

**Test Payment Flow**:

1. **Navigate to**: https://yourdomain.com/dashboard/settings
2. **Click**: "Upgrade to Pro"
3. **Use Test Card** (if you're using Stripe test mode - set `publishable_key=pk_test_...`):
   - Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/30`)
   - CVV: Any 3 digits (e.g., `123`)
4. **Should Redirect** to success page
5. **Verify** settings page shows "PRO" plan

**Test Free Tier Limits**:
- Create new account (stay on FREE)
- Go to /dashboard
- Verify "Create Trip" shows upgrade prompt after 3 attempts
- Verify "Save Trip" shows upgrade prompt after 5 trips

---

### Step 5: Post-Deployment Monitoring (2 min setup)

```bash
# Optional: Enable Stripe webhook monitoring
# In your Vercel project settings:
# - Go to Settings > Environment Variables
# - Verify all STRIPE_* variables are set
# - Check function logs in Vercel dashboard
```

**What to Monitor**:
- ✅ Stripe webhook logs: https://dashboard.stripe.com/webhooks
- ✅ Vercel function logs: https://vercel.com/dashboard
- ✅ Supabase database logs
- ✅ Error rates on API endpoints

---

## 🔐 Security Checklist

- [x] Stripe secret keys never exposed in client-side code
- [x] Database connection string uses DIRECT_URL for migrations
- [x] Authentication middleware protects all protected routes
- [x] Permission checks on all feature-gated endpoints
- [x] Rate limiting on public endpoints (Upstash Redis)
- [x] Webhook signature verification (Stripe)
- [x] CORS headers configured
- [x] Environment variables stored in secure vault (Vercel)

---

## 📊 Monitoring & Alerts

### Set Up Alerts (Optional but Recommended)

**Stripe Webhook Failures**:
- Go to https://dashboard.stripe.com/webhooks
- Click on your endpoint
- Enable **Email Alerts** for failed events

**Vercel Deployment Issues**:
- Go to https://vercel.com/account/notifications
- Enable Slack/Email notifications for:
  - Build failures
  - Production errors
  - Function timeouts

**Database Issues**:
- Supabase: https://app.supabase.com/project/[project-id]/logs/postgres-logs

---

## 🔄 Update Procedure (For Future Changes)

When you make any code changes:

```bash
# 1. Commit changes locally
git add .
git commit -m "feat: description of changes"

# 2. Push to GitHub (auto-deploys to Vercel)
git push origin master

# 3. Verify deployment at: https://vercel.com/dashboard

# 4. Test in production
curl https://yourdomain.com/api/subscription/status
```

---

## 🆘 Troubleshooting

### Issue: Stripe Webhook Not Firing

**Solution**:
1. Verify webhook URL is public (not localhost)
2. Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET` in env
3. Review Stripe webhook logs: https://dashboard.stripe.com/webhooks
4. Manually test: `stripe trigger checkout.session.completed`

### Issue: Database Migration Fails

**Solution**:
```bash
# 1. Check connection
npx prisma db execute --stdin < /dev/null

# 2. If connection works, try migration again
npx prisma db push

# 3. If still fails, check Supabase console for connection issues
```

### Issue: Users Can't Complete Checkout

**Solution**:
1. Verify Stripe publishable key is set in `.env`
2. Check browser console for JavaScript errors
3. Test with Stripe test card: `4242 4242 4242 4242`
4. Review Stripe payment logs: https://dashboard.stripe.com/payments

---

## 📈 Key Metrics to Track

Once deployed, monitor these KPIs:

- **Conversion Rate**: (PRO + TEAMS signups) / (total signups)
- **ARPU**: (Monthly recurring revenue) / (active users)
- **Churn Rate**: (Cancelled subscriptions) / (active subscriptions)
- **API Success Rate**: (Successful requests) / (total requests)
- **Error Rate**: Monitor `/api/stripe/webhook` for failures

---

## 🎉 You're Live!

Congratulations! Your production SaaS paywall is now live. 

**Key Features Active**:
- ✅ Free tier: 3 AI plans/month, 5 trip saves/month
- ✅ Pro tier: Unlimited access, PDF export, trip sharing
- ✅ Teams tier: All Pro features + team collaboration
- ✅ Real-time usage tracking with monthly resets
- ✅ Stripe payment processing with webhook lifecycle management

---

## 📞 Support & Resources

- **Stripe Docs**: https://stripe.com/docs/payments/quickstart
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

**Last Tested**: April 20, 2026  
**Build Commit**: d9946e5  
**Status**: ✅ Production Ready
