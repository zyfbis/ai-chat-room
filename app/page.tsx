"use client";

import { useUser } from "@/app/user-context";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
  const { user } = useUser();
  useEffect(() => {
    if (user && user.name) {
      redirect("/chat");
    } else {
      redirect("/login");
    }
  }, [user]);
  return <div></div>;
}
