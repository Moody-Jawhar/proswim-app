# ProSwim Mobile App — API Integration Guide

For the mobile developer. Covers the full API surface, with the **new authentication
flow** (hashed passwords, forced password change, WhatsApp device verification) called
out first because it changes how the app starts up.

---

## 1. Basics

**Base URL**

| Environment | URL |
|---|---|
| **Test (V27)** | `https://admin.proswim-lb.com/V27_API` |
| Production | `https://admin.proswim-lb.com/Proswim_API` |
| Local dev (via Vite proxy) | `/Proswim_API` |

> **Build against Test (V27) first.** It runs the unified-auth build of the API
> against the same `AMT_DB`. Production is still on the previous auth stack, so
> the flows in `MOBILE_AUTH_VERIFICATION.md` only exist on V27_API. Point store
> builds at Production only after the new API has been promoted there.

**Headers — every single request**

```
X-API-KEY: dev-api-key-12345
Content-Type: application/json
Accept: application/json
```

Requests marked **🔒 Auth** additionally need the JWT from login:

```
Authorization: Bearer <token>
```

**The token** is valid for **30 days**. There is no refresh endpoint — when a call
returns `401`, clear the stored token and send the user back to the sign-in screen.

**Errors.** Failures return a JSON body with a human-readable `message` that is safe to
show directly to the user:

```json
{ "message": "Password must contain at least one symbol (e.g. ! @ # $ % & *)." }
```

| Status | Meaning |
|---|---|
| `400` | Validation failed — show `message` |
| `401` | Not logged in / bad credentials / token expired → sign-in screen |
| `403` | Not allowed to see this record |
| `404` | Not found |
| `502` | Upstream (WhatsApp / push) failed — the action itself may still have succeeded |

---

## 2. ⚠️ What changed — read this first

Passwords are now **hashed** in the database. Three consequences for the app:

1. **`Login` returns two new flags** — `mustChangePassword` and `verified`. The app must
   act on both before showing the dashboard.
