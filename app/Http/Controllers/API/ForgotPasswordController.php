<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class ForgotPasswordController extends Controller
{
    private function generateResetCode()
    {
        return Str::upper(Str::random(6, 'alnum')); // e.g., ZZ797T
    }

    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email not found'], 404);
        }

        $token = $this->generateResetCode();

        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            [
                'email' => $request->email,
                'token' => $token,
                'created_at' => now()
            ]
        );

        $emailContent = "
            <!DOCTYPE html>
            <html>
            <head>
                <title>Timeless Password Reset</title>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            </head>
            <body style='font-family: Arial, sans-serif; color: #202124; line-height: 1.5; margin: 0; padding: 0;'>
                <div style='max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #dadce0; border-radius: 8px;'>
                    <h1 style='color: #1a73e8; font-size: 24px; margin: 0 0 20px;'>Timeless Password Reset</h1>
                    <p style='font-size: 16px; margin: 0 0 10px;'>Hi there,</p>
                    <p style='font-size: 16px; margin: 0 0 20px;'>We received a request to reset your password for your Timeless account. Here’s your reset code:</p>
                    <div style='background: #f1f3f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #1a73e8; border-radius: 4px; margin: 0 0 20px;'>$token</div>
                    <p style='font-size: 14px; margin: 0 0 20px;'>This code expires in 1 hour. If you didn’t request a reset, please ignore this email or contact us at <a href='mailto:support@timeless.com' style='color: #1a73e8; text-decoration: none;'>support@timeless.com</a>.</p>
                    <p style='font-size: 16px; margin: 0 0 20px;'>Thanks,<br>The Timeless Team</p>
                    <hr style='border: none; border-top: 1px solid #dadce0; margin: 20px 0;'>
                    <p style='font-size: 12px; color: #5f6368; margin: 0;'>Timeless Inc.<br>123 Timeless Lane, Somewhere, USA<br><a href='https://timeless.com' style='color: #1a73e8; text-decoration: none;'>timeless.com</a> • <a href='mailto:support@timeless.com' style='color: #1a73e8; text-decoration: none;'>support@timeless.com</a></p>
                    <p style='font-size: 12px; color: #5f6368; margin: 10px 0 0;'>© 2025 Timeless Inc. All rights reserved.</p>
                </div>
            </body>
            </html>
        ";

        Mail::html($emailContent, function ($message) use ($request) {
            $message->to($request->email)
                ->from('mambohappy00@gmail.com', 'Timeless')
                ->subject('Timeless Password Reset Code')
                ->priority(1); // Higher priority to signal importance
        });

        return response()->json([
            'message' => 'A code has been sent to your email.'
        ], 200);
    }

    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string|size:6',
        ]);

        $reset = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$reset || now()->diffInHours($reset->created_at) > 1) {
            DB::table('password_resets')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Invalid or expired code'], 400);
        }

        return response()->json(['message' => 'Code verified successfully'], 200);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string|size:6',
            'password' => 'required|confirmed|min:8',
        ]);

        $reset = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$reset) {
            return response()->json(['message' => 'Invalid token'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Password has been reset successfully'
        ], 200);
    }
}
