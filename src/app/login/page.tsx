"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/" },
    });
    if (error) alert(error.message);
    else alert("Check your email for the login link!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-50">
      <form
        onSubmit={handleLogin}
        className="p-8 bg-neutral-800 shadow-xl rounded-2xl w-80"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Login to QR-Safe</h1>
        <input
          type="email"
          placeholder="Your Email"
          className="w-full p-2 border rounded-lg mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">
          Send Magic Link
        </button>
      </form>
    </div>
  );
}
