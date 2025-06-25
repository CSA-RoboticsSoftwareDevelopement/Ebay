// "use client";

// import React, { useState, useEffect } from "react";
// import Link from 'next/link'; // Ensure you're using Next.js
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import { useAuth } from "@/context/AuthContext";
// import Swal from "sweetalert2"; // ✅ Import SweetAlert2
// const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

// type EbayProfile = {
//   username: string;
//   email: string;
//   access_token?: string; // ✅ Store token from DB
//   expires_at: Date;
//   created_at: Date;
//   updated_at: Date;
// };

// // Predefined message type
// type PredefinedMessage = {
//   id: string;
//   title: string;
//   message: string;
// };

// export default function Settings() {
//   const { user, authToken } = useAuth(); // ✅ Move useAuth() here (inside component)
//   const [ebayProfile, setEbayProfile] = useState<EbayProfile | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState("account");
//   // These state variables will be used in future implementation
//   // const [isModalOpen, setIsModalOpen] = useState(false);
//   // const [notificationsEnabled, setNotificationsEnabled] = useState(true);
//   // const [darkMode, setDarkMode] = useState(false);
  
//   // Predefined messages state
//   const [predefinedMessages, setPredefinedMessages] = useState<PredefinedMessage[]>([]);
//   const [newMessageTitle, setNewMessageTitle] = useState("");
//   const [newMessageContent, setNewMessageContent] = useState("");
//   const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  
//   // Load predefined messages from local storage on component mount
//   useEffect(() => {
//     const savedMessages = localStorage.getItem('predefinedMessages');
//     if (savedMessages) {
//       setPredefinedMessages(JSON.parse(savedMessages));
//     }
//   }, []);
  
//   // Save predefined messages to local storage whenever they change
//   useEffect(() => {
//     localStorage.setItem('predefinedMessages', JSON.stringify(predefinedMessages));
//   }, [predefinedMessages]);

//   useEffect(() => {
//     const fetchEbayProfile = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
  
//         if (!user || !user.id) {
//           console.error("❌ No user ID found in session");
//           setError("Not authenticated. Please login again.");
//           return;
//         }
  
//         console.log("✅ User ID:", user.id);
//         console.log("✅ Token:", authToken);
  
//         const profileResponse = await axios.get(
//           `${BACKEND_SERVER_URL}/api/ebay/profile?user_id=${user.id}`,
//           {
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         );
  
//         if (profileResponse.data?.ebayProfile?.access_token) {
//           setEbayProfile(profileResponse.data.ebayProfile);
//         } else {
//           setEbayProfile(null);
//         }
  
//         console.log("✅ eBay Profile:", profileResponse.data);
//       } catch (error) {
//         console.error("❌ Failed to load eBay profile:", error);
//         const apiError = error as { response?: { data?: { error?: string } } };
//         setError(
//           apiError.response?.data?.error || "Failed to load eBay profile"
//         );
//         setEbayProfile(null);
//       } finally {
//         setIsLoading(false);
//       }
//     };
  
//     fetchEbayProfile();
//   }, [user, authToken]); // ✅ Do NOT include 'error' here
  
//   // Move this outside
//   useEffect(() => {
//     if (error) {
//       console.error("Error:", error);
//     }
//   }, [error]);
  

//   const handleDisconnectEbay = async () => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "This will disconnect your eBay account!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, disconnect it!",
//     });

//     if (!result.isConfirmed) return;

//     try {
//       setIsLoading(true);

//       if (!user || !user.id) {
//         throw new Error("User ID not found. Please login again.");
//       }

//       await axios.delete(`${BACKEND_SERVER_URL}/api/ebay/disconnect`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${authToken}`,
//         },
//         data: { user_id: user.id },
//       });

//       setEbayProfile(null);
//       Swal.fire(
//         "Disconnected!",
//         "Your eBay account has been removed.",
//         "success"
//       );
//     } catch (error) {
//       console.error("❌ Failed to disconnect eBay account:", error);
//       Swal.fire("Error", "Failed to disconnect eBay account.", "error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateProfile = async () => {
//     if (!user?.id) {
//       Swal.fire("Error", "User ID is required!", "error");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const updatedData = {
//         username: name,
//         email: email,
//       };

//       const response = await axios.patch(
//         `${BACKEND_SERVER_URL}/api/ebay/update-profile/${user.id}`,
//         updatedData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       Swal.fire("Success!", response.data.message, "success");
//       setIsChanged(false);
//     } catch (error) {
//       console.error("❌ Error updating profile:", error);
//       Swal.fire("Error", "Failed to update profile", "error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const isPasswordValid =
//     newPassword.length >= 6 && newPassword === confirmPassword;

//     const handleChangePassword = async () => {
//       if (!isPasswordValid) {
//         Swal.fire("Error", "Passwords do not match or are too short!", "error");
//         return;
//       }
    
//       try {
//         const response = await axios.patch(
//           `${BACKEND_SERVER_URL}/api/ebay/update-profile/${user?.id}`,
//           { password: newPassword }, // ✅ Only send password
//           { headers: { Authorization: `Bearer ${authToken}` } }
//         );
    
//         Swal.fire("Success!", response.data.message, "success");
//         setCurrentPassword("");
//         setNewPassword("");
//         setConfirmPassword("");
//       } catch (error) {
//         console.error("❌ Error changing password:", error);
//         Swal.fire("Error", "Failed to change password", "error");
//       }
//     };
    

