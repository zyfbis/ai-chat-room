"use client";

import { useEffect } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useUser } from "@/app/user-context";

export default function ChatPage() {
  const { user } = useUser();
  useEffect(() => {
    if (user && user.name) {
      redirect("/chat");
    } else {
      redirect("/login");
    }
  }, [user]);
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded shadow-md">
        <Link href="/login">
          <button className="text-8xl font-bold mb-4">AI Chat Room</button>
        </Link>
      </div>
    </div>
  );
}
