import { WifiOff } from "lucide-react";

export const metadata = {
  title: "Offline | WHRD Hub",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-muted/20 flex items-center justify-center px-5">
      <div className="max-w-md text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-primary">You are offline</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This page needs a connection to load. Don&apos;t worry &mdash; any report you
          started or submitted while offline is saved safely on this device and will
          be sent automatically once you&apos;re back online.
        </p>
        <p className="text-xs text-muted-foreground">
          Check your connection and try again.
        </p>
      </div>
    </main>
  );
}
