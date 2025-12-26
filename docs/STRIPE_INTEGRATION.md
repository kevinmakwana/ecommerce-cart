# Stripe Payment Integration

Complete guide for integrating Stripe payments in the E-commerce Shopping Cart application.

## Overview

The application uses **Stripe Checkout** for secure payment processing. All payment handling is managed by Stripe, ensuring PCI compliance and secure transactions.

## How It Works

1. **User adds products to cart**
   - Products stored in `cart_items` table
   - Stock validation on each add

2. **User proceeds to checkout**
   - Click "Proceed to Checkout" button
   - Application creates Stripe Checkout session

3. **Stripe Checkout Page**
   - User redirected to Stripe-hosted checkout page
   - Enters payment information securely
   - Stripe handles all payment processing

4. **Payment Success**
   - Stripe redirects back to application
   - Webhook creates order in database
   - Cart items cleared automatically
   - Stock quantities decremented
   - Email notification sent to admin

5. **Order Confirmation**
   - User sees success page with order details
   - Order visible in user's order history
   - Admin receives email notification

---

## Test Cards

Use these test cards in development:

| Card Number | Brand | Scenario |
|-------------|-------|----------|
| `4242 4242 4242 4242` | Visa | ✅ **Success** (always succeeds) |
| `4000 0025 0000 3155` | Visa | ✅ **3D Secure** (requires authentication) |
| `4000 0000 0000 9995` | Visa | ❌ **Declined** (insufficient funds) |
| `4000 0000 0000 0002` | Visa | ❌ **Declined** (generic decline) |
| `4000 0000 0000 9979` | Visa | ❌ **Declined** (stolen card) |

**Additional Test Details:**
- **Expiry Date:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any valid postal code (e.g., 12345)

---

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Stripe API Keys (Test Mode)
STRIPE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Getting Your Keys:**

