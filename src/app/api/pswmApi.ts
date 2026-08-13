const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.VITE_BUILD_TARGET === "capacitor"
    ? // Native builds ignore the Vite proxy — this is what an installed app hits.
      // V27_API = unified-auth test build. Point store builds back at
      // https://admin.proswim-lb.com/Proswim_API once the new API is promoted.
      "https://admin.proswim-lb.com/V27_API"
    : "/V27_API");

const API_KEY = import.meta.env.VITE_API_KEY || "dev-api-key-12345";

// --- Auth storage ---

export function getStoredToken(): string | null {
  return localStorage.getItem("authToken");
}

export function setStoredToken(token: string): void {
  localStorage.setItem("authToken", token);
}

export function clearAuth(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("currentUser");
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// --- Core fetch helper ---

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-API-KEY": API_KEY,
  };

  if (requiresAuth) {
    const token = getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  });

  // A 401 on an authenticated call means the session is gone (expired, or the
  // server stopped honouring old tokens) — sign out and return to sign-in.
  if (res.status === 401 && requiresAuth) {
    clearAuth();
    if (import.meta.env.VITE_BUILD_TARGET === "capacitor") {
      // HashRouter (Capacitor build)
      window.location.hash = "#/signin";
    } else if (!window.location.pathname.endsWith("/signin")) {
      // BrowserRouter with basename /Mobilev1 (web build)
      window.location.href = "/Mobilev1/signin";
    }
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    // Prefer the server's user-safe message when the body is JSON like { "message": "..." }
    try {
      const parsed = JSON.parse(txt);
      if (parsed && typeof parsed.message === "string" && parsed.message) {
        throw new ApiError(parsed.message, res.status);
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
    }
    throw new ApiError(`${res.status}: ${txt || res.statusText}`, res.status);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json() as Promise<T>;
  return res.text() as unknown as Promise<T>;
}

// --- Types ---

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  studentId: number;
  studentFullName: string;
  message: string;
  mustChangePassword: boolean;
  verified: boolean;
}

export interface SendCodeResponse {
  sent: boolean;
  phone: string;
  expiresInMinutes: number;
  message: string;
}

export interface VerifyCodeResponse {
  verified: boolean;
  message: string;
}

export interface ProfileDto {
  studentId: number;
  studentFirstName: string | null;
  studentMiddleName: string | null;
  studentLastName: string | null;
  studentGender: string | null;
  studentDateOfBirth: string | null;
  studentSchool: string | null;
  studentEmail: string | null;
  studentEmail2: string | null;
  studentPhoneNumberCode1: string | null;
  studentPhoneNumber1: string | null;
  studentPhoneNumberCode2: string | null;
  studentPhoneNumber2: string | null;
  studentAddressCity: string | null;
  studentAddressRegion: string | null;
  studentAddressStreet: string | null;
  studentAddressBuilding: string | null;
  studentAddressFloor: string | null;
  studentNationality1: string | null;
  studentNationality2: string | null;
  studentNotes: string | null;
  studentLatestLevelName: string | null;
  studentPrimaryLocationId: number | null;
  locationNickName: string | null;
  studentPhotoUrl: string | null;
  coachFullName: string | null;
  studentEmergencyContactName: string | null;
  studentEmergencyContactPhoneCode: string | null;
  studentEmergencyContactPhone: string | null;
  studentEmergencyContactRelation: string | null;
  studentAllergies: string | null;
  studentMedicalNotes: string | null;
}

export interface ProfileUpdateDto {
  studentMiddleName: string | null;
  studentGender: string | null;
  studentSchool: string | null;
  studentFacebookAccount: string | null;
  studentParentFacebook: string | null;
  studentBloodTypeId: number | null;
  studentAddressCity: string | null;
  studentAddressRegion: string | null;
  studentAddressStreet: string | null;
  studentAddressBuilding: string | null;
  studentAddressFloor: string | null;
  studentNotes: string | null;
  studentNationality1: string | null;
  studentNationality2: string | null;
  studentMomOccupation: string | null;
  studentDadOccupation: string | null;
  studentVaccinated: boolean | null;
  studentVaccinatedRemarks: string | null;
  studentDifficultyRemarks: string | null;
}

