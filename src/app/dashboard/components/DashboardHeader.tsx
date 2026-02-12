import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface DashboardHeaderProps {
  user: User;
}
const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
  return (
    <>
      <h1 className="text-3xl font-bold text-white-800 mb-8 text-center">
        QR-Safe Management Panel
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-xl text-gray-400 hidden sm:block">
          {user.email}
        </span>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};

export default DashboardHeader;
