"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Select from "react-select";
import Swal from "sweetalert2";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement, // Ensure PaymentElement is imported
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";

// Make sure to load your Stripe public key from environment variables
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export default function PricingPlans() {
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.is_admin === 1;
  const [showModal, setShowModal] = useState(false); // For Add/Edit Plan
  const [showPaymentModal, setShowPaymentModal] = useState(false); // For Payment
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<Plan | null>(null);

  type Plan = {
    id: string;
    name: string;
    price: number;
    inventory: number;
    productFinder: number;
    platform: string[];
    findSeller: boolean;
    productOptimization: boolean;
    plan_type?: string; // Add this for consistency with fetched data
    find_seller?: boolean | number;
    product_optimization?: boolean | number;
  };

  const [editablePlan, setEditablePlan] = useState<Plan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [allPlans, setAllPlans] = useState<Plan[]>([]); // Explicitly type allPlans
  const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const [keys, setKeys] = useState<Array<{ plan_id: number; plan_status: number }>>([]); // Explicitly type keys


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

  const initialForm: Plan = {
    id: "",
    name: "",
    price: 0,
    inventory: 0,
    productFinder: 0,
    platform: [],
    findSeller: false,
    productOptimization: false,
  };

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_SERVER_URL}/api/plans/allplans`);
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }
      const data = await response.json();
      console.log("🔍 Raw plan response:", data);
      // Map the incoming data to match the Plan type, especially for boolean fields
      const formattedPlans = data.plans.map((plan) => ({ // Use any for mapping, then cast to Plan
        ...plan,
        name: plan.plan_type, // Use plan_type as name
        price: parseFloat(plan.price), // Ensure price is a number
        inventory: parseInt(plan.inventory),
        productFinder: parseInt(plan.product_finder),
        platform: Array.isArray(plan.platform)
          ? plan.platform
          : JSON.parse(plan.platform || "[]"), // Handle platform string
        findSeller: plan.find_seller === 1 || plan.find_seller === true,
        productOptimization:
          plan.product_optimization === 1 || plan.product_optimization === true,
      }));
      setAllPlans(formattedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  }, [BACKEND_SERVER_URL]);


    const fetchKeys = useCallback(async () => {
      try {
        const response = await axios.get("/api/admin/keys");
        console.log("Fetched keys:", response.data.keys); // Log fetched keys
         setKeys(response.data.keys);
      } catch (error) {
        console.error("Error fetching keys:", error);
      }
    }, []);

    useEffect(() => {
      fetchKeys();
    }, [fetchKeys]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);


  // IMPORTANT: Set active plan based on fetched keys and allPlans
  useEffect(() => {
    if (allPlans.length > 0 && keys.length > 0) {
      const activeKey = keys.find(key => key.plan_status === 1); // Find the active key
      if (activeKey) {
        // Find the corresponding plan in allPlans using activeKey.plan_id
        const activePlan = allPlans.find(
          (plan) => Number(plan.id) === activeKey.plan_id
        );
        if (activePlan) {
          setActivePlanId(activePlan.id);
          console.log("Setting active plan ID:", activePlan.id); // Log the active plan ID
        } else {
          console.log("Active plan not found in allPlans for key:", activeKey);
        }
      } else {
        console.log("No active key found with plan_status === 1");
      }
    }
  }, [allPlans, keys]); // Depend on both allPlans and keys


  const handleChange = (key: keyof Plan, value: Plan[keyof Plan]) => {
    setEditablePlan((prev: Plan | null) =>
      prev ? { ...prev, [key]: value } : prev
    );
  };

  const handleSave = async () => {
    if (!editablePlan || !user) return;

    if (!editablePlan.name || !editablePlan.price || !editablePlan.platform) {
      toast("error", "Please fill in all required fields.");
      return;
    }

    try {
      const endpoint = isEditing
        ? `${BACKEND_SERVER_URL}/api/plans/editplan/${editablePlan.id}`
        : `${BACKEND_SERVER_URL}/api/plans/addplans`;

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        credentials: "include",
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_type: editablePlan.name,
          price: editablePlan.price.toString(),
          inventory: editablePlan.inventory.toString(),
          product_finder: editablePlan.productFinder.toString(),
          platform: editablePlan.platform, // Send as array, backend should handle JSON.stringify
          find_seller: editablePlan.findSeller,
          product_optimization: editablePlan.productOptimization,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Full response error:", data);
        throw new Error(data.message || "Unknown error");
      }

      toast("success", "Plan saved successfully!");
      await fetchPlans();
      setEditablePlan(null);
      setIsEditing(false);
      setShowModal(false);
    } catch (error) { // Type 'any' for error for broader catching
      console.error("❌ Error saving plan:", error);
      toast("error", `Error saving the plan: ${error.message || ""}`);
    }
  };

  const handleUpgradeClick = (plan: Plan) => {
    console.log("Selected plan for payment:", plan);
    setSelectedPlanForPayment(plan);
    setShowPaymentModal(true);
  };

  // Stripe Payment Form Component
  const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements || !selectedPlanForPayment || !user?.id || !user?.email) {
        setMessage("Missing Stripe, Elements, Plan, or User details.");
        return;
      }

      setIsLoading(true);
      setMessage(null); // Clear previous messages

      try {
        // Step 1: Create a Payment Intent on your backend
        // This should always happen first to get the clientSecret
        const response = await fetch(
          `http://localhost:3000/api/stripe/create-payment-intent`, // Use BACKEND_SERVER_URL
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: selectedPlanForPayment.price * 100, // Amount in cents
              planId: selectedPlanForPayment.id,
              userId: user.id,
              userEmail: user.email,
              planName: selectedPlanForPayment.name,
            }),
          }
        );

        const data = await response.json(); // Get the full response data

        if (!response.ok || data.error) { // Check both response.ok and for custom backend error
          setMessage(data.error || "Failed to create Payment Intent on backend.");
          setIsLoading(false);
          return;
        }

        const clientSecret = data.clientSecret;

        // --- THE CRITICAL FIX: SUBMIT ELEMENTS FIRST ---
        // Step 2: Submit the PaymentElement to collect card details
        // This collects the data from the UI before confirming the payment.
        const { error: submitError } = await elements.submit();

        if (submitError) {
          setMessage(submitError.message || "An error occurred while submitting payment details.");
          setIsLoading(false);
          return;
        }

        // Step 3: Confirm the payment on the client side
        // Now that elements have submitted, proceed with confirmation.
        const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
          elements, // Pass the elements instance
          clientSecret,
          confirmParams: {
            // This is the URL Stripe will redirect to if the payment requires authentication (e.g., 3D Secure).
            // It should point to a page in your app that can handle the redirect outcome.
            // You might want a dedicated success/failure page here.
            return_url: `${window.location.origin}/pricing-plans?payment_success=true`, // Added query param for clarity
          },
          redirect: "if_required", // Important for automatic payment methods. Will redirect only if necessary.
        });

        if (confirmError) {
          // Display error to your customer (e.g., card was declined, invalid input)
          setMessage(confirmError.message || "An unexpected error occurred during payment confirmation.");
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
          // Payment was successful!
          setMessage("Payment Succeeded!");
          toast("success", "Payment successful! Your plan has been upgraded.");
          // Update local state or re-fetch user data if necessary
          setActivePlanId(selectedPlanForPayment.id);
          setShowPaymentModal(false);
          setSelectedPlanForPayment(null);
          // IMPORTANT: Your backend webhook (`/api/webhooks/stripe`) should handle
          // updating the user's plan in the database and sending emails.
          // Rely on the webhook for critical updates to prevent race conditions.
        }
      } catch (err) { // Type 'any' for error for broader catching
        console.error("Payment processing error:", err);
        setMessage(err.message || "An unexpected error occurred during payment processing.");
      } finally {
        setIsLoading(false);
      }
    };
    return (
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" />
        <button disabled={isLoading || !stripe || !elements} id="submit" className="mt-4 w-full bg-yellow-400 text-black px-6 py-2 rounded font-semibold shadow hover:bg-yellow-300 transition">
          <span id="button-text">
            {isLoading ? "Processing..." : "Pay now"}
          </span>
        </button>
        {/* Show any error or success messages */}
        {message && <div id="payment-message" className="text-red-500 mt-2 text-sm">{message}</div>}
      </form>
    );
  };


  return (
    <div className="p-8 bg-black min-h-screen relative text-white">
      <h1 className="text-2xl font-bold mb-4 text-white">Plans</h1>

      {/* Add Plan Button */}
      {isAdmin && (
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => {
              setEditablePlan(initialForm);
              setIsEditing(false);
              setShowModal(true);
            }}
            className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold shadow hover:bg-yellow-300 transition"
          >
            + Add Plan
          </button>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showModal && editablePlan && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-black rounded-2xl shadow-xl p-8 w-full max-w-2xl relative">
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
                    value={editablePlan[key] || ""} // Ensure value is not null/undefined
                    onChange={(e) =>
                      handleChange(
                        key as keyof Plan,
                        type === "number"
                          ? parseInt(e.target.value) || 0 // Default to 0 if parsing fails
                          : e.target.value
                      )
                    }
                    className="border px-2 py-1 rounded w-full text-black"
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
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "white",
                        borderColor: "#ccc",
                      }),
                      option: (provided) => ({
                        ...provided,
                        color: "black",
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: "black",
                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: "black",
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        color: "black",
                        ":hover": {
                          backgroundColor: "#f0f0f0",
                          color: "red",
                        },
                      }),
                    }}
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
                  className="form-checkbox h-5 w-5 text-yellow-500 rounded"
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
                  className="form-checkbox h-5 w-5 text-yellow-500 rounded"
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

      {/* Payment Modal */}
      {showPaymentModal && selectedPlanForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-black text-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <h2 className="text-2xl font-bold mb-4 text-yellow-500 text-center">
              Upgrade to {selectedPlanForPayment.name} Plan
            </h2>
            <p className="text-center mb-6">
              Total: ${selectedPlanForPayment.price}
            </p>

            <Elements
              stripe={stripePromise}
              options={{
                mode: "payment",
                amount: selectedPlanForPayment.price * 100,
                currency: "usd",
                appearance: { theme: "night" },
              }}
            >
              <CheckoutForm />
            </Elements>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPlanForPayment(null);
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
        {allPlans.map((plan: Plan, index: number) => {
          const platforms = (() => {
            try {
              if (Array.isArray(plan.platform)) return plan.platform.join(", ");
              // Fallback for cases where platform might be a stringified array
              const parsed = JSON.parse(plan.platform as string);
              return Array.isArray(parsed) ? parsed.join(", ") : plan.platform;
            } catch {
              return plan.platform;
            }
          })();

          return (
            <div
              key={index}
              className={`max-w-2xl mx-auto border rounded-2xl shadow-xl p-8 bg-black text-center transition ${
                activePlanId === plan.id
                  ? "border-yellow-400 shadow-2xl"
                  : "hover:border-yellow-400 hover:shadow-2xl"
              }`}
            >
              <h2 className="text-3xl font-bold mb-4 text-yellow-500">
                {plan.name} Plan
              </h2>

              <div className="text-left space-y-3">
                <div className="flex items-center">
                  <span className="w-60 font-semibold">Price</span>
                  <span>${plan.price}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-60 font-semibold">Inventory</span>
                  <span>{plan.inventory}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-60 font-semibold">Product Finder</span>
                  <span>{plan.productFinder}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-60 font-semibold">Platform(s)</span>
                  <span>{platforms}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-60 font-semibold">Find Seller</span>
                  <span
                    className={
                      plan.findSeller ? "text-green-600" : "text-red-500"
                    }
                  >
                    {plan.findSeller ? "✓" : "✗"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="w-60 font-semibold">
                    Product Optimization
                  </span>
                  <span
                    className={
                      plan.productOptimization ? "text-green-600" : "text-red-500"
                    }
                  >
                    {plan.productOptimization ? "✓" : "✗"}
                  </span>
                </div>

                <div className="mt-6">
                  {activePlanId === plan.id ? (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-600 px-4 py-2 rounded font-semibold cursor-not-allowed"
                    >
                      Active
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgradeClick(plan)}
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
                        name: plan.name || "",
                        price: plan.price,
                        inventory: plan.inventory,
                        productFinder: plan.productFinder,
                        platform: plan.platform,
                        findSeller: plan.findSeller,
                        productOptimization: plan.productOptimization,
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
                    onClick={() => {
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
                            setDeletingPlanId(Number(plan.id));
                            const res = await fetch(
                              `${BACKEND_SERVER_URL}/api/plans/deleteplan/${plan.id}`,
                              { method: "DELETE" }
                            );

                            if (!res.ok)
                              throw new Error("Failed to delete the plan");

                            toast("success", "Plan deleted successfully!");
                            fetchPlans();
                          } catch (error) { // Type 'any' for error
                            console.error("❌ Error deleting plan:", error);
                            toast("error", "Error deleting the plan.");
                          } finally {
                            setDeletingPlanId(null);
                          }
                        }
                      });
                    }}
                    disabled={deletingPlanId === Number(plan.id)}
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