export interface LevelHistoryDto {
  levelHistoryId: number;
  levelName: string | null;
  levelDateFrom: string | null;
  levelDateTo: string | null;
  levelRemarks: string | null;
}

export interface RegistrationDto {
  registrationId: number;
  semesterName: string | null;
  registrationSemesterId: number;
  registrationNetToPay: number;
  registrationCost: number;
  registrationDiscount: number;
  registrationStudentStopped: boolean | null;
  className1: string | null;
  className2: string | null;
  className3: string | null;
  locationNickName: string | null;
  registrationDate: string | null;
}

export interface SessionDto {
  sessionId: number;
  sessionClassId: number;
  sessionDate: string | null;
  sessionStatus: string | null;
  className: string | null;
  sessionDesc: string | null;
  attended: number;
  registered: number;
  makeuped: string | null;
  // This student's own attendance, included in /Group/Sessions so no
  // separate /Group/Attendance call is needed. Null until attendance is taken.
  myAttendanceId: number | null;
  myAttended: boolean | null;
  myAttendanceStatus: string | null;
  myRemarks: string | null;
  myMakeUpSessionId: number | null;
  myMakeUpDate: string | null;
  semesterId: number | null;
  semesterName: string | null;
  locationNickName: string | null;
  classDay: string | null;
  classTimeFrom: string | null;
  coachFullName: string | null;
}

export interface AttendanceDto {
  attendanceId: number;
  attendanceSessionId: number;
  sessionDate: string | null;
  attendanceStudentAttended: boolean | null;
  attendanceStatus: string | null;
  attendanceRemarks: string | null;
  className: string | null;
  semesterName: string | null;
}

export interface AttendanceSummaryDto {
  registrationId: number;
  studentFullName: string | null;
  semesterName: string | null;
  className: string | null;
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  locationNickName: string | null;
}

export interface GroupPaymentDto {
  paymentId: number;
  paymentIssuedTo: string | null;
  paymentDate: string | null;
  paymentTotalAmount: number;
  paymentPaidAmount: number;
  paymentPaidCurrency: string | null;
  semesterName: string | null;
  paymentSemesterId: number;
  paymentCash: number | null;
  paymentChq: number | null;
  paymentCC: number | null;
}

export interface GroupPaymentDueDto {
  registrationId: number;
  studentFullName: string | null;
  semesterName: string | null;
  registrationNetToPay: number;
  totalPaid: number;
  dueAmount: number;
  locationNickName: string | null;
}

export interface PrivatePackageDto {
  packageId: number;
  packageName: string | null;
  packageNamewInfo: string | null;
  packageStatus: string | null;
  packageLevel: string | null;
  packageNumberOfSessions: number;
  packageCurrency: string | null;
  packageAmount: number;
  packageNetToPay: number;
  packageStartDate: string | null;
  coachFullName: string | null;
  locationNickName: string | null;
  duePayment: number;
  amountPaid: number;
  sessionsLeft: number;
  countAttended: number;
}

export interface PrivateSessionDto {
  privateSessionId: number;
  privateSessionDate: string | null;
  privateSessionTime: string | null;
  privateSessionState: string | null;
  privateSessionAttended: boolean | null;
  privateSessionRemarks: string | null;
  coachFullName: string | null;
  locationIcon: string | null;
  privateSessionMkupDate: string | null;
  privateSessionMkupTime: string | null;
  coachMkup: string | null;
}

export interface PrivatePaymentDto {
  privatePaymentId: number;
  privatePackageId: number;
  privatePaymentIssuedTo: string | null;
  privatePaymentDate: string | null;
  privatePaymentTotalAmount: number;
  privatePaymentPaidAmount: number;
  privatePaymentPaidCurrency: string | null;
  packageName: string | null;
  coachFullName: string | null;
  privatePaymentCash: number | null;
  privatePaymentChq: number | null;
  privatePaymentCC: number | null;
}

export interface PrivatePaymentDueDto {
  packageId: number;
  packageName: string | null;
  packageStatus: string | null;
  packageNetToPay: number;
  totalPaid: number;
  dueAmount: number;
  coachFullName: string | null;
  locationNickName: string | null;
  packageCurrency: string | null;
}

