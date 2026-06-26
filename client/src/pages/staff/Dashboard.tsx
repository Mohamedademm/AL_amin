import { useState } from "react";
import { Mail, Phone, Lock, Save, User } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../utils/format";

export default function StaffDashboard() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState(() => ({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  }));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    setSaving(true);
    try {
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPwd(false);
      toast.success("Password changed");
    } catch {
      toast.error("Could not change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Welcome, ${user?.firstName} 👋`}
        subtitle="Manage your profile and account settings."
      />

      {/* Profile card */}
      <div className="mb-8 rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-xl font-bold text-primary">
            {initials(user?.firstName, user?.lastName)}
          </span>
          <div>
            <h2 className="text-xl font-bold text-content">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <Mail size={14} /> {user?.email}
            </p>
            {user?.phone && (
              <p className="flex items-center gap-1.5 text-sm text-muted">
                <Phone size={14} /> {user?.phone}
              </p>
            )}
          </div>
          <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit profile */}
      <section className="mb-6 rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <User size={18} className="text-primary" />
          <h3 className="font-semibold text-content">My information</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <Input
            label="Last name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
        <div className="mt-3">
          <Input
            label="Email"
            type="email"
            value={user?.email ?? ""}
            disabled
            icon={<Mail size={17} />}
          />
        </div>
        <div className="mt-3">
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            icon={<Phone size={17} />}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveProfile} disabled={saving}>
            <Save size={16} /> {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock size={18} className="text-primary" />
          <h3 className="font-semibold text-content">Password</h3>
        </div>
        {!showPwd ? (
          <Button variant="outline" onClick={() => setShowPwd(true)}>
            <Lock size={16} /> Change password
          </Button>
        ) : (
          <div className="space-y-3">
            <Input
              label="Current password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              placeholder="Enter current password"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="New password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                minLength={8}
                placeholder="Min 8 chars"
              />
              <Input
                label="Confirm password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                minLength={8}
                placeholder="Repeat password"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowPwd(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSavePassword}
                disabled={
                  saving ||
                  !passwordForm.newPassword ||
                  passwordForm.newPassword !== passwordForm.confirmPassword
                }
              >
                {saving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
