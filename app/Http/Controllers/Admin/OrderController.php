<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->input('perPage', 10);
        $search = $request->input('search', '');
        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');
        $status = $request->input('status', '');

        $query = Order::with(['user', 'orderItems.product'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', '%' . $search . '%')
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', '%' . $search . '%')
                                ->orWhere('email', 'like', '%' . $search . '%');
                        });
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            });

        if ($direction === 'desc') {
            $query->orderBy($sort, 'desc');
        } else {
            $query->orderBy($sort, 'asc');
        }

        $orders = $query->paginate($perPage)->withQueryString();

        // Transform the data for the frontend
        $orders->getCollection()->transform(fn ($order) => [
            'id' => $order->id,
            'order_number' => '#' . str_pad((string) $order->id, 6, '0', STR_PAD_LEFT),
            'customer_name' => $order->user->name ?? 'Guest',
            'customer_email' => $order->user->email ?? 'N/A',
            'total_amount' => $order->total_amount,
            'status' => $order->status,
            'created_at' => $order->created_at->format('Y-m-d H:i:s'),
            'items_count' => $order->orderItems->count(),
        ]);

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'perPage' => $perPage,
                'status' => $status,
                'page' => $request->input('page', 1),
            ],
            'statuses' => [
                'pending' => 'Pending',
                'processing' => 'Processing',
                'completed' => 'Completed',
                'cancelled' => 'Cancelled',
            ],
            'can' => [
                'create' => false,
                'edit' => true,
                'delete' => true,
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['user', 'orderItems.product']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => (new OrderResource($order))->resolve(),
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:pending,processing,completed,cancelled'],
        ]);

        try {
            $order->update([
                'status' => $request->status,
            ]);

            return back()->with('success', 'Order updated successfully');
        } catch (\Exception $e) {
            Log::error('Order update failed: ' . $e->getMessage());

            return back()->with('error', 'Failed to update order. Please try again.');
        }
    }

    public function destroy(Order $order): RedirectResponse
    {
        try {
            $order->delete();

            return to_route('admin.orders.index')->with('success', 'Order deleted successfully');
        } catch (\Exception $e) {
            Log::error('Order deletion failed: ' . $e->getMessage());

            return back()->with('error', 'Failed to delete order. Please try again.');
        }
    }
}
