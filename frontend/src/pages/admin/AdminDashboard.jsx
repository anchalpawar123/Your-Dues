 import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  UserPlus, 
  Building2, 
  Shield, 
  Users, 
  LogOut,
  Search,
  Trash2,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";

export default function AdminDashboard() {
  
  const [isOpen, setIsOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [reportData, setReportData] = useState([]);
  const [reportPage, setReportPage] = useState(1);
const reportPerPage = 20;
const [selectedBranch, setSelectedBranch] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDepartments: 0,
    totalHODs: 0,
    totalApplications: 0
  }); 
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Student tab state
  const [studentTab, setStudentTab] = useState("single"); // "single" or "bulk"

  // Form states for Add Student
   const [studentForm, setStudentForm] = useState({
  name: "",
  rollNumber: "",
  branch: "",
  semester: "", // ✅ ADD
  email: ""
});


  // Bulk upload states
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);

  // Form states for Add Department
  const [deptForm, setDeptForm] = useState({
    departmentName: "",
    email: "",
    password: ""
  });

  // Form states for Add HOD
  const [hodForm, setHodForm] = useState({
    name: "",
    email: "",
    password: "",
    branch: "" 
  });

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null, userName: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

//   useEffect(() => {
//   if (activePage === "users") {
//     fetchUsers();
//   }

//   if (activePage === "report") {
//     fetchReportTable();
//   }
// }, [activePage]);

