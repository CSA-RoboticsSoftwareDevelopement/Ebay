"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select";
import Swal from "sweetalert2";

export default function PricingPlans() {
  const { user, loading } = useAuth();
  const isAdmin = user?.is_admin === 1;
  const [showModal, setShowModal] = useState(false);
  const [editablePlan, setEditablePlan] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [allPlans, setAllPlans] = useState([]);
  const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const toast = (icon: "success" | "error" | "info", title: string) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon,
      title,
    });
  };

  const initialForm = {
    name: "",
    price: "",
    inventory: 0,
    productFinder: 0,
    platform: [],
    findSeller: false,
    productOptimization: false,
  };
  const fetchPlans = async () => {
    try {
      const response = await fetch(`${BACKEND_SERVER_URL}/api/plans/allplans`);
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }
      const data = await response.json();
      console.log("🔍 Raw plan response:", data);
      setAllPlans(data.plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [BACKEND_SERVER_URL]);

  const handleChange = (key: string, value: any) => {
    setEditablePlan((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!editablePlan || !user) return;

    if (!editablePlan.name || !editablePlan.price || !editablePlan.platform) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const endpoint = isEditing
        ? `${BACKEND_SERVER_URL}/api/plans/editplan/${editablePlan.id}`
        : `${BACKEND_SERVER_URL}/api/plans/addplans`;

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_type: editablePlan.name,
          price: parseFloat(editablePlan.price),
          inventory: parseInt(editablePlan.inventory),
          product_finder: parseInt(editablePlan.productFinder),
          platform: editablePlan.platform,
          find_seller: editablePlan.findSeller,
          product_optimization: editablePlan.productOptimization,
        }),
      });

      const data = await response.json();
      console.log("🧪 Backend response:", data);

      if (!response.ok) {
        console.error("❌ Full response error:", data);
        throw new Error(data.message || "Unknown error");
      }

      // ✅ Success
      toast("success", "Plan saved successfully!");
      console.log("✅ Saved Plan:", data);

      await fetchPlans(); // Refresh the list
      setEditablePlan(null);
      setIsEditing(false);
      setShowModal(false);
    } catch (error) {
      console.error("❌ Error saving plan:", error);
      toast("error", "Error saving the plan.");
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen relative">
      <h1 className="text-2xl font-bold mb-4">Plans</h1>

      {/* Toggle role
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="bg-gray-200 px-4 py-1 rounded shadow text-sm"
        >
          Mode: {isAdmin ? "Admin" : "User"}
        </button>
      </div> */}

      {/* Add Plan Button */}
      {isAdmin && (
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => {
              setEditablePlan(initialForm);
              setIsEditing(false); // ✅ Should be false for NEW plans
              setShowModal(true);
            }}
            className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold shadow hover:bg-yellow-300 transition"
          >
            + Add Plan
          </button>
        </div>
      )}

      {/* Add/Edit Plan Modal */}
      {showModal && editablePlan && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl relative">
            <h2 className="text-2xl font-bold mb-4 text-yellow-500 text-center">
              {editablePlan?.id ? "Edit Plan" : "Add New Plan"}
            </h2>

            <div className="space-y-4">
              {[
                { label: "Plan Name", key: "name", type: "text" },
                { label: "Price", key: "price", type: "text" },
                { label: "Inventory", key: "inventory", type: "number" },
                {
                  label: "Product Finder",
                  key: "productFinder",
                  type: "number",
                },
              ].map(({ label, key, type }) => (
                <div className="flex items-center" key={key}>
                  <span className="w-60 font-semibold">{label}</span>
                  <input
                    type={type}
                    value={editablePlan[key]}
                    onChange={(e) =>
                      handleChange(
                        key,
                        type === "number"
                          ? parseInt(e.target.value)
                          : e.target.value
                      )
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
              ))}
              <div className="flex items-center">
                <span className="w-60 font-semibold">Platform(s)</span>
                <div className="w-full">
                  <Select
                    isMulti
                    options={[
                      { value: "Amazon", label: "Amazon" },
                      { value: "eBay", label: "eBay" },
                      { value: "Etsy", label: "Etsy" },
                    ]}
                    value={editablePlan.platform?.map((p: string) => ({
                      label: p,
                      value: p,
                    }))}
                    onChange={(selectedOptions) => {
                      handleChange(
                        "platform",
                        selectedOptions.map((option) => option.value)
                      );
                    }}
                    className="z-50"
                  />
                </div>
              </div>

              {/* Boolean checkboxes */}
              <div className="flex items-center">
                <span className="w-60 font-semibold">Find Seller</span>
                <input
                  type="checkbox"
                  checked={editablePlan.findSeller}
                  onChange={(e) => handleChange("findSeller", e.target.checked)}
                />
              </div>
              <div className="flex items-center">
                <span className="w-60 font-semibold">Product Optimization</span>
                <input
                  type="checkbox"
                  checked={editablePlan.productOptimization}
                  onChange={(e) =>
                    handleChange("productOptimization", e.target.checked)
                  }
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300 transition"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditablePlan(null);
                }}
                className="px-5 py-2 bg-gray-300 text-black font-semibold rounded hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Show Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPlans.map((plan: any, index: number) => {
          const isArray = Array.isArray(plan.platform);
          const platforms = (() => {
            try {
              if (Array.isArray(plan.platform)) return plan.platform.join(", ");
              const parsed = JSON.parse(plan.platform);
              return Array.isArray(parsed) ? parsed.join(", ") : plan.platform;
            } catch {
              return plan.platform;
            }
          })();

          return (
            <div
              key={index}
              className="max-w-2xl mx-auto border rounded-2xl shadow-xl p-8 bg-white text-center"
            >
              <h2 className="text-3xl font-bold mb-4 text-yellow-500">
                {plan.plan_type} Plan
              </h2>

              <div className="text-left space-y-3">
                <div className="flex items-center">
                  <span className="w-60 font-semibold">Price</span>
                  <span>AUD ${parseFloat(plan.price).toFixed(2)}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-60 font-semibold">Inventory</span>
                  <span>{plan.inventory}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-60 font-semibold">Product Finder</span>
                  <span>{plan.product_finder}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-60 font-semibold">Platform(s)</span>
                  <span>{platforms}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-60 font-semibold">Find Seller</span>
                  <span
                    className={
                      plan.find_seller ? "text-green-600" : "text-red-500"
                    }
                  >
                    {plan.find_seller ? "✓" : "✗"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="w-60 font-semibold">
                    Product Optimization
                  </span>
                  <span
                    className={
                      plan.product_optimization
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {plan.product_optimization ? "✓" : "✗"}
                  </span>
                </div>
                <div className="mt-6">
                  {plan.plan_type.toLowerCase() === "silver" ? (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-600 px-4 py-2 rounded font-semibold cursor-not-allowed"
                    >
                      Active
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        alert(`Upgrade to ${plan.plan_type} selected.`)
                      }
                      className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold shadow hover:bg-yellow-300 transition"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              </div>
              {isAdmin && (
                <div className="mt-4 text-right">
                  <button
                    onClick={() => {
                      setEditablePlan({
                        name: plan.plan_type,
                        price: plan.price,
                        inventory: plan.inventory,
                        productFinder: plan.product_finder,
                        platform: (() => {
                          try {
                            if (Array.isArray(plan.platform))
                              return plan.platform;
                            const parsed = JSON.parse(plan.platform);
                            return Array.isArray(parsed) ? parsed : [parsed];
                          } catch {
                            return typeof plan.platform === "string"
                              ? [plan.platform]
                              : [];
                          }
                        })(),

                        findSeller:
                          plan.find_seller === 1 || plan.find_seller === true,
                        productOptimization:
                          plan.product_optimization === 1 ||
                          plan.product_optimization === true,
                        id: plan.id,
                      });
                      setIsEditing(true);
                      setShowModal(true);
                    }}
                    className="text-blue-500 font-semibold hover:underline"
                  >
                    ✎ Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this plan?"))
                        Swal.fire({
                          title: "Are you sure?",
                          text: "This will permanently delete the plan.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#d33",
                          cancelButtonColor: "#aaa",
                          confirmButtonText: "Yes, delete it!",
                        }).then(async (result) => {
                          if (result.isConfirmed) {
                            try {
                              setDeletingPlanId(plan.id);
                              const res = await fetch(
                                `${BACKEND_SERVER_URL}/api/plans/deleteplan/${plan.id}`,
                                { method: "DELETE" }
                              );

                              if (!res.ok)
                                throw new Error("Failed to delete the plan");

                              toast("success", "Plan deleted successfully!");
                              fetchPlans();
                            } catch (error) {
                              console.error("❌ Error deleting plan:", error);
                              toast("error", "Error deleting the plan.");
                            } finally {
                              setDeletingPlanId(null);
                            }
                          }
                        });
                    }}
                    disabled={deletingPlanId === plan.id}
                    className="ml-4 text-red-500 font-semibold hover:underline"
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
