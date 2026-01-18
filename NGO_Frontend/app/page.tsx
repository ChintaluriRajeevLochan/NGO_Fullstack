"use client";

import { useRouter } from "next/navigation";
import { User, Shield } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-200 via-purple-100 to-indigo-100 px-6">
      <div className="w-full max-w-3xl">
        {/* Title */}
        <h1 className="mb-4 text-center text-4xl font-bold text-purple-900">
          NGO Registration & Donation
          <br />
          Management System
        </h1>

        <p className="mx-auto mb-12 max-w-xl text-center text-gray-700">
          A secure platform where users can register, optionally donate, and
          track their donation history while administrators monitor
          registrations and payments transparently.
        </p>

        {/* Cards Container (VERTICAL) */}
        <div className="flex flex-col gap-8">
          {/* USER CARD */}
          <div
            onClick={() => router.push("/user/login")}
            className="group cursor-pointer rounded-3xl border border-white/40 bg-white/60 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-4 group-hover:bg-purple-200 transition">
                <User className="text-purple-700" size={32} />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-purple-900">
                  User
                </h2>
                <p className="text-gray-600">
                  Register, login, donate and track your donation status.
                </p>
              </div>
            </div>
          </div>

          {/* ADMIN CARD */}
          <div
            onClick={() => router.push("/admin/login")}
            className="group cursor-pointer rounded-3xl border border-white/40 bg-white/60 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-indigo-100 p-4 group-hover:bg-indigo-200 transition">
                <Shield className="text-indigo-700" size={32} />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-indigo-900">
                  Admin
                </h2>
                <p className="text-gray-600">
                  Login to monitor registrations and donation analytics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-12 text-center text-sm text-gray-500">
          Click a role to continue →
        </p>
      </div>
    </div>
  );
}
