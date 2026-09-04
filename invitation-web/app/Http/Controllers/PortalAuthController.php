<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use Illuminate\Http\Request;

class PortalAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'passcode' => ['required', 'string'],
        ]);

        $input = strtoupper(trim($request->input('passcode')));

        $invitation = Invitation::where('passcode', $input)
            ->orWhere('slug', strtolower($input))
            ->orWhere('phone', 'like', '%' . preg_replace('/[^0-9]/', '', $input) . '%')
            ->first();

        if (! $invitation) {
            return response()->json([
                'message' => 'Kode Undangan atau Nomor WhatsApp tidak terdaftar!',
            ], 422);
        }

        $request->session()->put('portal_invitation_id', $invitation->id);
        $request->session()->regenerate();

        return response()->json(['invitation' => $invitation]);
    }

    public function logout(Request $request)
    {
        $request->session()->forget('portal_invitation_id');
        $request->session()->save();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        $invitationId = $request->session()->get('portal_invitation_id');

        if (! $invitationId) {
            return response()->json(['invitation' => null]);
        }

        $invitation = Invitation::find($invitationId);

        return response()->json(['invitation' => $invitation]);
    }
}