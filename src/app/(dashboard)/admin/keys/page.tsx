"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

type SignupKey = {
  id: string;
  key: string;
  status:
    | "Not Activated"
    | "Activated"
    | "De-Activated"
    | "Expired"
    | "Renewed";
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  payment_mode: string | null;
  payment_date: string | number | null;
};


export default function AdminKeysPage() {
  const [keys, setKeys] = useState<SignupKey[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  // ✅ Redirect non-admin users
  useEffect(() => {
    if (user && user.is_admin !== 1) {
      toast.error("Access denied. Only admins can manage signup keys.");
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.is_admin === 1) {
      fetchKeys();
    }
  }, [user]);

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/admin/keys");

      interface ApiKey {
        id: string;
        license_key: string;
        status: "Not Activated" | "Activated" | "De-Activated" | "Expired";
        created_by: string | null;
        created_at: string;
        expires_at: string | null;
        payment_mode: string | null;
        payment_date: string | number | null;
      }

      const formattedKeys = response.data.keys.map((key: ApiKey) => ({
        id: key.id,
        key: key.license_key,
        status: key.status,
        createdBy: key.created_by || "System",
        createdAt: key.created_at,
        expiresAt: key.expires_at,
        payment_mode: key.payment_mode ?? "N/A", // ✅ Add this line
        payment_date: key.payment_date ?? "N/A", // ✅ And this line
      }));

      setKeys(
        formattedKeys.sort(
          (b, a) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching keys:", error);
      toast.error("Failed to fetch signup keys.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    fetchUsers(); // Fetch users when opening modal
  };

  const generateKey = async () => {
    if (!user || user.is_admin !== 1) {
      toast.error("You are not authorized to generate keys.");
      return;
    }

    try {
      setIsGenerating(true);

      const response = await axios.post("/api/admin/keys", {
        expiresInDays: parseInt(expiresInDays),
        payment_mode: paymentMode, // ✅ fixed
        payment_date: paymentDate, // ✅ fixed
      });

      if (response.data.success) {
        setKeys((prevKeys) => [...prevKeys, response.data.key]);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Signup key generated successfully!",
          confirmButtonText: "OK",
          confirmButtonColor: "#ffc300",
          didOpen: () => {
            const confirmBtn = Swal.getConfirmButton();
            if (confirmBtn) {
              confirmBtn.style.color = "#000";
            }
          },
        });
        setIsModalOpen(false);
        setPaymentMode("");
        setPaymentDate("");
      } else {
        toast.error("Failed to generate signup key.");
      }
    } catch (error) {
      console.error("Error generating key:", error);
      toast.error("Failed to generate signup key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteKey = async (id: string) => {
    if (!user || user.is_admin !== 1) {
      toast.error("You are not authorized to delete keys.");
      return;
    }
    try {
      await axios.delete("/api/admin/keys", {
        headers: { "x-user-admin": user.is_admin?.toString() || "0" },
        data: { id },
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Signup key deleted successfully!",
        confirmButtonText: "OK",
        confirmButtonColor: "#ffc300", // Yellow background
        didOpen: () => {
          const confirmBtn = Swal.getConfirmButton();
          if (confirmBtn) {
            confirmBtn.style.color = "#000"; // Black text
          }
        },
      });
      setKeys(keys.filter((key) => key.id !== id));
    } catch (error) {
      console.error("Error deleting key:", error);
      toast.error("Failed to delete signup key.");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust as needed

  // Filtered keys based on search
  const filteredKeys = keys.filter((key) => {
    const query = searchQuery.toLowerCase();
    return (
      key.key.toLowerCase().includes(query) ||
      key.status.toLowerCase().includes(query) ||
      key.payment_mode?.toLowerCase().includes(query) ||
      key.payment_date?.toString().toLowerCase().includes(query) ||
      key.createdAt.toLowerCase().includes(query) ||
      key.expiresAt?.toLowerCase().includes(query) ||
      key.createdBy?.toLowerCase().includes(query)
    );
  });

  // Paginated keys to show on current page
  const paginatedKeys = filteredKeys.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // for keys update
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [selectedKey, setSelectedKey] = useState<SignupKey | null>(null);

  const openRenewForm = (key) => {
    setSelectedKey(key);
    setShowRenewForm(true);
  };

  const closeRenewForm = () => {
    setShowRenewForm(false);
    setSelectedKey(null);
  };

  const [paymentMode, setPaymentMode] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("");

  const handleRenewSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(
        `${BACKEND_SERVER_URL}/api/renew-key`,
        {
          keyId: selectedKey?.id,
          paymentMode,
          paymentDate,
          newExpiryDate,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: response.data.message || "The license key has been renewed.",
        confirmButtonText: "OK",
        confirmButtonColor: "#ffc300", // Yellow background
        didOpen: () => {
          const confirmBtn = Swal.getConfirmButton();
          if (confirmBtn) {
            confirmBtn.style.color = "#000"; // Black text
          }
        },
      });

      closeRenewForm();
      // Optionally reload data here if needed
    } catch (error) {
      console.error("Renew Error:", error);
      alert("Failed to renew license.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">
          Licence Keys ({filteredKeys.length})
        </h1>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* 🔍 Search Input */}
          <input
            type="text"
            placeholder="Search keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-48"
          />

          {/* Generate Key Button */}

          <button
            onClick={openModal}
            className="bg-primary-yellow text-black hover:bg-black hover:text-white px-4 py-2 rounded-md transition"
          >
            New Key
          </button>
        </div>
      </div>

      {/* Add this modal component before the closing div */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">New Key</h2>

            <div className="space-y-4">
              {/* Expires In */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires In
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Mode
                </label>
                <input
                  type="text"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="e.g. UPI, Credit Card"
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={generateKey}
                  disabled={isGenerating}
                  className="bg-primary-yellow text-black hover:bg-black hover:text-white px-4 py-2 rounded-md transition text-sm"
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading keys...</p>
        </div>
      ) : (
        <>
          {/* 📌 Card Layout for Mobile */}
          <div className="block md:hidden space-y-4">
            {filteredKeys.length === 0 ? (
              <p className="text-center text-gray-500">No signup keys found.</p>
            ) : (
              paginatedKeys.map((key) => (
                <div key={key.id} className="bg-white rounded-lg shadow p-4">
                  <p className="text-lg font-semibold break-all">{key.key}</p>
                  <p className="text-sm text-gray-500">
                    Created At: {formatDate(key.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires At: {formatDate(key.expiresAt)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Payment Mode: {key.payment_mode}
                  </p>
                  <p className="text-sm text-gray-500">
                    Payment Date:{" "}
                    {formatDate(
                      key.payment_date ? key.payment_date.toString() : null
                    )}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        key.status
                          ? "bg-gray-200 text-gray-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {key.status}
                    </span>
                    {key.status === "Expired" ? (
                      <button
                        onClick={() => openRenewForm(key)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Renew
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (key.status !== "Activated") deleteKey(key.id);
                        }}
                        disabled={key.status === "Activated"}
                        className={`${
                          key.status === "Activated"
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:text-red-900"
                        }`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 📌 Table Layout for Larger Screens */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    S.NO
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Key
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Expires At
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedKeys.map((key, index) => (
                  <tr key={key.id}>
                    <td className="px-4 py-4 text-sm font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    <td className="px-4 py-4 text-sm font-medium">{key.key}</td>
                    <td className="px-4 py-4 text-sm">{key.status}</td>
                    <td className="px-4 py-4 text-sm">
                      {key.payment_mode ?? "N/A"}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {formatDate(
                        key.payment_date ? key.payment_date.toString() : null
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {formatDate(key.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {formatDate(key.expiresAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {key.status === "Expired" ? (
                        <button
                          onClick={() => openRenewForm(key)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Renew
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (key.status !== "Activated") deleteKey(key.id);
                          }}
                          disabled={key.status === "Activated"}
                          className={`${
                            key.status === "Activated"
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-600 hover:text-red-900"
                          }`}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-6  space-x-2">
            {Array.from(
              { length: Math.ceil(filteredKeys.length / itemsPerPage) },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {i + 1}
                </button>
              )
            )}
          </div>

          {showRenewForm && selectedKey && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                <h2 className="text-xl font-semibold mb-4">
                  Renew Key -{selectedKey.id}
                </h2>

                <form onSubmit={handleRenewSubmit}>
                  <div className="mb-4">
                    <label className="block font-medium">Payment Mode</label>
                    <select
                      className="w-full border rounded p-2 mt-1"
                      required
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block font-medium">Payment Date</label>
                    <input
                      type="date"
                      className="w-full border rounded p-2 mt-1"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block font-medium">New Expiry Date</label>
                    <input
                      type="date"
                      className="w-full border rounded p-2 mt-1"
                      required
                      value={newExpiryDate}
                      onChange={(e) => setNewExpiryDate(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeRenewForm}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-yellow text-black rounded hover:bg-blue-700"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
