<?php

namespace App\Console\Commands;

use App\Mail\DailySalesReport;
use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendDailySalesReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sales:daily-report';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily sales report to admin';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $today = \Illuminate\Support\Facades\Date::today();

        // Get all orders from today
        $orders = Order::with(['user', 'items.product'])
            ->whereDate('created_at', $today)
            ->get();

        $totalSales = $orders->sum('total_amount');

        $adminEmail = config('mail.admin_email', 'eComAdmin@mailinator.com');

        Mail::to($adminEmail)->send(
            new DailySalesReport($orders, $totalSales, $today->format('F j, Y'))
        );

        $this->info('Daily sales report sent successfully!');
    }
}
