  import express from "express";
import NoDuesApplication from "../models/NoDuesApplication.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
 

const router = express.Router();

/* ================= PENDING APPLICATIONS ================= */
router.get(
  "/:dept",
  authMiddleware,
  roleMiddleware(["library", "accounts", "tp", "hostel", "sports", "scholarship"]),
  async (req, res) => {
    try {
      const dept = req.params.dept;

    let filter = {
  departments: {
    $elemMatch: {
      name: dept,
      status: "pending",
    },
  },
};

       
if (dept === "accounts") {
  filter.finalStatus = "accounts_pending";
}
 
//         const apps = await NoDuesApplication.find({
//   finalStatus: { $ne: "approved" }
// }).sort({ createdAt: -1 }).sort({ createdAt: -1 });
const apps = await NoDuesApplication.find().sort({ createdAt: -1 });

// ✅ manual filtering (ACCURATE)
const filteredApps = apps.filter(app => {
  const deptObj = app.departments.find(d => d.name === dept);
  return deptObj && deptObj.status === "pending";
});

// accounts condition
if (dept === "accounts") {
  return res.json(
    filteredApps.filter(app => app.finalStatus === "accounts_pending")
  );
}

res.json(filteredApps);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= HISTORY ================= */
router.get(
  "/:dept/history",
  authMiddleware,
  roleMiddleware(["library", "accounts", "tp", "hostel", "sports", "scholarship" ]),
  async (req, res) => {
    try {
      const dept = req.params.dept;

      let filter = {
        departments: {
          $elemMatch: {
            name: dept,
            status: { $in: ["approved", "rejected"] },
          },
        },
      };

//       if (dept === "hostel") filter.isHosteller = true;
//       if (dept === "sports") filter.isSportsMember = true;
// if (dept === "scholarship") filter.isScholarshipHolder = true;

      const apps = await NoDuesApplication.find(filter).sort({ updatedAt: -1 });
      res.json(apps);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= UPDATE STATUS ================= */
 router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["library", "accounts", "tp", "hostel", "sports", "scholarship"]),
  async (req, res) => {
    try {
      const { department, status, remark } = req.body;

      const app = await NoDuesApplication.findById(req.params.id);
      if (!app) {
        return res.status(404).json({ message: "Application not found" });
      }

      
app.departments = app.departments.filter(
  (d, index, self) =>
    index === self.findIndex((x) => x.name === d.name)
);

       const deptObj = app.departments.find(
  (d) => d.name.toLowerCase() === department?.toLowerCase()
);

if (!deptObj) {
  console.log("❌ Department not found:", department);
  return res.status(400).json({ message: "Department not found" });
}
       

       deptObj.status = status;
 deptObj.remark = typeof remark === "string" ? remark.trim() : ""; // ✅ FIX
deptObj.updatedAt = new Date();

// 🔥 FINAL STATUS UPDATE (IMPORTANT)
 const anyRejected = app.departments.some(
  (d) => d.status === "rejected"
);

if (anyRejected) {
  // app.finalStatus = "rejected";
  app.finalStatus = "pending";
} else {
  const allApproved = app.departments.every(
    (d) => d.status === "approved" || d.name === "accounts"
  );

  if (allApproved) {
    app.finalStatus = "accounts_pending";
  }
}

await app.save();

      res.json({ message: "Updated successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);


  router.put(
  "/accounts/approve/:id",
  authMiddleware,
  roleMiddleware(["accounts"]),
  async (req, res) => {
    try {
      console.log("🔥 ACCOUNTS APPROVE HIT"); 
      const app = await NoDuesApplication.findById(req.params.id);

      // 🔥 accounts department को भी approve कर
      const accDept = app.departments.find(d => d.name === "accounts");
      if (accDept) {
        accDept.status = "approved";
      }

      app.accountStatus = "approved";
      app.finalStatus = "hod_pending";

      await app.save();

      return res.json({ message: "Sent to HOD" });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }
);
export default router;   