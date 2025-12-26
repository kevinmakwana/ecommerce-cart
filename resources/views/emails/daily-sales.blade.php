<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; border-radius: 5px; }
        .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📊 Daily Sales Report</h2>
            <p>{{ $date }}</p>
        </div>
        
        <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Orders:</strong> {{ count($orders) }}</p>
            <p><strong>Total Sales:</strong> ${{ number_format($totalSales, 2) }}</p>
        </div>
        
        @if(count($orders) > 0)
            <h3>Orders</h3>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($orders as $order)
                        <tr>
                            <td>#{{ $order->id }}</td>
                            <td>{{ $order->user->name }}</td>
                            <td>{{ $order->items->count() }}</td>
                            <td>${{ number_format($order->total_amount, 2) }}</td>
                            <td>{{ $order->created_at->format('H:i') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No sales recorded today.</p>
        @endif
    </div>
</body>
</html>
