

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

// Simulated plans
const plans = [
  {
    name: "Silver",
    price: "$29",
    inventory: 20,
    productFinder: 50,
    platform: "eBay",
    findSeller: false,
    productOptimization: false,
  },
  {
    name: "Gold",
    price: "$59",
    inventory: 50,
    productFinder: 100,
    platform: "Amazon",
    findSeller: true,
    productOptimization: false,
  },
  {
    name: "Platinum",
    price: "$99",
    inventory: 100,
    productFinder: 200,
    platform: "eBay, Amazon",
    findSeller: true,
    productOptimization: true,
  },
];

export default function PricingPlans() {
  const [isAdmin, setIsAdmin] = useState(true); // Toggle this to simulate role
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<null | typeof plans[number]>(null);
  const [editablePlan, setEditablePlan] = useState<null | typeof plans[number]>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [allPlans, setAllPlans] = useState([]); // Add this line to store plans from the backend
  const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
  const { user, loading } = useAuth();

  useEffect(() => {
    if (selectedPlan) {
      setEditablePlan({ ...selectedPlan });
      setIsEditing(false);
    }
  }, [selectedPlan]);

  const handleChange = (key: string, value: any) => {
    setEditablePlan((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${BACKEND_SERVER_URL}/api/plans/allplans`);
        if (!response.ok) {
          throw new Error("Failed to fetch plans");
        }
        const data = await response.json();
        setAllPlans(data); // Store the fetched plans in the state
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };
  
    fetchPlans();
  }, [BACKEND_SERVER_URL]);
  
  const handleSave = async () => {
    // Check if there are changes to the plan before sending the request
    if (!editablePlan) return;
    if (!user) return;
  
    try {
      const response = await fetch(`${BACKEND_SERVER_URL}/api/plans/addplans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_type: editablePlan.name,
          inventory: editablePlan.inventory,
          product_finder: editablePlan.productFinder,
          platform: JSON.stringify(editablePlan.platform.split(',')), // Convert platform to JSON array
          find_seller: editablePlan.findSeller,
          product_optimization: editablePlan.productOptimization,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save the plan');
      }
  
      const data = await response.json();
  
      // Log the response (you can display a success message here or handle errors)
      console.log('Saved Plan:', data);
      alert('Plan saved successfully!');
  
      // Reset states and close modal after saving
      setSelectedPlan(null);
      setEditablePlan(null);
      setIsEditing(false);
  
    } catch (error) {
      console.error('❌ Error saving plan:', error);
      alert('There was an error saving the plan.');
    }
  };
  
  

  return (
    <div className="p-8 bg-white min-h-screen relative">
      {/* Admin/User Toggle for Testing */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="bg-gray-200 px-4 py-1 rounded shadow text-sm"
        >
          Mode: {isAdmin ? "Admin" : "User"}
        </button>
      </div>

      {/* Add Plan Button */}

<div className="mb-8 flex justify-start">
  <button
    onClick={() => setDropdownVisible(!dropdownVisible)}
    className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold shadow hover:bg-yellow-300 transition"
  >
    + Add Plan
  </button>
</div>


      {/* Dropdown Plan Buttons */}
      {dropdownVisible && (
        <div className="flex justify-center gap-6 mb-10">
          {plans.map((plan) => (
            <button
              key={plan.name}
              onClick={() => setSelectedPlan(plan)}
              className="bg-black text-white px-6 py-2 rounded hover:bg-yellow-400 hover:text-black transition"
            >
              {plan.name}
            </button>
          ))}
        </div>
      )}

      {/* Plan Modal */}
      {editablePlan && (
        <div className="max-w-2xl mx-auto border rounded-2xl shadow-xl p-8 bg-white text-center mt-12">
          <h2 className="text-3xl font-bold mb-4 text-yellow-500">
            {editablePlan.name} Plan
          </h2>

          <div className="text-left space-y-3">
            {/* Inventory */}
            <div className="flex items-center">
              <span className="w-80 font-semibold">Inventory</span>
              {isEditing ? (
                <input
                  type="number"
                  value={editablePlan.inventory}
                  onChange={(e) => handleChange("inventory", parseInt(e.target.value))}
                  className="border px-2 py-1 rounded w-full"
                />
              ) : (
                <span>{editablePlan.inventory}</span>
              )}
            </div>

            {/* Product Finder */}
            <div className="flex items-center">
              <span className="w-80 font-semibold">Product Finder</span>
              {isEditing ? (
                <input
                  type="number"
                  value={editablePlan.productFinder}
                  onChange={(e) => handleChange("productFinder", parseInt(e.target.value))}
                  className="border px-2 py-1 rounded w-full"
                />
              ) : (
                <span>{editablePlan.productFinder}</span>
              )}
            </div>

            {/* Platform */}
            <div className="flex items-center">
              <span className="w-80 font-semibold">Platform</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editablePlan.platform}
                  onChange={(e) => handleChange("platform", e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
              ) : (
                <span>{editablePlan.platform}</span>
              )}
            </div>

            {/* Find Seller */}
            <div className="flex items-center">
              <span className="w-80 font-semibold">Find Seller</span>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editablePlan.findSeller}
                  onChange={(e) => handleChange("findSeller", e.target.checked)}
                />
              ) : (
                <span className={editablePlan.findSeller ? "text-green-600" : "text-red-500"}>
                  {editablePlan.findSeller ? "✓" : "✗"}
                </span>
              )}
            </div>

            {/* Product Optimization */}
            <div className="flex items-center">
              <span className="w-80 font-semibold">Product Optimization</span>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editablePlan.productOptimization}
                  onChange={(e) => handleChange("productOptimization", e.target.checked)}
                />
              ) : (
                <span className={editablePlan.productOptimization ? "text-green-600" : "text-red-500"}>
                  {editablePlan.productOptimization ? "✓" : "✗"}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300 transition"
              >
                Edit
              </button>
            )}
            <button
              onClick={isEditing ? handleSave : () => setSelectedPlan(null)}
              className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300 transition"
            >
              {isEditing ? "Save" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



