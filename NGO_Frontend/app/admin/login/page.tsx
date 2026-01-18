"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Call AUTH login endpoint
      const res = await axios.post("https://ngo-backend-sska.onrender.com/api/auth/login", {
        email,
        password,
      });

      // ✅ Validate ADMIN role
      if (res.data.user.role !== "ADMIN") {
        alert("This account is not an admin.");
        return;
      }

      // ✅ Clear old session
      localStorage.clear();

      // ✅ Save new session
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("email", res.data.user.email);
      localStorage.setItem("role", res.data.user.role);

      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("LOGIN ERROR ❌", err);
      alert(err.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-200 via-purple-100 to-indigo-100">
      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-md rounded-3xl bg-white/70 p-8 shadow-xl backdrop-blur"
      >
        {/* Back to Home */}
        <Link
          href="/"
          className="absolute left-4 top-4 text-sm font-medium text-purple-600 hover:underline"
        >
          ← Back to Home
        </Link>

        <h1 className="mb-6 text-center text-2xl font-bold text-purple-700">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Admin Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border px-4 py-3 focus:outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-xl border px-4 py-3 focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
