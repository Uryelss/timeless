<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Profile;

class CustomerController extends Controller
{
    // List customer profiles (active or archived based on query parameter)
    public function index(Request $request)
    {
        if ($request->query('archived')) {
            $customers = Profile::onlyTrashed()->get();
        } else {
            $customers = Profile::all();
        }
        return response()->json($customers);
    }

    // Update a customer profile
    public function update(Request $request, $id)
    {
        $customer = Profile::findOrFail($id);

        $validatedData = $request->validate([
            'first_name'    => 'sometimes|required|string',
            'middle_name'   => 'nullable|string',
            'last_name'     => 'sometimes|required|string',
            'suffix'        => 'nullable|string',
            'gender'        => 'sometimes|nullable|string',  // Not required on update
            'date_of_birth' => 'sometimes|nullable|date',     // Not required on update
            'phone'         => 'sometimes|nullable|string',   // Not required on update
            'profile_image' => 'nullable|file|image',
            'address'       => 'sometimes|nullable|string',   // Not required on update
        ]);

        if ($request->hasFile('profile_image')) {
            $validatedData['profile_image'] = $request->file('profile_image')->store('profiles', 'public');
        }

        $customer->update($validatedData);

        return response()->json($customer);
    }


    // Archive (soft delete) a customer profile
    public function destroy($id)
    {
        $customer = Profile::findOrFail($id);
        $customer->delete();
        return response()->json(['message' => 'Customer archived successfully']);
    }

    // Restore a soft-deleted customer profile
    public function restore($id)
    {
        $customer = Profile::withTrashed()->findOrFail($id);
        $customer->restore();
        return response()->json(['message' => 'Customer restored successfully']);
    }
}