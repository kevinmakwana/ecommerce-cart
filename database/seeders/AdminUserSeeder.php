<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => config('mail.admin_email', 'eComAdmin@mailinator.com'),
            'password' => Hash::make('password'),
        ]);

        $admin->assignRole('admin');
    }
}
