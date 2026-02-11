"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  ShieldCheck,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

export default function FinderPage() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setItem(data);
      setLoading(false);
    };

    if (id) fetchItem();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!item)
    return (
      <div className="text-center mt-20 text-red-500">
        متاسفانه این وسیله در سیستم ثبت نشده است.
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 p-6 text-white text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-2" />
          <h1 className="text-xl font-bold">وسیله پیدا شده!</h1>
          <p className="text-blue-100 text-sm">
            از اینکه برای بازگرداندن این وسیله وقت می‌گذارید سپاسگزاریم
          </p>
        </div>

        <div className="p-8 text-center">
          <p className="text-slate-500 text-sm mb-1">نام وسیله:</p>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            {item.name}
          </h2>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8">
            <div className="flex items-center justify-center gap-2 text-amber-700 mb-2 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>پیام مالک:</span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              {item.description ||
                "در صورت پیدا شدن، لطفاً از طریق چت زیر با من در ارتباط باشید."}
            </p>
          </div>

          <h1 className="text-2xl font-bold">You Found an Item!</h1>
          <p>The owner has been notified of your approximate location.</p>

          <button
            onClick={() => router.push(`/chat/${item.id}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
          >
            <MessageCircle className="w-6 h-6" />
            شروع چت ناشناس با مالک
          </button>
        </div>
      </div>
    </main>
  );
}