//   const [name, setName] = useState(user?.username || "");
//   const [email, setEmail] = useState(user?.email || "");
//   const [isChanged, setIsChanged] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setName(user.username || "");
//       setEmail(user.email || "");
//     }
//   }, [user]);

//   useEffect(() => {
//     // ✅ Enable button only if something changed
//     if (name !== user?.username || email !== user?.email) {
//       setIsChanged(true);
//     } else {
//       setIsChanged(false);
//     }
//   }, [name, email, user]);

//   // ✅ Listen for messages from the popup
//   useEffect(() => {
//     const handleMessage = (event: MessageEvent) => {
//       if (event.data.status === "success") {
//         console.log("✅ eBay authentication successful!");
//         window.location.href = "/settings"; // ✅ Redirect parent page
//       }
//     };

//     window.addEventListener("message", handleMessage);
//     return () => window.removeEventListener("message", handleMessage);
//   }, []);

//   // ✅ Connect to eBay function
//   const handleConnectEbay = async () => {
//     try {
//       setIsLoading(true);

//       if (!user || !user.id) {
//         throw new Error("User ID not found. Please log in.");
//       }

//       // ✅ Send request with userId
//       const response = await axios.get(`/api/ebay/auth-url?user_id=${user.id}`);

//       if (!response.data.url) throw new Error("Invalid OAuth URL from server");

//       // ✅ Open popup AFTER fetching URL (prevents blank popup issue)
//       const popup = window.open(
//         response.data.url, // ✅ eBay OAuth URL
//         "eBayOAuth",
//         "width=600,height=700,resizable=yes,scrollbars=yes"
//       );

//       if (!popup) throw new Error("Popup blocked. Please allow pop-ups.");
//     } catch (error) {
//       console.error("❌ Error connecting to eBay:", error);
//       toast.error("Failed to connect eBay account.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Function to add a new predefined message
//   const handleAddMessage = () => {
//     if (!newMessageTitle.trim() || !newMessageContent.trim()) {
//       toast.error("Please enter both title and message content");
//       return;
//     }
    
//     const newMessage: PredefinedMessage = {
//       id: Date.now().toString(),
//       title: newMessageTitle,
//       message: newMessageContent
//     };
    
//     setPredefinedMessages([...predefinedMessages, newMessage]);
//     setNewMessageTitle("");
//     setNewMessageContent("");
    
//     toast.success("Message template added successfully");
//   };
  
//   // Function to edit a predefined message
//   const handleEditMessage = (id: string) => {
//     const messageToEdit = predefinedMessages.find(msg => msg.id === id);
//     if (messageToEdit) {
//       setNewMessageTitle(messageToEdit.title);
//       setNewMessageContent(messageToEdit.message);
//       setEditingMessageId(id);
//     }
//   };
  
//   // Function to update an edited message
//   const handleUpdateMessage = () => {
//     if (!editingMessageId) return;
    
//     const updatedMessages = predefinedMessages.map(msg => 
//       msg.id === editingMessageId 
//         ? { ...msg, title: newMessageTitle, message: newMessageContent } 
//         : msg
//     );
    
//     setPredefinedMessages(updatedMessages);
//     setNewMessageTitle("");
//     setNewMessageContent("");
//     setEditingMessageId(null);
    
//     toast.success("Message template updated successfully");
//   };
  
//   // Function to delete a predefined message
//   const handleDeleteMessage = (id: string) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!"
//     }).then((result) => {
//       if (result.isConfirmed) {
//         const updatedMessages = predefinedMessages.filter(msg => msg.id !== id);
//         setPredefinedMessages(updatedMessages);
        
//         if (editingMessageId === id) {
//           setNewMessageTitle("");
//           setNewMessageContent("");
//           setEditingMessageId(null);
//         }
        
//         toast.success("Message template deleted successfully");
//       }
//     });
//   };

//   return (
//     <div className="space-y-6 p-6">
//                   <nav className="text-sm text-gray-400 mb-2">
//                     <ol className="list-reset flex">
//                       <li>
//                         <Link href="/" className="hover:underline text-primary-yellow">Home</Link>
//                       </li>
//                       <li><span className="mx-2">/</span></li>
//                       <li className="text-white">Settings</li>
//                     </ol>
//                   </nav>

//       <h1 className="text-2xl font-bold text-white">Settings</h1>

//       {/* Tabs */}
//       <div className="border-b">
//         <nav className="flex overflow-x-auto -mb-px">
//             <div className="flex min-w-full space-x-8 px-4 text-white">
//             {["account", "notifications", "integrations", "preferences"].map(
//               (tab) => (
//                 <button
//                   key={tab}
//                   className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
//                     activeTab === tab
//                       ? "border-primary-yellow text-primary-black"
//                       : "border-transparent text-neutral-gray-500 hover:text-neutral-gray-700 hover:border-neutral-gray-300"
//                   }`}
//                   onClick={() => setActiveTab(tab)}
//                 >
//                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                 </button>
//               )
//             )}
//           </div>
//         </nav>
//       </div>

