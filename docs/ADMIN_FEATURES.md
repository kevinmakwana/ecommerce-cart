# Admin Features

Complete guide to managing orders as an administrator.

## Overview

The admin dashboard provides comprehensive order management capabilities including:
- View all customer orders
- Search and filter orders
- Update order status
- View order details
- Print invoices
- Delete orders

---

## Accessing Admin Features

### Login as Admin

**Credentials:**
- **Email:** eComAdmin@mailinator.com
- **Password:** password

**Requirements:**
- Must have `admin` role assigned
- Admin role created via `RoleSeeder`

---

## Admin Orders Listing

### Route

```
GET /admin/orders
```

### Features

#### 1. Orders Table

**Displays:**
- Order number
- Customer name and email
- Order total
- Status (with color-coded badges)
- Order date
- Actions (View, Delete)

#### 2. Search Functionality

Search by:
- Order number
- Customer name
- Customer email

**Usage:**
```
Search: #1234
Search: John Doe
Search: john@example.com
```

#### 3. Status Filtering

Filter orders by status:
- **All** - Show all orders
- **Pending** - New orders awaiting processing
- **Processing** - Orders being prepared
- **Completed** - Fulfilled orders
- **Cancelled** - Cancelled orders

#### 4. Pagination

- Configurable items per page: 10, 25, 50, 100
- Previous/Next navigation
- Page number display

#### 5. Order Actions

**View Details:**
- Click "View" button to see order details

**Delete Order:**
- Click "Delete" button
- Confirmation dialog (SweetAlert2)
- Permanent deletion

---

## Order Details Page

### Route

```
GET /admin/orders/{order}
```

### Information Displayed

#### Customer Information
- Customer name
- Customer email

