import { useEffect, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Clock,
  History,
  CheckCircle,
  LogOut,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  FileText,
  TrendingUp,
  RefreshCw,
  X,
} from "lucide-react";

export default function ScholarshipDashboard() {
  const [isOpen, setIsOpen] = useState(false);
   const token = localStorage.getItem("token"); 
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Verification checkboxes
  const [scholarshipVerified, setScholarshipVerified] = useState(false);
  const [amountCleared, setAmountCleared] = useState(false);
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);
  const [noPendingRecovery, setNoPendingRecovery] = useState(false);
  const [remark, setRemark] = useState("");

  // ── Fetch Dashboard Data ───────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        "http://localhost:5000/api/department/scholarship",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setApplications(res.data);

      setStats({
        pending: res.data.length,
        approved: 0,
        rejected: 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);

    try {
      const res = await axios.get(
        "http://localhost:5000/api/department/scholarship/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (
      !scholarshipVerified ||
      !amountCleared ||
      !documentsSubmitted ||
      !noPendingRecovery
    ) {
      alert("Verify all requirements");
      return;
    }

    if (!remark.trim()) {
      alert("Remark required");
      return;
    }

    await axios.put(
      `http://localhost:5000/api/department/update/${selectedApp._id}`,
      {
        department: "scholarship",
        status: "approved",
        remark,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
alert("Application approved successfully!");
    resetModal();

    fetchDashboardData();
  };

  const handleReject = async () => {
    if (!remark.trim()) {
      alert("Remark required");
      return;
    }

    await axios.put(
      `http://localhost:5000/api/department/update/${selectedApp._id}`,
      {
        department: "scholarship",
        status: "rejected",
        remark,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
alert(" Application rejected!");
    resetModal();

    fetchDashboardData();
  };

  const resetModal = () => {
    setSelectedApp(null);
    setScholarshipVerified(false);
    setAmountCleared(false);
    setDocumentsSubmitted(false);
    setNoPendingRecovery(false);
    setRemark("");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      alert("Logged out!");
    }
  };

  // ── Status Badge ───────────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
            Pending
          </span>
        );
    }
  };

  // ── Component ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* ════════════════════ SIDEBAR ════════════════════ */}
       <div className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white flex flex-col shadow-2xl transform transition-transform duration-300 z-50
${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>  {/* Logo */}
        <div className="p-6 border-b border-emerald-700 relative">
          <button 
  className="md:hidden absolute top-4 right-4 text-white text-xl"
  onClick={() => setIsOpen(false)}
>
  ✕
</button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10  bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                Scholarship Department
              </h1>
              <p className="text-xs text-emerald-200 mt-0.5">
                No Dues Management
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            {
              id: "dashboard",
              label: "Dashboard",
              sub: "Overview & Statistics",
              Icon: LayoutDashboard,
            },
            {
              id: "pending",
              label: "Pending Applications",
              sub: "Review & Process",
              Icon: Clock,
              badge: stats.pending,
            },
            {
              id: "history",
              label: "History",
              sub: "All Processed Apps",
              Icon: History,
            },
          ].map(({ id, label, sub, Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === id
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-emerald-100 hover:bg-blue-700 hover:text-white"
              }`}
            >
              <Icon className="mr-3 w-5 h-5 flex-shrink-0" />
              <div className="text-left flex-1">
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs opacity-70">{sub}</p>
              </div>
              {badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-emerald-700">
          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">Scholarship Admin</p>
              <p className="text-xs text-emerald-300">Department Head</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            <LogOut className="mr-2 w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* ════════════════════ MAIN CONTENT ════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        {/* Top Header */}
        <div className="bg-white border-b px-6 py-4 shadow-sm flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "pending" && "Pending Applications"}
                {activeTab === "history" && "Application History"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {activeTab === "pending" &&
                  "Review and process pending applications"}
                {activeTab === "history" && "View all processed applications"}
                {activeTab === "dashboard" &&
                  "Monitor scholarship clearance applications"}
              </p>
           
            </div>
            <button 
  className="md:hidden text-2xl"
  onClick={() => setIsOpen(true)}
>
  ☰
</button>
             
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* ════ DASHBOARD ════ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pending */}
                <div className="bg-white rounded-xl shadow border border-orange-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Clock className="w-7 h-7 text-orange-600" />
                    </div>
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.pending}
                  </p>
                </div>

                {/* Approved */}
                <div className="bg-white rounded-xl shadow border border-green-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Today
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Approved Today</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.approved}
                  </p>
                </div>

                {/* Rejected */}
                <div className="bg-white rounded-xl shadow border border-red-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <TrendingUp className="w-7 h-7 text-red-500" />
                    </div>
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      Today
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Rejected Today</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.rejected}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow border p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab("pending")}
                    className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-emerald-600 text-white rounded-lg mr-4">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Review Pending Applications
                        </p>
                        <p className="text-sm text-gray-500">
                          {stats.pending} applications waiting
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("history")}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-600 text-white rounded-lg mr-4">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          View Application History
                        </p>
                        <p className="text-sm text-gray-500">
                          All processed applications
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-xl shadow border p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  System Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Total Today
                    </span>
                    <span className="font-bold text-emerald-600">
                      {stats.pending + stats.approved + stats.rejected}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Clearance Rate
                    </span>
                    <span className="font-bold text-green-600">
                      {stats.approved + stats.rejected > 0
                        ? Math.round(
                            (stats.approved /
                              (stats.approved + stats.rejected)) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      System
                    </span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ PENDING ════ */}
          {activeTab === "pending" && (
            <div className="bg-white rounded-xl shadow border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Pending Applications
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                    {stats.pending} Applications
                  </span>
                  <button
                    onClick={fetchDashboardData}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
                    <p className="text-gray-500">Loading applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="flex justify-center mb-6">
                      <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      All Clear!
                    </h3>
                    <p className="text-gray-500 mb-1">
                      No pending applications at the moment
                    </p>
                    <p className="text-sm text-gray-400">
                      New applications will appear here automatically
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "#",
                          "Roll No",
                          "Name",
                          "Branch",
                          "Applied On",
                          "Action",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {applications.map((app, idx) => (
                        <tr
                          key={app._id}
                          className="hover:bg-emerald-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm font-semibold text-emerald-700">
                            {app.rollNumber}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {app.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                              {app.branch}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(app.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ════ HISTORY ════ */}
          {activeTab === "history" && (
            <div className="bg-white rounded-xl shadow border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Application History
                  </h3>
                  <p className="text-sm text-gray-500">
                    All processed applications
                  </p>
                </div>
                <button
                  onClick={fetchHistory}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                {historyLoading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
                    <p className="text-gray-500">Loading history...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="text-6xl mb-6">📋</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      No History Found
                    </h3>
                    <p className="text-gray-500">
                      No applications have been processed yet
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "Roll No",
                          "Name",
                          "Branch",
                          "Semester",
                          "Status",
                          "Processed On",
                          "Remarks",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {history.map((app) => (
                        <tr
                          key={app._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-800">
                            {app.rollNumber}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {app.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {app.branch}
                            </span>
                          </td>
                          <td className="px-6 py-4">
  <div className="text-sm text-gray-700">
    {app.semester || "N/A"}
  </div>
</td>
                          <td className="px-6 py-4">
                            {getStatusBadge(
                              app.departments?.find(
                               (d) => d.name?.toLowerCase() === "scholarship",
                              )?.status,
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(app.updatedAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                            {/* {app.remark || "No remarks"} */}
                            {app.departments?.find(d => d.name === "scholarship")?.remark || "No remarks"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════ REVIEW MODAL ════════════════════ */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Review Application</h3>
                    <p className="text-sm text-emerald-100 mt-0.5">
                      Scholarship Clearance Verification
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetModal}
                  className="text-white hover:text-emerald-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Student Information */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Student Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Name", value: selectedApp.name },
                    {
                      label: "Roll Number",
                      value: selectedApp.rollNumber,
                      mono: true,
                    },
                    { label: "Branch", value: selectedApp.branch },
                    { label: "Semester", value: selectedApp.semester || "N/A" },
                  ].map(({ label, value, mono }) => (
                    <div
                      key={label}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p
                        className={`font-semibold text-gray-800 ${
                          mono ? "font-mono text-emerald-600" : ""
                        }`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scholarship Verification */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Scholarship Verification
                </h4>
                <div className="space-y-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  {[
                    {
                      label: "Scholarship record verified",
                      checked: scholarshipVerified,
                      setter: setScholarshipVerified,
                    },
                    {
                      label: "All scholarship installments cleared",
                      checked: amountCleared,
                      setter: setAmountCleared,
                    },
                    {
                      label: "All scholarship documents submitted",
                      checked: documentsSubmitted,
                      setter: setDocumentsSubmitted,
                    },
                    {
                      label: "No scholarship recovery pending",
                      checked: noPendingRecovery,
                      setter: setNoPendingRecovery,
                    },
                  ].map(({ label, checked, setter }) => (
                    <label
                      key={label}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setter(e.target.checked)}
                        className="w-5 h-5 text-emerald-600 rounded border-gray-300 accent-emerald-600"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Remark */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Remark <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter your remark here..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[100px] resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This remark will be visible to the student
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                >
                   Approve
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                >
                   Reject
                </button>
                <button
                  onClick={resetModal}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
