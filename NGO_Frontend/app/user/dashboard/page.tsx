"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Script from "next/script";
import { Wallet, History, User, LogOut, Pencil, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Donation = {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
};

type SectionKey = "donate" | "history" | "profile";

export default function UserDashboard() {
  const router = useRouter();

  const [openSections, setOpenSections] = useState({
    donate: true,
    history: false,
    profile: false,
  });

  const [donations, setDonations] = useState<Donation[]>([]);
  const [token, setToken] = useState<string | null>(null);

  // User info
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Edit states
  const [editName, setEditName] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  // Refs (prevents cursor jumping)
  const amountRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    const t = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");

    if (!t) {
      router.push("/user/login");
      return;
    }

    setToken(t);
    setUserName(name || "");
    setUserEmail(email || "");

    fetchDonations(t);
  }, []);

  /* ---------------- HELPERS ---------------- */

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/user/login");
  };

  /* ---------------- API ---------------- */

  const fetchDonations = async (t: string) => {
    try {
      const res = await axios.get("https://ngo-backend-sska.onrender.com/api/donations/my", {
        headers: { Authorization: `Bearer ${t}` },
      });
      setDonations(res.data);
    } catch {
      console.log("Failed to load donations");
    }
  };

  /* ---------------- RAZORPAY PAYMENT ---------------- */

  const handleDonate = async () => {
    if (!token) return;

    const amountValue = amountRef.current?.value;
    if (!amountValue) return alert("Enter amount");

    try {
      const orderRes = await axios.post(
        "https://ngo-backend-sska.onrender.com/api/donations/create-order",
        { amount: Number(amountValue) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { orderId, amount, key, donationId } = orderRes.data;

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Refresh page.");
        return;
      }

      const options = {
        key,
        amount,
        currency: "INR",
        name: "NGO Donation",
        description: "Sandbox Donation",
        order_id: orderId,

        handler: async function (response: any) {
          try {
            await axios.post(
              "https://ngo-backend-sska.onrender.com/api/donations/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                donationId,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            alert("Payment Successful ✅");
            if (amountRef.current) amountRef.current.value = "";
            fetchDonations(token);
          } catch {
            alert("Payment verification failed ❌");
          }
        },

        // ✅ User closes popup / cancels payment
        modal: {
          ondismiss: async () => {
            try {
              await axios.post(
                "https://ngo-backend-sska.onrender.com/api/donations/mark-failed",
                { donationId },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              alert("Payment cancelled ❌");
              fetchDonations(token);
            } catch {
              console.log("Failed to mark cancelled payment");
            }
          },
        },

        theme: { color: "#7c3aed" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err);
      alert("Unable to start payment");
    }
  };

  /* ---------------- PROFILE UPDATE ---------------- */

  async function saveProfile() {
    try {
      if (!token) return;

      const payload: any = {};

      if (editName && nameRef.current?.value.trim()) {
        payload.name = nameRef.current.value.trim();
      }

      if (editPassword && passwordRef.current?.value.trim()) {
        payload.password = passwordRef.current.value.trim();
      }

      if (!payload.name && !payload.password) return;

      const res = await axios.put(
        "https://ngo-backend-sska.onrender.com/api/auth/update-profile",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      localStorage.setItem("name", res.data.user.name);
      setUserName(res.data.user.name);

      alert("Profile updated successfully ✅");

      setEditName(false);
      setEditPassword(false);
      if (passwordRef.current) passwordRef.current.value = "";
    } catch {
      alert("Profile update failed");
    }
  }

  /* ---------------- UI COMPONENT ---------------- */

  const Section = ({
    id,
    title,
    icon,
    children,
  }: {
    id: SectionKey;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => {
    const isOpen = openSections[id];

    return (
      <div className="mb-6 rounded-3xl border border-white/50 bg-white/50 p-6 shadow-xl backdrop-blur-2xl">
        <div
          onClick={() => toggleSection(id)}
          className="flex cursor-pointer items-center gap-3 text-lg font-semibold text-purple-900"
        >
          {icon}
          {title}
        </div>

        {isOpen && <div className="mt-6">{children}</div>}
      </div>
    );
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-100 to-indigo-100 p-6">
      {/* Razorpay SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-purple-900">
          User Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-white shadow-lg transition hover:scale-[1.04]"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Donate */}
        <Section
          id="donate"
          title="Make a Donation"
          icon={<Wallet className="text-purple-700" />}
        >
          <div className="flex flex-col gap-4">
            <input
              ref={amountRef}
              type="number"
              placeholder="Enter amount ₹"
              className="w-full rounded-xl border border-gray-200 bg-white/80 p-2 outline-none focus:ring-2 focus:ring-purple-400"
            />

            <button
              onClick={handleDonate}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-2 font-semibold text-white shadow-lg transition hover:scale-[1.03]"
            >
              Pay via Razorpay ❤️
            </button>
          </div>
        </Section>

        {/* History */}
        <Section
          id="history"
          title="Donation History"
          icon={<History className="text-purple-700" />}
        >
          {donations.length === 0 ? (
            <p className="text-sm text-gray-600">No donations yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id} className="border-b">
                    <td>₹{d.amount}</td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          d.status === "SUCCESS"
                            ? "bg-green-200 text-green-800"
                            : d.status === "FAILED"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td>{new Date(d.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Profile */}
        <Section
          id="profile"
          title="Your Profile"
          icon={<User className="text-purple-700" />}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Mail size={18} />
              <input
                value={userEmail}
                disabled
                className="w-full rounded-xl border bg-gray-100 p-2"
              />
            </div>

            <div className="flex items-center gap-3">
              <User size={18} />
              <input
                ref={nameRef}
                defaultValue={userName}
                disabled={!editName}
                className="w-full rounded-xl border bg-white/80 p-2 disabled:bg-gray-100"
              />
              <button onClick={() => setEditName(true)}>
                <Pencil size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Lock size={18} />
              <input
                ref={passwordRef}
                type="password"
                disabled={!editPassword}
                placeholder="New Password"
                className="w-full rounded-xl border bg-white/80 p-2 disabled:bg-gray-100"
              />
              <button onClick={() => setEditPassword(true)}>
                <Pencil size={16} />
              </button>
            </div>

            {(editName || editPassword) && (
              <button
                onClick={saveProfile}
                className="rounded-xl bg-purple-600 py-2 text-white hover:bg-purple-700"
              >
                Save Changes
              </button>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
