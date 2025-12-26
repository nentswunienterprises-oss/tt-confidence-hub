import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function ExecutiveDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify user is authenticated
    if (!user) {
      setLocation("/executive/landing");
      return;
    }
    setLoading(false);
  }, [user, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFF5ED] to-[#E63946]">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-[#1A1A1A]">Loading...</div>
        </div>
      </div>
    );
  }

  const getRoleTitle = () => {
    if (user?.role === "coo") return "Chief Operations Officer";
    if (user?.role === "hr") return "Human Resources";
    if (user?.role === "ceo") return "Chief Executive Officer";
    return "Executive";
  };

  const getRoleColor = () => {
    if (user?.role === "coo") return "bg-blue-100 text-blue-800";
    if (user?.role === "hr") return "bg-green-100 text-green-800";
    if (user?.role === "ceo") return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5ED] via-white to-[#E63946]">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                {getRoleTitle()} Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {user?.name || user?.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Role Badge */}
        <div className="mb-8">
          <span className={`inline-block px-4 py-2 rounded-full font-semibold ${getRoleColor()}`}>
            {user?.role?.toUpperCase()}
          </span>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#E63946]">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
              Overview
            </h3>
            <p className="text-gray-600 mb-4">
              View key metrics and operational insights
            </p>
            <button className="text-[#E63946] hover:text-[#1A1A1A] font-semibold">
              View Details →
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#E63946]">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
              Team Management
            </h3>
            <p className="text-gray-600 mb-4">
              Manage team members and assignments
            </p>
            <button className="text-[#E63946] hover:text-[#1A1A1A] font-semibold">
              Manage Team →
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#E63946]">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
              Reports
            </h3>
            <p className="text-gray-600 mb-4">
              Access and generate reports
            </p>
            <button className="text-[#E63946] hover:text-[#1A1A1A] font-semibold">
              View Reports →
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
            Your Account Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-semibold text-[#1A1A1A]">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Role</p>
              <p className="font-semibold text-[#1A1A1A]">{user?.role?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="font-semibold text-[#1A1A1A]">
                {user?.name || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Member Since</p>
              <p className="font-semibold text-[#1A1A1A]">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
