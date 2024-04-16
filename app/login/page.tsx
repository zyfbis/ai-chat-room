"use client";

import { useUser } from "@/app/user-context";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { user, setUser } = useUser();

  const handleLogin = (formData: FormData) => {
    const username = formData.get("username");
    if (!username) {
      return;
    }
    setUser({ name: username as string });
    redirect("/chat");
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <form className="p-4 border rounded-lg" action={handleLogin}>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="mt-1 p-2 border block w-full rounded-md"
            defaultValue={user ? user.name : ""}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
