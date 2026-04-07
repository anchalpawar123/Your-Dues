import express from "express";
import auth from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import NoDuesApplication from "../models/NoDuesApplication.js";
import Notification from "../models/Notification.js";
import nodemailer from "nodemailer";
 
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
const router = express.Router();
/* ================= PENDING FOR HOD ================= */
  router.get(
  "/pending",
  auth,
  roleMiddleware(["hod"]),
  async (req, res) => {
    try {
          

  const apps = await NoDuesApplication.find({
  finalStatus: "hod_pending",
  branch: req.user.branch.toUpperCase().trim(),
}).sort({ createdAt: -1 }); 

return res.json(apps);

 
       
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);



/* ================= FINAL APPROVE ================= */
 



/* ================= FINAL APPROVE ================= */
 /* ================= FINAL APPROVE ================= */
router.put(
  "/final-approve/:id",
  auth,
  roleMiddleware(["hod"]),
  async (req, res) => {
    try {
      const app = await NoDuesApplication.findById(req.params.id);
  if (app.branch.toUpperCase().trim() !== req.user.branch.toUpperCase().trim())  {
  return res.status(403).json({
    message: "You cannot approve other branch application",
  });
}
      if (!app) {
        return res.status(404).json({ message: "Application not found" });
      }

      // ✅ SAFETY CHECK: all departments approved
      const allApproved =
        Array.isArray(app.departments) &&
        app.departments.length > 0 &&
        app.departments.every(d => d.status === "approved");

      if (!allApproved) {
        return res.status(400).json({
          message: "All departments are not approved yet",
        });
      }

      // ✅ FINAL HOD APPROVAL
      app.hodStatus = "approved";
      app.finalStatus = "approved";
      app.hodRemark = req.body.remark || "";
      app.hodApprovedAt = new Date();
      app.hodApprovedBy = req.user._id;
      
app.hodName = req.user.name;   // 👈 ye add kar
 
app.hodBranch = req.user.branch;
      await app.save();

      // 🔔 DASHBOARD NOTIFICATION (ONLY HERE)
      await Notification.create({
        studentId: app.studentId,
        rollNumber: app.rollNumber,
        message:
          "🎉 Your No Dues has been approved by HOD. You can now download your certificate.",
      });

      // 📧 SEND MAIL (ONLY AFTER HOD APPROVE)
     // 📧 SEND MAIL WITH PDF ATTACHMENT

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// 🔹 Ensure certificates folder exists
const dirPath = path.join("certificates");
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

// 🔹 Create file path
const filePath = path.join(dirPath, `${app.rollNumber}_NoDues.pdf`);

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream(filePath));

// 🔹 PDF Content
doc.fontSize(20).text("NO DUES CERTIFICATE", { align: "center" });
doc.moveDown();
doc.fontSize(14).text(`Name: ${app.name}`);
doc.text(`Roll Number: ${app.rollNumber}`);
doc.text(`Branch: ${app.branch}`);
doc.text(`Approved By HOD`);
doc.text(`Date: ${new Date().toLocaleDateString()}`);

doc.end();

// Wait a moment to ensure file is written
await new Promise(resolve => setTimeout(resolve, 1000));

// 🔹 Send Mail with Attachment
 

// 🔹 Delete file after sending (server clean rahega)
fs.unlinkSync(filePath);

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: app.email,
        subject: "No Dues Certificate Approved",
        text: `Hello ${app.name},

Your No Dues application has been finally approved by the HOD.

You can now login and download your No Dues Certificate.

Roll Number: ${app.rollNumber}

Regards,
College Administration`,
      });

      res.json({
        message: "Final No Dues Approved by HOD & mail sent",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= HOD REJECT ================= */
router.put(
  "/reject/:id",
  auth,
  roleMiddleware(["hod"]),
  async (req, res) => {
    try {
      const app = await NoDuesApplication.findById(req.params.id);

      if (!app) {
        return res.status(404).json({ message: "Application not found" });
      }

      // branch check
      if (app.branch.toUpperCase().trim() !== req.user.branch.toUpperCase().trim()) {
        return res.status(403).json({
          message: "You cannot reject other branch application",
        });
      }

      // reject logic
      // app.hodStatus = "rejected";
      // app.finalStatus = "pending"; // ⚠️ important
      // // app.finalStatus = "hod_rejected";
      // app.hodRemark = req.body.remark || "";
      app.hodStatus = "rejected";
app.hodRemark = req.body.remark || "Rejected by HOD";
app.finalStatus = "hod_rejected"; 
      app.hodApprovedAt = new Date();
      app.hodApprovedBy = req.user._id;

      await app.save();

      return res.json({ message: "Application rejected by HOD" });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);
/* ================= HISTORY ================= */
router.get(
  "/history",
  auth,
  roleMiddleware(["hod"]),
  async (req, res) => {
    const apps = await NoDuesApplication.find({
  hodStatus: { $in: ["approved", "rejected"] },
  branch: { $regex: new RegExp(`^${req.user.branch}$`, "i") },
}).sort({ updatedAt: -1 });

    res.json(apps);
  }
);

export default router;
