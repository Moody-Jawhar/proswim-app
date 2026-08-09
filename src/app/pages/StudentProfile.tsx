import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Save,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import { MobileHeader } from "../components/MobileHeader";
import { MobileNav } from "../components/MobileNav";
import {
  getStudentById,
  updateStudentProfile,
  type StudentDto,
  type StudentProfileUpdateDto,
} from "../api/pswmApi";

const proswimLogo = "https://www.proswim-lb.com/Gallery/_Website/Logo/ProSwimLogo.png";

// Alias to keep the rest of the file unchanged
type StudentProfileUpdateRequest = StudentProfileUpdateDto;

function toDateOnly(iso: string | null): string {
  if (!iso) return "";
  // if your API returns "2026-01-03T00:00:00", keep yyyy-mm-dd
  return iso.substring(0, 10);
}

export function StudentProfile() {
  const { id } = useParams<{ id: string }>();

  const studentId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [id]);

  const [activeTab, setActiveTab] = useState<"overview" | "edit">("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [student, setStudent] = useState<StudentDto | null>(null);
  const [form, setForm] = useState<StudentProfileUpdateRequest | null>(null);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      setError("Invalid student id in route.");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const data = await getStudentById(studentId);

        setStudent(data);

        // initialize editable form from loaded student
        const editable: StudentProfileUpdateRequest = {
          studentId: data.studentId,

          studentMiddleName: data.studentMiddleName,
          studentGender: data.studentGender,
          studentSchool: data.studentSchool,

          studentFacebookAccount: data.studentFacebookAccount,
          studentParentFacebook: data.studentParentFacebook,
          studentBloodTypeId: data.studentBloodTypeId,

          studentAddressCity: data.studentAddressCity,
          studentAddressRegion: data.studentAddressRegion,
          studentAddressStreet: data.studentAddressStreet,
          studentAddressBuilding: data.studentAddressBuilding,
          studentAddressFloor: data.studentAddressFloor,

          studentNotes: data.studentNotes,

          studentNationality1: data.studentNationality1,
          studentNationality2: data.studentNationality2,
          studentMomOccupation: data.studentMomOccupation,
          studentDadOccupation: data.studentDadOccupation,

          studentDifficulty: data.studentDifficulty,
          studentDifficultyRemarks: data.studentDifficultyRemarks,

          studentEliteSwimmer: data.studentEliteSwimmer,
          studentGiftedSwimmer: data.studentGiftedSwimmer,
          studentGroupSwimmer: data.studentGroupSwimmer,
          studentPrivateSwimmer: data.studentPrivateSwimmer,
          studentSchoolSwimmer: data.studentSchoolSwimmer,
          studentAquaBabySwimmer: data.studentAquaBabySwimmer,
          studentAquaGymSwimmer: data.studentAquaGymSwimmer,
          studentOthersSwimmer: data.studentOthersSwimmer,

          studentVaccinated: data.studentVaccinated,
          studentVaccinatedRemarks: data.studentVaccinatedRemarks,
          studentWaitingList: data.studentWaitingList,
        };

        setForm(editable);
      } catch (e: any) {
        setError(e?.message || "Failed to load student profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  async function handleSave() {
    if (!form) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateStudentProfile(form);

      const refreshed = await getStudentById(form.studentId);
      setStudent(refreshed);

      setSuccess("Profile updated successfully.");
      setActiveTab("overview");
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const fullName = student
    ? [student.studentFirstName, student.studentMiddleName, student.studentLastName]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Student Profile" showBack={true} showSignOut={true} />

      <div className="px-4 py-6 space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="relative bg-gradient-to-br from-[#1e5c97] to-[#1a6bb8] p-6 pb-16">
            <img
              src={proswimLogo}
              alt="ProSwim"
              className="absolute top-4 right-4 h-12 w-auto opacity-20"
            />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <User className="size-6 text-white" />
              </div>
              <div>
                <div className="text-white text-lg">{loading ? "Loading..." : fullName || "Student"}</div>
                <div className="text-white/80 text-sm">
                  ID: {studentId || "-"} {student?.studentSchool ? `• ${student.studentSchool}` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Quick info */}
          <div className="p-5 -mt-8">
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                <ShieldAlert className="size-5 text-red-600" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3">
                <CheckCircle className="size-5 text-green-600" />
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <InfoChip
                icon={<Mail className="size-4 text-blue-600" />}
                label="Email"
                value={student?.studentEmail || "-"}
              />
              <InfoChip
                icon={<Phone className="size-4 text-blue-600" />}
                label="Phone"
                value={
                  student?.studentPhoneNumber1
                    ? `${student?.studentPhoneNumberCode1 || ""} ${student?.studentPhoneNumber1}`
                    : "-"
                }
              />
              <InfoChip
                icon={<Calendar className="size-4 text-blue-600" />}
                label="Birthdate"
                value={toDateOnly(student?.studentDateOfBirth || null) || "-"}
              />
              <InfoChip
                icon={<MapPin className="size-4 text-blue-600" />}
                label="City"
                value={student?.studentAddressCity || "-"}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
            Overview
          </TabButton>
          <TabButton active={activeTab === "edit"} onClick={() => setActiveTab("edit")}>
            Edit Profile
          </TabButton>
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4">
            <h3 className="text-lg text-gray-900">Profile Details</h3>

            <InfoRow label="First Name" value={student?.studentFirstName || "-"} />
            <InfoRow label="Middle Name" value={student?.studentMiddleName || "-"} />
            <InfoRow label="Last Name" value={student?.studentLastName || "-"} />
            <InfoRow label="Gender" value={student?.studentGender || "-"} />
            <InfoRow label="School" value={student?.studentSchool || "-"} />
            <InfoRow label="Email 2" value={student?.studentEmail2 || "-"} />
            <InfoRow label="Nationality 1" value={student?.studentNationality1 || "-"} />
            <InfoRow label="Nationality 2" value={student?.studentNationality2 || "-"} />
            <InfoRow label="Notes" value={student?.studentNotes || "-"} />

            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-sm text-gray-700 mb-2">
                Read-only flags (from system)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <FlagBadge label="Active" value={student?.studentActive} />
                <FlagBadge label="Deleted" value={student?.studentDeleted} />
                <FlagBadge label="Online" value={student?.studentShowOnline} />
                <FlagBadge label="Wall of Fame" value={student?.studentShowWallofFame} />
                <FlagBadge label="Champion" value={student?.studentShowChampion} />
                <FlagBadge label="Special" value={student?.studentShowSpecial} />
              </div>
            </div>
          </div>
        )}

        {/* Edit */}
        {activeTab === "edit" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-5">
            <h3 className="text-lg text-gray-900">Edit Profile</h3>

            {loading || !student || !form ? (
              <div className="text-sm text-gray-600">Loading form…</div>
            ) : (
              <>
                {/* Read-only section */}
                <div className="rounded-xl bg-gray-50 p-4 space-y-3">
                  <h4 className="text-sm text-gray-700">Locked fields</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="First Name" value={student.studentFirstName || ""} disabled />
                    <Input label="Last Name" value={student.studentLastName || ""} disabled />
                    <Input label="Email" value={student.studentEmail || ""} disabled />
                    <Input
                      label="Phone"
                      value={`${student.studentPhoneNumberCode1 || ""} ${student.studentPhoneNumber1 || ""}`.trim()}
                      disabled
                    />
                    <Input label="Birthdate" value={toDateOnly(student.studentDateOfBirth)} disabled />
                    <Input label="Special Text" value={student.studentSpecialText || ""} disabled />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Toggle label="Active" checked={!!student.studentActive} disabled />
                    <Toggle label="Deleted" checked={!!student.studentDeleted} disabled />
                    <Toggle label="Online" checked={!!student.studentShowOnline} disabled />
                    <Toggle label="Wall of Fame" checked={!!student.studentShowWallofFame} disabled />
                    <Toggle label="Champion" checked={!!student.studentShowChampion} disabled />
                    <Toggle label="Special" checked={!!student.studentShowSpecial} disabled />
                  </div>
                </div>

                {/* Editable section */}
                <div className="space-y-3">
                  <h4 className="text-sm text-gray-700">Editable fields</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Middle Name"
                      value={form.studentMiddleName || ""}
                      onChange={(v) => setForm({ ...form, studentMiddleName: v || null })}
                    />
                    <Input
                      label="Gender"
                      value={form.studentGender || ""}
                      onChange={(v) => setForm({ ...form, studentGender: v || null })}
                    />
                  </div>

                  <Input
                    label="School"
                    value={form.studentSchool || ""}
                    onChange={(v) => setForm({ ...form, studentSchool: v || null })}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Facebook"
                      value={form.studentFacebookAccount || ""}
                      onChange={(v) => setForm({ ...form, studentFacebookAccount: v || null })}
                    />
                    <Input
                      label="Parent Facebook"
                      value={form.studentParentFacebook || ""}
                      onChange={(v) => setForm({ ...form, studentParentFacebook: v || null })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="City"
                      value={form.studentAddressCity || ""}
                      onChange={(v) => setForm({ ...form, studentAddressCity: v || null })}
                    />
                    <Input
                      label="Region"
                      value={form.studentAddressRegion || ""}
                      onChange={(v) => setForm({ ...form, studentAddressRegion: v || null })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Street"
                      value={form.studentAddressStreet || ""}
                      onChange={(v) => setForm({ ...form, studentAddressStreet: v || null })}
                    />
                    <Input
                      label="Building"
                      value={form.studentAddressBuilding || ""}
                      onChange={(v) => setForm({ ...form, studentAddressBuilding: v || null })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Floor"
                      value={form.studentAddressFloor || ""}
                      onChange={(v) => setForm({ ...form, studentAddressFloor: v || null })}
                    />
                    <Input
                      label="Blood Type Id"
                      type="number"
                      value={form.studentBloodTypeId?.toString() || ""}
                      onChange={(v) =>
                        setForm({
                          ...form,
                          studentBloodTypeId: v ? Number(v) : null,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Nationality 1"
                      value={form.studentNationality1 || ""}
                      onChange={(v) => setForm({ ...form, studentNationality1: v || null })}
                    />
                    <Input
                      label="Nationality 2"
                      value={form.studentNationality2 || ""}
                      onChange={(v) => setForm({ ...form, studentNationality2: v || null })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Mom Occupation"
                      value={form.studentMomOccupation || ""}
                      onChange={(v) => setForm({ ...form, studentMomOccupation: v || null })}
                    />
                    <Input
                      label="Dad Occupation"
                      value={form.studentDadOccupation || ""}
                      onChange={(v) => setForm({ ...form, studentDadOccupation: v || null })}
                    />
                  </div>

                  <TextArea
                    label="Notes"
                    value={form.studentNotes || ""}
                    onChange={(v) => setForm({ ...form, studentNotes: v || null })}
                  />

                  <div className="rounded-xl bg-gray-50 p-4 space-y-3">
                    <h4 className="text-sm text-gray-700">Flags (editable)</h4>

                    <div className="grid grid-cols-2 gap-2">
                      <Toggle
                        label="Difficulty"
                        checked={!!form.studentDifficulty}
                        onChange={(b) => setForm({ ...form, studentDifficulty: b })}
                      />
                      <Toggle
                        label="Vaccinated"
                        checked={!!form.studentVaccinated}
                        onChange={(b) => setForm({ ...form, studentVaccinated: b })}
                      />
                      <Toggle
                        label="Waiting List"
                        checked={!!form.studentWaitingList}
                        onChange={(b) => setForm({ ...form, studentWaitingList: b })}
                      />

                      <Toggle
                        label="Elite Swimmer"
                        checked={!!form.studentEliteSwimmer}
                        onChange={(b) => setForm({ ...form, studentEliteSwimmer: b })}
                      />
                      <Toggle
                        label="Gifted Swimmer"
                        checked={!!form.studentGiftedSwimmer}
                        onChange={(b) => setForm({ ...form, studentGiftedSwimmer: b })}
                      />
                      <Toggle
                        label="Group Swimmer"
                        checked={!!form.studentGroupSwimmer}
                        onChange={(b) => setForm({ ...form, studentGroupSwimmer: b })}
                      />
                      <Toggle
                        label="Private Swimmer"
                        checked={!!form.studentPrivateSwimmer}
                        onChange={(b) => setForm({ ...form, studentPrivateSwimmer: b })}
                      />
                      <Toggle
                        label="School Swimmer"
                        checked={!!form.studentSchoolSwimmer}
                        onChange={(b) => setForm({ ...form, studentSchoolSwimmer: b })}
                      />
                      <Toggle
                        label="AquaBaby"
                        checked={!!form.studentAquaBabySwimmer}
                        onChange={(b) => setForm({ ...form, studentAquaBabySwimmer: b })}
                      />
                      <Toggle
                        label="AquaGym"
                        checked={!!form.studentAquaGymSwimmer}
                        onChange={(b) => setForm({ ...form, studentAquaGymSwimmer: b })}
                      />
                      <Toggle
                        label="Others"
                        checked={!!form.studentOthersSwimmer}
                        onChange={(b) => setForm({ ...form, studentOthersSwimmer: b })}
                      />
                    </div>

                    <TextArea
                      label="Difficulty Remarks"
                      value={form.studentDifficultyRemarks || ""}
                      onChange={(v) => setForm({ ...form, studentDifficultyRemarks: v || null })}
                    />
                    <TextArea
                      label="Vaccinated Remarks"
                      value={form.studentVaccinatedRemarks || ""}
                      onChange={(v) => setForm({ ...form, studentVaccinatedRemarks: v || null })}
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-[#1e5c97] text-white rounded-xl py-3 active:scale-[0.99] disabled:opacity-60"
                  >
                    <Save className="size-5" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 py-4 opacity-50">
          <img src={proswimLogo} alt="ProSwim" className="h-8 w-auto" />
          <span className="text-sm text-gray-500">ProSwim-LB</span>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}

/* ----------------- UI small components ----------------- */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
        active
          ? "bg-[#1e5c97] text-white"
          : "bg-gray-100 text-gray-600 active:scale-95"
      }`}
    >
      {children}
    </button>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <div className="text-xs text-gray-500">{label}</div>
      </div>
      <div className="text-sm text-gray-900 break-words">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm text-gray-900 text-right break-words max-w-[60%]">
        {value}
      </div>
    </div>
  );
}

function FlagBadge({ label, value }: { label: string; value: boolean | null | undefined }) {
  const on = !!value;
  return (
    <div
      className={`px-3 py-2 rounded-xl text-sm border ${
        on
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-gray-50 border-gray-200 text-gray-600"
      }`}
    >
      {label}: {on ? "Yes" : "No"}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-xl px-3 py-2 text-sm border outline-none ${
          disabled
            ? "bg-gray-100 text-gray-500 border-gray-200"
            : "bg-white text-gray-900 border-gray-200 focus:border-[#1e5c97]"
        }`}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl px-3 py-2 text-sm border outline-none bg-white text-gray-900 border-gray-200 focus:border-[#1e5c97]"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange?: (b: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange?.(!checked)}
      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-sm ${
        disabled
          ? "opacity-60 bg-gray-100 border-gray-200"
          : "bg-white border-gray-200 active:scale-[0.99]"
      }`}
    >
      <span className="text-gray-700">{label}</span>
      <span
        className={`w-10 h-6 rounded-full relative transition ${
          checked ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
