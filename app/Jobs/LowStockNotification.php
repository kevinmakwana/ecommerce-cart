<?php

namespace App\Jobs;

use App\Mail\LowStockMail;
use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class LowStockNotification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Product $product
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Send email to admin
        $adminEmail = config('mail.admin_email', 'aeComAdmin@mailinator.com');
        Mail::to($adminEmail)->send(new LowStockMail($this->product));
    }
}
