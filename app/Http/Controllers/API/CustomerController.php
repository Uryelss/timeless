<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;

class CustomerController extends Controller
{
    // List active customers or archived if query param is set.
    public function index(Request $request)
    {
        if ($request->query('archived')) {
            $customers = Customer::onlyTrashed()->get();
        } else {
            $customers = Customer::all();
        }
        return response()->json($customers);
    }

    // Store a new customer (for example, when a user registers, data is also saved here)
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'first_name'  => 'required|string',
            'last_name'   => 'required|string',
            'middle_name' => 'nullable|string',
            'suffix'      => 'nullable|string',
            'gender'      => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'phone'       => 'nullable|string',
            'profile_image' => 'nullable|file|image',
        ]);

        // Handle file upload if provided.
        if ($request->hasFile('profile_image')) {
            $validatedData['profile_image'] = $request->file('profile_image')->store('profiles', 'public');
        }

        $customer = Customer::create($validatedData);
        return response()->json($customer, 201);
    }

    // Update an existing customer
    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validatedData = $request->validate([
            'first_name'  => 'sometimes|required|string',
            'last_name'   => 'sometimes|required|string',
            'middle_name' => 'nullable|string',
            'suffix'      => 'nullable|string',
            'gender'      => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'phone'       => 'nullable|string',
            'profile_image' => 'nullable|file|image',
        ]);

        if ($request->hasFile('profile_image')) {
            $validatedData['profile_image'] = $request->file('profile_image')->store('profiles', 'public');
        }

        $customer->update($validatedData);
        return response()->json($customer);
    }

    // Archive (soft delete) a customer
    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();
        return response()->json(['message' => 'Customer archived successfully']);
    }

    // Restore a soft-deleted customer
    public function restore($id)
    {
        $customer = Customer::withTrashed()->findOrFail($id);
        $customer->restore();
        return response()->json(['message' => 'Customer restored successfully']);
    }
}