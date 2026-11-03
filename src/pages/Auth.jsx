
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { signUp,signIn } = useAuth();

  const handleSubmit = async (event) => {
  event.preventDefault();

  setSubmitting(true);
  setMessage("");
  setErrorMessage("");

  try {
    if (isLogin) {
      await signIn({ email, password });

      window.location.href = "/";
      return;
    }

    const data = await signUp({
      fullName,
      email,
      password,
      role,
    });

    if (data.session) {
      setMessage("Account created successfully!");
    } else {
      setMessage(
        "Account created. Please check your email to confirm your account."
      );
    }
  } catch (error) {
    setErrorMessage(error.message);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <main className="min-h-screen bg-[#F0F8F6] text-[#102A43]">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">

        {/* Left section */}
        <section className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
          <div>
            <a href="/" className="inline-flex items-center gap-3">
              <span className="text-4xl">🎓</span>
              <span className="text-3xl font-bold tracking-tight">
                Study<span className="text-teal-700">Mart</span>
              </span>
            </a>
            <p className="ml-14 mt-1 text-sm text-slate-500">
              Buy · Sell · Connect
            </p>
          </div>

          <div className="relative z-10 max-w-lg">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              YOUR CAMPUS MARKETPLACE
            </p>
            <h1 className="text-5xl font-bold leading-tight">
              {isLogin
                ? "Your Campus Marketplace"
                : "Join the StudyMart Community"}
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">
              {isLogin
                ? "Find great deals on books, notes, electronics and more. Buy or sell with fellow students and local sellers."
                : "Create your account and discover a community where students and local shops buy, sell and grow together."}
            </p>

            <div className="mt-10 rounded-3xl bg-[#DDEFEA] p-8">
              <div className="text-8xl text-center">🎒</div>
              <div className="mt-5 flex justify-center gap-4 text-4xl">
                <span>📚</span>
                <span>💻</span>
                <span>📝</span>
                <span>🎧</span>
              </div>
              <p className="mt-4 text-center text-sm text-slate-600">
                Everything students need, all in one place.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-teal-100 pt-6 text-center">
            <div>
              <span className="text-xl">🔒</span>
              <p className="mt-2 text-sm font-semibold">Safe & Secure</p>
              <p className="mt-1 text-xs text-slate-500">Your data matters</p>
            </div>
            <div>
              <span className="text-xl">🤝</span>
              <p className="mt-2 text-sm font-semibold">Student Community</p>
              <p className="mt-1 text-xs text-slate-500">Buy and sell locally</p>
            </div>
            <div>
              <span className="text-xl">♻️</span>
              <p className="mt-2 text-sm font-semibold">Reuse & Save</p>
              <p className="mt-1 text-xs text-slate-500">Give items new life</p>
            </div>
          </div>
        </section>

        {/* Right section */}
        <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:py-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-9">

            {/* Mobile logo */}
            <a href="/" className="mb-8 flex items-center gap-2 lg:hidden">
              <span className="text-3xl">🎓</span>
              <span className="text-2xl font-bold">
                Study<span className="text-teal-700">Mart</span>
              </span>
            </a>

            <div className="mb-8">
              <h2 className="text-3xl font-bold">
                {isLogin ? "Welcome Back!" : "Create Your Account"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isLogin
                  ? "Log in to continue to your StudyMart account."
                  : "Join StudyMart. It only takes a minute."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-semibold">
                    Full Name
                  </label>
                  <input
  id="fullName"
  name="fullName"
  type="text"
  value={fullName}
  onChange={(event) => setFullName(event.target.value)}
  autoComplete="name"
  required
  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
/>
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                  Email Address
                </label>
                <input
  id="email"
  name="email"
  type="email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
  autoComplete="email"
  required
  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
/>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                  Password
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 pr-3 transition focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    required
                    className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-2 text-xs font-semibold text-slate-500 hover:text-teal-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {isLogin ? (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input
                      type="checkbox"
                      className="accent-teal-700"
                    />
                    Remember me
                  </label>
                  <Link
  to="/forgot-password"
  className="text-sm font-medium text-brand hover:underline"
>
  Forgot password?
</Link>
                </div>
              ) : (
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold">
                    Choose Your Role
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      aria-pressed={role === "student"}
                      className={`rounded-xl border p-4 text-left transition ${
                        role === "student"
                          ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700"
                          : "border-slate-200 hover:border-teal-300"
                      }`}
                    >
                      <span className="text-2xl">🎓</span>
                      <span className="mt-2 block text-sm font-bold">Student</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Buy and sell items with other students.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("local_seller")}
                      aria-pressed={role === "local_seller"}
                      className={`rounded-xl border p-4 text-left transition ${
                        role === "local_seller"
                          ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700"
                          : "border-slate-200 hover:border-teal-300"
                      }`}
                    >
                      <span className="text-2xl">🏪</span>
                      <span className="mt-2 block text-sm font-bold">Local Seller</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Register your shop and sell products.
                      </span>
                    </button>
                  </div>
                </fieldset>
              )}

              {message && (
                <p role="status" className="text-sm text-green-700">{message}</p>
              )}
              {errorMessage && (
                <p role="alert" className="text-sm text-red-600">{errorMessage}</p>
              )}

             <button
  type="submit"
  disabled={submitting}
  className="w-full rounded-xl bg-teal-700 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
>
  {submitting
    ? "Please wait..."
    : isLogin
      ? "Log In"
      : "Create Account"}
</button>
            </form>

            

{errorMessage && (
  <p className="mt-4 text-sm text-red-600">
    {errorMessage}
  </p>
)}

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              {" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowPassword(false);
                }}
                className="font-bold text-teal-700 hover:text-teal-900"
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to StudyMart's Terms of Service and Privacy Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