//       {/* Account Settings Tab */}
//       <div className="mt-6">
//         {activeTab === "account" && (
//           <div className="space-y-6">
//             {/* Profile section */}
//             <div className="bg-black border border-gray-200 rounded-lg p-6 shadow-sm hover:border-primary-yellow transition-colors">
//               <h2 className="text-lg font-medium mb-4 text-white">Profile Information</h2>
//               <form className="space-y-4">
//               <div>
//               <label
//               htmlFor="name"
//               className="block text-sm font-medium text-white"
//               >
//               Name
//               </label>
//               <input
//               type="text"
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//               />
//               </div>
//               <div>
//               <label
//               htmlFor="email"
//               className="block text-sm font-medium text-white"
//               >
//               Email
//               </label>
//               <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//               />
//               </div>
//               <button
//               type="button"
//               onClick={handleUpdateProfile}
//               disabled={!isChanged} // ✅ Disable when no changes
//               className={`px-4 py-2 rounded-md text-white ${
//               isChanged
//                 ? "bg-blue-500 hover:bg-blue-600"
//                 : "bg-gray-400 cursor-not-allowed"
//               }`}
//               >
//               Save Changes
//               </button>
//               </form>
//             </div>

//             {/* Password section */}
//             <div className="bg-black border border-white rounded-lg p-6 shadow-sm hover:border-primary-yellow transition-colors">
//               <h2 className="text-lg font-medium mb-4 text-white">Change Password</h2>
//               <form className="space-y-4">
//               <div>
//               <label
//               htmlFor="currentPassword"
//               className="block text-sm font-medium text-white"
//               >
//               Current Password
//               </label>
//               <input
//               type="password"
//               id="currentPassword"
//               value={currentPassword}
//               onChange={(e) => setCurrentPassword(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//               />
//               </div>
//               <div>
//               <label
//               htmlFor="newPassword"
//               className="block text-sm font-medium text-white"
//               >
//               New Password
//               </label>
//               <input
//               type="password"
//               id="newPassword"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//               />
//               </div>
//               <div>
//               <label
//               htmlFor="confirmPassword"
//               className="block text-sm font-medium text-white"
//               >
//               Confirm New Password
//               </label>
//               <input
//               type="password"
//               id="confirmPassword"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//               />
//               </div>
//               <button
//               type="button"
//               onClick={handleChangePassword}
//               className={`px-4 py-2 rounded-md ${
//               isPasswordValid
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-400 text-white cursor-not-allowed"
//               }`}
//               >
//               Change Password
//               </button>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Notifications Settings Tab */}
//         {activeTab === "notifications" && (
//           <div className="bg-black border border-white rounded-lg p-6 shadow-sm">
//             <h2 className="text-lg font-medium mb-4 text-white">
//               Notification Preferences
//             </h2>
//             <div className="space-y-4">
//               {/* Order Updates */}
//               <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-sm font-medium text-white">
//               Order Updates
//             </h3>
//             <p className="text-sm text-gray-400">
//               Receive notifications about order updates
//             </p>
//           </div>
//           <button
//             type="button"
//             className="bg-yellow-500 relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
//             disabled
//           >
//             <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
//           </button>
//               </div>

//               {/* Promotions */}
//               <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-sm font-medium text-white">
//               Promotions
//             </h3>
//             <p className="text-sm text-gray-400">
//               Receive notifications about promotions
//             </p>
//           </div>
//           <button
//             type="button"
//             className="bg-gray-700 relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
//             disabled
//           >
//             <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
//           </button>
//               </div>

//               {/* Security Alerts */}
//               <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-sm font-medium text-white">
//               Security Alerts
//             </h3>
//             <p className="text-sm text-gray-400">
//               Receive notifications about security issues
//             </p>
//           </div>
//           <button
//             type="button"
//             className="bg-primary-yellow relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
//             disabled
//           >
//             <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
//           </button>
//               </div>

//               {/* New Features */}
//               <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-sm font-medium text-white">
//               New Features
//             </h3>
//             <p className="text-sm text-gray-400">
//               Receive notifications about new features
//             </p>
//           </div>
//           <button
//             type="button"
//             className="bg-gray-700 relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
//             disabled
//           >
//             <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
//           </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* eBay Integration Tab */}
//         {activeTab === "integrations" && (
//             <div className="card p-4 bg-black shadow rounded-lg border border-white hover:outline hover:outline-2 hover:outline-primary-yellow transition-colors">
//             <h2 className="text-white font-semibold mb-4">eBay Account</h2>

//             <div className="flex items-center mb-4">
//               <span
//               className={`px-3 py-1 rounded-full text-sm font-semibold ${
//                 ebayProfile?.access_token
//                 ? "bg-green-100 text-green-700"
//                 : "bg-red-100 text-red-700"
//               }`}
//               >
//                 {ebayProfile?.access_token ? "Connected" : "Disconnected"}
//               </span>
//             </div>

//             {ebayProfile?.access_token ? (
//               <div className="space-y-3">
//                 <button
//                   onClick={handleDisconnectEbay}
//                   disabled={isLoading}
//                   className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
//                 >
//                   {isLoading ? "Disconnecting..." : "Disconnect eBay Account"}
//                 </button>
//               </div>
//             ) : (
//               <button
//                 onClick={handleConnectEbay}
//                 disabled={isLoading}
//                 className="px-6 py-2 bg-primary-yellow text-primary-black font-medium  rounded-lg hover:bg-primary-black hover:text-white  font-medium transition disabled:opacity-50"
//               >
//                 {isLoading ? "Redirecting..." : "Connect eBay Account"}
//               </button>
//             )}
//           </div>
//         )}

