import { useEffect, useState } from "react";
import { CheckCircle, Download, Printer } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
 
 
export default function NoDuesCertificate() {
  const { applicationId } = useParams();
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (applicationId) {
      fetchCertificateData();
    }
  }, [applicationId]);

  const fetchCertificateData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/student/certificate/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCertificateData(res.data);
    } catch (err) {
      console.error("Error fetching certificate:", err);
      alert("❌ Failed to load certificate");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // const handleDownload = () => {
  //   // Trigger print dialog which allows "Save as PDF"
  //   window.print();
  // };


  const handleDownload = () => {
  const element = document.getElementById("certificate");

  const options = {
    margin: 0,
    filename: `No_Dues_${certificateData.rollNumber}.pdf`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: {
      scale: 2,
      useCORS: true,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: { mode: ["css", "legacy"] },
  };

  html2pdf().set(options).from(element).save();
};


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Certificate not found</p>
          <p className="text-gray-600">Please check if your application is approved by HOD</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Button - Hidden when printing */}
      <div className="print:hidden bg-gray-100 p-4 border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">No Dues Certificate</h2>
            <p className="text-sm text-gray-600">Ready to download or print</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Certificate - A4 Size */}
        <div className="print:bg-white">

       <div
  id="certificate"
  className="certificate-container bg-white print:shadow-none mx-auto"
  style={{
  width: "100%",
  maxWidth: "210mm",
  padding: "20px",
  margin: "10px auto",
  boxSizing: "border-box",
}}>
          {/* Certificate Content */}
          <div className="p-0">



            {/* Header Section */}
              <div className="text-center mt-0 mb-2 pb-2 border-b-2 border-gray-300">

              {/* College Logo (Optional) */}
              <div className="flex justify-center items-center mb-4">
                 

<div className="flex justify-center  mb-2 mt-0
">
  <img
    src="/college-logo.png"
    alt="College Logo"
    className="h-20 md:h-24 w-auto object-contain"
  />
</div>

              </div>

              {/* College Name */}
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 uppercase tracking-wide mb-2">
                {certificateData.collegeName || "Chameli Devi Gruop Of Institutions Indore"}
              </h1>
              
              {/* Affiliation */}
              <p className="text-sm text-gray-600 uppercase tracking-wider">
                {certificateData.affiliation || "Affiliated to Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)"}
              </p>
              
              {/* College Address */}
              <p className="text-xs text-gray-500 mt-1">
                {certificateData.address || "MP,Indore - 462001"}
              </p>
            </div>

            {/* Certificate Title */}
            <div className="text-center mb-8">
               <h3 className="text-lg md:text-2xl font-bold text-gray-900 uppercase tracking-wide inline-block pb-2 px-6">
  Your Dues Certificate
