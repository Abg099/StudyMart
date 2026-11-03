
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, role, loading, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        ""
      );
    }
  }, [user]);

  if (loading) {
    return <div className="py-20 text-center">Loading profile...</div>;
  }

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!fullName.trim()) {
      setError("Full name cannot be empty.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password && password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setSaving(true);

    try {
      await updateProfile({
        fullName,
        password,
      });

      setPassword("");
      setConfirmPassword("");
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-2xl">

          <div className="mb-8">
            <p className="font-bold uppercase tracking-widest text-brand">
              Account Settings
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              Edit Profile
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your account information and password.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >

            {/* Account Information */}
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Account Information
              </h2>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  Email Address
                </label>

                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Email address cannot be changed.
                </p>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  Account Type
                </label>

                <input
                  type="text"
                  value={
                    role === "local_seller"
                      ? "Local Seller"
                      : role === "student"
                      ? "Student"
                      : role || "User"
                  }
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Account type cannot be changed.
                </p>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Leave these fields empty if you don't want to change your password.
              </p>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  New Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {message}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand px-6 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