//         {/* Preferences Tab */}
//         {activeTab === "preferences" && (
//             <div className="space-y-6">
//             <div className="card p-4 bg-black shadow rounded-lg border border-white hover:outline hover:outline-2 hover:outline-primary-yellow transition-colors">
//               <h2 className="text-white font-semibold mb-4">Preferences</h2>
//               <p className="text-white-600">
//               Customize your application experience.
//               </p>

//               <div className="mt-4">
//                 <label className="block text-sm font-medium text-white mb-2">
//                   Theme
//                 </label>
//                 <select className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed bg-neutral-800">
//                   <option value="light" selected>
//                     Light Mode
//                   </option>
//                   <option value="dark">Dark Mode</option>
//                 </select>
//               </div>
//             </div>
            
//             {/* Predefined Messages Card */}
//             <div className="card p-4 bg-black text-white border border-white shadow rounded-lg hover:border-primary-yellow transition-colors">
//               <h2 className="text-white font-semibold mb-4">Predefined Messages</h2>
//               <p className="text-gray-400 mb-4">
//               Create message templates to quickly respond to customers after they place an order.
//               </p>
              
//               {/* Form to add/edit messages */}
//               <div className="space-y-4 mb-6 border-b border-white pb-6">
//               <div>
//                 <label className="block text-sm font-medium text-white mb-2">
//                 Message Title
//                 </label>
//                 <input
//                 type="text"
//                 value={newMessageTitle}
//                 onChange={(e) => setNewMessageTitle(e.target.value)}
//                 placeholder="e.g., Thank You, Shipping Update"
//                 className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-yellow focus:border-primary-yellow bg-neutral-800 text-white"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-white mb-2">
//                 Message Content
//                 </label>
//                 <textarea
//                 value={newMessageContent}
//                 onChange={(e) => setNewMessageContent(e.target.value)}
//                 placeholder="Write your message here..."
//                 rows={4}
//                 className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-yellow focus:border-primary-yellow bg-neutral-800 text-white"
//                 />
//               </div>
              
//               <button
//                 onClick={editingMessageId ? handleUpdateMessage : handleAddMessage}
//                 className="px-4 py-2 bg-primary-yellow text-primary-black font-medium rounded-md hover:bg-primary-black hover:text-white transition"
//               >
//                 {editingMessageId ? "Update Template" : "Add Template"}
//               </button>
              
//               {editingMessageId && (
//                 <button
//                 onClick={() => {
//                   setNewMessageTitle("");
//                   setNewMessageContent("");
//                   setEditingMessageId(null);
//                 }}
//                 className="ml-3 px-4 py-2 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-600 transition"
//                 >
//                 Cancel Editing
//                 </button>
//               )}
//               </div>
              
//               {/* List of saved messages */}
//               <div>
//               <h3 className="font-medium text-white mb-3">Your Templates</h3>
              
//               {predefinedMessages.length === 0 ? (
//                 <p className="text-gray-400 italic">No message templates saved yet.</p>
//               ) : (
//                 <ul className="space-y-3">
//                 {predefinedMessages.map((message) => (
//                   <li key={message.id} className="border border-white rounded-md p-3 bg-neutral-800 hover:border-primary-yellow transition-colors">
//                   <div className="flex justify-between items-start mb-2">
//                     <h4 className="font-medium text-primary-yellow">{message.title}</h4>
//                     <div className="flex space-x-2">
//                     <button
//                       onClick={() => handleEditMessage(message.id)}
//                       className="text-blue-400 hover:text-blue-600"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDeleteMessage(message.id)}
//                       className="text-red-400 hover:text-red-600"
//                     >
//                       Delete
//                     </button>
//                     </div>
//                   </div>
//                   <p className="text-gray-300 text-sm whitespace-pre-line">{message.message}</p>
//                   </li>
//                 ))}
//                 </ul>
//               )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext"; // Ensure this path is correct
import Swal from "sweetalert2";

const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

type EbayProfile = {
  username: string;
  email: string;
  access_token?: string;
  expires_at: string; // Assuming Date is serialized to string
  created_at: string;
  updated_at: string;
};

type AmazonProfile = {
  username: string;
  email: string;
  access_token?: string;
  expires_at: string; // Assuming Date is serialized to string
  created_at: string;
  updated_at: string;
};

type PredefinedMessage = {
  id: string;
  title: string;
  message: string;
};

