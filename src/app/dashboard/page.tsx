"use client";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddItem from "./components/AddItem";
import Items from "./components/Items";
import SelectedItem from "./components/SelectedItem";
import DashboardHeader from "./components/DashboardHeader";

export default function Dashboard() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    console.log("useEffect");
    setMounted(true);
    checkUser();
  }, []);

  // چک کردن لاگین بودن کاربر
  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
    } else {
      setUser(user);
      fetchItems(user.id); // ارسال آی‌دی کاربر برای فیلتر
    }
  };

  const fetchItems = async (userId: string) => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", userId) // 👈 فقط وسایل این کاربر را بگیر
      .order("created_at", { ascending: false });

    if (data) setItems(data);
  };

  if (!mounted || !user) return null;

  return (
    <main className="min-h-screen bg-black-50 p-6 flex flex-col items-center font-sans">
      <DashboardHeader user={user} />
      <AddItem
        user={user}
        onSuccess={(data) => setNewItem(data)}
        onRefresh={(userId) => fetchItems(userId)}
      />

      <SelectedItem
        newItem={newItem}
        selectedItem={selectedItem}
        onClose={() => {
          setNewItem(null);
          setSelectedItem(null);
        }}
      />

      <Items items={items} setSelectedItem={setSelectedItem} />
    </main>
  );
}
