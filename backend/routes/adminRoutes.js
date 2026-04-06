import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import NoDuesApplication from "../models/NoDuesApplication.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/* ================= ADMIN STATS ================= */
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const totalStudents = await User.countDocuments({ role: "student" });
    const totalDepartments = await User.countDocuments({
  role: { $in: ["library","accounts","tp","hostel","sports","scholarship"] }
});
      const totalHODs = await User.countDocuments({ role: "hod" });
      const totalApplications = await NoDuesApplication.countDocuments();

      res.json({
        totalStudents,
        totalDepartments,
        totalHODs,
        totalApplications,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= GET ALL USERS ================= */
router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find().select("-password").sort({ createdAt: -1 });
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= ADD STUDENT ================= */
 router.post(
  "/add-student",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      // const { name, rollNumber, branch, email } = req.body;
      const { name, rollNumber, branch, semester, email } = req.body;

      if (!name || !rollNumber || !branch) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      const exists = await User.findOne({ rollNumber });
      if (exists) {
        return res.status(400).json({ message: "Student already exists" });
      }

      const hashedPassword = await bcrypt.hash(rollNumber, 10);
// 🧹 old data cleanup (IMPORTANT)
await NoDuesApplication.deleteMany({ rollNumber });
      await User.create({
        name,
        rollNumber,
        branch,
        semester,
        email,
        password: hashedPassword,
        role: "student",
      });

      res.json({ message: "Student added successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= ADD DEPARTMENT ================= */
router.post(
  "/add-department",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { departmentName, email, password } = req.body;

      if (!departmentName || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "Department already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // await User.create({
      //   name: departmentName,
      //   email,
      //   password: hashedPassword,
      //   role: "department",
        
      //   // department: departmentName.toLowerCase(),
      //   department: deptValue,
      // });
let deptValue = departmentName.toLowerCase();

if (deptValue === "training & placement") {
  deptValue = "tp";
}

await User.create({
  name: departmentName,
  email,
  password: hashedPassword,
  role: deptValue,
});
      res.json({ message: "Department added successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= ADD HOD ================= */
router.post(
  "/add-hod",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      // const { name, email, password } = req.body;
      const { name, email, password, branch } = req.body;

       if (!name || !email || !password || !branch) {
  return res.status(400).json({ message: "All fields including branch required" });
}

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "HOD already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
 
      await User.create({
  name,
  email,
  password: hashedPassword,
  role: "hod",
  branch: branch.toUpperCase().trim(), // 🔥 YE CHANGE
});

      res.json({ message: "HOD added successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= DELETE USER ================= */
router.delete(
  "/delete-user/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      // await User.findByIdAndDelete(req.params.id);
      const user = await User.findById(req.params.id);

// ✅ user delete
await User.findByIdAndDelete(req.params.id);

// ✅ uska old no-dues data bhi delete
if (user?.rollNumber) {
  await NoDuesApplication.deleteMany({ rollNumber: user.rollNumber });
}
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= BULK UPLOAD STUDENTS ================= */
  router.post(
  "/bulk-upload-students",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {

      const students = req.body.students;

      if (!students || students.length === 0) {
        return res.status(400).json({ message: "No students provided" });
      }

      let success = 0;
      let failed = 0;

      for (const student of students) {
        try {

          const exists = await User.findOne({ rollNumber: student.rollNumber });

          if (exists) {
            failed++;
            continue;
          }

          const hashedPassword = await bcrypt.hash(student.rollNumber, 10);

         await User.create({
  name: student.name,
  rollNumber: student.rollNumber,
  branch: student.branch,
  semester: student.semester, // 🔥 ADD THIS
  email: student.email,
  password: hashedPassword,
  role: "student"
});

          success++;

        } catch (err) {
          failed++;
        }
      }

      res.json({
        total: students.length,
        success,
        failed
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


/* ================= FINAL APPROVED REPORT ================= */
// router.get(
//   "/report-table",
//   authMiddleware,
//   roleMiddleware(["admin"]),
//   async (req, res) => {
//     try {
//       const { branch } = req.query;

//       let filter = {
//         finalStatus: "approved" // ✅ ONLY completed
//       };

//       // branch filter
//       if (branch) {
//         filter.branch = branch.toUpperCase().trim();
//       }

//       const apps = await NoDuesApplication.find(filter)
//         .sort({ updatedAt: -1 });

//       const result = apps.map(app => ({
//   name: app.name,
//   rollNumber: app.rollNumber,
//   branch: app.branch,
//   semester: app.semester, // 🔥 ADD THIS LINE
//   status: app.finalStatus 
// }));

//       res.json(result);

//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );


router.get(
  "/report-table",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { branch, type } = req.query;

      let filter = {
        finalStatus: "approved",
      };

      if (branch) {
        filter.branch = branch.toUpperCase().trim();
      }

      const apps = await NoDuesApplication.find(filter);

      let filteredApps = apps;

      // 🔥 MAIN LOGIC
      if (type === "report1") {
        // ✅ ONLY 8th SEM
        filteredApps = apps.filter(
          (app) => Number(app.semester) === 8
        );
      } else if (type === "report2") {
        // ✅ EXCEPT 8th SEM
        filteredApps = apps.filter(
          (app) => Number(app.semester) !== 8
        );
      }

      const result = filteredApps.map(app => ({
        name: app.name,
        rollNumber: app.rollNumber,
        branch: app.branch,
        semester: app.semester,
        status: app.finalStatus
      }));

      res.json(result);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);
export default router;
