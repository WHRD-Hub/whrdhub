import { ChatFab } from "@/components/chat-fab";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ChatFab />
    </>
  );
}