useEffect(() => {
  if (activePage === "users") {
    fetchUsers();
  }

  if (activePage === "report") {
    fetchReportTable(selectedBranch, "report1"); // ✅ 8 sem
  }

  if (activePage === "report2") {
    fetchReportTable(selectedBranch, "report2"); // ✅ बाकी
  }
}, [activePage, selectedBranch]);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportTable = async (branch = "", type = "report1") => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/admin/report-table?branch=${branch}&type=${type}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setReportData(res.data);

  } catch (err) {
    console.error(err);
  }
};

  const handleAddStudent = async (e) => {
    e.preventDefault();
     if (!studentForm.name.trim()) {
  return alert("Name required");
}

if (!studentForm.rollNumber.trim()) {
  return alert("Roll number required");
}

if (!studentForm.branch) {
  return alert("Select branch");
}

if (!studentForm.semester) {
  return alert("Select semester");
}

    try {
      await axios.post(
        "http://localhost:5000/api/admin/add-student",
        { ...studentForm, password: studentForm.rollNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Student added successfully!");
      setStudentForm({
  name: "",
  rollNumber: "",
  branch: "",
  semester: "",
  email: ""
});
      fetchDashboardStats();
    } catch (err) {
      alert("❌ Failed to add student: " + (err.response?.data?.message || "Error"));
      console.error(err);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert("CSV file is empty or invalid!");
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
         
          return {
  name: values[0] || "",
  rollNumber: values[1] || "",
  branch: values[2] || "",
  semester: values[3] || "",
  email: values[4] || "" // ✅ FIX
};
       
      });

      setCsvPreview(data);
    };

    reader.readAsText(file);
  };

  const handleBulkUpload = async () => {
  if (csvPreview.length === 0) {
    alert("⚠️ Please upload a CSV file first!");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:5000/api/admin/bulk-upload-students",
      { students: csvPreview },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setUploadResult(res.data);

    alert("✅ Bulk upload completed!");

    fetchDashboardStats();
    fetchUsers();

  } catch (err) {
    alert("❌ Bulk upload failed");
    console.error(err);
  }
};

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.departmentName || !deptForm.email || !deptForm.password) {
      alert("⚠️ Please fill all fields!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/admin/add-department",
        deptForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Department added successfully!");
      setDeptForm({ departmentName: "", email: "", password: "" });
      fetchDashboardStats();
      window.location.reload();
    } catch (err) {
      alert("❌ Failed to add department: " + (err.response?.data?.message || "Error"));
      console.error(err);
    }
  };

  const handleAddHOD = async (e) => {
    e.preventDefault();
    if (!hodForm.name || !hodForm.email || !hodForm.password || !hodForm.branch) {
      alert("⚠️ Please fill all fields!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/admin/add-hod",
        hodForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ HOD added successfully!");
      setHodForm({ name: "", email: "", password: "" });
      fetchDashboardStats();
    } catch (err) {
      alert("❌ Failed to add HOD: " + (err.response?.data?.message || "Error"));
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/delete-user/${deleteModal.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ User deleted successfully!");
      setDeleteModal({ show: false, userId: null, userName: "" });
      fetchUsers();
      fetchDashboardStats();
    } catch (err) {
      alert("❌ Failed to delete user");
      console.error(err);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const resetStudentForm = () => {
     setStudentForm({
  name: "",
  rollNumber: "",
  branch: "",
  semester: "", // ✅ ADD
  email: ""
});
  };

  const resetDeptForm = () => {
    setDeptForm({ departmentName: "", email: "", password: "" });
  };

   const resetHODForm = () => {
  setHodForm({ name: "", email: "", password: "", branch: "" });
};

  const resetBulkUpload = () => {
    setCsvFile(null);
    setCsvPreview([]);
    setUploadResult(null);
  };

  // Filter users based on search and role
  const departmentRoles = ["library","accounts","tp","hostel","sports","scholarship"];

const filteredUsers = users.filter(user => {

  const matchesSearch =
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());

  let matchesRole = true;

  if (roleFilter === "student") {
    matchesRole = user.role === "student";
  } 
  else if (roleFilter === "hod") {
    matchesRole = user.role === "hod";
  } 
  else if (roleFilter === "department") {
    matchesRole = departmentRoles.includes(user.role);
  }

  return matchesSearch && matchesRole;
});

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* ============ LEFT SIDEBAR (FIXED) ============ */}
       <div className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex flex-col shadow-2xl transform transition-transform duration-300 z-50
${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        {/* Admin Header */}
        <div className="p-6 border-b border-blue-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <button 
  className="md:hidden absolute top-4 right-4 text-white text-xl"
  onClick={() => setIsOpen(false)}
>
  ✕
</button>
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-xs text-blue-200">Control Center</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActivePage("dashboard")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              activePage === "dashboard"
                ? "bg-white text-blue-900 shadow-lg transform scale-105"
                : "text-blue-100 hover:bg-blue-700/50"
            }`}
          >
            <LayoutDashboard className="mr-3 w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActivePage("add-student")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              activePage === "add-student"
                ? "bg-white text-blue-900 shadow-lg transform scale-105"
                : "text-blue-100 hover:bg-blue-700/50"
            }`}
          >
            <UserPlus className="mr-3 w-5 h-5" />
            <span className="font-medium">Student Management</span>
          </button>

          <button
            onClick={() => setActivePage("add-department")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              activePage === "add-department"
                ? "bg-white text-blue-900 shadow-lg transform scale-105"
                : "text-blue-100 hover:bg-blue-700/50"
            }`}
          >
            <Building2 className="mr-3 w-5 h-5" />
            <span className="font-medium">Add Department</span>
          </button>

          <button
            onClick={() => setActivePage("add-hod")}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              activePage === "add-hod"
                ? "bg-white text-blue-900 shadow-lg transform scale-105"
                : "text-blue-100 hover:bg-blue-700/50"
            }`}
          >
            <Shield className="mr-3 w-5 h-5" />
            <span className="font-medium">Add HOD</span>
          </button>


<button
  onClick={() => setActivePage("users")}
  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
    activePage === "users"
      ? "bg-white text-blue-900 shadow-lg transform scale-105"
      : "text-blue-100 hover:bg-blue-700/50"
  }`}
>
  <Users className="mr-3 w-5 h-5" />
  <span className="font-medium">Total Users</span>
</button>

          <button
  onClick={() => setActivePage("report")}
  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
    activePage === "report"
      ? "bg-white text-blue-900 shadow-lg transform scale-105"
      : "text-blue-100 hover:bg-blue-700/50"
  }`}
