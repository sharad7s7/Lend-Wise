import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/common/Layout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { borrowRequestService } from "../services/borrowRequestService";
import { assessCredit } from "../utils/aiEngine";
import { notificationService } from "../services/notificationService";

export default function BorrowPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    loanAmount: "",
    purpose: "General",
    duration: 12,
    monthlyIncome: "",
    repaymentPreference: "Monthly",
  });
  const [myRequests, setMyRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedRequestForCert, setSelectedRequestForCert] = useState(null);
  const [certSubmissionData, setCertSubmissionData] = useState({});
  const [certificateSubmitted, setCertificateSubmitted] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const fetchRequests = async () => {
        try {
          const requests = await borrowRequestService.getUserRequests(user.id);
          setMyRequests(requests);
        } catch (error) {
          console.error(error);
        }
      };
      fetchRequests();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if terms are accepted
    if (!termsAccepted) {
      setShowTermsModal(true);
      notificationService.add({
        title: "Terms Required",
        message: "Please read and accept the terms & conditions first",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get AI assessment for the request
      let assessment = null;
      if (formData.monthlyIncome) {
        assessment = assessCredit({
          monthlyIncome: Number(formData.monthlyIncome),
          employmentType: user?.role === "Student" ? "Student" : "Salaried",
          loanAmount: Number(formData.loanAmount),
          duration: Number(formData.duration),
          repaymentBehavior: "Average",
        });
      }

      const request = await borrowRequestService.createRequest({
        borrowerId: user.id,
        borrowerName: user.name,
        amount: Number(formData.loanAmount),
        purpose: formData.purpose,
        duration: Number(formData.duration),
        monthlyIncome: formData.monthlyIncome
          ? Number(formData.monthlyIncome)
          : null,
        repaymentPreference: formData.repaymentPreference,
        creditScore: assessment?.creditScore || null,
        riskLevel: assessment?.riskCategory || null,
        suggestedInterestRate: assessment?.interestRate || null,
        defaultProbability: assessment?.defaultProbability || null,
        certificateSubmitted: false,
        certificateSubmissionDeadline: null,
      });

      setMyRequests([...myRequests, request]);

      // Show certificate immediately after request creation
      setSelectedRequestForCert(request);
      const estimatedInterestRate = assessment?.interestRate || 8; // Default 8% if no assessment
      const estimatedInterest = calculateInterest(
        Number(formData.loanAmount),
        estimatedInterestRate,
        Number(formData.duration)
      );

      setCertSubmissionData({
        principal: Number(formData.loanAmount),
        interest: estimatedInterest.toFixed(2),
        total: (Number(formData.loanAmount) + estimatedInterest).toFixed(2),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        isEstimated: true,
      });
      setShowCertificate(true);

      setFormData({
        loanAmount: "",
        purpose: "General",
        duration: 12,
        monthlyIncome: "",
        repaymentPreference: "Monthly",
      });
      setTermsAccepted(false);

      notificationService.add({
        title: "Borrow Request Created",
        message: `Your request for $${formData.loanAmount.toLocaleString()} has been posted`,
        type: "success",
      });
    } catch (error) {
      notificationService.add({
        title: "Error",
        message: "Failed to create borrow request",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800";
      case "Funded":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate interest amount based on principal, rate and duration
  const calculateInterest = (principal, rate, months) => {
    return (principal * rate * months) / (100 * 12);
  };

  // Handle certificate view
  const handleViewCertificate = (request) => {
    setSelectedRequestForCert(request);
    const interest = request.interestRate
      ? calculateInterest(
          request.amount,
          request.interestRate,
          request.duration
        )
      : 0;
    setCertSubmissionData({
      principal: request.amount,
      interest: interest.toFixed(2),
      total: (request.amount + interest).toFixed(2),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
    setShowCertificate(true);
  };

  // Handle certificate submission
  const handleCertificateSubmit = () => {
    if (!selectedRequestForCert) return;

    // Update the request with certificate submission
    const updatedRequests = myRequests.map((req) => {
      if (req.requestId === selectedRequestForCert.requestId) {
        return {
          ...req,
          certificateSubmitted: true,
          certificateSubmissionDeadline: certSubmissionData.deadline,
          submissionDate: new Date().toISOString().split("T")[0],
        };
      }
      return req;
    });

    setMyRequests(updatedRequests);
    setCertificateSubmitted(true);

    notificationService.add({
      title: "Certificate Submitted",
      message: `Digital signature certificate submitted successfully. Deadline: ${certSubmissionData.deadline}`,
      type: "success",
    });

    setTimeout(() => {
      setShowCertificate(false);
      setCertificateSubmitted(false);
    }, 2000);
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Borrow</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Borrow Request Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Request a Loan</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loan Amount ($)
              </label>
              <input
                type="number"
                value={formData.loanAmount}
                onChange={(e) =>
                  setFormData({ ...formData, loanAmount: e.target.value })
                }
                required
                min="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loan Purpose
              </label>
              <select
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="General">General</option>
                <option value="Education">Education</option>
                <option value="Medical">Medical</option>
                <option value="Home Improvement">Home Improvement</option>
                <option value="Business">Business</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (months)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                required
                min="1"
                max="60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monthly Income ($) - Optional
              </label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyIncome: e.target.value })
                }
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Helps determine interest rate"
              />
              <p className="text-xs text-gray-500 mt-1">
                Providing income helps lenders assess your request and may
                result in better rates
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Repayment Preference
              </label>
              <select
                value={formData.repaymentPreference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    repaymentPreference: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <div className="flex items-center mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <input
                type="checkbox"
                id="terms-check"
                checked={termsAccepted}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setTermsAccepted(false);
                  } else {
                    setShowTermsModal(true);
                  }
                }}
                className="mr-3 w-4 h-4"
              />
              <label htmlFor="terms-check" className="text-sm text-gray-700">
                I have read and accept the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-primary-600 hover:text-primary-700 font-semibold underline"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !termsAccepted}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Request..." : "Create Borrow Request"}
            </button>
          </form>
        </div>

        {/* My Borrow Requests */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">My Borrow Requests</h2>

          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>No borrow requests yet</p>
              <p className="text-sm mt-2">Create a request to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div
                  key={request.requestId}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">
                      ${request.amount.toLocaleString()}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Purpose: {request.purpose}</div>
                    <div>Duration: {request.duration} months</div>
                    {request.interestRate && (
                      <div>Interest Rate: {request.interestRate}%</div>
                    )}
                    {request.lenderName && (
                      <div>Lender: {request.lenderName}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {request.createdAt}
                    </div>
                    {request.certificateSubmitted && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-xs">
                        ✓ Certificate Submitted on {request.submissionDate}
                      </div>
                    )}
                  </div>
                  {request.status === "Funded" &&
                    !request.certificateSubmitted && (
                      <button
                        onClick={() => handleViewCertificate(request)}
                        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 text-sm"
                      >
                        View & Sign Certificate
                      </button>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <h2 className="text-2xl font-bold">Terms & Conditions</h2>
            </div>
            <div className="px-6 py-6 text-gray-700 space-y-4">
              <div className="space-y-3">
                <h3 className="font-bold text-lg">1. Loan Agreement</h3>
                <p className="text-sm">
                  You agree to borrow money under the terms specified in your
                  loan request. The borrowed amount (Principal) and calculated
                  interest must be repaid according to the agreed repayment
                  schedule.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">2. Interest & Charges</h3>
                <p className="text-sm">
                  The interest rate is determined based on your credit
                  assessment and risk profile. You agree to pay the total amount
                  (Principal + Interest) within the specified duration as per
                  your repayment preference (Monthly/Bi-weekly/Weekly).
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">
                  3. Digital Certificate & Signature
                </h3>
                <p className="text-sm">
                  Once your loan is funded, you must generate and submit a
                  digital signature certificate within 30 days. This certificate
                  will contain:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                  <li>Principal Amount (loan amount)</li>
                  <li>
                    Interest Amount (calculated based on rate and duration)
                  </li>
                  <li>Total Repayment Amount</li>
                  <li>Your digital signature as proof of acceptance</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">4. Submission Deadline</h3>
                <p className="text-sm">
                  The digital signature certificate must be submitted within 30
                  days from the date your loan is funded. Failure to submit may
                  result in penalties or loan cancellation.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">5. Repayment Obligation</h3>
                <p className="text-sm">
                  You are legally obligated to repay the borrowed amount plus
                  interest according to the scheduled repayment dates. Late
                  payments may incur additional charges as per the lender's
                  policy.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">
                  6. Accuracy of Information
                </h3>
                <p className="text-sm">
                  You confirm that all information provided in your loan request
                  is accurate and truthful. Providing false information may
                  result in legal action.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">7. Default & Consequences</h3>
                <p className="text-sm">
                  In case of default (failure to repay), the lender reserves the
                  right to take legal action to recover the amount along with
                  interest and applicable penalties.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => {
                  setShowTermsModal(false);
                  setTermsAccepted(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTermsModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Certificate Modal */}
      {showCertificate && selectedRequestForCert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div
              className={`bg-gradient-to-r ${
                certSubmissionData.isEstimated
                  ? "from-blue-600 to-cyan-600"
                  : "from-purple-600 to-indigo-600"
              } px-6 py-4 text-white rounded-t-xl flex-shrink-0`}
            >
              <h2 className="text-2xl font-bold">
                Digital Signature Certificate
              </h2>
              <p
                className={`${
                  certSubmissionData.isEstimated
                    ? "text-blue-100"
                    : "text-purple-100"
                } text-sm mt-1`}
              >
                {certSubmissionData.isEstimated
                  ? "Estimated Loan Agreement (Pre-Approval)"
                  : "Loan Agreement Document"}
              </p>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="p-8 bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-purple-300 m-6 rounded-lg">
                {/* Certificate Status Badge */}
                {certSubmissionData.isEstimated && (
                  <div className="mb-6 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm text-blue-800 font-semibold">
                      ℹ️ This is an estimated certificate based on your current
                      request. Final certificate will be generated once your
                      loan is funded.
                    </p>
                  </div>
                )}

                {/* Certificate Header */}
                <div className="text-center mb-8 pb-8 border-b-2 border-gray-300">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    LOAN AGREEMENT CERTIFICATE
                  </h3>
                  <p className="text-gray-600">
                    {certSubmissionData.isEstimated
                      ? "Pre-Approval Estimate"
                      : "Digital Signature Verified Document"}
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="space-y-6 mb-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">
                        Borrower Name
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {user?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">
                        Borrower ID
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {user?.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                        Principal Amount
                      </p>
                      <p className="text-2xl font-bold text-blue-700 mt-2">
                        ${certSubmissionData.principal?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                        Interest Amount
                      </p>
                      <p className="text-2xl font-bold text-green-700 mt-2">
                        ${certSubmissionData.interest}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                      Total Amount Due
                    </p>
                    <p className="text-3xl font-bold text-purple-700 mt-2">
                      ${certSubmissionData.total}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">
                        Loan Duration
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {selectedRequestForCert.duration} months
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">
                        Interest Rate
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {selectedRequestForCert.interestRate || "N/A"}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submission Deadline */}
                <div
                  className={`p-4 ${
                    certSubmissionData.isEstimated
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "bg-orange-50 border-l-4 border-orange-500"
                  } rounded mb-8`}
                >
                  <p className="text-sm text-gray-600 font-semibold uppercase">
                    Submission Deadline
                  </p>
                  <p
                    className={`text-xl font-bold mt-2 ${
                      certSubmissionData.isEstimated
                        ? "text-blue-700"
                        : "text-orange-700"
                    }`}
                  >
                    {certSubmissionData.deadline}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      certSubmissionData.isEstimated
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >
                    {certSubmissionData.isEstimated
                      ? "📋 Will be confirmed once your loan is funded"
                      : "⚠️ Must be submitted within 30 days of loan funding"}
                  </p>
                </div>

                {/* Digital Signature Section */}
                <div className="border-t-2 border-gray-300 pt-6">
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-4">
                    Digital Signature
                  </p>
                  <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-purple-300">
                    <div className="text-center flex-1">
                      <div className="text-5xl mb-2">🔐</div>
                      <p className="font-bold text-gray-900">
                        Digitally Signed
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        By accepting this certificate, you agree to all terms
                        and conditions mentioned above.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certification Footer */}
                <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center">
                  <p className="text-xs text-gray-500">
                    This is a digital certificate. Your signature confirms
                    acceptance of the loan terms and commitment to repay the
                    total amount by the specified deadline.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Certificate Date: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-4 rounded-b-xl flex-shrink-0">
              <button
                onClick={() => setShowCertificate(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100"
              >
                {certSubmissionData.isEstimated ? "Close" : "Cancel"}
              </button>
              {!certSubmissionData.isEstimated && (
                <button
                  onClick={handleCertificateSubmit}
                  disabled={certificateSubmitted}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {certificateSubmitted ? "✓ Submitted" : "Submit Certificate"}
                </button>
              )}
              {certSubmissionData.isEstimated && (
                <button
                  onClick={() => setShowCertificate(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  I Understand
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Lenders cannot create borrow requests
  if (user?.role === "Lender") {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-600 mb-4">
                Lenders cannot create borrow requests.
              </p>
              <a
                href="/lend"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Go to Lend Page →
              </a>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>{content}</Layout>
    </ProtectedRoute>
  );
}
