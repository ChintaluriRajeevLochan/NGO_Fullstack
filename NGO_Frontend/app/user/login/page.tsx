"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("https://ngo-backend-sska.onrender.com/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("email", res.data.user.email);

      router.push("/user/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
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
          User Login
        </h1>

        <input
          type="email"
          placeholder="Email"
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
          className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-gray-700">
          New user?{" "}
          <Link
            href="/user/register"
            className="font-semibold text-purple-600 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
