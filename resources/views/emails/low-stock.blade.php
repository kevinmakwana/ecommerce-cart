<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; }
        .product-info { margin: 20px 0; }
        .product-info p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert">
            <h2>⚠️ Low Stock Alert</h2>
        </div>
        
        <div class="product-info">
            <p><strong>Product:</strong> {{ $product->name }}</p>
            <p><strong>Current Stock:</strong> {{ $product->stock_quantity }} units</p>
            <p><strong>Price:</strong> ${{ number_format($product->price, 2) }}</p>
        </div>
        
        <p>Please restock this product as soon as possible.</p>
    </div>
</body>
</html>