2. **`ChangePassword` actually works now.** It was previously broken (it wrote to the
   wrong table and could never change a student's password). It now enforces a password
   policy — see below.
3. **Nobody can look up a student's password anymore**, not even admin. A forgotten
   password is handled by an admin pressing **Send Invite** in the back office, which
   resets it and WhatsApps a new temporary one. There is no "forgot password" endpoint
   in the app — direct users to contact ProSwim.

### Required startup flow

```
POST /api/Auth/Login
      │
      ├── mustChangePassword == true ──► Change Password screen  (blocking — they are
      │                                   still on the temporary invite password)
      │
      ├── verified == false ───────────► Verify screen:
      │                                   POST /api/Auth/SendVerificationCode
      │                                   → user reads the 6-digit code from WhatsApp
      │                                   → POST /api/Auth/VerifyCode
      │
      └── otherwise ───────────────────► Dashboard
```

Handle `mustChangePassword` **first**. A brand-new student invited from the back office
will have both flags set.

---

## 3. Authentication

### `POST /api/Auth/Login`

No auth header needed (this is where you get the token).

```jsonc
// Request
{ "username": "KarimKojok16899", "password": "16899@2026PS" }

// 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "studentId": 16899,
  "studentFullName": "Karim Kojok",
  "message": "Login successful.",
  "verified": false,            // NEW — device not yet verified by WhatsApp code
  "mustChangePassword": false   // NEW — still on the temporary invite password
}

// 401 Unauthorized
{ "success": false, "token": "", "studentId": 0, "message": "Invalid credentials." }
```

Store `token` and `studentId`. Usernames are issued by ProSwim in the form
`FirstName + LastName + StudentId` (e.g. `KarimKojok16899`).

---

### `POST /api/Auth/ChangePassword` 🔒 Auth

```jsonc
// Request
{ "oldPassword": "16899@2026PS", "newPassword": "MyNew#Pass1" }

// 200 OK
{ "message": "Password updated successfully." }
```

**Password policy — validate in the UI as well, so the user gets instant feedback:**

- at least **8 characters**
- at least **one symbol** (anything that is not a letter or a digit — `! @ # $ % & * . _ -` …)
- must be **different** from the current password

Rejections come back as `400` with the exact reason in `message`:

| `message` |
|---|
| `Password must be at least 8 characters.` |
| `Password must contain at least one symbol (e.g. ! @ # $ % & *).` |
| `New password must be different from the current one.` |
| `Current password is incorrect.` |

After a successful change, `mustChangePassword` becomes `false` on the next login.
The existing token stays valid — you do **not** need to re-login.

---

### `POST /api/Auth/SendVerificationCode` 🔒 Auth

No request body.

```jsonc
// 200 OK
{
  "sent": true,
  "phone": "••••••••498",     // masked — safe to display ("Code sent to ••••••••498")
  "expiresInMinutes": 10,
  "message": "Verification code sent by WhatsApp."
}

// 400 — no phone on file
{ "message": "No valid phone number on file. Please contact ProSwim." }

// 502 — WhatsApp gateway failed
{ "sent": false, "message": "Could not send the WhatsApp code." }
```

Sends a **6-digit** code by WhatsApp to the phone number ProSwim has on file for the
student. Show a "Resend code" button — calling this again invalidates the previous code
and issues a fresh one.

---

### `POST /api/Auth/VerifyCode` 🔒 Auth

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

Rules: the code **expires after 10 minutes**, is **single-use**, and allows a maximum of
**5 attempts** before it is burned (the user must then request a new one). On success,
`verified` is `true` on all future logins — this is a one-time, per-student check.

---

## 4. Profile

| Endpoint | Notes |
|---|---|
| `GET /api/Profile` 🔒 | The logged-in student's profile |
| `PUT /api/Profile` 🔒 | Update editable fields. The student ID is taken from the token — never send it |
| `GET /api/Profile/LevelHistory` 🔒 | Swim-level history |

---

## 5. Group classes

| Endpoint | Notes |
|---|---|
| `GET /api/Group/Registrations` 🔒 | Semesters the student is registered in. Gives you `registrationSemesterId` for the calls below |
| `GET /api/Group/Sessions?semesterId={id}` 🔒 | Sessions for that semester |
| `GET /api/Group/Attendance?semesterId={id}` 🔒 | The student's own attendance records |
| `GET /api/Group/AttendanceSummary?semesterId={id}` 🔒 | Attended / absent totals |

---

## 6. Private packages

| Endpoint | Notes |
|---|---|
| `GET /api/Private/Packages` 🔒 | All packages the student is on. Gives you `packageId` |
| `GET /api/Private/Packages/{packageId}` 🔒 | One package |
| `GET /api/Private/Sessions?packageId={id}` 🔒 | Sessions for that package |

A package the student is not on simply returns an **empty list** — ownership is enforced
in the query itself.

---

## 7. Payments & receipts

| Endpoint | Notes |
|---|---|
| `GET /api/Payments/Group?semesterId={id}` 🔒 | Group payments. Pass `0` for *all* semesters |
| `GET /api/Payments/Private?packageId={id}` 🔒 | Private payments. Pass `0` for *all* packages |
| `GET /api/Payments/Group/{paymentId}/Receipt` 🔒 | **NEW** — full printable receipt |
| `GET /api/Payments/Private/{privatePaymentId}/Receipt` 🔒 | **NEW** — full printable receipt |

### Receipt payload

The two `/Receipt` endpoints return everything needed to render or print a receipt —
serial number, a friendly receipt number, issued-to, amounts, payment mode, and the
**branch with its contact details**:

```jsonc
// GET /api/Payments/Private/11068/Receipt
{
  "privatePaymentId": 11068,
  "idShow": 1413,                       // friendly receipt number
  "serial": "Pr-RD20200925",
  "privatePaymentDate": "2020-09-25T00:00:00",
  "issuedTo": "Mrs. Nehme",
  "privatePaymentTotalAmount": 330000,
  "privatePaymentPaidAmount": 330000,
  "privatePaymentPaidCurrency": "LBP",
  "paymentMode": "Cash",                // Cash / Cheque / Visa
  "packageName": "10 Sessions",
  "packageNetToPay": 800000,
  "packageTotalPaid": 800000,
  "packageDue": 0,
  "coachFullName": "C- Hadi Saad",
  "locationNickName": "Radisson",
  "locationFullAddress": "Ain Mraysseh",
  "locationCity": "Beirut",
  "locationPhone1": "9611367239"
}
```

The group receipt has the same shape plus `semesterName`, and `studentPaidAmount` /
`studentDueAmount` — a group payment can cover several students, so those two are **this
student's own share**.

A receipt that doesn't belong to the student returns **404**.

---

## 8. Locations

**No login required** — API key only. Use these for the branch list and the location
detail / map screen.

| Endpoint |
|---|
| `GET /api/Locations/GetLocations` |
| `GET /api/Locations/GetLocationById?id={id}` |

```jsonc
{
  "locationId": 2,
  "locationNickName": "Radisson",
  "locationFullName": "Radisson Martinez Blu",
  "locationCity": "Beirut",
  "locationFullAddress": "Ain Mraysseh",
  "locationContact": "Mr Omar fakhreddine",
  "locationContactPhone": "+96178969094",
  "locationPhone1": "9611367239",
  "locationPhone2": "-",
  "locationInfoEmail": "-",
  "locationWebsiteText": "Ein Mraysseh, near Phoenicia. Reserved for private and group classes…",
  "locationXLAT": "33.900258",          // map pin
  "locationXLONG": "35.492821",
  "locationMapURL": "-",
  "locationIcon": "RD",
  "locationActive": true
}
```

⚠️ Some fields contain a literal `"-"` as a placeholder rather than being empty. Treat
`"-"` and `""` as "no value" before rendering.

Use `locationXLAT` / `locationXLONG` for the map pin — `locationMapURL` is often unset.

---

## 9. Notifications

| Endpoint | Notes |
|---|---|
| `GET /api/Notifications` 🔒 | The student's in-app inbox, newest first |
| `POST /api/Notifications/TestMe` 🔒 | Sends a test push to the logged-in student |

```jsonc
// GET /api/Notifications
[
  { "pushNotificationId": 85, "studentId": 113,
    "date": "2026-07-12T20:03:39", "type": "Info",
    "desc": "Your practice on Saturday is at 11:00" }
]
```

**Push delivery.** Pushes are sent through Firebase Cloud Messaging to the **topic**
`student_{studentId}`. For a device to receive them, the app must subscribe to that topic
after login:

```
subscribeToTopic("student_" + studentId)
```

and unsubscribe on logout. Without that subscription the notification still appears in the
in-app inbox above, but the phone will never buzz.

---

## 10. Feedback

| Endpoint | Notes |
|---|---|
| `GET /api/Feedback` 🔒 | Feedback requests for the student |
| `POST /api/Feedback/{id}/Answer` 🔒 | Submit answers |

---

## 11. Skills checklist

| Endpoint |
|---|
| `GET /api/Students/GetChecklist?studentId={id}` |

---

## Appendix — quick reference

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/Auth/Login` | key only |
| POST | `/api/Auth/ChangePassword` | 🔒 |
| POST | `/api/Auth/SendVerificationCode` | 🔒 |
| POST | `/api/Auth/VerifyCode` | 🔒 |
| GET  | `/api/Profile` | 🔒 |
| PUT  | `/api/Profile` | 🔒 |
| GET  | `/api/Profile/LevelHistory` | 🔒 |
| GET  | `/api/Group/Registrations` | 🔒 |
| GET  | `/api/Group/Sessions?semesterId=` | 🔒 |
| GET  | `/api/Group/Attendance?semesterId=` | 🔒 |
| GET  | `/api/Group/AttendanceSummary?semesterId=` | 🔒 |
| GET  | `/api/Private/Packages` | 🔒 |
| GET  | `/api/Private/Packages/{id}` | 🔒 |
| GET  | `/api/Private/Sessions?packageId=` | 🔒 |
| GET  | `/api/Payments/Group?semesterId=` | 🔒 |
| GET  | `/api/Payments/Private?packageId=` | 🔒 |
| GET  | `/api/Payments/Group/{id}/Receipt` | 🔒 |
| GET  | `/api/Payments/Private/{id}/Receipt` | 🔒 |
| GET  | `/api/Locations/GetLocations` | key only |
| GET  | `/api/Locations/GetLocationById?id=` | key only |
| GET  | `/api/Notifications` | 🔒 |
| POST | `/api/Notifications/TestMe` | 🔒 |
| GET  | `/api/Feedback` | 🔒 |
| POST | `/api/Feedback/{id}/Answer` | 🔒 |
| GET  | `/api/Students/GetChecklist?studentId=` | key only |
