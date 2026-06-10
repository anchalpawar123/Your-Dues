 import { useEffect, useState } from "react";
import { LayoutDashboard, Clock, History, CheckCircle, LogOut, Shield } from "lucide-react";
import axios from "axios";

export default function HODDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Form states
  const [remark, setRemark] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const pendingRes = await axios.get(
        "http://localhost:5000/api/hod/pending",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplications(pendingRes.data);
      
      setStats({
        pending: pendingRes.data.length,
        approved: 0,
        rejected: 0
      });

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/hod/history",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  // Check if all departments have approved
  const areAllDepartmentsApproved = (app) => {
    if (!app.departments || app.departments.length === 0) return false;
    return app.departments.every(dept => dept.status === "approved");
  };

  const handleFinalApproval = async () => {
    if (!remark.trim()) {
      alert("⚠️ Remark is required!");
      return;
    }

    if (!areAllDepartmentsApproved(selectedApp)) {
      alert("❌ Cannot approve! All departments must approve first.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/hod/final-approve/${selectedApp._id}`,
        {
          remark,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
 
      alert("✅ Final No Dues Certificate Approved!");
      resetModal();
      fetchDashboardData();
    } catch (err) {
      alert("❌ Failed to approve application");
      console.error(err);
    }
  };

  const handleReject = async () => {
  if (!remark.trim()) {
    alert("⚠️ Please provide rejection reason!");
    return;
  }

  try {
    await axios.put(
      `http://localhost:5000/api/hod/reject/${selectedApp._id}`,
      { remark },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("❌ Application rejected successfully!");
    resetModal();
    fetchDashboardData();

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    alert(err.response?.data?.message || "❌ Reject failed");
  }
};

  const resetModal = () => {
    setSelectedApp(null);
    setRemark("");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Pending</span>;
    }
  };

  const getDepartmentStatusSummary = (app) => {
    if (!app.departments || app.departments.length === 0) {
      return { approved: 0, pending: 0, rejected: 0, total: 0 };
    }

    const summary = {
      approved: 0,
      pending: 0,
      rejected: 0,
      total: app.departments.length
    };

    app.departments.forEach(dept => {
      if (dept.status === "approved") summary.approved++;
      else if (dept.status === "rejected") summary.rejected++;
      else summary.pending++;
    });

    return summary;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ============ LEFT SIDEBAR ============ */}
      {/* <div className="w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white flex flex-col"> */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white flex flex-col shadow-2xl transform transition-transform duration-300 z-50
${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        {/* Logo/Header Section */}
        {/* <div className="p-6 border-b border-blue-700"> */}
        <div className="p-6 border-b border-blue-700 relative">
  <button 
    className="md:hidden absolute top-4 right-4 text-white text-xl"
    onClick={() => setIsOpen(false)}
  >
    ✕
  </button>
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold">HOD Dashboard</h1>
              <p className="text-sm text-blue-200 mt-1">Final Approval Authority</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === "dashboard"
                ? "bg-white text-blue-700 shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <LayoutDashboard className="mr-3 w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Dashboard</p>
              <p className="text-xs opacity-75">Overview & Statistics</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab("pending")}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === "pending"
                ? "bg-white text-blue-700 shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <Clock className="mr-3 w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Pending Final Approval</p>
              <p className="text-xs opacity-75">Review & Process</p>
            </div>
            {stats.pending > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.pending}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === "history"
                ? "bg-white text-blue-700 shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <History className="mr-3 w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">History</p>
              <p className="text-xs opacity-75">All Processed Apps</p>
            </div>
          </button>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-blue-700">
          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">Head of Department</p>
              <p className="text-xs text-blue-300">Final Authority</p>
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

      {/* ============ MAIN CONTENT AREA ============ */}
      {/* <div className="flex-1 flex flex-col"> */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        {/* Top Header Bar */}
        <div className="bg-white border-b px-6 py-4 shadow-sm">
          {/* <div className="flex justify-between items-center"> */}
          {/* <div className="flex items-center space-x-4"> */}
           <div className="flex items-center justify-between">

  {/* LEFT SIDE */}
  <div>
    <h2 className="text-xl font-bold text-gray-800">
      {activeTab === "dashboard" && "Dashboard Overview"}
      {activeTab === "pending" && "Pending Final Approvals"}
      {activeTab === "history" && "Application History"}
    </h2>
  </div>

  {/* RIGHT SIDE */}
  <div className="flex items-center gap-4">

    <button 
      className="md:hidden text-gray-700 text-2xl"
      onClick={() => setIsOpen(true)}
    >
      ☰
    </button>

     

  </div>

</div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-auto p-6">
          {/* ============ DASHBOARD CONTENT ============ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pending Card */}
                <div className="bg-white rounded-lg shadow border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Clock className="w-7 h-7 text-orange-600" />
                    </div>
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Awaiting Final Approval</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
                </div>

                {/* Approved Card */}
                <div className="bg-white rounded-lg shadow border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      Today
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Approved Today</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.approved}</p>
                </div>

                {/* Rejected Card */}
                <div className="bg-white rounded-lg shadow border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <LayoutDashboard className="w-7 h-7 text-red-600" />
                    </div>
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                      Today
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Rejected Today</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.rejected}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow border p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab("pending")}
                    className="p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-600 text-white rounded-lg mr-4">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Review Pending Approvals</p>
                        <p className="text-sm text-gray-600">{stats.pending} applications waiting</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("history")}
                    className="p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-600 text-white rounded-lg mr-4">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">View Application History</p>
                        <p className="text-sm text-gray-600">All processed applications</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-lg shadow border p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total Today</span>
                    <span className="font-bold text-blue-600">{stats.pending + stats.approved + stats.rejected}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ PENDING REQUESTS CONTENT ============ */}
          {activeTab === "pending" && (
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Pending Final Approvals</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {stats.pending} Applications
                    </span>
                    <button
                      onClick={fetchDashboardData}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                      title="Refresh"
                    >
                      ↻
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="text-6xl mb-6 text-green-500">✅</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">All Clear!</h3>
                    <p className="text-gray-600 mb-4">No pending applications at the moment</p>
                    <p className="text-sm text-gray-500">New applications will appear here automatically</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Roll Number</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Applied Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {applications.map((app, idx) => {
                        const deptSummary = getDepartmentStatusSummary(app);
                        const allApproved = areAllDepartmentsApproved(app);
                        
                        return (
                          <tr key={app._id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 font-medium">{idx + 1}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-mono text-sm font-semibold text-blue-600">{app.rollNumber}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{app.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {app.branch}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {allApproved ? (
                                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    All Approved
                                  </span>
                                ) : (
                                  <div className="text-xs">
                                    <span className="text-green-600 font-semibold">{deptSummary.approved}</span>
                                    <span className="text-gray-400"> / </span>
                                    <span className="text-gray-600">{deptSummary.total}</span>
                                    {deptSummary.rejected > 0 && (
                                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded">
                                        {deptSummary.rejected} rejected
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {new Date(app.createdAt || Date.now()).toLocaleDateString('en-IN')}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                  allApproved 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                              >
                                {allApproved ? 'Final Review' : 'View Details'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ============ HISTORY CONTENT ============ */}
          {activeTab === "history" && (
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Application History</h3>
                    <p className="text-sm text-gray-600">All processed applications</p>
                  </div>
                  <button
                    onClick={fetchHistory}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
                  >
                    <span className="mr-2">↻</span>
                    Refresh
                  </button>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                {historyLoading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading history...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="text-6xl mb-6 text-gray-400">📋</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No History Found</h3>
                    <p className="text-gray-600">No applications have been processed yet</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Roll Number</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Final Status</th
                        >
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
  Semester
</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Processed Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">HOD Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Array.isArray(history) && history.map((app) => (
                        <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm font-semibold text-gray-900">{app.rollNumber}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{app.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {app.branch}
                            </span>
                          </td>
                          <td className="px-6 py-4">
  <div className="text-sm text-gray-900">
    {app.semester || "N/A"}
  </div>
</td>
                          <td className="px-6 py-4">
                            {getStatusBadge(app.finalStatus)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(app.updatedAt || Date.now()).toLocaleDateString('en-IN')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {app.hodRemark || "No remarks"}
                            </div>
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

      {/* ============ VERIFICATION MODAL ============ */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Final No Dues Approval</h3>
                  <p className="text-sm text-blue-100 mt-1">HOD Final Authority Review</p>
                </div>
                <button
                  onClick={resetModal}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Student Information */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Student Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-800">{selectedApp.name}</p>
                  </div>
                  <div className="border border-gray-200 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">Roll Number</p>
                    <p className="font-mono font-semibold text-blue-600">{selectedApp.rollNumber}</p>
                  </div>
                  <div className="border border-gray-200 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">Branch</p>
                    <p className="font-semibold text-gray-800">{selectedApp.branch}</p>
                  </div>
                  <div className="border border-gray-200 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">Semester</p>
                    <p className="font-semibold text-gray-800">{selectedApp.semester || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Department-wise Clearance Status */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Department-wise Clearance Status</h4>
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  {selectedApp.departments && selectedApp.departments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedApp.departments.map((dept, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              dept.status === 'approved' ? 'bg-green-500' : 
                              dept.status === 'rejected' ? 'bg-red-500' : 
                              'bg-yellow-500'
                            }`}></div>
                            <div>
                              <p className="font-semibold text-gray-800 capitalize">{dept.name}</p>
                              {dept.remark && (
                                <p className="text-xs text-gray-600 mt-0.5">{dept.remark}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(dept.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No department data available</p>
                  )}
                </div>
              </div>

              {/* Approval Status Alert */}
              {!areAllDepartmentsApproved(selectedApp) && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-start">
                    <div className="text-yellow-600 text-2xl mr-3">⚠️</div>
                    <div>
                      <p className="font-semibold text-yellow-800">Cannot Approve Yet</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        All departments must approve before HOD can give final approval.
                        {selectedApp.departments?.filter(d => d.status === 'rejected').length > 0 && 
                          " Some departments have rejected this application."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {areAllDepartmentsApproved(selectedApp) && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-start">
                    <div className="text-green-600 text-2xl mr-3">✅</div>
                    <div>
                      <p className="font-semibold text-green-800">Ready for Final Approval</p>
                      <p className="text-sm text-green-700 mt-1">
                        All departments have approved this application. You can now give final approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* HOD Remark */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  HOD Remark <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter your final remarks here..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                  disabled={!areAllDepartmentsApproved(selectedApp)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This remark will be visible on the final No Dues certificate
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleFinalApproval}
                  disabled={!areAllDepartmentsApproved(selectedApp)}
                  className={`flex-1 px-4 py-3 rounded font-semibold transition-colors ${
                    areAllDepartmentsApproved(selectedApp)
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                   Approve Final No Dues
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded font-semibold transition-colors"
                >
                   Reject Application
                </button>
                <button
                  onClick={resetModal}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isOpen && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
    onClick={() => setIsOpen(false)}
  ></div>
)}
    </div>
  );
}