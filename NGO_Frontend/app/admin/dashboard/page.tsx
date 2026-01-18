"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  IndianRupee,
  List,
  Download,
  ChevronLeft,
  ChevronRight,
  Pencil,
  User,
  Lock,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ---------------- TYPES ---------------- */

type Donation = {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

type Person = {
  _id: string;
  name: string;
  email: string;
};

const PAGE_SIZE = 5;

/* ---------------- COMPONENT ---------------- */

export default function AdminDashboard() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);

  // ✅ Profile Data
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [authChecked, setAuthChecked] = useState(false);

  /* Profile UI */
  const [showProfile, setShowProfile] = useState(false);
  const [editName, setEditName] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /* Stats */
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalAmount: 0,
  });

  /* Data */
  const [donations, setDonations] = useState<Donation[]>([]);
  const [users, setUsers] = useState<Person[]>([]);
  const [admins, setAdmins] = useState<Person[]>([]);

  const [view, setView] = useState<"donations" | "users" | "admins">("donations");

  /* Filters */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  /* Pagination */
  const [page, setPage] = useState(1);

  /* ---------------- API FUNCTIONS ---------------- */

  async function fetchStats(t: string) {
    const res = await axios.get("https://ngo-backend-sska.onrender.com/api/admin/stats", {
      headers: { Authorization: `Bearer ${t}` },
    });
    setStats(res.data);
  }

  async function fetchDonations(t: string) {
    const res = await axios.get(
      "https://ngo-backend-sska.onrender.com/api/admin/donations",
      { headers: { Authorization: `Bearer ${t}` } }
    );
    setDonations(res.data);
  }

  async function fetchUsers(t: string) {
    const res = await axios.get("https://ngo-backend-sska.onrender.com/api/admin/users", {
      headers: { Authorization: `Bearer ${t}` },
    });
    setUsers(res.data);
  }

  async function fetchAdmins(t: string) {
    const res = await axios.get("https://ngo-backend-sska.onrender.com/api/admin/admins", {
      headers: { Authorization: `Bearer ${t}` },
    });
    setAdmins(res.data);
  }

  function handleLogout() {
    localStorage.clear();
    router.push("/admin/login");
  }

  async function saveProfile() {
  try {
    if (!token) return;

    const payload: any = {};
    if (editName && newName.trim()) payload.name = newName;
    if (editPassword && newPassword.trim())
      payload.password = newPassword;

    if (!payload.name && !payload.password) return;

    const res = await axios.put(
      "https://ngo-backend-sska.onrender.com/api/admin/update-profile",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    
    localStorage.setItem("name", res.data.admin.name);
    setAdminName(res.data.admin.name);
    setNewName(res.data.admin.name);

    alert("Profile updated successfully ✅");

    setEditName(false);
    setEditPassword(false);
    setNewPassword("");
  } catch (err: any) {
    alert(err.response?.data?.message || "Failed to update profile");
  }
}


  /* ---------------- AUTH INIT ---------------- */

  useEffect(() => {
    const t = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");

    if (!t) {
      router.push("/admin/login");
      return;
    }

    // ✅ LOAD PROFILE DATA
    setToken(t);
    setAdminName(name || "Admin");
    setAdminEmail(email || "not-found@email.com");
    setNewName(name || "");

    setAuthChecked(true);

    fetchStats(t);
    fetchDonations(t);
    fetchUsers(t);
    fetchAdmins(t);
  }, []);

  /* ---------------- FILTER LOGIC ---------------- */

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const text =
        (d.user?.name || "").toLowerCase() +
        (d.user?.email || "").toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || d.status === statusFilter;

      const donationDate = new Date(d.createdAt).getTime();

      const matchesFromDate =
        !fromDate || donationDate >= new Date(fromDate).getTime();

      const matchesToDate =
        !toDate ||
        donationDate <= new Date(toDate + "T23:59:59").getTime();

      const matchesMinAmount =
        !minAmount || d.amount >= Number(minAmount);

      const matchesMaxAmount =
        !maxAmount || d.amount <= Number(maxAmount);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate &&
        matchesMinAmount &&
        matchesMaxAmount
      );
    });
  }, [
    donations,
    search,
    statusFilter,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
  ]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const filteredAdmins = useMemo(() => {
    return admins.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [admins, search]);

  useEffect(() => {
    setPage(1);
  }, [view, search, statusFilter, fromDate, toDate, minAmount, maxAmount]);

  const activeData =
    view === "donations"
      ? filteredDonations
      : view === "users"
      ? filteredUsers
      : filteredAdmins;

  const totalPages = Math.max(1, Math.ceil(activeData.length / PAGE_SIZE));

  const paginatedData = activeData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ---------------- EXPORT ---------------- */

  function exportCSV() {
    if (!activeData.length) return alert("No data to export");

    const headers = Object.keys(activeData[0]).join(",");
    const csv = activeData.map((r) => Object.values(r).join(","));

    const blob = new Blob([headers + "\n" + csv.join("\n")], {
      type: "text/csv",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${view}.csv`;
    link.click();
  }

  /* ---------------- UI ---------------- */

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-100 to-indigo-100 p-6">
      {/* LOGOUT */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleLogout}
          className="rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white"
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} />
        <StatCard
          title="Total Donations"
          value={stats.totalDonations}
          icon={<List />}
        />
        <StatCard
          title="Total Amount"
          value={`₹${stats.totalAmount}`}
          icon={<IndianRupee />}
        />
      </div>

      {/* PROFILE SECTION */}
      <div className="mb-6 rounded-3xl bg-white/60 p-5 shadow">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex w-full items-center justify-between font-semibold"
        >
          <div className="flex items-center gap-2">
            <User size={18} /> Profile
          </div>
          <span>{showProfile ? "−" : "+"}</span>
        </button>

        {showProfile && (
          <div className="mt-4 space-y-3">
            {/* EMAIL */}
            <div className="flex items-center gap-3">
              <Mail size={18} />
              <input
                value={adminEmail}
                disabled
                className="w-full rounded border bg-gray-100 px-3 py-2"
              />
            </div>

            {/* NAME */}
            <div className="flex items-center gap-3">
              <User size={18} />
              <input
                value={newName}
                disabled={!editName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
              <button onClick={() => setEditName(!editName)}>
                <Pencil size={16} />
              </button>
            </div>

            {/* PASSWORD */}
            <div className="flex items-center gap-3">
              <Lock size={18} />
              <input
                type="password"
                value={newPassword}
                disabled={!editPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full rounded border px-3 py-2"
              />
              <button onClick={() => setEditPassword(!editPassword)}>
                <Pencil size={16} />
              </button>
            </div>

            {(editName || editPassword) && (
              <button
                onClick={saveProfile}
                className="rounded-lg bg-purple-600 px-4 py-2 text-white"
              >
                Save Changes
              </button>
            )}
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Tab
          label="Donations"
          active={view === "donations"}
          onClick={() => setView("donations")}
        />
        <Tab
          label="Users"
          active={view === "users"}
          onClick={() => setView("users")}
        />
        <Tab
          label="Admins"
          active={view === "admins"}
          onClick={() => setView("admins")}
        />
      </div>

      {/* FILTERS */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border bg-white/70 px-3 py-2"
        />

        {view === "donations" && (
          <>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border bg-white/70 px-3 py-2"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>

            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-xl border bg-white/70 px-3 py-2" />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-xl border bg-white/70 px-3 py-2" />
            <input type="number" placeholder="Min ₹" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="w-28 rounded-xl border bg-white/70 px-3 py-2" />
            <input type="number" placeholder="Max ₹" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="w-28 rounded-xl border bg-white/70 px-3 py-2" />
          </>
        )}

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-white"
        >
          <Download size={16} /> Export
        </button>
      </div>

      {/* TABLE */}
      <div className="rounded-3xl bg-white/60 p-4 shadow overflow-x-auto">
        {view === "donations" && (
          <DonationsTable donations={paginatedData as Donation[]} />
        )}
        {view !== "donations" && (
          <SimpleTable data={paginatedData as Person[]} />
        )}
      </div>

      {/* PAGINATION */}
      <div className="mt-4 flex justify-center items-center gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft />
        </button>

        <span className="font-semibold">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function Tab({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 font-semibold ${
        active ? "bg-purple-600 text-white" : "bg-white/70"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="rounded-3xl bg-white/60 p-5 shadow">
      <div className="flex items-center gap-3 text-purple-900">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

function SimpleTable({ data }: { data: Person[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="px-5 py-4">Name</th>
          <th className="px-5 py-4">Email</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d._id} className="border-b">
            <td className="px-5 py-4">{d.name}</td>
            <td className="px-5 py-4">{d.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DonationsTable({ donations }: { donations: Donation[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="px-5 py-4">User</th>
          <th className="px-5 py-4">Email</th>
          <th className="px-5 py-4">Amount</th>
          <th className="px-5 py-4">Status</th>
          <th className="px-5 py-4">Date</th>
        </tr>
      </thead>
      <tbody>
        {donations.map((d) => (
          <tr key={d._id} className="border-b">
            <td className="px-5 py-4">{d.user?.name}</td>
            <td className="px-5 py-4">{d.user?.email}</td>
            <td className="px-5 py-4">₹{d.amount}</td>
            <td className="px-5 py-4">
              <span
                className={`px-3 py-1 rounded-full text-xs ${
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
            <td className="px-5 py-4">
              {new Date(d.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