1. Sign up at [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Navigate to **Developers → API Keys**
3. Copy **Publishable key** (starts with `pk_test_`)
4. Copy **Secret key** (starts with `sk_test_`)

---

## Webhook Configuration

Webhooks are essential for processing payments asynchronously. They allow Stripe to notify your application when payment events occur.

### Local Development Webhooks

#### Method 1: Using Stripe CLI (Recommended)

The setup script automatically installs Stripe CLI. To set it up manually:

**1. Install Stripe CLI:**

macOS:
```bash
brew install stripe/stripe-cli/stripe
```

Linux:
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
tar -xzf stripe_linux_amd64.tar.gz
sudo mv stripe /usr/local/bin/
```

Windows:
```bash
scoop install stripe
```

**2. Login to Stripe:**

```bash
stripe login
```

This opens your browser for authentication.

**3. Forward Webhooks:**

```bash
stripe listen --forward-to localhost:8000/stripe/webhook
```

**4. Get Webhook Secret:**

The CLI displays a webhook secret like:
```
whsec_xxxxxxxxxxxxxxxxxxxxx
```

**5. Update Environment:**

Add the secret to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

**6. Keep CLI Running:**

Leave the terminal open with `stripe listen` running while developing.

#### Method 2: Using start-with-webhooks.sh Script

Automated script that starts the application with webhook forwarding:

```bash
./start-with-webhooks.sh
```

This script:
1. Starts Docker containers
2. Starts webhook listener
3. Starts development server

### Production Webhooks

**1. Create Webhook Endpoint:**

In Stripe Dashboard:
- Navigate to **Developers → Webhooks**
- Click **Add endpoint**
- Enter URL: `https://yourdomain.com/stripe/webhook`
- Select events:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

**2. Get Webhook Secret:**

- After creating endpoint, click to reveal **Signing secret**
- Copy the secret (starts with `whsec_`)

**3. Update Production Environment:**

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## Webhook Events

The application handles these Stripe webhook events:

### checkout.session.completed

**Triggered:** When customer completes checkout

**Handler:** `app/Http/Controllers/StripeWebhookController.php`

**Actions:**
1. Retrieves checkout session data
2. Creates order in database
3. Creates order items from session line items
4. Decrements product stock
5. Clears user's cart
6. Sends email notification to admin

### payment_intent.succeeded

**Triggered:** When payment is successfully processed

**Handler:** Logged for confirmation

### payment_intent.payment_failed

**Triggered:** When payment fails

**Handler:** Logged for troubleshooting

---

## Code Implementation

### Creating Checkout Session

**Controller:** `app/Http/Controllers/CheckoutController.php`

```php
public function createCheckoutSession(Request $request)
{
    $cartItems = CartItem::where('user_id', Auth::id())->with('product')->get();
    
    $lineItems = $cartItems->map(function ($cartItem) {
        return [
            'price_data' => [
                'currency' => 'usd',
                'product_data' => [
                    'name' => $cartItem->product->name,
                ],
                'unit_amount' => $cartItem->product->price * 100,
            ],
            'quantity' => $cartItem->quantity,
        ];
    })->toArray();

    $session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => $lineItems,
        'mode' => 'payment',
        'success_url' => route('checkout.success') . '?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => route('checkout.cancel'),
        'client_reference_id' => (string) Auth::id(),
    ]);

    return Inertia::location($session->url);
}
```

### Handling Webhooks

**Controller:** `app/Http/Controllers/StripeWebhookController.php`

```php
public function handleWebhook(Request $request)
{
    $signature = $request->header('Stripe-Signature');
    
    try {
        $event = \Stripe\Webhook::constructEvent(
            $request->getContent(),
            $signature,
            config('services.stripe.webhook_secret')
        );
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 400);
    }

    if ($event->type === 'checkout.session.completed') {
        $this->handleCheckoutSessionCompleted($event->data->object);
    }

    return response()->json(['status' => 'success']);
}
```

### Routes

**File:** `routes/web.php`

```php
// Checkout routes
Route::middleware('auth')->group(function () {
    Route::post('/checkout', [CheckoutController::class, 'createCheckoutSession'])
        ->name('checkout.create');
    Route::get('/checkout/success', [CheckoutController::class, 'success'])
        ->name('checkout.success');
    Route::get('/checkout/cancel', [CheckoutController::class, 'cancel'])
        ->name('checkout.cancel');
});

// Webhook route (no auth middleware)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);
```

---

## Testing Payment Flow

### 1. Start Application

```bash
./vendor/bin/sail up -d
./vendor/bin/sail composer dev
```

### 2. Start Webhook Listener

In another terminal:

```bash
stripe listen --forward-to localhost:8000/stripe/webhook
```

Or use the script:

```bash
./start-with-webhooks.sh
```

### 3. Test Checkout

1. Login to application (http://localhost:8000)
2. Add products to cart
3. Click "Proceed to Checkout"
4. Use test card: `4242 4242 4242 4242`
5. Enter any future expiry, any CVC, any ZIP
6. Complete payment

### 4. Verify Success

- ✅ Redirected to success page
- ✅ Order created in database
- ✅ Cart cleared
- ✅ Stock decremented
- ✅ Admin email sent (check Mailpit at http://localhost:8026)
- ✅ Webhook event logged in terminal

---

## Troubleshooting

### Webhook Not Receiving Events

**Symptoms:**
- Payment succeeds but order not created
- Cart not cleared after payment

**Solutions:**

1. **Verify Stripe CLI is running:**
   ```bash
   stripe listen --forward-to localhost:8000/stripe/webhook
   ```

2. **Check webhook secret in .env:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Verify webhook route:**
   ```bash
   ./vendor/bin/sail artisan route:list | grep webhook
   ```

4. **Check logs:**
   ```bash
   ./vendor/bin/sail artisan log:tail
   ```

### Payment Succeeds But Order Not Created

**Causes:**
- Webhook signature verification failed
- Webhook endpoint not accessible
- Database constraint violation

**Solutions:**

1. **Check webhook logs in Stripe CLI:**
   ```
   stripe listen --forward-to localhost:8000/stripe/webhook --log-level debug
   ```

2. **Verify user_id in session:**
   ```php
   // In StripeWebhookController
   Log::info('Client reference ID: ' . $session->client_reference_id);
   ```

3. **Check database constraints:**
   ```bash
   ./vendor/bin/sail artisan tinker
   >>> Order::create([...]) // Test manual order creation
   ```

### Invalid API Key Error

**Error Message:**
```
No API key provided
```

**Solutions:**

1. **Check .env file:**
   ```env
   STRIPE_KEY=pk_test_...
   STRIPE_SECRET=sk_test_...
   ```

2. **Clear config cache:**
   ```bash
   ./vendor/bin/sail artisan config:clear
   ```

3. **Verify Stripe package:**
   ```bash
   ./vendor/bin/sail composer show stripe/stripe-php
   ```

---

## Security Best Practices

### 1. Never Expose Secret Key

❌ **Wrong:**
```javascript
// In frontend code
const stripe = Stripe('sk_test_...');  // NEVER DO THIS
```

✅ **Correct:**
```javascript
// In frontend code
const stripe = Stripe('pk_test_...');  // Publishable key only
```

### 2. Always Verify Webhooks

✅ **Required:**
```php
$event = \Stripe\Webhook::constructEvent(
    $request->getContent(),
    $signature,
    config('services.stripe.webhook_secret')
);
```

### 3. Use HTTPS in Production

❌ **Insecure:**
```
http://yourdomain.com/stripe/webhook
```

✅ **Secure:**
```
https://yourdomain.com/stripe/webhook
```

### 4. Validate Amounts

✅ **Always validate:**
```php
$expectedAmount = $cartItems->sum(fn($item) => $item->product->price * $item->quantity);
$sessionAmount = $session->amount_total / 100;

if ($expectedAmount != $sessionAmount) {
    throw new \Exception('Amount mismatch');
}
```

---

## Production Checklist

Before going live:

- [ ] Switch to **live mode** keys (pk_live_, sk_live_)
- [ ] Configure production webhook endpoint
- [ ] Enable HTTPS for webhook URL
- [ ] Test with real payment amounts
- [ ] Set up webhook monitoring
- [ ] Configure email notifications
- [ ] Test refund flow
- [ ] Set up Stripe Dashboard alerts
- [ ] Review Stripe billing settings
- [ ] Test 3D Secure authentication

---

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Laravel Cashier](https://laravel.com/docs/billing) (for subscriptions)

---

## Related Documentation

- [Installation Guide](INSTALLATION.md)
- [Development Commands](DEVELOPMENT.md)
- [Testing Guide](TESTING.md)
- [Troubleshooting](TROUBLESHOOTING.md)
