import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/common/Layout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { loanService } from "../services/loanService";

export default function MyInvestmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (user?.id) {
      const fetchData = async () => {
        try {
          const lendingHistory = await loanService.getLendingHistory(user.id);
          // Mock stats since service method is missing
          const mockStats = {
            totalLent: lendingHistory.reduce(
              (sum, item) => sum + (item.amountInvested || 0),
              0
            ),
            activeLending: lendingHistory.filter((i) => i.status === "Active")
              .length,
            interestEarned: 0,
            defaultRate: 0,
          };
          setInvestments(lendingHistory);
          setStats(mockStats);
        } catch (error) {
          console.error("Error fetching investments:", error);
        }
      };
      fetchData();
    }
  }, [user]);

  const filteredInvestments = investments.filter((inv) => {
    if (filter === "All") return true;
    return inv.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Defaulted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateExpectedReturn = (investment) => {
    if (investment.status === "Completed") {
      return investment.interestPaid || 0;
    }
    if (investment.status === "Defaulted") {
      return 0;
    }
    // Calculate expected return based on interest rate
    const monthlyInterest =
      (investment.amount * investment.interestRate) / 100 / 12;
    const monthsRemaining = investment.duration || 12;
    return Math.round(monthlyInterest * monthsRemaining);
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Investments
          </h1>
          <p className="text-gray-600">Track all your lending investments</p>
        </div>
        <button
          onClick={() => navigate("/marketplace/explore")}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          Explore Borrowers
        </button>
      </div>

      {/* Risk Concentration Warning */}
      {stats && stats.activeLending > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                Diversification Suggestion
              </h3>
              <p className="text-sm text-yellow-700">
                Consider diversifying your portfolio across different risk
                levels to optimize returns and reduce overall risk exposure.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm font-semibold text-gray-600 mb-1">
              Total Invested
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${stats.totalLent.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm font-semibold text-gray-600 mb-1">
              Active Investments
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.activeLending}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm font-semibold text-gray-600 mb-1">
              Returns Earned
            </div>
            <div className="text-3xl font-bold text-green-600">
              ${stats.totalReturnsEarned.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm font-semibold text-gray-600 mb-1">
              Completed
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {stats.completedLoans}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">
            Filter by Status:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Defaulted">Defaulted</option>
          </select>
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Investment Portfolio</h2>

        {filteredInvestments.length === 0 ? (
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
            <p className="text-lg mb-2">No investments yet</p>
            <p className="text-sm mb-4">
              Start investing by exploring available borrowers
            </p>
            <button
              onClick={() => navigate("/marketplace/explore")}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Explore Borrowers
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvestments.map((investment) => (
              <div
                key={investment.loanId}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() =>
                  navigate(`/marketplace/investment/${investment.loanId}`)
                }
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {investment.borrowerName || "Anonymous Borrower"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          investment.status
                        )}`}
                      >
                        {investment.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(
                          investment.riskLevel
                        )}`}
                      >
                        {investment.riskLevel} Risk
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">Amount:</span> $
                        {investment.amount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Interest Rate:</span>{" "}
                        {investment.interestRate}%
                      </div>
                      <div>
                        <span className="font-semibold">Expected Return:</span>{" "}
                        ${calculateExpectedReturn(investment).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Type:</span>{" "}
                        {investment.trustType === "AI"
                          ? "AI Verified"
                          : "Social Trust"}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {investment.createdAt}
                      {investment.completedAt &&
                        ` • Completed: ${investment.completedAt}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/marketplace/investment/${investment.loanId}`
                        );
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute requiredAccess="dashboard">
      <Layout>{content}</Layout>
    </ProtectedRoute>
  );
}