export interface PaymentSummaryDto {
  totalGroupNetToPay: number;
  totalGroupPaid: number;
  totalGroupDue: number;
  totalPrivateNetToPay: number;
  totalPrivatePaid: number;
  totalPrivateDue: number;
}

export interface FeedbackRequestDto {
  id: number;
  refId: number;
  refType: string | null;
  feedbackIntroduction: string | null;
  feedbackQuestion1Text: string | null;
  feedbackQuestion2Text: string | null;
  feedbackQuestion3Text: string | null;
  feedbackQuestion4Text: string | null;
  feedbackQuestion5Text: string | null;
  feedbackRequestedDate1: string | null;
  alreadyAnswered: boolean;
  feedbackFilledDate: string | null;
  feedbackQuestion1Answer: number | null;
  feedbackQuestion2Answer: number | null;
  feedbackQuestion3Answer: number | null;
  feedbackQuestion4Answer: number | null;
  feedbackQuestion5Answer: number | null;
  feedbackQuestionSuggestions: string | null;
}

export interface FeedbackAnswerRequest {
  id: number;
  refId: number;
  psCode: string;
  q1Answer: number;
  q2Answer: number;
  q3Answer: number;
  q4Answer: number;
  q5Answer: number;
  q6Suggestion: string;
}

export interface LocationDto {
  locationId: number;
  locationNickName: string | null;
  locationFullName: string | null;
  locationCity: string | null;
  locationActive: boolean;
}

export interface LocationDetailDto extends LocationDto {
  locationPhone1: string | null;
  locationPhone2: string | null;
  locationEmail: string | null;
  locationAddress: string | null;
  locationLatitude: number | null;
  locationLongitude: number | null;
}

export interface StudentDto {
  studentId: number;
  studentFirstName: string | null;
  studentMiddleName: string | null;
  studentLastName: string | null;
  studentGender: string | null;
  studentDateOfBirth: string | null;
  studentSchool: string | null;
  studentEmail: string | null;
  studentEmail2: string | null;
  studentFacebookAccount: string | null;
  studentParentFacebook: string | null;
  studentBloodTypeId: number | null;
  studentPhoneNumberCode1: string | null;
  studentPhoneNumber1: string | null;
  studentPhoneNumberCode2: string | null;
  studentPhoneNumber2: string | null;
  studentAddressCity: string | null;
  studentAddressRegion: string | null;
  studentAddressStreet: string | null;
  studentAddressBuilding: string | null;
  studentAddressFloor: string | null;
  studentNotes: string | null;
  studentNationality1: string | null;
  studentNationality2: string | null;
  studentMomOccupation: string | null;
  studentDadOccupation: string | null;
  studentDifficulty: boolean | null;
  studentDifficultyRemarks: string | null;
  studentEliteSwimmer: boolean | null;
  studentGiftedSwimmer: boolean | null;
  studentGroupSwimmer: boolean | null;
  studentPrivateSwimmer: boolean | null;
  studentSchoolSwimmer: boolean | null;
  studentAquaBabySwimmer: boolean | null;
  studentAquaGymSwimmer: boolean | null;
  studentOthersSwimmer: boolean | null;
  studentVaccinated: boolean | null;
  studentVaccinatedRemarks: string | null;
  studentWaitingList: boolean | null;
  studentActive: boolean | null;
  studentDeleted: boolean | null;
  studentShowOnline: boolean | null;
  studentShowWallofFame: boolean | null;
  studentShowChampion: boolean | null;
  studentShowSpecial: boolean | null;
  studentSpecialText: string | null;
  studentLatestLevelName: string | null;
  studentStartingDate: string | null;
  studentPhotoUrl: string | null;
  coachFullName: string | null;
}

