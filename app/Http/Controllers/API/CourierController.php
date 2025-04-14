<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Courier;

class CourierController extends Controller
{
    public function index()
    {
        $couriers = Courier::with(['orders' => function ($query) {
            $query->with([
                'orderDetails.product',
                'shipping.address',
                'shipping.shippingMethod',
                'shipping.shippingStatus',
            ])->whereNull('deleted_at');
        }])->get();

        // Format response for frontend
        $formattedCouriers = $couriers->map(function ($courier) {
            return [
                'id' => $courier->id,
                'name' => $courier->name,
                'email' => $courier->email,
                'is_available' => $courier->is_available,
                'orders' => $courier->orders->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'total_amount' => $order->total_amount,
                        'order_status' => $order->order_status,
                        'order_date' => $order->order_date->toISOString(),
                        'items' => $order->orderDetails->map(function ($detail) {
                            return [
                                'product_name' => $detail->product->product_name,
                                'quantity' => $detail->quantity,
                                'price' => $detail->price,
                                'subtotal' => $detail->quantity * $detail->price,
                            ];
                        }),
                        'shipping' => $order->shipping ? [
                            'address' => [
                                'street' => $order->shipping->address->street,
                                'barangay' => $order->shipping->address->barangay,
                                'city' => $order->shipping->address->city,
                                'state' => $order->shipping->address->state,
                                'postal_code' => $order->shipping->address->postal_code,
                                'country' => $order->shipping->address->country,
                                'phone' => $order->shipping->address->phone,
                            ],
                            'shipping_method' => $order->shipping->shippingMethod->name,
                            'shipping_status' => $order->shipping->shippingStatus->name,
                            'tracking_number' => $order->shipping->tracking_number,
                        ] : null,
                    ];
                }),
            ];
        });

        return response()->json($formattedCouriers);
    }
}