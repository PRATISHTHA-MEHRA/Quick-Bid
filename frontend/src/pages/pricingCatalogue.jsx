import { Search, Filter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { motion } from "framer-motion";

export default function PricingCatalogue() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("product_catalogue")
        .select(
          "product_name, category, conductor_material, standard_iec, unit_price, test_price"
        );
      if (!error) setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <main className="flex-1 bg-white">
      {/* PAGE HEADER */}
      <div className="px-10 pt-6 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Pricing Catalogue
          </h1>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus size={16} /> Add New Product
          </button>
          <button className="border px-4 py-2 rounded-lg text-sm flex items-center gap-2 bg-white hover:bg-gray-50 transition">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-10 mb-3">
        <div className="relative w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by SKU Code or Cable Type..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="px-10 pb-10">
        <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Product Name",
                  "Category",
                  "Conductor Material",
                  "Standard IEC",
                  "Unit Price",
                  "Test Price",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-4 text-left text-sm font-medium text-gray-600 border-b"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : (
                products.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 border-b"
                  >
                    <td className="px-6 py-3 text-sm">{item.product_name}</td>
                    <td className="px-6 py-3 text-sm">{item.category}</td>
                    <td className="px-6 py-3 text-sm">{item.conductor_material}</td>
                    <td className="px-6 py-3 text-sm">{item.standard_iec}</td>
                    <td className="px-6 py-3 text-sm">{item.unit_price}</td>
                    <td className="px-6 py-3 text-sm">{item.test_price}</td>
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