>
  <FileText className="mr-3 w-5 h-5" />
  <span className="font-medium">Reports</span>
</button>

<button
  onClick={() => setActivePage("report2")}
  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
    activePage === "report2"
      ? "bg-white text-blue-900 shadow-lg transform scale-105"
      : "text-blue-100 hover:bg-blue-700/50"
  }`}
>
  <FileText className="mr-3 w-5 h-5" />
  <span className="font-medium">Report 2</span>
</button>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <LogOut className="mr-2 w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* ============ MAIN CONTENT AREA (RIGHT SIDE) ============ */}
      {/* <div className="flex-1 ml-64"> */}
      <div className="flex-1 ml-0 md:ml-64">
        {/* Top Header */}
      {/* <div className="bg-white border-b px-6 py-4 shadow-sm"> */}
      {/* <div className="bg-white border-b px-4 md:px-6 py-4 shadow-sm flex items-center justify-between"> */}
      <div className="bg-white border-b px-4 md:px-6 py-4 shadow-sm">
         
          
         <div className="flex items-center justify-between w-full">

  {/* LEFT SIDE - HEADING */}
  
    {/* <h2 className="text-2xl font-bold text-gray-800"> */}
   <h2 className="text-2xl font-bold text-gray-800">
  {activePage === "dashboard" && "Dashboard Overview"}
  {activePage === "add-student" && "Student Management"}
  {activePage === "add-department" && "Add New Department"}
  {activePage === "add-hod" && "Add New HOD"}
  {activePage === "report" && "Branch Wise Reports"}
  {activePage === "report2" && "Other Students Report"}
</h2>

    {/* <p className="text-sm text-gray-500 mt-1">
      {activePage === "dashboard" && "Welcome back! Here's your system overview"}
    </p> */}
  

  {/* RIGHT SIDE - HAMBURGER */}
  <button 
    className="md:hidden text-gray-700 text-2xl"
    onClick={() => setIsOpen(true)}
  >
    ☰
  </button>

</div>
          <p className="text-sm text-gray-500 mt-1">
            {activePage === "dashboard" && "Welcome back! Here's your system overview"}
            {activePage === "add-student" && "Add students individually or upload in bulk"}
            {activePage === "add-department" && "Register a new department"}
            {activePage === "add-hod" && "Register a new Head of Department"}
             
          </p>
        </div>

        {/* Content */}
         <div className="p-4">
          {/* ============ DASHBOARD HOME ============ */}
          {activePage === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Students Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Students</p>
                <p className="text-4xl font-bold text-gray-800">{stats.totalStudents}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-green-600 font-medium">● Active</p>
                </div>
              </div>

              {/* Total Departments Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-xl">
                    <Building2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Departments</p>
                <p className="text-4xl font-bold text-gray-800">{stats.totalDepartments}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-green-600 font-medium">● Active</p>
                </div>
              </div>

              {/* Total HODs Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total HODs</p>
                <p className="text-4xl font-bold text-gray-800">{stats.totalHODs}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-green-600 font-medium">● Active</p>
                </div>
              </div>

              {/* Total No Dues Forms Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl">
                    <FileText className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">No Dues Applications</p>
                <p className="text-4xl font-bold text-gray-800">{stats.totalApplications}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-blue-600 font-medium">● Total Submitted</p>
                </div>
              </div>
            </div>
          )}

          {/* ============ STUDENT MANAGEMENT PAGE ============ */}
          {activePage === "add-student" && (
            // <div className="max-w-5xl mx-auto">
            <div className="max-w-5xl mx-auto mt-4 md:mt-6">
              {/* Tabs */}
              <div className="bg-white rounded-t-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setStudentTab("single")}
                    className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors duration-200 ${
                      studentTab === "single"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <UserPlus className="w-5 h-5 inline-block mr-2" />
                    Add Single Student
                  </button>
                  <button
                    onClick={() => setStudentTab("bulk")}
                    className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors duration-200 ${
                      studentTab === "bulk"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Upload className="w-5 h-5 inline-block mr-2" />
                    Bulk Upload Students
                  </button>
                </div>

                {/* Single Student Form */}
                {studentTab === "single" && (
                  <div className="p-8">
                    <form onSubmit={handleAddStudent}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={studentForm.name}
                            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter student name"
                          />
                        </div>

                        {/* Roll Number */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Roll Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={studentForm.rollNumber}
                            onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="e.g., 0832CS221001"
                          />
                        </div>

                        {/* Branch */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Branch <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={studentForm.branch}
                            onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            <option value="">Select Branch</option>
                            <option value="CSE">Computer Science Engineering</option>
                            <option value="ECE">Electronics & Communication</option>
                            <option value="ME">Mechanical Engineering</option>
                            <option value="CE">Civil Engineering</option>
                            <option value="EE">Electrical Engineering</option>
                            <option value="IT">Information Technology</option>
<option value="AIDS">Artificial Intelligence & Data Science</option>
<option value="CSIT">Computer Science & Information Technology</option>
                          </select>
                        </div>

{/* Semester */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Semester <span className="text-red-500">*</span>
  </label>
  <select
    value={studentForm.semester}
    onChange={(e) =>
      setStudentForm({ ...studentForm, semester: e.target.value })
    }
    className="w-full border border-gray-300 rounded-lg px-4 py-3"
  >
    <option value="">Select Semester</option>
    <option value="1">1st</option>
    <option value="2">2nd</option>
    <option value="3">3rd</option>
    <option value="4">4th</option>
    <option value="5">5th</option>
    <option value="6">6th</option>
    <option value="7">7th</option>
    <option value="8">8th</option>
  </select>
</div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email <span className="text-gray-400 text-xs">(optional)</span>
                          </label>
                          <input
                            type="email"
                            value={studentForm.email}
                            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="student@example.com"
                          />
                        </div>
                      </div>

                      {/* Note */}
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-blue-800">Default Password</p>
                          {/* <p className="text-sm text-blue-600 mt-1">
                            The student's default password will be set to their <strong>Roll Number</strong>. 
                            They can change it after first login.
                          </p> */}
                          <p className="text-sm text-blue-600 mt-1">
  The system will automatically assign a default password.
  Students will be asked to update it after login.
</p>

                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-4 mt-8">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                        >
                          Save Student
                        </button>
                        <button
                          type="button"
                          onClick={resetStudentForm}
                          className="px-8 py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-all"
                        >
                          Reset
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Bulk Upload Form */}
                {studentTab === "bulk" && (
                  <div className="p-8">
                    {/* CSV Format Info */}
                    <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start">
                        <FileText className="w-6 h-6 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-amber-900 mb-2">CSV File Format</h4>
                          <p className="text-sm text-amber-700 mb-3">
                            Your CSV file should have the following columns in this exact order:
                          </p>
                          <div className="bg-white rounded-lg p-4 border border-amber-200 font-mono text-xs">
                            <div className="text-gray-600 mb-2"> name,rollNumber,branch,semester,email</div>
                            <div className="text-gray-800">Rahul Kumar,0832CS221001,CSE,8,rahul@gmail.com</div>
                            <div className="text-gray-800">Priya Singh,0832CS221002,CSE,5,priya@gmail.com</div>
                            <div className="text-gray-800">Amit Sharma,0832ME221001,ME,7,amit@gmail.com</div>
                          </div>
                          <p className="text-xs text-amber-600 mt-3">
                            💡 <strong>Note:</strong> Email is optional. Default password will be the Roll Number.
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
  Passwords are handled securely by the system and are never shown.
</p>
                        </div>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Upload CSV File
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 font-semibold">
                            Click to upload
                          </span>
                          <span className="text-gray-500"> or drag and drop</span>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleCSVUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">CSV files only</p>
                        {csvFile && (
                          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {csvFile.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preview Table */}
                    {csvPreview.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-800 mb-3">Preview ({csvPreview.length} students)</h4>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="overflow-x-auto max-h-96">
                            <table className="w-full">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Roll Number</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Branch</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
  Semester
</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {csvPreview.map((student, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{student.rollNumber}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{student.branch}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
  {student.semester}
</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{student.email || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upload Result */}
                    {uploadResult && (
                      <div className="mb-6 grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-blue-600">{uploadResult.total}</p>
                          <p className="text-sm text-blue-700">Total</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-green-600">{uploadResult.success}</p>
                          <p className="text-sm text-green-700">Success</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-red-600">{uploadResult.failed}</p>
                          <p className="text-sm text-red-700">Failed</p>
                        </div>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleBulkUpload}
                        disabled={csvPreview.length === 0}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                      >
                        <Upload className="w-5 h-5 inline-block mr-2" />
                        Upload Students
                      </button>
                      <button
                        onClick={resetBulkUpload}
                        className="px-8 py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-all"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ ADD DEPARTMENT PAGE ============ */}
          {activePage === "add-department" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Department Information</h3>
                <form onSubmit={handleAddDepartment}>
                  <div className="space-y-6">
                    {/* Department Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={deptForm.departmentName}
                        onChange={(e) => setDeptForm({ ...deptForm, departmentName: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Department</option>
                        <option value="Library">Library</option>
                        <option value="Accounts">Accounts</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Sports">Sports</option>
                        <option value="Scholarship">Scholarship</option>
                        <option value="Training & Placement">Training & Placement</option>
                        {/* <option value="Exam">Exam</option> */}
                      </select>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={deptForm.email}
                        onChange={(e) => setDeptForm({ ...deptForm, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="department@college.com"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={deptForm.password}
                        onChange={(e) => setDeptForm({ ...deptForm, password: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                      Save Department
                    </button>
                    <button
                      type="button"
                      onClick={resetDeptForm}
                      className="px-8 py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ============ ADD HOD PAGE ============ */}
          {activePage === "add-hod" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">HOD Information</h3>
                <form onSubmit={handleAddHOD}>
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={hodForm.name}
                        onChange={(e) => setHodForm({ ...hodForm, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter HOD name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={hodForm.email}
                        onChange={(e) => setHodForm({ ...hodForm, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="hod@college.com"
                      />
                    </div>

{/* Branch */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Branch <span className="text-red-500">*</span>
  </label>
  <select
    value={hodForm.branch}
    onChange={(e) => setHodForm({ ...hodForm, branch: e.target.value })}
    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
  >
    <option value="">Select Branch</option>
    <option value="CSE">Computer Science Engineering</option>
    <option value="ECE">Electronics & Communication</option>
    <option value="ME">Mechanical Engineering</option>
    <option value="CE">Civil Engineering</option>
    <option value="EE">Electrical Engineering</option>
    <option value="IT">Information Technology</option>
<option value="AIDS">Artificial Intelligence & Data Science</option>
<option value="CSIT">Computer Science & Information Technology</option>
  </select>
</div>
{/* Semester */}
 
 {/* Semester */}
 
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={hodForm.password}
                        onChange={(e) => setHodForm({ ...hodForm, password: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                      Save HOD
                    </button>
                    <button
                      type="button"
                      onClick={resetHODForm}
                      className="px-8 py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ============ USER LIST PAGE ============ */}
          {activePage === "users" && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Search and Filter Header */}
              <div className="px-6 py-5 border-b bg-gradient-to-r from-gray-50 to-white">
                 <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  {/* Search Box */}
                  <div className="relative w-full md:flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or roll number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Role Filter */}
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="department">Departments</option>
                    <option value="hod">HODs</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              {/* <div className="overflow-x-auto"> */}
              <div className="w-full overflow-x-auto">
                {loading ? (
                  <div className="p-16 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-16 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Users Found</h3>
                    <p className="text-gray-600">No users match your search criteria</p>
                  </div>
                ) : (
                  <>
                    {/* <table className="w-full"> */}
                    <table className="min-w-[600px] w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email / Roll</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
  Semester
</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                                user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'department' ? 'bg-green-100 text-green-800' :
                                user.role === 'hod' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {user.role === 'student' ? user.rollNumber : user.email}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {/* {user.department || user.branch || '-'} */}
                                {user.department || user.branch || user.role || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
  <div className="text-sm text-gray-900">
    {user.semester || '-'}
  </div>
</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setDeleteModal({ show: true, userId: user._id, userName: user.name })}
                                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                              >
                                <Trash2 className="w-4 h-4 mr-1.5" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing <span className="font-semibold">{indexOfFirstUser + 1}</span> to{" "}
                          <span className="font-semibold">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{" "}
                          <span className="font-semibold">{filteredUsers.length}</span> users
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          {[...Array(totalPages)].map((_, index) => (
                            <button
                              key={index}
                              onClick={() => paginate(index + 1)}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                currentPage === index + 1
                                  ? "bg-blue-600 text-white shadow-md"
                                  : "border border-gray-300 hover:bg-gray-100"
                              }`}
                            >
                              {index + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          

        {activePage === "report" && (
  // <div className="p-6">
<div className="p-4 w-full flex flex-col">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-none">

      

      {/* ✅ 2. TOTAL COUNT (YAHI ADD KARNA HAI) */}
      <div className="mt-3">
  <button className="bg-blue-600 text-white px-5 py-2 rounded-full shadow-md font-semibold">
    Total Approved Students: {reportData.length}
  </button>
</div>

      {/* ✅ 3. SEARCH + DROPDOWN + EXPORT (EK LINE ME) */}
      {/* <div className="flex items-center gap-3 mt-4 mb-6"> */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-4 mb-6">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by name or roll..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg"
        />

        {/* DROPDOWN */}
        <select
          value={selectedBranch}
          onChange={(e) => {
  setSelectedBranch(e.target.value);
  fetchReportTable(
    e.target.value,
    activePage === "report" ? "report1" : "report2"
  );
}}
          className="border px-4 py-2 rounded-lg"
        >
          <option value="">All Branch</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ME">ME</option>
          <option value="CE">CE</option>
          <option value="ECE">ECE</option>
          <option value="EE">EE</option>
          <option value="AIDS">AIDS</option>
          <option value="CSIT">CSIT</option>
        </select>

        {/* EXPORT BUTTON */}
        <button
          onClick={() => {
            const csv = [
              ["Roll", "Name", "Branch"],
              ...reportData.map(item => [
                item.rollNumber,
                item.name,
                item.branch,
                item.semester
              ])
            ]
              .map(e => e.join(","))
              .join("\n");

            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "report.csv";
            a.click();
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
        >
          Export CSV
        </button>

      </div>

      {/* ✅ 4. BRANCH CARDS (TABLE SE JUST UPAR) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...new Set(reportData.map(item => item.branch))].map(branch => {
          const count = reportData.filter(item => item.branch === branch).length;

          return (
            <div key={branch} className="bg-blue-50 p-4 rounded-xl text-center">
              <h3 className="font-bold text-lg">{branch}</h3>
              <p className="text-blue-700">{count} Approved</p>
            </div>
          );
        })}
      </div>

      {/* ✅ 5. TABLE */}
     <div className="w-full overflow-x-auto">

  {/* <table className="min-w-[600px] w-full text-sm"> */}
<table className="min-w-[600px] w-full text-sm font-medium">
    {/* <thead className="border-b bg-gray-50"> */}
     <thead className="border-b bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
  <tr>
    <th className="py-2 px-2 text-left">Roll</th>
    <th className="py-2 px-2 text-left">Name</th>
    <th className="py-2 px-2 text-left">Branch</th>
    <th className="py-2 px-2 text-left">Semester</th> {/* ✅ ADD */}
    <th className="py-2 px-2 text-left">Status</th>
  </tr>
</thead>

    <tbody>
      { reportData
  // .filter(item => Number(item.semester) === 8)
  .map((item, index) => (
        // <tr key={index} className="border-b border-gray-200">
        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">

          <td className="py-3 px-2">{item.rollNumber}</td>
           <td className="py-3 px-2">
  <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
    {item.name}
  </span>
</td>
          {/* <td className="py-3 px-2">{item.branch}</td> */}
           <td className="py-3 px-2 text-gray-700">
  {item.branch}
</td>

<td className="py-3 px-2">
  {item.semester}
</td>
            <td className="py-3 px-2">
  <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
    Approved
  </span>
</td>

        </tr>
      ))}
    </tbody>

  </table>

{/* ================= REPORT 2 ================= */}

 
</div>
    </div>
  </div>
)}

{activePage === "report2" && (

    <div className="p-4 w-full flex flex-col">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-none">

      {/* ✅ TOTAL COUNT */}
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
  {/* SEARCH */}
  <input
    type="text"
    placeholder="Search by name or roll..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border px-4 py-2 rounded-lg"
  />

  {/* DROPDOWN */}
  <select
    value={selectedBranch}
    onChange={(e) => {
  setSelectedBranch(e.target.value);
  fetchReportTable(
    e.target.value,
    activePage === "report" ? "report1" : "report2"
  );
}}
    className="border px-4 py-2 rounded-lg"
  >
    <option value="">All Branch</option>
    <option value="CSE">CSE</option>
    <option value="IT">IT</option>
    <option value="ME">ME</option>
    <option value="CE">CE</option>
    <option value="ECE">ECE</option>
    <option value="EE">EE</option>
    <option value="AIDS">AIDS</option>
    <option value="CSIT">CSIT</option>
  </select>

  {/* EXPORT */}
  <button
    onClick={() => {
      const filtered = reportData.filter(item => Number(item.semester) !== 8);

      const csv = [
        ["Roll", "Name", "Branch", "Semester"],
        ...filtered.map(item => [
          item.rollNumber,
          item.name,
          item.branch,
          item.semester
        ])
      ]
        .map(e => e.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "report2.csv";
      a.click();
    }}
    className="bg-green-500 text-white px-4 py-2 rounded-lg"
  >
    Export CSV
  </button>

</div>

      {/* ✅ BRANCH CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-6">
        {[...new Set(
          reportData
            .filter(item => Number(item.semester) !== 8)
            .map(item => item.branch)
        )].map(branch => {

          const count = reportData.filter(
            item => item.branch === branch && Number(item.semester) !== 8
          ).length;

          return (
            <div key={branch} className="bg-blue-50 p-4 rounded-xl text-center">
              <h3 className="font-bold text-lg">{branch}</h3>
              <p className="text-blue-700">{count} Approved</p>
            </div>
          );
        })}
      </div>

      {/* ✅ TABLE */}
      <div className="w-full overflow-x-auto">

        <table className="min-w-[600px] w-full text-sm font-medium">

          <thead className="border-b bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="py-2 px-2 text-left">Roll</th>
              <th className="py-2 px-2 text-left">Name</th>
              <th className="py-2 px-2 text-left">Branch</th>
              <th className="py-2 px-2 text-left">Semester</th>
              <th className="py-2 px-2 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {reportData
              .filter(item => Number(item.semester) !== 8)
              .map((item, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">

                  <td className="py-3 px-2">{item.rollNumber}</td>

                  <td className="py-3 px-2">
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                      {item.name}
                    </span>
                  </td>

                  <td className="py-3 px-2 text-gray-700">
                    {item.branch}
                  </td>

                  <td className="py-3 px-2">
                    {item.semester}
                  </td>

                  <td className="py-3 px-2">
                    <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      Approved
                    </span>
                  </td>

                </tr>
              ))}
          </tbody>

        </table>

      </div>

    </div>
  </div>

)}

        </div>
      </div>
 
    
      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete User</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-900">{deleteModal.userName}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal({ show: false, userId: null, userName: "" })}
                className="flex-1 px-6 py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Delete
              </button>
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