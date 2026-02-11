"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Send, ArrowLeft, LocateIcon } from "lucide-react"; // تغییر جهت فلش برای انگلیسی
import Link from "next/link";

export default function ChatPage() {
  const { itemId } = useParams();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isOwner = searchParams.get("role") === "owner";

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!itemId || !mounted) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("item_id", itemId)
        .order("created_at", { ascending: true });

      if (error) console.error("Fetch error:", error.message);
      else if (data) setMessages(data);

      setTimeout(scrollToBottom, 100);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat-${itemId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          setTimeout(scrollToBottom, 100);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, mounted]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        item_id: itemId,
        text: newMessage,
        is_from_owner: isOwner,
      },
    ]);

    if (error) console.error("Send error:", error.message);
    setNewMessage("");
  };

  const updateLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // آپدیت لوکیشن در دیتابیس
          await supabase
            .from("items")
            .update({
              last_lat: latitude,
              last_lng: longitude,
            })
            .eq("id", itemId);

          const locationData = JSON.stringify({
            lat: latitude,
            lng: longitude,
          });

          const { error } = await supabase.from("messages").insert([
            {
              item_id: itemId,
              text: `LOCATION_PAYLOAD:${locationData}`, // یک پیشوند برای تشخیص پیام لوکیشن
              is_from_owner: isOwner,
            },
          ]);

          if (error) {
            console.error("Location send error", error);
          }
        },
        (error) => {
          console.error("Location access denied", error);
        },
      );
    }
  };
  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-900 max-w-md mx-auto shadow-2xl font-sans">
      {/* Header */}
      <div className="bg-blue-800 p-4 text-white flex items-center gap-3 shadow-md">
        <Link href={`/`}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center font-bold">
          QR
        </div>
        <div>
          <h2 className="font-bold text-sm">
            {isOwner ? "Chat with Finder" : "Chat with Owner"}
          </h2>
          <p className="text-[10px] text-blue-200">Online (Anonymous)</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.is_from_owner ? "justify-start" : "justify-end"}`}
          >
            {msg.text.startsWith("LOCATION_PAYLOAD:") ? (
              <a
                href={`https://www.google.com/maps?q=${JSON.parse(msg.text.split("LOCATION_PAYLOAD:")[1]).lat},${JSON.parse(msg.text.split("LOCATION_PAYLOAD:")[1]).lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs text-blue-500 underline flex items-center gap-1"
              >
                📍 View last seen on Map
              </a>
            ) : (
              <div
                className={`max-w-[80%] p-3 text-sm shadow-sm ${
                  msg.is_from_owner
                    ? "bg-white text-slate-800 rounded-2xl rounded-tl-none"
                    : "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                }`}
              >
                {msg.text}
                <div className="text-[9px] mt-1 opacity-50 text-right">
                  {new Date(msg.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={sendMessage}
        className="p-3 bg-gray-600 border-t flex gap-2 items-center"
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-500 rounded-full px-5 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
        />
        {!isOwner && (
          <button
            onClick={updateLocation}
            className="bg-blue-400 text-white p-2 rounded-full hover:scale-105 transition-transform"
          >
            <LocateIcon className="w-5 h-5" />
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-400 text-white p-2 rounded-full hover:scale-105 transition-transform"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
