 import { useState, useEffect } from "react";
import axios from "axios";
 
  export default function StudentProfile() {
const [profilePic, setProfilePic] = useState("");

useEffect(() => {
  axios
    .get("http://localhost:5000/api/student/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then((res) => {
      setProfilePic(res.data.profilePic);
    });
}, []);
  
   
   
 
  return (
    <div className="max-w-xl bg-white p-8 rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="flex flex-col items-center">

        {/* PROFILE IMAGE */}
        <label className="relative cursor-pointer">
          {profilePic ? (
  <img
    src={profilePic}
    alt="Profile"
    className="w-32 h-32 rounded-full object-cover border"
  />
) : (
  <div className="w-32 h-32 rounded-full border flex items-center justify-center text-gray-500 font-medium">
    Add Image
  </div>
)}


          {!profilePic && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium">
              Add Image
            </div>
          )}

          <input
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      await axios.put(
        "http://localhost:5000/api/student/profile-pic",
        { image: reader.result },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProfilePic(reader.result);
    };

    reader.readAsDataURL(file);
  }}
/>
        </label>

        {profilePic && (
          <button
            onClick={() => {
              localStorage.removeItem("profilePic");
              window.location.reload();
            }}
            className="mt-3 text-sm text-red-600 hover:underline"
          >
            Remove Image
          </button>
        )}

        {/* DETAILS */}
         <div className="mt-6 text-center">
  <p className="text-2xl font-semibold text-gray-900">
    {localStorage.getItem("studentName")}
  </p>
  <p className="text-gray-500 mt-1">
    Roll No: {localStorage.getItem("rollNumber")}
  </p>
</div>

      </div>
    </div>
  );
}
