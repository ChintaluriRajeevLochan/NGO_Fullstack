"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function UserRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("https://ngo-backend-sska.onrender.com/api/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful ✅ Please login.");
      router.push("/user/login");
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-200 via-purple-100 to-indigo-100 px-4">
      <form
        onSubmit={handleRegister}
        className="relative w-full max-w-md rounded-3xl bg-white/70 p-8 shadow-xl backdrop-blur-xl"
      >
        {/* Back */}
        <Link
          href="/"
          className="absolute left-4 top-4 text-sm font-medium text-purple-600 hover:underline"
        >
          ← Back to Home
        </Link>

        {/* Title */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="rounded-full bg-purple-100 p-3">
            <UserPlus className="text-purple-700" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-purple-800">
            Create Your Account
          </h1>
          <p className="text-sm text-gray-600">
            Register to start donating securely
          </p>
        </div>

        {/* Name */}
        <input
          type="text"
          placeholder="Full Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
        />

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.03]"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        {/* Login Redirect */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/user/login"
            className="font-semibold text-purple-700 hover:underline"
          >
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