#### Order Information
- Order number (e.g., #1234)
- Order date
- Current status
- Total amount

#### Order Items
- Product image
- Product name
- Quantity
- Unit price
- Subtotal

#### Order Summary
- Subtotal
- Shipping (if applicable)
- Tax (if applicable)
- **Total**

### Actions

#### 1. Update Status

**Available statuses:**
- Pending
- Processing
- Completed
- Cancelled

**Update process:**
1. Select new status from dropdown
2. Click "Update Status"
3. Order status updated in database
4. Confirmation toast message

**Status badge colors:**
- Pending: Yellow
- Processing: Blue
- Completed: Green
- Cancelled: Red

#### 2. Print Invoice

- Click "Print Invoice" button
- Opens print preview
- Generates formatted invoice with:
  - Company information
  - Order details
  - Itemized list
  - Total calculation
- Uses `react-to-print` library

#### 3. Back to Orders

- Returns to orders listing page
- Maintains previous filters/search

---

## Order Management Workflow

### Typical Order Flow

1. **New Order** → Status: Pending
   - Customer completes checkout
   - Webhook creates order
   - Admin receives email notification

2. **Process Order** → Status: Processing
   - Admin updates status
   - Prepare items for shipment
   - Update inventory if needed

3. **Ship Order** → Status: Completed
   - Items shipped
   - Update status to completed
   - Customer receives confirmation (if implemented)

4. **Handle Cancellations** → Status: Cancelled
   - Process refund in Stripe
   - Update status to cancelled
   - Restore inventory (if implemented)

---

## Admin Email Notifications

### Low Stock Alerts

**Trigger:** Product stock ≤ 10 units

**Email includes:**
- Product name
- Current stock quantity
- Product price
- Recommendation to reorder

**Check email:**
- Development: http://localhost:8026 (Mailpit)
- Production: Configured email service

### Daily Sales Report

**Schedule:** Sent daily at configured time

**Email includes:**
- Total orders count
- Total revenue
- Date range
- Order breakdown

**Manual trigger:**
```bash
./vendor/bin/sail artisan sales:daily-report
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
# Install react-to-print for invoice printing
./vendor/bin/sail npm install react-to-print

# Build assets
./vendor/bin/sail npm run build

# Or for development
./vendor/bin/sail npm run dev
```

### 2. Assign Admin Role

**Create admin user via seeder:**

```bash
./vendor/bin/sail artisan db:seed --class=AdminUserSeeder
```

**Or assign role manually:**

```bash
./vendor/bin/sail artisan tinker

>>> $user = User::find(1);
>>> $user->assignRole('admin');
```

### 3. Configure Admin Email

**In `.env`:**

```env
ADMIN_EMAIL=admin@yourdomain.com
```

---

## Admin Routes

| Method | Route | Name | Description |
|--------|-------|------|-------------|
| GET | /admin/orders | admin.orders.index | List all orders |
| GET | /admin/orders/{order} | admin.orders.show | View order details |
| PUT | /admin/orders/{order} | admin.orders.update | Update order status |
| DELETE | /admin/orders/{order} | admin.orders.destroy | Delete order |

**Protection:**
- All routes use `auth` middleware
- All routes use `role:admin` middleware
- Non-admin users receive 403 Forbidden

---

## Customization

### Company Information in Invoice

**File:** `resources/js/Pages/Admin/Orders/OrderInvoice.jsx`

```jsx
<div className="mb-6">
    <h2 className="text-xl font-bold">Your Company Name</h2>
    <p className="text-sm text-gray-600">123 Business St</p>
    <p className="text-sm text-gray-600">City, State 12345</p>
    <p className="text-sm text-gray-600">Phone: (555) 123-4567</p>
    <p className="text-sm text-gray-600">Email: info@yourcompany.com</p>
</div>
```

### Order Statuses

**File:** `app/Http/Controllers/Admin/OrderController.php`

```php
$statuses = [
    'pending',
    'processing',
    'completed',
    'cancelled',
    // Add custom statuses here
    'shipped',
    'refunded',
];
```

**Update badge colors:**

**File:** `resources/js/Pages/Admin/Orders/Show.jsx`

```jsx
const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    shipped: 'bg-purple-100 text-purple-800',
    refunded: 'bg-gray-100 text-gray-800',
};
```

### Items Per Page Options

**File:** `resources/js/Pages/Admin/Orders/Index.jsx`

```jsx
const perPageOptions = [10, 25, 50, 100, 200];
```

---

## Security Considerations

### Role-Based Access Control

**Middleware stack:**
```php
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Admin routes
    });
```

**Authorization checks:**
- User must be authenticated
- User must have 'admin' role
- Automatically enforced by middleware

### CSRF Protection

- All form submissions include CSRF token
- Inertia.js handles token automatically
- Delete operations require confirmation

### XSS Prevention

- All data sanitized by React
- Blade templates use `{{ }}` escaping
- No raw HTML rendering except trusted sources

---

## Troubleshooting

### "Route not found" error

**Solution:**
```bash
./vendor/bin/sail artisan route:clear
./vendor/bin/sail artisan route:cache
```

### Navigation link not showing

**Check:**
1. User is logged in as admin
2. `isAdmin` prop passed correctly in `AppServiceProvider`:

```php
public function boot(): void
{
    Inertia::share([
        'auth' => function () {
            return [
                'user' => Auth::user(),
                'isAdmin' => Auth::check() && Auth::user()->hasRole('admin'),
            ];
        },
    ]);
}
```

### Images not displaying

**Solution:**
```bash
./vendor/bin/sail artisan storage:link
```

### Print function not working

**Solution:**
```bash
./vendor/bin/sail npm install react-to-print
./vendor/bin/sail npm run build
```

### Status update not working

**Check:**
1. Valid status value
2. Route properly defined
3. Authorization passing

**Debug:**
```php
// In OrderController::update()
Log::info('Status update', [
    'order_id' => $order->id,
    'new_status' => $request->status
]);
```

---

## API Documentation

### Update Order Status

**Endpoint:**
```
PUT /admin/orders/{order}
```

**Request:**
```json
{
    "status": "processing"
}
```

**Response (Success):**
```json
{
    "message": "Order status updated successfully"
}
```

**Validation:**
- Status must be one of: pending, processing, completed, cancelled
- Order must exist
- User must be admin

### Delete Order

**Endpoint:**
```
DELETE /admin/orders/{order}
```

**Response (Success):**
```json
{
    "message": "Order deleted successfully"
}
```

**Notes:**
- Cascades to order items
- Cannot be undone
- Requires confirmation

---

## Future Enhancements

Potential admin features to implement:

- [ ] **Order Refunds** - Process refunds through Stripe
- [ ] **Order Notes** - Add internal notes to orders
- [ ] **Bulk Actions** - Update multiple orders at once
- [ ] **Export Orders** - CSV/Excel export functionality
- [ ] **Order Tracking** - Integration with shipping providers
- [ ] **Email Notifications** - Send status updates to customers
- [ ] **Inventory Management** - Track and update stock levels
- [ ] **Sales Reports** - Detailed analytics and reporting
- [ ] **Customer Management** - View customer order history
- [ ] **Product Management** - Full CRUD for products

---

## Files Created

### Backend

- `app/Http/Controllers/Admin/OrderController.php` - Order management logic
- `app/Providers/AppServiceProvider.php` - Modified to share `isAdmin` with Inertia

### Frontend

- `resources/js/Pages/Admin/Orders/Index.jsx` - Orders listing page
- `resources/js/Pages/Admin/Orders/Show.jsx` - Order details page
- `resources/js/Pages/Admin/Orders/OrderInvoice.jsx` - Printable invoice component

### Routes

- `routes/admin.php` - Admin route definitions

---

## Related Documentation

- [Installation Guide](INSTALLATION.md)
- [Development Commands](DEVELOPMENT.md)
- [Testing Documentation](TESTING.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Deployment Guide](DEPLOYMENT.md)
