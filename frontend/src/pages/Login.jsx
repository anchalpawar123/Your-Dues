 import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      const payload =
        role === "student"
          ? { role, rollNumber, password }
          : { role, email, password };

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        payload
      );
      

      const { token, role: backendRole } = res.data;
      if (backendRole === "student") {
  localStorage.setItem("rollNumber", rollNumber);
  localStorage.setItem("studentName", res.data.name || "Student");
}


localStorage.setItem("token", token);
localStorage.setItem("role", backendRole);

if (backendRole === "student") {
  localStorage.setItem("rollNumber", rollNumber);
}

      setMessage("✅ Login successful! Redirecting...");
      setMessageType("success");

      setTimeout(() => {
  const roleRoutes = {
    student: "/student",
    admin: "/admin",

    library: "/department/library",
    accounts: "/department/accounts",
    tp: "/department/tp",
    hostel: "/department/hostel",
    sports: "/department/sports",
    hod: "/department/hod",
    scholarship: "/department/scholarship",

  };

  const path = roleRoutes[backendRole];
if (path) {
  navigate(path);
  window.location.reload();   // 🔥 YE LINE ADD KARO
} else {
  alert("No dashboard found for this role");
}

  
}, 1200);


    } catch (error) {
      setMessage(
        error.response?.data?.message || "❌ Invalid credentials"
      );
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200">
      <div className="bg-white w-full max-w-md mx-4 sm:mx-0 rounded-xl shadow-xl overflow-hidden">

        {/* TOP IMAGE */}
         <div className="h-32 sm:h-40 w-full">
          <img
            src="https://image-static.collegedunia.com/public/reviewPhotos/292068/1494843473phpy8cUGH.jpeg"
            alt="College"
            className="h-full w-full object-cover"
          />
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-sky-600 mb-5">
            No Dues Login
          </h2>
          

          {/* ROLE SELECT */}
          <label className="text-sm font-medium text-gray-700">
            Select Role
          </label>
          <select
           className="w-full mb-4 p-2.5 text-sm sm:text-base border rounded focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setEmail("");
              setRollNumber("");
              setPassword("");
            }}
            required
          >
             
             <option value="">-- Choose Role --</option>
<option value="student">Student</option>

<option value="library">Library</option>
<option value="accounts">Accounts</option>
<option value="tp">Training & Placement</option>
<option value="hostel">Hostel</option>
<option value="sports">Sports</option>
 <option value="scholarship">Scholarship</option>


<option value="hod">HOD</option>
 

<option value="admin">Admin</option>

          </select>

          {/* STUDENT LOGIN */}
          {role === "student" && (
            <>
              <label className="text-sm font-medium text-gray-700">
                Roll Number
              </label>
              <input
                type="text"
                placeholder="Eg: 0832CS221025"
                className="w-full mb-1 p-2 border rounded"
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
              
            </>
          )}

          {/* ADMIN / DEPARTMENT LOGIN */}
           {/* ADMIN / DEPARTMENT LOGIN */}
{role !== "student" && role && (
  <>
    <label className="text-sm font-medium text-gray-700">
      Email Address
    </label>
    <input
      type="email"
      placeholder="department@cdgi.com"
      className="w-full mb-4 p-2 border rounded"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
  </>
)}


          {/* PASSWORD */}
          {role && (
            <>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder={
                  role === "student"
                    ? "password"
                    : "Enter your password"
                }
                className="w-full mb-4 p-2 border rounded"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}

          {/* MESSAGE */}
          {message && (
            <p
              className={`mb-4 text-sm text-center font-medium ${
                messageType === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button className="w-full bg-sky-500 text-white py-2 rounded hover:bg-sky-600 transition">
            Login
          </button>
          <button
  type="button"
  onClick={() => navigate("/")}
  className="w-full mt-3 bg-black text-white py-3 rounded text-lg font-semibold hover:bg-gray-800 transition"
>
  ← Back to Home
</button>
        </form>
      </div>
    </div>
  );
}
