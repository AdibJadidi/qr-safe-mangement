import { supabase } from "@/lib/supabase";
import { Loader2, PlusCircle } from "lucide-react";
import React, { useState } from "react";

interface AddItemProps {
  user: any;
  onSuccess: (newItem: any) => void;
  onRefresh: (userId: string) => void;
}
const AddItem = ({ user, onSuccess, onRefresh }: AddItemProps) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      alert("Registration error: " + error.message);
    } else {
      onSuccess(data);
      setName("");
      onRefresh(user?.id); // Refresh the list
    }
    setLoading(false);
  };
  return (
    <form
      onSubmit={handleAddItem}
      className="w-full max-w-lg bg-neutral-800 p-6 rounded-xl shadow-sm border border-slate-200"
    >
      <label className="block text-sm font-medium  mb-2">New Item Name</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Home Keys, Wallet"
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <PlusCircle className="w-5 h-5" />
          )}
          Generate QR
        </button>
      </div>
    </form>
  );
};

export default AddItem;
