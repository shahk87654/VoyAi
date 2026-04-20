# Stripe Setup Guide for VoyAI

Complete step-by-step guide to configure Stripe for VoyAI's paywall system.

## Prerequisites
- VoyAI app is deployed or running locally
- Stripe account created at [stripe.com](https://stripe.com)

## ✅ Step 1: Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test Mode** (toggle in top-right)
3. Navigate to **Developers** → **API Keys**
4. Copy the following keys:
   - **Secret Key** (starts with `sk_test_...` or `sk_live_...`)
   - **Publishable Key** (starts with `pk_test_...` or `pk_live_...`)

Store these temporarily - you'll need them in Step 4.

---

## ✅ Step 2: Create Products & Prices

### Create Pro Plan Product

1. Go to **Products** in left sidebar
2. Click **+ Create Product**
3. Fill in:
   - **Name**: `Pro`
   - **Description**: `Unlimited AI planning, PDF export, trip sharing`
   - **Price**: `$19.00`
   - **Billing period**: `Month`
   - Click **Save product**
4. **Copy the Price ID** (format: `price_1ABC...`)

### Create Teams Plan Product

Repeat the above with:
   - **Name**: `Teams`
   - **Description**: `Everything in Pro + team collaboration, analytics`
   - **Price**: `$49.00`
   - **Billing period**: `Month`
4. **Copy the Price ID** (format: `price_1ABC...`)

---

## ✅ Step 3: Create Webhook Endpoint

1. Navigate to **Developers** → **Webhooks** 
2. Click **+ Add Endpoint**
3. Fill in:
   - **URL**: `https://yourapp.com/api/stripe/webhook`
     - For local testing: Use [ngrok](https://ngrok.com) to expose local server
     - Example: `https://abc123.ngrok.io/api/stripe/webhook`
   - **API version**: Leave as default
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. Click **Add Endpoint**
6. On the webhook details page, **copy the Signing Secret** (format: `whsec_...`)

---

## ✅ Step 4: Update Environment Variables

Update `.env.local` with all the values from steps 1-3:

```env
# Stripe - Test Mode Keys
STRIPE_SECRET_KEY=sk_test_51ABC...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...
STRIPE_WEBHOOK_SECRET=whsec_1ABC...

# Stripe Plan Price IDs
STRIPE_PRO_PRICE_ID=price_1ABC123456789...
STRIPE_TEAMS_PRICE_ID=price_1DEF987654321...
```

**⚠️ Important**:
- For **development**: Use test keys (`sk_test_*`, `pk_test_*`)
- For **production**: Replace with live keys (`sk_live_*`, `pk_live_*`)
- Never commit real API keys to git!

---

## ✅ Step 5: Test Locally (Optional)

### Use Stripe CLI for Webhook Testing

1. **Install Stripe CLI**: 
   - [Download](https://stripe.com/docs/stripe-cli)
   - Or via homebrew: `brew install stripe/stripe-cli/stripe`

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Trigger test events**:
   ```bash
   # Test checkout completion
   stripe trigger checkout.session.completed
   
   # Test subscription updates
   stripe trigger customer.subscription.updated
   ```

### Test in App

1. Start VoyAI: `npm run dev`
2. Navigate to `/dashboard/settings`
3. Click "Upgrade to Pro"
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
5. Complete checkout
6. **Verify in Stripe Dashboard**:
   - Check **Payments** section
   - Verify webhook received in **Webhooks** section

---

## ✅ Step 6: Deploy to Production

When ready to launch:

1. **Create live Stripe account**
2. **Switch to Live Mode** in Stripe Dashboard
3. **Create new products & prices** (or upgrade test products to live)
4. **Create new webhook endpoint** with live domain
5. **Update `.env` in production** with live keys:
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRO_PRICE_ID=price_...
   STRIPE_TEAMS_PRICE_ID=price_...
   ```
6. Deploy to Vercel/hosting with new env vars
7. Monitor webhook logs for errors

---

## 🧪 Testing Checklist

### Checkout Flow
- [ ] Free user sees "Upgrade" button in settings
- [ ] Clicking upgrade redirects to Stripe checkout
- [ ] Can complete payment with test card
- [ ] Payment appears in Stripe Dashboard
- [ ] User plan updates to "Pro" after payment

### Webhook Processing
- [ ] Webhook received in Stripe logs
- [ ] User subscription updated in database
- [ ] User can now access Pro features
- [ ] AI plan limits removed
- [ ] PDF export available
- [ ] Trip sharing available

### Subscription Changes
- [ ] User can view current plan in settings
- [ ] Usage statistics display correctly
- [ ] Subscription cancellation handled

---

## 🐛 Troubleshooting

### Webhook Not Received
- Check webhook URL is correct and HTTPS
- Verify Stripe IP is whitelisted
- Check firewall/security groups

### Payment Processing Fails
- Verify price IDs match in `.env` files
- Check Stripe products are created correctly
- Ensure webhook secret is correct

### User Plan Not Updating
- Check webhook logs for errors
- Verify `aiPlansThisMonth` and `tripsThisMonth` are updating
- Check user table in database

### Test Mode Issues
- Verify using `sk_test_` and `pk_test_` keys
- Check Stripe Dashboard is in Test Mode
- Try different test cards from [Stripe docs](https://stripe.com/docs/testing)

---

## 📚 References

- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Stripe Testing](https://stripe.com/docs/testing)

---

**Next**: After setup, run integration tests to verify everything works!
