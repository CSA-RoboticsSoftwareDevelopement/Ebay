import React, { useState } from "react";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2
import { Product, EbaySpecificData, AmazonSpecificData, EtsySpecificData, ProductVariation } from "@/types/ProductTypes"; // ✅ Import Product type
interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProduct: Product) => void;
}
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;



const API_URL = `${BACKEND_SERVER_URL}/api/ebay/products/inventory/add`; // ✅ API Endpoint

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  // Universal form fields
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    quantity: "",
    description: "",
    category: "",
    condition: "NEW",
    images: [""], // Array for multiple images
  });

  // Variation state
  const [hasVariations, setHasVariations] = useState(false);
  const [variations, setVariations] = useState<ProductVariation[]>([
    { id: "1", name: "Size", options: [{ name: "One Size", quantity: 1 }] }
  ]);

  // Shipping state
  const [shippingType, setShippingType] = useState("default");

  // Platform-specific data
  const [ebayData, setEbayData] = useState<Partial<EbaySpecificData>>({
    conditionId: 1000, // New
    itemSpecifics: {},
    listingFormat: "FIXED_PRICE",
    bestOffer: false,
  });

  const [amazonData, setAmazonData] = useState<Partial<AmazonSpecificData>>({
    fulfillmentChoice: "FBM",
    bulletPoints: [""],
  });

  const [etsyData, setEtsyData] = useState<Partial<EtsySpecificData>>({
    whoMade: "i_did",
    whenMade: "2020_2023",
    isSupply: false,
    isPersonalizable: false,
    tags: [],
  });

  // State for platform selection
  const [platforms, setPlatforms] = useState({
    ebay: true, // Default to true since this is the eBay app
    amazon: false,
    etsy: false,
  });

  const [selectedTab, setSelectedTab] = useState("universal"); // "universal", "amazon", "ebay", "etsy"
  const [loading, setLoading] = useState(false); // ✅ Track submission state
  const [error, setError] = useState<string | null>(null); // ✅ Track API errors

  // Handle input changes for universal fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image URL changes
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  // Add another image field
  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  // Remove image field
  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData({ ...formData, images: newImages });
    }
  };

  // Handle platform selection changes
  const handlePlatformChange = (platform: keyof typeof platforms) => {
    setPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  // Handle changes to eBay-specific data
  const handleEbayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEbayData({
      ...ebayData,
      [e.target.name]: e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : e.target.value
    });
  };

  // Handle changes to Amazon-specific data
  const handleAmazonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAmazonData({
      ...amazonData,
      [e.target.name]: e.target.value
    });
  };

  // Handle bullet point changes for Amazon
  const handleBulletPointChange = (index: number, value: string) => {
    const newBulletPoints = [...(amazonData.bulletPoints || [""])];
    newBulletPoints[index] = value;
    setAmazonData({ ...amazonData, bulletPoints: newBulletPoints });
  };

  // Handle changes to Etsy-specific data
  const handleEtsyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
      
    setEtsyData({
      ...etsyData,
      [e.target.name]: value
    });
  };

  // Handle Etsy tags changes
  const handleTagChange = (index: number, value: string) => {
    const newTags = [...(etsyData.tags || [])];
    newTags[index] = value;
    setEtsyData({ ...etsyData, tags: newTags });
  };

  // Add Etsy tag field
  const addTagField = () => {
    setEtsyData({ ...etsyData, tags: [...(etsyData.tags || []), ""] });
  };

  // Handle variations
  const handleVariationChange = (index: number, field: string, value: string) => {
    const newVariations = [...variations];
    newVariations[index] = { ...newVariations[index], [field]: value };
    setVariations(newVariations);
  };

  const handleVariationOptionChange = (
    variationIndex: number,
    optionIndex: number,
    field: string,
    value: string | number
  ) => {
    const newVariations = [...variations];
    newVariations[variationIndex].options[optionIndex] = {
      ...newVariations[variationIndex].options[optionIndex],
      [field]: field === 'quantity' ? Number(value) : value
    };
    setVariations(newVariations);
  };
  

  const addVariation = () => {
    setVariations([...variations, { 
      id: Date.now().toString(), 
      name: "", 
      options: [{ name: "", quantity: 1 }] 
    }]);
  };

  const addVariationOption = (variationIndex: number) => {
    const newVariations = [...variations];
    newVariations[variationIndex].options.push({ name: "", quantity: 1 });
    setVariations(newVariations);
  };

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const removeVariationOption = (variationIndex: number, optionIndex: number) => {
    if (variations[variationIndex].options.length > 1) {
      const newVariations = [...variations];
      newVariations[variationIndex].options = newVariations[variationIndex].options.filter((_, i) => i !== optionIndex);
      setVariations(newVariations);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Ensure required fields are filled
    if (!formData.title || !formData.price || !formData.quantity) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Ensure at least one platform is selected
    if (!platforms.ebay && !platforms.amazon && !platforms.etsy) {
      setError("Please select at least one platform to list on.");
      setLoading(false);
      return;
    }

    // Validate platform-specific data
    if (platforms.ebay && !ebayData.conditionId) {
      setError("Please set condition for eBay listing.");
      setLoading(false);
      return;
    }

    if (platforms.amazon && amazonData.fulfillmentChoice === "FBA" && !amazonData.asin) {
      setError("ASIN is required for Amazon FBA listings.");
      setLoading(false);
      return;
    }

    if (platforms.etsy && !etsyData.whoMade) {
      setError("Please specify who made the item for Etsy.");
      setLoading(false);
      return;
    }

    // ✅ Prepare data in API format
    const productData = {
      sku: `SKU-${Date.now()}`, // Generate unique SKU
      title: formData.title,
      quantity: hasVariations ? 
        variations.reduce((total, v) => total + v.options.reduce((sum, o) => sum + o.quantity, 0), 0) : 
        parseInt(formData.quantity),
      price: formData.price,
      currency: "AUD", // Changed to AUD as per requirements
      condition: formData.condition,
      category: formData.category,
      description: formData.description,
      imageUrls: formData.images.filter(img => img.trim() !== ""),
      variations: hasVariations ? variations : undefined,
      platforms: platforms,
      platformData: {
        ebay: platforms.ebay ? ebayData : undefined,
        amazon: platforms.amazon ? amazonData : undefined,
        etsy: platforms.etsy ? etsyData : undefined
      },
      shippingType,
    };

    try {
      // ✅ Send POST request to API
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Read response error
        console.error("API Error:", errorText); // ✅ Log the full API response
        throw new Error(`Failed to add product: ${errorText}`);
      }

      // ✅ Convert response to JSON
      const newProduct = await response.json();

      // ✅ Pass new product to parent component
      onAddProduct(newProduct);
      await Swal.fire({
        title: "Success!",
        text: "Product added successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // ✅ Reset form after successful submission
      setFormData({
        title: "",
        price: "",
        quantity: "",
        description: "",
        category: "",
        condition: "NEW",
        images: [""],
      });
      setPlatforms({
        ebay: true,
        amazon: false,
        etsy: false,
      });
      setHasVariations(false);
      setVariations([{ id: "1", name: "Size", options: [{ name: "One Size", quantity: 1 }] }]);
      setEbayData({
        conditionId: 1000,
        itemSpecifics: {},
        listingFormat: "FIXED_PRICE",
        bestOffer: false,
      });
      setAmazonData({
        fulfillmentChoice: "FBM",
        bulletPoints: [""],
      });
      setEtsyData({
        whoMade: "i_did",
        whenMade: "2020_2023",
        isSupply: false,
        isPersonalizable: false,
        tags: [],
      });

      // ✅ Close modal after successful submission
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong!");
      }
    } finally {
      setLoading(false);
    }

  };

  // Platform Icons
  const PlatformIcon = ({ platform }: { platform: string }) => {
    switch (platform) {
      case 'ebay':
        return (
          <div className="w-6 h-6 bg-primary-yellow rounded-full flex items-center justify-center">
            <span className="text-[10px] text-primary-black font-bold">eB</span>
          </div>
        );
      case 'amazon':
        return (
          <div className="w-6 h-6 bg-neutral-gray-300 rounded-full flex items-center justify-center">
            <span className="text-[10px] text-primary-black font-bold">Am</span>
          </div>
        );
      case 'etsy':
        return (
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">E</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">Add New Product</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b sticky top-16 bg-white z-10 overflow-x-auto">
          <button
            className={`px-6 py-3 font-medium ${selectedTab === 'universal' ? 'border-b-2 border-primary-yellow text-primary-black' : 'text-gray-500'}`}
            onClick={() => setSelectedTab('universal')}
          >
            Universal Details
          </button>
          {platforms.ebay && (
            <button
              className={`px-6 py-3 font-medium ${selectedTab === 'ebay' ? 'border-b-2 border-primary-yellow text-primary-black' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('ebay')}
            >
              eBay
            </button>
          )}
          {platforms.amazon && (
            <button
              className={`px-6 py-3 font-medium ${selectedTab === 'amazon' ? 'border-b-2 border-primary-yellow text-primary-black' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('amazon')}
            >
              Amazon
            </button>
          )}
          {platforms.etsy && (
            <button
              className={`px-6 py-3 font-medium ${selectedTab === 'etsy' ? 'border-b-2 border-primary-yellow text-primary-black' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('etsy')}
            >
              Etsy
            </button>
          )}
          <button
            className={`px-6 py-3 font-medium ${selectedTab === 'platforms' ? 'border-b-2 border-primary-yellow text-primary-black' : 'text-gray-500'}`}
            onClick={() => setSelectedTab('platforms')}
          >
            Platforms
          </button>
          <button
            className={`px-6 py-3 font-medium ${selectedTab === 'variations' ? 'border-b-2 border-primary-yellow text-primary-black' : 'text-gray-500'}`}
            onClick={() => setSelectedTab('variations')}
          >
            Variations
          </button>
          <button
            className={`px-6 py-3 font-medium ${selectedTab === 'shipping' ? 'border-b-2 border-primary-yellow text-primary-black' : 'text-gray-500'}`}
            onClick={() => setSelectedTab('shipping')}
          >
            Shipping
          </button>
        </div>

        {error && <p className="text-red-500 text-sm p-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Universal Details Tab */}
            {selectedTab === 'universal' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Product Title"
                    className="w-full border px-3 py-2 rounded-lg"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">80 character limit recommended for eBay</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    placeholder="Enter product description"
                    className="w-full border px-3 py-2 rounded-lg"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (AUD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Price"
                      className="w-full border px-3 py-2 rounded-lg"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      placeholder="Quantity"
                      className="w-full border px-3 py-2 rounded-lg"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      disabled={hasVariations}
                    />
                    {hasVariations && (
                      <p className="text-xs text-gray-500 mt-1">Quantity will be calculated from variations</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="category"
                    placeholder="Enter category"
                    className="w-full border px-3 py-2 rounded-lg"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="condition"
                    className="w-full border px-3 py-2 rounded-lg"
                    value={formData.condition}
                    onChange={handleChange}
                    required
                  >
                    <option value="NEW">New</option>
                    <option value="USED">Used</option>
                    <option value="REFURBISHED">Refurbished</option>
                    <option value="OPEN_BOX">Open Box</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`Image URL ${index + 1}`}
                          className="w-full border px-3 py-2 rounded-lg"
                          value={image}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          required={index === 0}
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageField}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
                    >
                      + Add Another Image
                    </button>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="hasVariations"
                    checked={hasVariations}
                    onChange={() => setHasVariations(!hasVariations)}
                    className="h-4 w-4 text-primary-yellow"
                  />
                  <label htmlFor="hasVariations" className="ml-2 text-sm font-medium text-gray-700">
                    This product has variations (size, color, etc.)
                  </label>
                </div>
              </div>
            )}

            {/* Variations Tab */}
            {selectedTab === 'variations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Product Variations</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={hasVariations}
                      onChange={() => setHasVariations(!hasVariations)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-yellow"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">Enable variations</span>
                  </label>
                </div>
                
                {hasVariations ? (
                  <div className="space-y-6">
                    {variations.map((variation, vIndex) => (
                      <div key={variation.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Variation Type (e.g., Size, Color)
                            </label>
                            <input
                              type="text"
                              value={variation.name}
                              onChange={(e) => handleVariationChange(vIndex, 'name', e.target.value)}
                              className="w-full border px-3 py-2 rounded-lg"
                              placeholder="e.g., Size, Color"
                              required={hasVariations}
                            />
                          </div>
                          {variations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariation(vIndex)}
                              className="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Options
                          </label>
                          {variation.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option.name}
                                onChange={(e) => handleVariationOptionChange(vIndex, oIndex, 'name', e.target.value)}
                                className="flex-1 border px-3 py-2 rounded-lg"
                                placeholder="Option name (e.g., Small, Red)"
                                required={hasVariations}
                              />
                              <input
                                type="number"
                                value={option.quantity}
                                onChange={(e) => handleVariationOptionChange(vIndex, oIndex, 'quantity', e.target.value)}
                                className="w-24 border px-3 py-2 rounded-lg"
                                placeholder="Qty"
                                min="0"
                                required={hasVariations}
                              />
                              {variation.options.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeVariationOption(vIndex, oIndex)}
                                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addVariationOption(vIndex)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addVariation}
                      className="px-3 py-2 bg-primary-yellow text-primary-black rounded-lg text-sm"
                    >
                      + Add Another Variation Type
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Enable variations if your product comes in different options like sizes or colors. Each variation can have its own quantity and optional price.
                  </p>
                )}
              </div>
            )}

            {/* Shipping Tab */}
            {selectedTab === 'shipping' && (
              <div className="space-y-6">
                <h3 className="font-medium">Shipping Configuration</h3>
<p className="text-sm text-gray-600">
  Configure how this product will be shipped. Platform-specific shipping details can be set in each platform&rsquo;s tab.
</p>

                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Shipping Method</label>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="ship-default"
                          name="shippingType"
                          value="default"
                          checked={shippingType === "default"}
                          onChange={() => setShippingType("default")}
                          className="h-4 w-4 text-primary-yellow border-gray-300"
                        />
                        <label htmlFor="ship-default" className="ml-2 text-sm text-gray-700">
                          Use default shipping profiles/policies
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="ship-custom"
                          name="shippingType"
                          value="custom"
                          checked={shippingType === "custom"}
                          onChange={() => setShippingType("custom")}
                          className="h-4 w-4 text-primary-yellow border-gray-300"
                        />
                        <label htmlFor="ship-custom" className="ml-2 text-sm text-gray-700">
                          Set custom shipping for this product
                        </label>
                      </div>
                      
                      {platforms.amazon && (
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="ship-fba"
                            name="shippingType"
                            value="fba"
                            checked={shippingType === "fba"}
                            onChange={() => {
                              setShippingType("fba");
                              setAmazonData({...amazonData, fulfillmentChoice: "FBA"});
                            }}
                            className="h-4 w-4 text-primary-yellow border-gray-300"
                          />
                          <label htmlFor="ship-fba" className="ml-2 text-sm text-gray-700">
                            Fulfilled by Amazon (FBA)
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {shippingType === "custom" && (
                    <div className="border rounded-lg p-4 space-y-4">
    <p className="text-sm text-gray-600">
  You&rsquo;ve selected custom shipping. Please configure platform-specific shipping details in each platform&rsquo;s tab.
</p>

                    </div>
                  )}
                </div>
              </div>
            )}

            {/* eBay Tab */}
            {selectedTab === 'ebay' && (
              <div className="space-y-6">
                <h3 className="font-medium">eBay-Specific Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      eBay Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="conditionId"
                      className="w-full border px-3 py-2 rounded-lg"
                      value={ebayData.conditionId}
                      onChange={handleEbayChange}
                      required={platforms.ebay}
                    >
                      <option value="1000">New</option>
                      <option value="1500">New - Other</option>
                      <option value="1750">New with defects</option>
                      <option value="2000">Certified Refurbished</option>
                      <option value="2500">Excellent - Refurbished</option>
                      <option value="3000">Very Good - Refurbished</option>
                      <option value="4000">Good - Refurbished</option>
                      <option value="5000">Seller Refurbished</option>
                      <option value="6000">Used - Excellent</option>
                      <option value="7000">Used - Very Good</option>
                      <option value="8000">Used - Good</option>
                      <option value="9000">Used - Acceptable</option>
                      <option value="10000">For parts or not working</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Listing Format
                    </label>
                    <select
                      name="listingFormat"
                      className="w-full border px-3 py-2 rounded-lg"
                      value={ebayData.listingFormat}
                      onChange={handleEbayChange}
                    >
                      <option value="FIXED_PRICE">Fixed Price</option>
                      <option value="AUCTION">Auction</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bestOffer"
                      name="bestOffer"
                      checked={ebayData.bestOffer}
                      onChange={(e) => setEbayData({...ebayData, bestOffer: e.target.checked})}
                      className="h-4 w-4 text-primary-yellow"
                    />
                    <label htmlFor="bestOffer" className="ml-2 text-sm text-gray-700">
                      Accept Best Offers
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      placeholder="eBay Subtitle (additional fees may apply)"
                      className="w-full border px-3 py-2 rounded-lg"
                      value={ebayData.subtitle || ""}
                      onChange={handleEbayChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">Additional fees apply for subtitles</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Specifics
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Item specifics help buyers find your listing. Required fields will be determined by your selected category.
                    </p>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-sm text-center text-gray-600">
                        Item specifics will be loaded based on your selected category.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Policies
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Shipping Policy
                        </label>
                        <select
                          name="fulfillmentPolicyId"
                          className="w-full border px-3 py-2 rounded-lg"
                          value={ebayData.fulfillmentPolicyId || ""}
                          onChange={handleEbayChange}
                        >
                          <option value="">Select a shipping policy</option>
                          <option value="default">Default Shipping Policy</option>
                          {/* These would be populated from the eBay API */}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Return Policy
                        </label>
                        <select
                          name="returnPolicyId"
                          className="w-full border px-3 py-2 rounded-lg"
                          value={ebayData.returnPolicyId || ""}
                          onChange={handleEbayChange}
                        >
                          <option value="">Select a return policy</option>
                          <option value="default">Default Return Policy</option>
                          {/* These would be populated from the eBay API */}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Amazon Tab */}
            {selectedTab === 'amazon' && (
              <div className="space-y-6">
                <h3 className="font-medium">Amazon-Specific Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ASIN (if listing existing product)
                      </label>
                      <input
                        type="text"
                        name="asin"
                        placeholder="e.g., B07PDHSNMW"
                        className="w-full border px-3 py-2 rounded-lg"
                        value={amazonData.asin || ""}
                        onChange={handleAmazonChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UPC/EAN/GTIN
                      </label>
                      <input
                        type="text"
                        name="upc"
                        placeholder="e.g., 123456789012"
                        className="w-full border px-3 py-2 rounded-lg"
                        value={amazonData.upc || ""}
                        onChange={handleAmazonChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        name="brand"
                        placeholder="e.g., Nike"
                        className="w-full border px-3 py-2 rounded-lg"
                        value={amazonData.brand || ""}
                        onChange={handleAmazonChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manufacturer
                      </label>
                      <input
                        type="text"
                        name="manufacturer"
                        placeholder="e.g., Nike Inc."
                        className="w-full border px-3 py-2 rounded-lg"
                        value={amazonData.manufacturer || ""}
                        onChange={handleAmazonChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer Part Number (MPN)
                    </label>
                    <input
                      type="text"
                      name="mpn"
                      placeholder="e.g., AB12345"
                      className="w-full border px-3 py-2 rounded-lg"
                      value={amazonData.mpn || ""}
                      onChange={handleAmazonChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bullet Points (Key Features)
                    </label>
                    <div className="space-y-2">
                      {(amazonData.bulletPoints || [""]).map((bullet, index) => (
                        <input
                          key={index}
                          type="text"
                          placeholder={`Bullet point ${index + 1}`}
                          className="w-full border px-3 py-2 rounded-lg"
                          value={bullet}
                          onChange={(e) => handleBulletPointChange(index, e.target.value)}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setAmazonData({
                          ...amazonData,
                          bulletPoints: [...(amazonData.bulletPoints || [""]), ""]
                        })}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
                      >
                        + Add Bullet Point
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Keywords
                    </label>
                    <textarea
                      name="searchKeywords"
                      placeholder="Enter search keywords separated by commas"
                      className="w-full border px-3 py-2 rounded-lg"
                      rows={2}
                      value={amazonData.searchKeywords || ""}
                      onChange={handleAmazonChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fulfillment
                    </label>
                    <select
                      name="fulfillmentChoice"
                      className="w-full border px-3 py-2 rounded-lg"
                      value={amazonData.fulfillmentChoice}
                      onChange={handleAmazonChange}
                    >
                      <option value="FBM">Fulfilled by Merchant (FBM)</option>
                      <option value="FBA">Fulfilled by Amazon (FBA)</option>
                    </select>
                  </div>
                  
                  {amazonData.fulfillmentChoice === "FBM" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Template ID
                      </label>
                      <select
                        name="shippingTemplateId"
                        className="w-full border px-3 py-2 rounded-lg"
                        value={amazonData.shippingTemplateId || ""}
                        onChange={handleAmazonChange}
                      >
                        <option value="">Select a shipping template</option>
                        <option value="default">Default Template</option>
                        {/* These would be populated from the Amazon API */}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Etsy Tab */}
            {selectedTab === 'etsy' && (
              <div className="space-y-6">
                <h3 className="font-medium">Etsy-Specific Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Who Made It <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="whoMade"
                        className="w-full border px-3 py-2 rounded-lg"
                        value={etsyData.whoMade}
                        onChange={handleEtsyChange}
                        required={platforms.etsy}
                      >
                        <option value="i_did">I did</option>
                        <option value="collective">A member of my shop</option>
                        <option value="someone_else">Another company or person</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        When Made <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="whenMade"
                        className="w-full border px-3 py-2 rounded-lg"
                        value={etsyData.whenMade}
                        onChange={handleEtsyChange}
                        required={platforms.etsy}
                      >
                        <option value="made_to_order">Made to order</option>
                        <option value="2020_2023">2020-2023</option>
                        <option value="2010_2019">2010-2019</option>
                        <option value="2000_2009">2000-2009</option>
                        <option value="before_2000">Before 2000</option>
                        <option value="1990s">1990s</option>
                        <option value="1980s">1980s</option>
                        <option value="1970s">1970s</option>
                        <option value="1960s">1960s</option>
                        <option value="1950s">1950s</option>
                        <option value="1940s">1940s</option>
                        <option value="1930s">1930s</option>
                        <option value="1920s">1920s</option>
                        <option value="1910s">1910s</option>
                        <option value="1900s">1900s</option>
                        <option value="1800s">1800s</option>
                        <option value="1700s">1700s</option>
                        <option value="before_1700">Before 1700</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Is It a Supply? <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="isSupply"
                        className="w-full border px-3 py-2 rounded-lg"
                        value={etsyData.isSupply ? "true" : "false"}
                        onChange={(e) => setEtsyData({...etsyData, isSupply: e.target.value === "true"})}
                        required={platforms.etsy}
                      >
                        <option value="false">No</option>
                        <option value="true">Yes, it&rsquo;s a craft supply</option>
                        </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (up to 13)
                    </label>
                    <div className="space-y-2">
                      <div className="border rounded-lg p-2 flex flex-wrap gap-2">
                        {(etsyData.tags || []).map((tag, index) => (
                          <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                            <input
                              type="text"
                              value={tag}
                              onChange={(e) => handleTagChange(index, e.target.value)}
                              className="bg-transparent border-none focus:outline-none w-20"
                              placeholder="Tag"
                            />
                            <button
                              type="button"
                              onClick={() => setEtsyData({
                                ...etsyData,
                                tags: (etsyData.tags || []).filter((_, i) => i !== index)
                              })}
                              className="ml-1 text-gray-500 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {(etsyData.tags || []).length < 13 && (
                          <button
                            type="button"
                            onClick={addTagField}
                            className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600"
                          >
                            + Add tag
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Tags help buyers find your item. You can add up to 13 tags.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Profile
                    </label>
                    <select
                      name="shippingProfileId"
                      className="w-full border px-3 py-2 rounded-lg"
                      value={etsyData.shippingProfileId || ""}
                      onChange={handleEtsyChange}
                    >
                      <option value="">Select a shipping profile</option>
                      <option value="default">Default Shipping Profile</option>
                      {/* These would be populated from the Etsy API */}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shop Section
                    </label>
                    <select
                      name="shopSection"
                      className="w-full border px-3 py-2 rounded-lg"
                      value={etsyData.shopSection || ""}
                      onChange={handleEtsyChange}
                    >
                      <option value="">None (appear in all sections)</option>
                      <option value="featured">Featured Items</option>
                      {/* These would be populated from the Etsy API */}
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPersonalizable"
                      name="isPersonalizable"
                      checked={etsyData.isPersonalizable}
                      onChange={(e) => setEtsyData({...etsyData, isPersonalizable: e.target.checked})}
                      className="h-4 w-4 text-primary-yellow"
                    />
                    <label htmlFor="isPersonalizable" className="ml-2 text-sm text-gray-700">
                      This item can be personalized (buyers can request custom text)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Platforms Tab */}
            {selectedTab === 'platforms' && (
              <div className="space-y-6">
                <p className="text-sm text-gray-600">
                  Select the platforms where you want to list this product.
                  Different platforms may have different fees and requirements.
                </p>
                
                <div className="space-y-4">
                  {/* eBay Platform */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <PlatformIcon platform="ebay" />
                      <div>
                        <h3 className="font-medium">eBay</h3>
                        <p className="text-xs text-gray-500">Standard listing</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={platforms.ebay}
                        onChange={() => handlePlatformChange('ebay')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-yellow"></div>
                    </label>
                  </div>
                  
                  {/* Amazon Platform */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <PlatformIcon platform="amazon" />
                      <div>
                        <h3 className="font-medium">Amazon</h3>
                        <p className="text-xs text-gray-500">{platforms.amazon ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={platforms.amazon}
                        onChange={() => handlePlatformChange('amazon')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-yellow"></div>
                    </label>
                  </div>
                  
                  {/* Etsy Platform */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <PlatformIcon platform="etsy" />
                      <div>
                        <h3 className="font-medium">Etsy</h3>
                        <p className="text-xs text-gray-500">{platforms.etsy ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={platforms.etsy}
                        onChange={() => handlePlatformChange('etsy')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-yellow"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected platforms preview */}
          <div className="bg-gray-50 px-6 py-3 border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Listing on:</span>
              <div className="flex space-x-1">
                {platforms.ebay && <PlatformIcon platform="ebay" />}
                {platforms.amazon && <PlatformIcon platform="amazon" />}
                {platforms.etsy && <PlatformIcon platform="etsy" />}
              </div>
            </div>
          </div>

          {/* Footer with actions */}
          <div className="flex items-center justify-end p-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg mr-2"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-yellow text-primary-black rounded-lg font-medium hover:bg-primary-black hover:text-white transition-colors"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