export interface StudentProfileUpdateDto {
  studentId: number;
  studentMiddleName: string | null;
  studentGender: string | null;
  studentSchool: string | null;
  studentFacebookAccount: string | null;
  studentParentFacebook: string | null;
  studentBloodTypeId: number | null;
  studentAddressCity: string | null;
  studentAddressRegion: string | null;
  studentAddressStreet: string | null;
  studentAddressBuilding: string | null;
  studentAddressFloor: string | null;
  studentNotes: string | null;
  studentNationality1: string | null;
  studentNationality2: string | null;
  studentMomOccupation: string | null;
  studentDadOccupation: string | null;
  studentDifficulty: boolean | null;
  studentDifficultyRemarks: string | null;
  studentEliteSwimmer: boolean | null;
  studentGiftedSwimmer: boolean | null;
  studentGroupSwimmer: boolean | null;
  studentPrivateSwimmer: boolean | null;
  studentSchoolSwimmer: boolean | null;
  studentAquaBabySwimmer: boolean | null;
  studentAquaGymSwimmer: boolean | null;
  studentOthersSwimmer: boolean | null;
  studentVaccinated: boolean | null;
  studentVaccinatedRemarks: string | null;
  studentWaitingList: boolean | null;
}

// --- API Functions ---

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(
    "/api/Auth/Login",
    { method: "POST", body: JSON.stringify({ username, password }) },
    false
  );
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await apiRequest<void>("/api/Auth/ChangePassword", {
    method: "POST",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function sendVerificationCode(): Promise<SendCodeResponse> {
  return apiRequest<SendCodeResponse>("/api/Auth/SendVerificationCode", { method: "POST" });
}

export async function verifyCode(code: string): Promise<VerifyCodeResponse> {
  return apiRequest<VerifyCodeResponse>("/api/Auth/VerifyCode", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

// Legacy data quirk: some LBP amounts are stored with a USD currency label.
// Any amount above 10,000 is treated as LBP; smaller amounts keep their currency.
export function effectiveCurrency(amount: number, currency?: string | null): string {
  return Math.abs(amount) > 10000 ? "LBP" : (currency || "USD");
}

export function formatMoney(amount: number, currency?: string | null): string {
  return `${amount.toLocaleString()} ${effectiveCurrency(amount, currency)}`;
}

// Mirror of the server password policy — check before calling the API.
export function validatePasswordPolicy(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password must contain at least one symbol (e.g. ! @ # $ % & *).";
  return null;
}

export async function getProfile(): Promise<ProfileDto> {
  return apiRequest<ProfileDto>("/api/Profile");
}

export async function updateProfile(data: ProfileUpdateDto): Promise<void> {
  await apiRequest<void>("/api/Profile", { method: "PUT", body: JSON.stringify(data) });
}

export async function getProfileLevelHistory(): Promise<LevelHistoryDto[]> {
  return apiRequest<LevelHistoryDto[]>("/api/Profile/LevelHistory");
}

// --- Personal Information (parent-editable) ---

export interface PersonalInfoUpdateDto {
  studentAddressCity: string | null;
  studentAddressRegion: string | null;
  studentAddressStreet: string | null;
  studentAddressBuilding: string | null;
  studentAddressFloor: string | null;
  studentEmergencyContactName: string | null;
  studentEmergencyContactPhoneCode: string | null;
  studentEmergencyContactPhone: string | null;
  studentEmergencyContactRelation: string | null;
  studentAllergies: string | null;
  studentMedicalNotes: string | null;
}

export async function updatePersonalInfo(data: PersonalInfoUpdateDto): Promise<void> {
  await apiRequest<void>("/api/Profile/PersonalInfo", { method: "PUT", body: JSON.stringify(data) });
}

// Changing the main phone/email is a request that ProSwim staff approve —
// the value only changes after approval (security rule).
export interface ContactChangeRequestDto {
  requestId: number;
  fieldType: string | null;      // "Phone" | "Email"
  oldValue: string | null;
  newPhoneCode: string | null;
  newValue: string | null;
  status: string | null;         // Pending | Approved | Rejected | Cancelled
  requestedDate: string | null;
  reviewedDate: string | null;
  reviewNote: string | null;
}

export async function getContactChangeRequests(): Promise<ContactChangeRequestDto[]> {
  return apiRequest<ContactChangeRequestDto[]>("/api/Profile/ContactChangeRequests");
}

export async function submitContactChangeRequest(
  fieldType: "Phone" | "Email",
  newValue: string,
  newPhoneCode?: string
): Promise<{ requestId: number; message: string }> {
  return apiRequest<{ requestId: number; message: string }>("/api/Profile/ContactChangeRequest", {
    method: "POST",
    body: JSON.stringify({ fieldType, newValue, newPhoneCode: newPhoneCode || null }),
  });
}

// --- Competitive Team Portfolio (read-only) ---
// Row objects keep the DB's PascalCase column names (EventName, TimeMs, ...).

export type PortfolioRow = Record<string, unknown>;

export interface CompPortfolioDto {
  personalBests: PortfolioRow[];
  results: PortfolioRow[];
  awards: PortfolioRow[];
  documents: PortfolioRow[];
  evaluations: PortfolioRow[];
  upcomingCompetitions: PortfolioRow[];
}

export async function getCompPortfolio(): Promise<CompPortfolioDto> {
  return apiRequest<CompPortfolioDto>("/api/Comp/Portfolio");
}

// --- Family accounts (multi-child parents) ---
// A family = swimmers sharing the account's main phone + staff-made links.
// Switching re-issues a student token for the sibling; everything else in the
// app then loads that swimmer's data automatically.

export interface FamilyMemberDto {
  studentId: number;
  studentFullName: string | null;
  studentDateOfBirth: string | null;
  studentPhotoUrl: string | null;
  studentLatestLevelName: string | null;
  locationNickName: string | null;
  isCurrent: boolean;
}

export async function getFamily(): Promise<FamilyMemberDto[]> {
  return apiRequest<FamilyMemberDto[]>("/api/Family");
}

export async function switchStudent(studentId: number): Promise<void> {
  const res = await apiRequest<{ token: string; studentId: number; studentFullName: string }>(
    "/api/Family/Switch",
    { method: "POST", body: JSON.stringify({ studentId }) },
  );
  setStoredToken(res.token);
  const raw = localStorage.getItem("currentUser");
  const user = raw ? JSON.parse(raw) : {};
  localStorage.setItem("currentUser", JSON.stringify({
    ...user,
    name: res.studentFullName,
    studentId: res.studentId,
    role: "student",
  }));
}

export async function getGroupRegistrations(): Promise<RegistrationDto[]> {
  return apiRequest<RegistrationDto[]>("/api/Group/Registrations");
}

export async function getGroupSessions(
  semesterId?: number,
  dateFrom?: string,
  dateTo?: string
): Promise<SessionDto[]> {
  const q = new URLSearchParams();
  if (semesterId != null) q.set('semesterId', String(semesterId));
  if (dateFrom) q.set('dateFrom', dateFrom);
  if (dateTo) q.set('dateTo', dateTo);
  const qs = q.toString();
  return apiRequest<SessionDto[]>(`/api/Group/Sessions${qs ? `?${qs}` : ''}`);
}

export async function getGroupAttendance(semesterId?: number): Promise<AttendanceDto[]> {
  const q = semesterId != null ? `?semesterId=${semesterId}` : "";
  return apiRequest<AttendanceDto[]>(`/api/Group/Attendance${q}`);
}

export async function getGroupAttendanceSummary(semesterId?: number): Promise<AttendanceSummaryDto[]> {
  const q = semesterId != null ? `?semesterId=${semesterId}` : "";
  return apiRequest<AttendanceSummaryDto[]>(`/api/Group/AttendanceSummary${q}`);
}

export async function getGroupPayments(semesterId: number): Promise<GroupPaymentDto[]> {
  return apiRequest<GroupPaymentDto[]>(`/api/Payments/Group?semesterId=${semesterId}`);
}

export async function getGroupPaymentsDue(): Promise<GroupPaymentDueDto[]> {
  return apiRequest<GroupPaymentDueDto[]>("/api/Payments/GroupDue");
}

export async function getPrivatePackages(): Promise<PrivatePackageDto[]> {
  return apiRequest<PrivatePackageDto[]>("/api/Private/Packages");
}

export async function getPrivatePackage(id: number): Promise<PrivatePackageDto> {
  return apiRequest<PrivatePackageDto>(`/api/Private/Packages/${id}`);
}

export async function getPrivateSessions(
  packageId?: number,
  opts?: { dateFrom?: string; dateTo?: string; onlyActive?: boolean }
): Promise<PrivateSessionDto[]> {
  const q = new URLSearchParams();
  if (packageId != null) q.set('packageId', String(packageId));
  if (opts?.dateFrom) q.set('dateFrom', opts.dateFrom);
  if (opts?.dateTo) q.set('dateTo', opts.dateTo);
  if (opts?.onlyActive) q.set('onlyActive', 'true');
  const qs = q.toString();
  return apiRequest<PrivateSessionDto[]>(`/api/Private/Sessions${qs ? `?${qs}` : ''}`);
}

export async function getPrivatePayments(packageId: number): Promise<PrivatePaymentDto[]> {
  return apiRequest<PrivatePaymentDto[]>(`/api/Payments/Private?packageId=${packageId}`);
}

export async function getPrivatePaymentsDue(): Promise<PrivatePaymentDueDto[]> {
  return apiRequest<PrivatePaymentDueDto[]>("/api/Payments/PrivateDue");
}

export async function getPaymentSummary(): Promise<PaymentSummaryDto> {
  return apiRequest<PaymentSummaryDto>("/api/Payments/Summary");
}

export async function getFeedback(): Promise<FeedbackRequestDto[]> {
  return apiRequest<FeedbackRequestDto[]>("/api/Feedback");
}

export async function answerFeedback(id: number, data: FeedbackAnswerRequest): Promise<void> {
  await apiRequest<void>(`/api/Feedback/${id}/Answer`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getLocations(): Promise<LocationDto[]> {
  return apiRequest<LocationDto[]>("/api/Locations/GetLocations", {}, false);
}

export async function getLocationById(id: number): Promise<LocationDetailDto> {
  return apiRequest<LocationDetailDto>(`/api/Locations/GetLocationById?id=${id}`, {}, false);
}

export async function getStudentById(id: number): Promise<StudentDto> {
  return apiRequest<StudentDto>(`/api/Students/GetStudentById?id=${id}`);
}

export async function updateStudentProfile(data: StudentProfileUpdateDto): Promise<void> {
  await apiRequest<void>("/api/Students/UpdateStudentProfile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface ChecklistItemDto {
  checklistItemId: number;
  checklistItemText: string;
  checklistItemLevelName: string;
  checklistItemOrder: number;
  isChecked: boolean;
  dateChecked: string | null;
  checkedByUserId: number | null;
}

export async function getChecklist(studentId: number): Promise<ChecklistItemDto[]> {
  return apiRequest<ChecklistItemDto[]>(`/api/Students/GetChecklist?studentId=${studentId}`);
}

export interface NewsItemDto {
  newsId: number;
  newsTitle: string;
  newsBody: string;
  newsImageURL: string | null;
  newsLocationId: number | null;
  newsDate: string | null;
  /** Optional social buttons under the article, linking to ProSwim profiles. */
  newsWhatsappURL: string | null;
  newsYoutubeURL: string | null;
  newsFacebookURL: string | null;
}

export async function getNews(locationId?: number): Promise<NewsItemDto[]> {
  const q = locationId ? `?locationId=${locationId}` : '';
  return apiRequest<NewsItemDto[]>(`/api/News${q}`);
}

export interface NotificationDto {
  pushNotificationId: number;
  studentId: number;
  date: string;
  type: string | null;
  desc: string | null;
}

export async function getNotifications(): Promise<NotificationDto[]> {
  return apiRequest<NotificationDto[]>('/api/Notifications');
}

export interface GroupReceiptDto {
  paymentId: number;
  studentName: string | null;
  semesterName: string | null;
  paymentDate: string | null;
  paymentPaidAmount: number;
  paymentPaidCurrency: string | null;
  paymentTotalAmount: number;
  paymentNotes: string | null;
}

export interface PrivateReceiptDto {
  privatePaymentId: number;
  studentName: string | null;
  packageName: string | null;
  coachFullName: string | null;
  privatePaymentDate: string | null;
  privatePaymentPaidAmount: number;
  privatePaymentPaidCurrency: string | null;
  privatePaymentTotalAmount: number;
  privatePaymentNotes: string | null;
}

export async function getGroupReceipt(paymentId: number): Promise<GroupReceiptDto> {
  return apiRequest<GroupReceiptDto>(`/api/Payments/Group/${paymentId}/Receipt`);
}

export async function getPrivateReceipt(privatePaymentId: number): Promise<PrivateReceiptDto> {
  return apiRequest<PrivateReceiptDto>(`/api/Payments/Private/${privatePaymentId}/Receipt`);
}
