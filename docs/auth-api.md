# Auth API — password change & WhatsApp verification

Startup flow after `POST /api/Auth/Login`:

```
POST /api/Auth/Login
  ├─ mustChangePassword === true ─► Change Password screen (BLOCKING)
  ├─ verified === false          ─► Verify screen (Send Code → Verify Code)
  └─ else                        ─► Dashboard
```

A freshly invited student has both set. `verified` is a one-time per-student check.

## POST /api/Auth/Login

Headers: `X-API-KEY` only (no Bearer). Password sent plaintext — do NOT hash client-side.

```jsonc
// Request
{ "username": "KarimKojok16899", "password": "16899@2026PS" }

// 200 OK
{
  "success": true,
  "token": "eyJhbGci...",
  "studentId": 16899,
  "studentFullName": "Karim Kojok",
  "message": "Login successful.",
  "mustChangePassword": false,
  "verified": false
}

// 401
{ "success": false, "token": "", "studentId": 0, "message": "Invalid credentials." }
```

## POST /api/Auth/ChangePassword 🔒

Headers: `X-API-KEY` + `Authorization: Bearer <token>`.

```jsonc
// Request
{ "oldPassword": "16899@2026PS", "newPassword": "MyNew#Pass1" }

// 200 OK
{ "message": "Password updated successfully." }
```

Policy (server-enforced, mirrored in UI via `validatePasswordPolicy`): min 8 characters,
at least one symbol (non-letter, non-digit), different from current.
Token stays valid after change — no re-login.

400 messages (user-safe to display):
- `Password must be at least 8 characters.`
- `Password must contain at least one symbol (e.g. ! @ # $ % & *).`
- `New password must be different from the current one.`
- `Current password is incorrect.`

## POST /api/Auth/SendVerificationCode 🔒

No request body. Sends a 6-digit code by WhatsApp to the phone on file.

```jsonc
// 200 OK
{ "sent": true, "phone": "••••••••498", "expiresInMinutes": 10,
  "message": "Verification code sent by WhatsApp." }

// 400 — no phone on file
{ "message": "No valid phone number on file. Please contact ProSwim." }

// 502 — gateway failed (let user retry)
{ "sent": false, "message": "Could not send the WhatsApp code." }
```

`phone` is masked — safe to show. Re-calling invalidates the previous code (Resend).

## POST /api/Auth/VerifyCode 🔒

```jsonc
// Request
{ "code": "482913" }

// 200 OK
{ "verified": true, "message": "Verified." }

// 400
{ "verified": false, "message": "Incorrect code." }
{ "verified": false, "message": "Too many attempts. Request a new code." }
{ "verified": false, "message": "No active code. Request a new one." }
```

Code expires in 10 min, single-use, max 5 attempts. On the "request a new code"
outcomes, return to the Send-Code step. On success, `verified` is true on all
future logins.

## App implementation

- Client: `src/app/api/pswmApi.ts` — `login`, `changePassword`, `sendVerificationCode`,
  `verifyCode`, `validatePasswordPolicy`, `ApiError` (carries the server's user-safe message).
- Screens: `ChangePasswordPage` (`/change-password`, forced mode via
  `location.state.required`), `VerifyPage` (`/verify`).
- Routing branch lives in `SignInPage.handleSubmit`.