</h3>

              <p className="text-sm text-gray-500 mt-3">Academic Year {certificateData.academicYear || "2025-2026"}</p>
            </div>

            {/* Certificate Number */}
            <div className="text-right mb-6">
              {/* <p className="text-sm text-gray-600">
                Certificate No: <span className="font-semibold">{certificateData.certificateNumber || `NDC/${new Date().getFullYear()}/${certificateData.rollNumber}`}</span>
              </p> */}
              <p className="text-sm text-gray-600">
                Date of Issue: <span className="font-semibold">{new Date(certificateData.approvalDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </p>
            </div>

            {/* Student Details Box */}
            <div className="border-2 border-gray-800 rounded p-6 mb-8 bg-gray-50 break-inside-avoid">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                Student Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Student Name:</p>
                  <p className="text-base font-semibold text-gray-900">{certificateData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Roll Number:</p>
                  <p className="text-base font-semibold font-mono text-gray-900">{certificateData.rollNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Branch:</p>
                  <p className="text-base font-semibold text-gray-900">{certificateData.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Semester:</p>
                  <p className="text-base font-semibold text-gray-900">{certificateData.semester || "Final Year"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Exam Status:</p>
                  <p className="text-base font-semibold text-gray-900">{certificateData.examStatus || "Regular"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Session:</p>
                  <p className="text-base font-semibold text-gray-900">{certificateData.session || "2021-2025"}</p>
                </div>
              </div>
            </div>

            {/* Certificate Text */}
            <div className="mb-8 text-center px-4">
              <p className="text-base text-gray-800 leading-relaxed">
                This is to certify that <span className="font-bold">{certificateData.name}</span>, 
                Roll Number <span className="font-bold font-mono">{certificateData.rollNumber}</span>, 
                of <span className="font-bold">{certificateData.branch}</span> branch, 
                has successfully cleared all departmental dues of the institution and is eligible for 
                further academic processing including degree/diploma issuance.
              </p>
            </div>

            {/* Department Clearance Table */}
         <div className="mb-8 overflow-x-auto break-inside-avoid">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                Department Clearance Status
              </h3>
              <table className="w-full border-collapse border-2 border-gray-800">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="border border-gray-700 px-4 py-3 text-left text-sm font-semibold">S.No</th>
                    <th className="border border-gray-700 px-4 py-3 text-left text-sm font-semibold">Department</th>
                    <th className="border border-gray-700 px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="border border-gray-700 px-4 py-3 text-left text-sm font-semibold">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {certificateData.departments && certificateData.departments.map((dept, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 text-sm">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-3 text-sm font-medium capitalize">{dept.name}</td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {dept.status === 'approved' ? 'Approved' : dept.status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-xs text-gray-600">
                        {dept.remark || 'Cleared'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
<div className="page-break"></div> 
            {/* HOD Approval Section */}
            <div className="mb-8 border-2 border-gray-800 rounded p-6 bg-blue-50 break-inside-avoid">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Final Approval</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">HOD Name:</p>
                  <p className="text-base font-semibold text-gray-900">{certificateData.hodName ? certificateData.hodName : "HOD"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approval Date:</p>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(certificateData.approvalDate || Date.now()).toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              {certificateData.hodRemark && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">HOD Remark:</p>
                  <p className="text-sm text-gray-800 italic">"{certificateData.hodRemark}"</p>
                </div>
              )}
            </div>

            {/* Signature Section */}
            <div className="flex justify-between items-end mt-12">
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2 w-48">
                  <p className="text-sm font-semibold text-gray-800">Date</p>
                  <p className="text-xs text-gray-600">
                    {new Date(certificateData.approvalDate || Date.now()).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* <div className="text-center">
                <div className="mb-2">
                  <div className="w-48 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <p className="text-xs text-gray-400 italic">Digital Signature</p>
                  </div>
                </div>
                <div className="border-t-2 border-gray-800 pt-2 w-48">
                  <p className="text-sm font-semibold text-gray-800">Head of Department</p>
                  <p className="text-xs text-gray-600">{certificateData.hodName || "HOD"}</p>
                </div>
              </div> */}

              {/* <div className="text-center">
                <div className="mb-2">
                  <div className="w-48 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <p className="text-xs text-gray-400 italic">College Seal</p>
                  </div>
                </div>
                <div className="border-t-2 border-gray-800 pt-2 w-48">
                  <p className="text-sm font-semibold text-gray-800">Office Seal</p>
                  <p className="text-xs text-gray-600">Authorized</p>
                </div>
              </div> */}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-300">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">
                   This is a system-generated certificate and does not require a manual signature.
                </p>
                {/* <p className="text-xs text-gray-500">
                  For verification, please contact the examination department with certificate number: 
                  <span className="font-semibold"> {certificateData.certificateNumber || `NDC/${new Date().getFullYear()}/${certificateData.rollNumber}`}</span>
                </p> */}
                <p className="text-xs text-gray-400 mt-2">
                  Generated on: {new Date().toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
    <style jsx>{`
  @media print {
    body {
      margin: 0;
      padding: 0;
    }

    .certificate-container {
      box-shadow: none !important;
      margin: 0 !important;
      width: 210mm !important;
    }

    /* 🔥 CUT FIX */
    .break-inside-avoid {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* 🔥 PAGE BREAK CONTROL */
    .page-break {
      page-break-before: always;
      break-before: page;
    }

    @page {
      size: A4;
      margin: 10mm;
    }

    /* scroll hide */
    ::-webkit-scrollbar {
      display: none;
    }
  }
`}</style>
    </>
  );
}

// Sample usage in student dashboard
export function StudentDashboardWithCertificate() {
  const [showCertificate, setShowCertificate] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  return (
    <div>
      {showCertificate ? (
        <NoDuesCertificate applicationId={applicationId} />
      ) : (
        <div>
          {/* Student Dashboard Content */}
          <button
            onClick={() => {
              setApplicationId("your-application-id");
              setShowCertificate(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            📄 View No Dues Certificate
          </button>
        </div>
      )}
    </div>
  );
}