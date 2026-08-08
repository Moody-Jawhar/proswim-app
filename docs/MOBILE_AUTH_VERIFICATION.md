# ProSwim App — New Login, Password & Verification

Hand-off for the mobile developer. This covers **only what changed** in
authentication. Everything else in the app (profile, sessions, payments, etc.)
is unchanged — see `MOBILE_API_INTEGRATION.md` for the full surface.

---

## 0. TL;DR — the one thing to get right

> **The app does NOT hash passwords. Do not add any hashing/encryption on the
> client.**
>
> Passwords are hashed **on the server**. The app keeps sending the **plaintext**
> password over HTTPS exactly as it does today. TLS protects it in transit; the
> server hashes it on arrival and never stores or returns plaintext. If you hash
> on the client, login will fail.

What you actually need to build on the app side:

1. React to **two new flags** on the login response (`mustChangePassword`, `verified`).
2. A **Change Password** screen (the endpoint now works and enforces a policy).
3. A **WhatsApp verification** screen (send code → enter code).

---

## 1. Startup flow

After a successful `POST /api/Auth/Login`, branch on the two new flags **in this
order**:

```
Login OK
  │
  1. mustChangePassword === true ?  ──► Change Password screen  (BLOCKING)
  │                                     user is still on the temp invite password
  │
  2. verified === false ?           ──► Verify screen
  │                                     Send Code → user reads WhatsApp → Verify Code
  │
  3. else                           ──► Dashboard
```

A student who was just invited from the back office will have **both** flags set:
force the password change first, then run verification.

`verified` is a **one-time, per-student** check. Once done it stays `true` on every
future login, so most returning users go straight to the dashboard.

---

## 2. Endpoints

Base URL and the `X-API-KEY` header are the same as every other call. Endpoints
marked 🔒 need `Authorization: Bearer <token>` from login.

### 2.1 `POST /api/Auth/Login`  (updated response)

```jsonc
// Request  — unchanged, still plaintext
{ "username": "KarimKojok16899", "password": "16899@2026PS" }

// 200 OK
{
  "success": true,
  "token": "eyJhbGciOi...",
  "studentId": 16899,
  "studentFullName": "Karim Kojok",
  "message": "Login successful.",
  "mustChangePassword": false,   // ← NEW
  "verified": false              // ← NEW
}

// 401 — bad credentials
{ "success": false, "token": "", "studentId": 0, "message": "Invalid credentials." }
```

### 2.2 `POST /api/Auth/ChangePassword` 🔒

```jsonc
// Request
{ "oldPassword": "16899@2026PS", "newPassword": "MyNew#Pass1" }

// 200 OK
{ "message": "Password updated successfully." }
```

**Password policy** (enforced by the server — mirror it in the UI for instant feedback):

- at least **8 characters**
- at least **one symbol** — any character that is not a letter or a digit
  (`! @ # $ % & * . _ -` …)
- must be **different** from the current password

`400` responses, with the exact reason in `message`:

| `message` |
|---|
| `Password must be at least 8 characters.` |
| `Password must contain at least one symbol (e.g. ! @ # $ % & *).` |
| `New password must be different from the current one.` |
| `Current password is incorrect.` |

The existing token stays valid after a change — **no re-login needed**. On the next
login `mustChangePassword` will be `false`.

### 2.3 `POST /api/Auth/SendVerificationCode` 🔒  (no body)

Sends a **6-digit** code by WhatsApp to the phone ProSwim has on file.

```jsonc
// 200 OK
{ "sent": true, "phone": "••••••••498", "expiresInMinutes": 10,
  "message": "Verification code sent by WhatsApp." }

// 400 — no phone on file
{ "message": "No valid phone number on file. Please contact ProSwim." }

// 502 — WhatsApp gateway failed (let the user retry)
{ "sent": false, "message": "Could not send the WhatsApp code." }
```

`phone` is already masked — safe to show ("Code sent to ••••••••498"). Provide a
**Resend** button; calling this again invalidates the previous code.

### 2.4 `POST /api/Auth/VerifyCode` 🔒

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

Rules: code **expires in 10 minutes**, is **single-use**, max **5 attempts** before it
is burned. On the two "request a new code" outcomes, send the user back to the Send-Code
step.

---

## 3. Drop-in client (`src/app/api/pswmApi.ts`)

Add these to the existing file. `apiRequest` is your current helper (it already sets
`X-API-KEY` and the Bearer token).

```ts
// --- Auth: login response now carries two extra flags ---
export interface LoginResponse {
  success: boolean;
  token: string;
  studentId: number;
  studentFullName: string;
  message: string;
  mustChangePassword: boolean; // NEW
  verified: boolean;           // NEW
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  // NOTE: send the plaintext password. Do NOT hash it on the client.
  return apiRequest<LoginResponse>(
    "/api/Auth/Login",
    { method: "POST", body: JSON.stringify({ username, password }) },
    false // no auth header for login
  );
}

// --- Change password (min 8 chars + 1 symbol, enforced server-side) ---
export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await apiRequest<void>("/api/Auth/ChangePassword", {
    method: "POST",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

// --- WhatsApp device verification ---
export interface SendCodeResponse {
  sent: boolean;
  phone: string;            // masked, e.g. "••••••••498"
  expiresInMinutes: number;
  message: string;
}

export async function sendVerificationCode(): Promise<SendCodeResponse> {
  return apiRequest<SendCodeResponse>("/api/Auth/SendVerificationCode", { method: "POST" });
}

export async function verifyCode(code: string): Promise<{ verified: boolean; message: string }> {
  return apiRequest<{ verified: boolean; message: string }>("/api/Auth/VerifyCode", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

// --- Client-side mirror of the server password policy (for instant UX) ---
export function validatePasswordPolicy(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password must contain at least one symbol.";
  return null; // ok
}
```

### Post-login routing

```ts
const res = await login(username, password);
if (!res.success) { showError(res.message); return; }

setStoredToken(res.token);
// ... store studentId, subscribe to push topic "student_" + res.studentId ...

if (res.mustChangePassword)      navigate("/change-password", { required: true });
else if (!res.verified)          navigate("/verify");
else                             navigate("/dashboard");
```

`apiRequest` already throws on non-2xx with the server's `message` in the error — catch
it and show `message` directly; every failure string above is user-safe.

---

## 4. Screens to build

**Change Password** (reachable normally, and forced when `mustChangePassword`)
- fields: current password, new password, confirm new password
- validate with `validatePasswordPolicy` before calling; show the server `message` on 400
- on success: if it was the forced flow, continue to Verify (if `verified` was false) or Dashboard

**Verify** (when `verified === false`)
- "Send code to my WhatsApp" → `sendVerificationCode()` → show masked `phone` + a 10-min hint
- 6-digit input → `verifyCode(code)`
- Resend button (re-calls send). On "Too many attempts" / "No active code", force a resend.
- on `verified: true` → Dashboard

---

## 5. Notes & edge cases

- **Forgot password:** there is no self-service reset endpoint. An admin re-sends an
  invite from the back office, which resets the password and WhatsApps a new temporary
  one (and re-sets `mustChangePassword`). In the app, point users to "contact ProSwim".
- **Token expiry:** JWT lasts 30 days, no refresh endpoint. On any `401`, clear the token
  and return to sign-in.
- **No phone on file:** `SendVerificationCode` returns 400. Show the message and let the
  user proceed to contact ProSwim (they can't self-verify without a number).
- **Username format** (FYI, issued by ProSwim): `FirstName + LastName + StudentId`, e.g.
  `KarimKojok16899`. The app never generates usernames.
```
