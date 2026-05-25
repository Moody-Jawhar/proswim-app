const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/Proswim_API";

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

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${txt || res.statusText}`);
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
  sessionRemarks: string | null;
  className: string | null;
  coachFullName: string | null;
  locationNickName: string | null;
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
  packageStatus: string | null;
  packageNumberOfSessions: number;
  packageNetToPay: number;
  packageAmount: number;
  packageDiscount: number;
  packageStartDate: string | null;
  coachFullName: string | null;
  locationNickName: string | null;
  packageLevel: string | null;
  packageCurrency: string | null;
  sessionsAttended: number;
  sessionsRemaining: number;
}

export interface PrivateSessionDto {
  privateSessionId: number;
  packageId: number;
  privateSessionDate: string | null;
  privateSessionTime: string | null;
  privateSessionStatus: string | null;
  privateSessionState: string | null;
  privateSessionAttended: boolean | null;
  privateSessionRemarks: string | null;
  coachFullName: string | null;
  locationNickName: string | null;
  packageName: string | null;
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

export async function getProfile(): Promise<ProfileDto> {
  return apiRequest<ProfileDto>("/api/Profile");
}

export async function updateProfile(data: ProfileUpdateDto): Promise<void> {
  await apiRequest<void>("/api/Profile", { method: "PUT", body: JSON.stringify(data) });
}

export async function getProfileLevelHistory(): Promise<LevelHistoryDto[]> {
  return apiRequest<LevelHistoryDto[]>("/api/Profile/LevelHistory");
}

export async function getGroupRegistrations(): Promise<RegistrationDto[]> {
  return apiRequest<RegistrationDto[]>("/api/Group/Registrations");
}

export async function getGroupSessions(semesterId?: number): Promise<SessionDto[]> {
  const q = semesterId != null ? `?semesterId=${semesterId}` : "";
  return apiRequest<SessionDto[]>(`/api/Group/Sessions${q}`);
}

export async function getGroupAttendance(semesterId?: number): Promise<AttendanceDto[]> {
  const q = semesterId != null ? `?semesterId=${semesterId}` : "";
  return apiRequest<AttendanceDto[]>(`/api/Group/Attendance${q}`);
}

export async function getGroupAttendanceSummary(semesterId?: number): Promise<AttendanceSummaryDto[]> {
  const q = semesterId != null ? `?semesterId=${semesterId}` : "";
  return apiRequest<AttendanceSummaryDto[]>(`/api/Group/AttendanceSummary${q}`);
}

export async function getGroupPayments(): Promise<GroupPaymentDto[]> {
  return apiRequest<GroupPaymentDto[]>("/api/Payments/Group");
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

export async function getPrivateSessions(): Promise<PrivateSessionDto[]> {
  return apiRequest<PrivateSessionDto[]>("/api/Private/Sessions");
}

export async function getPrivateSessionsUpcoming(): Promise<PrivateSessionDto[]> {
  return apiRequest<PrivateSessionDto[]>("/api/Private/Sessions/Upcoming");
}

export async function getPrivateSessionsHistory(): Promise<PrivateSessionDto[]> {
  return apiRequest<PrivateSessionDto[]>("/api/Private/Sessions/History");
}

export async function getPrivatePayments(): Promise<PrivatePaymentDto[]> {
  return apiRequest<PrivatePaymentDto[]>("/api/Payments/Private");
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

export async function getLocationById(id: number): Promise<LocationDto> {
  return apiRequest<LocationDto>(`/api/Locations/GetLocationById?id=${id}`, {}, false);
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