export default function Settings() {
  const { user, authToken, loading: isAuthLoading } = useAuth(); // ✅ Use 'loading' as per AuthContext
  const [ebayProfile, setEbayProfile] = useState<EbayProfile | null>(null);
  const [amazonProfile, setAmazonProfile] = useState<AmazonProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false); // This is for component-level loading (e.g., button clicks)
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("account");

  // Predefined messages state
  const [predefinedMessages, setPredefinedMessages] = useState<PredefinedMessage[]>([]);
  const [newMessageTitle, setNewMessageTitle] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // Load predefined messages from local storage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('predefinedMessages');
    if (savedMessages) {
      try {
        setPredefinedMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse predefined messages from local storage", e);
        localStorage.removeItem('predefinedMessages'); // Clear corrupted data
      }
    }
  }, []);

  // Save predefined messages to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('predefinedMessages', JSON.stringify(predefinedMessages));
  }, [predefinedMessages]);

  useEffect(() => {
    // Only attempt to fetch profiles if authentication is not loading
    // and user/authToken are available.
    // console.log("Settings useEffect - user:", user, "authToken:", authToken, "isAuthLoading:", isAuthLoading);

    if (!isAuthLoading && user && user.id && authToken) {
      const fetchEbayProfile = async () => {
        try {
          setError(null); // Clear previous errors
          console.log("✅ Fetching eBay Profile for User ID:", user.id);
          const profileResponse = await axios.get(
            `${BACKEND_SERVER_URL}/api/ebay/profile?user_id=${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          if (profileResponse.data?.ebayProfile?.access_token) {
            setEbayProfile(profileResponse.data.ebayProfile);
          } else {
            setEbayProfile(null);
          }
          console.log("✅ eBay Profile Data:", profileResponse.data); // Log actual data for debugging
        } catch (error) {
          console.error("❌ Failed to load eBay profile:", error);
          const apiError = error as { response?: { data?: { error?: string } } };
          setError(
            apiError.response?.data?.error || "Failed to load eBay profile."
          );
          setEbayProfile(null);
        }
      };

      const fetchAmazonProfile = async () => {
        try {
          setError(null); // Clear previous errors
          console.log("✅ Fetching Amazon Profile for User ID:", user.id);
          const profileResponse = await axios.get(
            `${BACKEND_SERVER_URL}/api/amazon/profile?user_id=${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          if (profileResponse.data?.amazonProfile?.access_token) {
            setAmazonProfile(profileResponse.data.amazonProfile);
          } else {
            setAmazonProfile(null);
          }
          console.log("✅ Amazon Profile Data:", profileResponse.data); // Log actual data for debugging
        } catch (error) {
          console.error("❌ Failed to load Amazon profile:", error);
          const apiError = error as { response?: { data?: { error?: string } } };
          setError(
            apiError.response?.data?.error || "Failed to load Amazon profile."
          );
          setAmazonProfile(null);
        }
      };

      // Execute fetches
      fetchEbayProfile();
      fetchAmazonProfile();
    } else if (!isAuthLoading && (!user || !user.id || !authToken)) {
      // This block will run if auth is done loading, but no user/token found.
      setError("Not authenticated. Please login again.");
      setEbayProfile(null); // Ensure profiles are cleared if user logs out
      setAmazonProfile(null);
    }
    // If isAuthLoading is true, this useEffect will just wait.

  }, [user, authToken, isAuthLoading]); // Depend on isAuthLoading as well

  useEffect(() => {
    if (error) {
      console.error("Global Error State:", error);
    }
  }, [error]);


  const handleDisconnectEbay = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will disconnect your eBay account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, disconnect it!",
    });

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);

      if (!user || !user.id) {
        throw new Error("User ID not found. Please login again.");
      }

      await axios.delete(`${BACKEND_SERVER_URL}/api/ebay/disconnect`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        data: { user_id: user.id }, // Make sure backend expects user_id in data for DELETE
      });

      setEbayProfile(null);
      Swal.fire(
        "Disconnected!",
        "Your eBay account has been removed.",
        "success"
      );
    } catch (error) {
      console.error("❌ Failed to disconnect eBay account:", error);
      Swal.fire("Error", "Failed to disconnect eBay account.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectAmazon = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will disconnect your Amazon account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, disconnect it!",
    });

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);

      if (!user || !user.id) {
        throw new Error("User ID not found. Please login again.");
      }

      await axios.delete(`${BACKEND_SERVER_URL}/api/amazon/disconnect`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        data: { user_id: user.id }, // Make sure backend expects user_id in data for DELETE
      });

      setAmazonProfile(null);
      Swal.fire(
        "Disconnected!",
        "Your Amazon account has been removed.",
        "success"
      );
    } catch (error) {
      console.error("❌ Failed to disconnect Amazon account:", error);
      Swal.fire("Error", "Failed to disconnect Amazon account.", "error");
    } finally {
      setIsLoading(false);
    }
  };


  const handleUpdateProfile = async () => {
    // These `name` and `email` states should be initialized with `user.username` and `user.email`
    // at the beginning, and updated when the user types.
    if (!user?.id) {
      Swal.fire("Error", "User ID is required!", "error");
      return;
    }

    setIsLoading(true);

    try {
      const updatedData = {
        username: name,
        email: email,
      };

      // ✅ This endpoint should be a generic user profile update, not tied to eBay.
      // E.g., `${BACKEND_SERVER_URL}/api/users/${user.id}` or `/api/profile/${user.id}`
      const response = await axios.patch(
        `${BACKEND_SERVER_URL}/api/users/${user.id}`, // Changed to a more generic user endpoint
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Optionally, if your backend returns the updated user, you can update the context here
      // For example, if response.data.user contains the new username/email:
      // if (response.data.user) {
      //   setAuthTokenAndUser(authToken!, response.data.user); // Make sure setAuthTokenAndUser exists in useAuth context
      // }

      Swal.fire("Success!", response.data.message, "success");
      setIsChanged(false);
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      Swal.fire("Error", "Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isPasswordValid =
    newPassword.length >= 6 && newPassword === confirmPassword;

    const handleChangePassword = async () => {
      if (!isPasswordValid) {
        Swal.fire("Error", "Passwords do not match or are too short!", "error");
        return;
      }

      if (!user?.id) {
        Swal.fire("Error", "User ID is required for password change!", "error");
        return;
      }

      try {
        // ✅ This endpoint should also be a generic user password update.
        const response = await axios.patch(
          `${BACKEND_SERVER_URL}/api/users/${user.id}/change-password`, // Changed to a more generic endpoint
          { currentPassword, newPassword }, // Send current password for verification
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        Swal.fire("Success!", response.data.message, "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error("❌ Error changing password:", error);
        // Provide more specific error messages if possible from backend
        Swal.fire("Error", "Failed to change password. " + (axios.isAxiosError(error) && error.response?.data?.message || ""), "error");
      }
    };


  const [name, setName] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isChanged, setIsChanged] = useState(false);

  // Initialize name and email when user object becomes available or changes
  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]); // This will re-run if `user` object reference changes (e.g., after login)

  // Check if profile details have changed
  useEffect(() => {
    // Only compare if user is not null
    if (user && (name !== user.username || email !== user.email)) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [name, email, user]);


  // Listen for messages from the popup (for eBay and Amazon)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Ensure the message is from a trusted origin if possible, or at least from your own domain
      // if (event.origin !== "YOUR_FRONTEND_DOMAIN") return; // Add this for security

      // For eBay
      if (event.data.source === "ebayAuth" && event.data.status === "success") {
        console.log("✅ eBay authentication successful!");
        // Instead of a full reload, you can call checkAuth from context to refresh user data
        // if your backend callback updates the user record in DB with new tokens
        // Or simply re-fetch eBay profile here
        // checkAuth(); // If checkAuth retrieves token from backend
        // fetchEbayProfile(); // This would require refactoring fetchEbayProfile to be standalone
        window.location.reload(); // Simplest for now, as it re-runs everything
      }
      // For Amazon
      if (event.data.source === "amazonAuth" && event.data.status === "success") {
        console.log("✅ Amazon authentication successful!");
        // checkAuth(); // If checkAuth retrieves token from backend
        // fetchAmazonProfile(); // This would require refactoring fetchAmazonProfile to be standalone
        window.location.reload(); // Simplest for now, as it re-runs everything
      } else if (event.data.source === "amazonAuth" && event.data.status === "error") {
        console.error("❌ Amazon authentication failed:", event.data.message);
        Swal.fire("Error", `Amazon connection failed: ${event.data.message || 'Unknown error'}`, "error");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []); // Dependencies empty, as `checkAuth` or specific fetch functions would be called if needed.

  // Connect to eBay function
  const handleConnectEbay = async () => {
    try {
      setIsLoading(true);

      if (!user || !user.id) {
        Swal.fire("Error", "User not logged in. Please login to connect eBay.", "error");
        setIsLoading(false); // Make sure to reset loading on error
        return;
      }

      // Ensure BACKEND_SERVER_URL is correctly defined and accessible
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/ebay/auth-url?user_id=${user.id}`);

      if (!response.data.url) throw new Error("Invalid OAuth URL from server");

      const popup = window.open(
        response.data.url,
        "eBayOAuth",
        "width=600,height=700,resizable=yes,scrollbars=yes"
      );

      if (!popup) {
        Swal.fire("Error", "Popup blocked. Please allow pop-ups for this site.", "error");
        throw new Error("Popup blocked. Please allow pop-ups.");
      }
    } catch (error) {
      console.error("❌ Error connecting to eBay:", error);
      toast.error("Failed to connect eBay account.");
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to Amazon function
  const handleConnectAmazon = async () => {
    try {
      setIsLoading(true);

      if (!user || !user.id) {
        Swal.fire("Error", "User not logged in. Please login to connect Amazon.", "error");
        setIsLoading(false); // Make sure to reset loading on error
        return;
      }

      // Ensure BACKEND_SERVER_URL is correctly defined and accessible
      const response = await axios.get(`${BACKEND_SERVER_URL}/api/amazon/auth-url?user_id=${user.id}`);

      if (!response.data.url) throw new Error("Invalid Amazon OAuth URL from server");

      const popup = window.open(
        response.data.url,
        "AmazonOAuth",
        "width=600,height=700,resizable=yes,scrollbars=yes"
      );

      if (!popup) {
        Swal.fire("Error", "Popup blocked. Please allow pop-ups for this site.", "error");
        throw new Error("Popup blocked. Please allow pop-ups.");
      }
    } catch (error) {
      console.error("❌ Error connecting to Amazon:", error);
      toast.error("Failed to connect Amazon account.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new predefined message
  const handleAddMessage = () => {
    if (!newMessageTitle.trim() || !newMessageContent.trim()) {
      toast.error("Please enter both title and message content");
      return;
    }

    const newMessage: PredefinedMessage = {
      id: Date.now().toString(), // Simple unique ID
      title: newMessageTitle,
      message: newMessageContent
    };

    setPredefinedMessages([...predefinedMessages, newMessage]);
    setNewMessageTitle("");
    setNewMessageContent("");

    toast.success("Message template added successfully");
  };

  // Function to edit a predefined message
  const handleEditMessage = (id: string) => {
    const messageToEdit = predefinedMessages.find(msg => msg.id === id);
    if (messageToEdit) {
      setNewMessageTitle(messageToEdit.title);
      setNewMessageContent(messageToEdit.message);
      setEditingMessageId(id);
    }
  };

  // Function to update an edited message
  const handleUpdateMessage = () => {
    if (!editingMessageId) return;

    if (!newMessageTitle.trim() || !newMessageContent.trim()) {
      toast.error("Please enter both title and message content");
      return;
    }

    const updatedMessages = predefinedMessages.map(msg =>
      msg.id === editingMessageId
        ? { ...msg, title: newMessageTitle, message: newMessageContent }
        : msg
    );

    setPredefinedMessages(updatedMessages);
    setNewMessageTitle("");
    setNewMessageContent("");
    setEditingMessageId(null);

    toast.success("Message template updated successfully");
  };

  // Function to delete a predefined message
  const handleDeleteMessage = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedMessages = predefinedMessages.filter(msg => msg.id !== id);
        setPredefinedMessages(updatedMessages);

        if (editingMessageId === id) {
          setNewMessageTitle("");
          setNewMessageContent("");
          setEditingMessageId(null);
        }

        toast.success("Message template deleted successfully");
      }
    });
  };

  // Optional: Render a loading state for the entire page if auth is still loading
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading settings...
      </div>
    );
  }

  // Optional: Render an error message if auth failed and user is not available
  if (!user || !user.id || !authToken) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-white">
        <p className="text-xl text-red-500 mb-4">
          Error: Not authenticated. Please login again.
        </p>
        <Link href="/login" className="text-primary-yellow hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  // Main render for Settings component
  return (
    <div className="space-y-6 p-6">
                  <nav className="text-sm text-gray-400 mb-2">
                    <ol className="list-reset flex">
                      <li>
                        <Link href="/" className="hover:underline text-primary-yellow">Home</Link>
                      </li>
                      <li><span className="mx-2">/</span></li>
                      <li className="text-white">Settings</li>
                    </ol>
                  </nav>

      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex overflow-x-auto -mb-px">
            <div className="flex min-w-full space-x-8 px-4 text-white">
            {["account", "notifications", "integrations", "preferences"].map(
              (tab) => (
                <button
                  key={tab}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? "border-primary-yellow text-primary-black"
                      : "border-transparent text-neutral-gray-500 hover:text-neutral-gray-700 hover:border-neutral-gray-300"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>
        </nav>
      </div>

      {/* Account Settings Tab */}
      <div className="mt-6">
        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Profile section */}
            <div className="bg-black border border-gray-200 rounded-lg p-6 shadow-sm hover:border-primary-yellow transition-colors">
              <h2 className="text-lg font-medium mb-4 text-white">Profile Information</h2>
              <form className="space-y-4">
              <div>
              <label
              htmlFor="name"
              className="block text-sm font-medium text-white"
              >
              Name
              </label>
              <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              </div>
              <div>
              <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
              >
              Email
              </label>
              <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              </div>
              <button
              type="button"
              onClick={handleUpdateProfile}
              disabled={!isChanged || isLoading} // Disable if no changes or loading
              className={`px-4 py-2 rounded-md text-white ${
              (isChanged && !isLoading)
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
              }`}
              >
              {isLoading ? "Saving..." : "Save Changes"}
              </button>
              </form>
            </div>

            {/* Password section */}
            <div className="bg-black border border-white rounded-lg p-6 shadow-sm hover:border-primary-yellow transition-colors">
              <h2 className="text-lg font-medium mb-4 text-white">Change Password</h2>
              <form className="space-y-4">
              <div>
              <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-white"
              >
              Current Password
              </label>
              <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              </div>
              <div>
              <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-white"
              >
              New Password
              </label>
              <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              </div>
              <div>
              <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-white"
              >
              Confirm New Password
              </label>
              <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              </div>
              <button
              type="button"
              onClick={handleChangePassword}
              disabled={!isPasswordValid || isLoading} // Disable if not valid or loading
              className={`px-4 py-2 rounded-md ${
              (isPasswordValid && !isLoading)
                ? "bg-blue-500 text-white"
                : "bg-gray-400 text-white cursor-not-allowed"
              }`}
              >
              {isLoading ? "Changing..." : "Change Password"}
              </button>
              </form>
            </div>
          </div>
        )}

        {/* Notifications Settings Tab */}
        {activeTab === "notifications" && (
          <div className="bg-black border border-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4 text-white">
              Notification Preferences
            </h2>
            <div className="space-y-4">
              {/* Order Updates */}
              <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">
              Order Updates
            </h3>
            <p className="text-sm text-gray-400">
              Receive notifications about order updates
            </p>
          </div>
          <button
            type="button"
            className="bg-yellow-500 relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            disabled
          >
            <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
          </button>
              </div>

              {/* Promotions */}
              <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">
              Promotions
            </h3>
            <p className="text-sm text-gray-400">
              Receive notifications about promotions
            </p>
          </div>
          <button
            type="button"
            className="bg-gray-700 relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            disabled
          >
            <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
          </button>
              </div>

              {/* Security Alerts */}
              <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">
              Security Alerts
            </h3>
            <p className="text-sm text-gray-400">
              Receive notifications about security issues
            </p>
          </div>
          <button
            type="button"
            className="bg-primary-yellow relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            disabled
          >
            <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
          </button>
              </div>

              {/* New Features */}
              <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">
              New Features
            </h3>
            <p className="text-sm text-gray-400">
              Receive notifications about new features
            </p>
          </div>
          <button
            type="button"
            className="bg-gray-700 relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            disabled
          >
            <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
          </button>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            {/* eBay Integration Card */}
            <div className="card p-4 bg-black shadow rounded-lg border border-white hover:outline hover:outline-2 hover:outline-primary-yellow transition-colors">
              <h2 className="text-white font-semibold mb-4">eBay Account</h2>

              <div className="flex items-center mb-4">
                <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  ebayProfile?.access_token
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                }`}
                >
                  {ebayProfile?.access_token ? "Connected" : "Disconnected"}
                </span>
              </div>

              {ebayProfile?.access_token ? (
                <div className="space-y-3">
                  <button
                    onClick={handleDisconnectEbay}
                    disabled={isLoading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isLoading ? "Disconnecting..." : "Disconnect eBay Account"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectEbay}
                  disabled={isLoading}
                  className="px-6 py-2 bg-primary-yellow text-primary-black font-medium  rounded-lg hover:bg-primary-black hover:text-white  font-medium transition disabled:opacity-50"
                >
                  {isLoading ? "Redirecting..." : "Connect eBay Account"}
                </button>
              )}
            </div>

            {/* Amazon Integration Card */}
            <div className="card p-4 bg-black shadow rounded-lg border border-white hover:outline hover:outline-2 hover:outline-primary-yellow transition-colors">
              <h2 className="text-white font-semibold mb-4">Amazon Account</h2>

              <div className="flex items-center mb-4">
                <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  amazonProfile?.access_token
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                }`}
                >
                  {amazonProfile?.access_token ? "Connected" : "Disconnected"}
                </span>
              </div>

              {amazonProfile?.access_token ? (
                <div className="space-y-3">
                  <button
                    onClick={handleDisconnectAmazon}
                    disabled={isLoading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isLoading ? "Disconnecting..." : "Disconnect Amazon Account"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectAmazon}
                  disabled={isLoading}
                  className="px-6 py-2 bg-primary-yellow text-primary-black font-medium  rounded-lg hover:bg-primary-black hover:text-white  font-medium transition disabled:opacity-50"
                >
                  {isLoading ? "Redirecting..." : "Connect Amazon Account"}
                </button>
              )}
            </div>
          </div>
        )}

<div className="mt-6">
  <button
    onClick={() => {
      const url = '/amazon-auth';
      const windowFeatures = 'noopener,noreferrer,width=600,height=800';
      window.open(url, '_blank', windowFeatures);
    }}
    className="px-6 py-2 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-400"
  >
    Connect to Amazon
  </button>
</div>
 
        {/* Preferences Tab */}
        {activeTab === "preferences" && (
            <div className="space-y-6">
            <div className="card p-4 bg-black shadow rounded-lg border border-white hover:outline hover:outline-2 hover:outline-primary-yellow transition-colors">
              <h2 className="text-white font-semibold mb-4">Preferences</h2>
              <p className="text-white-600">
              Customize your application experience.
              </p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Theme
                </label>
                <select className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed bg-neutral-800">
                  <option value="light" selected>
                    Light Mode
                  </option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </div>

            {/* Predefined Messages Card */}
            <div className="card p-4 bg-black text-white border border-white shadow rounded-lg hover:border-primary-yellow transition-colors">
              <h2 className="text-white font-semibold mb-4">Predefined Messages</h2>
              <p className="text-gray-400 mb-4">
              Create message templates to quickly respond to customers after they place an order.
              </p>

              {/* Form to add/edit messages */}
              <div className="space-y-4 mb-6 border-b border-white pb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                Message Title
                </label>
                <input
                type="text"
                value={newMessageTitle}
                onChange={(e) => setNewMessageTitle(e.target.value)}
                placeholder="e.g., Thank You, Shipping Update"
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-yellow focus:border-primary-yellow bg-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                Message Content
                </label>
                <textarea
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                placeholder="Write your message here..."
                rows={4}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-yellow focus:border-primary-yellow bg-neutral-800 text-white"
                />
              </div>

              <button
                onClick={editingMessageId ? handleUpdateMessage : handleAddMessage}
                disabled={isLoading} // Disable if component-level loading is active
                className="px-4 py-2 bg-primary-yellow text-primary-black font-medium rounded-md hover:bg-primary-black hover:text-white transition disabled:opacity-50"
              >
                {editingMessageId ? "Update Template" : "Add Template"}
              </button>

              {editingMessageId && (
                <button
                onClick={() => {
                  setNewMessageTitle("");
                  setNewMessageContent("");
                  setEditingMessageId(null);
                }}
                disabled={isLoading} // Disable if component-level loading is active
                className="ml-3 px-4 py-2 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-600 transition disabled:opacity-50"
                >
                Cancel Editing
                </button>
              )}
              </div>

              {/* List of saved messages */}
              <div>
              <h3 className="font-medium text-white mb-3">Your Templates</h3>

              {predefinedMessages.length === 0 ? (
                <p className="text-gray-400 italic">No message templates saved yet.</p>
              ) : (
                <ul className="space-y-3">
                {predefinedMessages.map((message) => (
                  <li key={message.id} className="border border-white rounded-md p-3 bg-neutral-800 hover:border-primary-yellow transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-primary-yellow">{message.title}</h4>
                    <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditMessage(message.id)}
                      disabled={isLoading} // Disable while loading
                      className="text-blue-400 hover:text-blue-600 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      disabled={isLoading} // Disable while loading
                      className="text-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-line">{message.message}</p>
                  </li>
                ))}
                </ul>
              )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}