
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { supabase } from "../createClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      setValidSession(!error && !!data.session);
      setChecking(false);
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setPassword("");
      setConfirmPassword("");
      setMessage("Your password has been updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-[70vh] bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Reset Password
          </h1>

          {checking ? (
            <p className="mt-4 text-sm text-slate-500">
              Verifying your reset link...
            </p>
          ) : !validSession ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-red-600">
                This reset link is invalid or expired. Please request a new one.
              </p>

              <Link
                to="/forgot-password"
                className="inline-block font-semibold text-brand hover:underline"
              >
                Request another reset link
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-500">
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    New password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Confirm new password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                {message && (
                  <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {message}
                  </p>
                )}

                {error && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                {!message && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                )}

                {message && (
                  <Link
                    to="/login"
                    className="block text-center font-semibold text-brand hover:underline"
                  >
                    Go to Login
                  </Link>
                )}
              </form>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
