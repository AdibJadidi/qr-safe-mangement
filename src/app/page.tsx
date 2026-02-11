"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, PlusCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setItems(data);
  };

  useEffect(() => {
    if (mounted) fetchItems();
  }, [mounted]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      alert("Registration error: " + error.message);
    } else {
      setNewItem(data);
      setName("");
      fetchItems(); // Refresh the list
    }
    setLoading(false);
  };

  const getStaticMapUrl = (lat: number, lng: number) => {
    const zoom = 15;
    const size = "300,200";

    return `https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${lng},${lat}&z=${zoom}&l=map&size=${size}&pt=${lng},${lat},pm2rdl`;
  };
  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black-50 p-6 flex flex-col items-center font-sans">
      <h1 className="text-3xl font-bold text-white-800 mb-8 text-center">
        QR-Safe Management Panel
      </h1>

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

      {(newItem || selectedItem) && (
        <div className="mt-8 bg-neutral-700 p-8 rounded-2xl shadow-xl border-2 border-green-100 flex flex-col items-center animate-in fade-in zoom-in duration-300">
          {newItem && (
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold text-lg">
                Registered Successfully!
              </span>
            </div>
          )}

          <div className="bg-white p-4 rounded-xl border-4 border-slate-800">
            <QRCodeSVG
              value={`${window.location.origin}/item/${selectedItem?.id || newItem?.id}`}
              size={200}
              level={"H"}
              includeMargin={true}
            />
          </div>

          <p className="mt-4 text-slate-200 font-medium">
            {selectedItem?.id || newItem?.name}
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Print this QR and attach it to your item
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full max-w-4xl">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-neutral-700 p-6 gap-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-blue-200 transition-colors"
            style={{ height: "fit-content" }}
          >
            <div>
              <h3 className="font-bold text-lg text-white-800">{item.name}</h3>
              <p className="text-gray-400 text-xs mb-4">
                Registered on:{" "}
                {new Date(item.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/chat/${item.id}?role=owner`}
                className="flex-1 bg-cyan-800 text-white-600 text-center py-2 rounded-lg text-sm font-medium hover:bg-cyan-950 transition-colors"
              >
                View Chats
              </Link>
              <button
                onClick={() => setSelectedItem(item)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-gray-500 transition-colors cursor-pointer"
              >
                QR Code
              </button>
            </div>
            {item?.last_lat && item?.last_lng && (
              <div>
                <a
                  href={`https://www.google.com/maps?q=${item?.last_lat},${item?.last_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs text-blue-500 underline flex items-center gap-1"
                >
                  <img
                    src={getStaticMapUrl(
                      item?.last_lat, // Latitude
                      item?.last_lng, // Longitude
                    )}
                    alt="Location Map"
                    className="w-full h-auto object-cover border-b rounded-2xl"
                  />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
