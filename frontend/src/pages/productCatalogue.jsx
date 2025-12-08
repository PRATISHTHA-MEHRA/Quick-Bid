// src/pages/ProductCatalogue.jsx
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { motion } from "framer-motion";
import { Search, Plus, Filter, ChevronDown } from "lucide-react";

export default function ProductCatalogue() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFilter, setOpenFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // 🔹 Fetch products from Supabase with Filtering Applied
  const fetchFilteredProducts = async () => {
    setLoading(true);
    let query = supabase.from("product_catalogue").select("*");

    if (categoryFilter !== "All") {
      query = query.eq("category", categoryFilter);
    }

    const { data, error } = await query;

    if (!error) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [categoryFilter]);

  // 🔹 Search filter applied on UI side
  const finalResults = products.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔹 Add New Product - FULL DATA INSERT
  const handleAddProduct = async () => {
    const newProduct = {
      product_name: "New Copper Cable",
      category: "Power Cables",
      conductor_material: "Copper",
      conductor_size_sqmm: "16",
      voltage_rating: "1100V",
      core: "4 Core",
    };

    const { error } = await supabase
      .from("product_catalogue")
      .insert([newProduct]);

    if (!error) fetchFilteredProducts();
  };

  return (
    <main className="flex-1 bg-white">
      <div className="px-10 pt-8 pb-40 min-h-[85vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Product Catalogue
          </h1>

          <button
            onClick={handleAddProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Product
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex justify-between items-center mb-5">

          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by SKU Code or Cable Type…"
              className="pl-10 pr-3 py-2 w-full border rounded-lg text-sm focus:ring-2 focus:ring-blue-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters Dropdown */}
          <div className="relative">
            <button
              className="text-sm border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition"
              onClick={() =>
                setOpenFilter(openFilter === "category" ? null : "category")
              }
            >
              <Filter size={14} />
              Filters
              <ChevronDown size={14} />
            </button>

            {openFilter === "category" && (
              <div className="absolute right-0 bg-white shadow-md border rounded-lg text-sm w-40 p-2 z-20">
                {["All", "Power Cables", "Speaker Cables", "Industrial", "Renewable", "Custom"].map(
                  (cat) => (
                    <p
                      key={cat}
                      onClick={() => {
                        setCategoryFilter(cat);
                        setOpenFilter(null);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {cat}
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {[
                  "Product Name",
                  "Category",
                  "Conductor Material",
                  "Conductor Size (sqmm)",
                  "Voltage Rating",
                  "Core",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left font-medium tracking-wide"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : finalResults.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                finalResults.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.04 }}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">{item.product_name}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">{item.conductor_material}</td>
                    <td className="px-6 py-4">{item.conductor_size_sqmm}</td>
                    <td className="px-6 py-4">{item.voltage_rating}</td>
                    <td className="px-6 py-4">{item.core}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
