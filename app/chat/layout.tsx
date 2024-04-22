import { UserRedirect } from "@/app/user-context";
import SideBar from "@/app/chat/side-bar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserRedirect>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:block md:w-64">
          <SideBar />
        </div>
        <div className="flex-grow overflow-hidden">{children}</div>
      </div>
    </UserRedirect>
  );
}
