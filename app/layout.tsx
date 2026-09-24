import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: {
    default: "Where's My Therapist",
    template: "%s — Where's My Therapist",
  },
  description: "Find the right therapist for where you are in life.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Public demo mode:
  // Production authentication/database configuration is intentionally
  // excluded from this public repository.
  const user = null;
  const role: "client" | "provider" | null = null;

  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar initialUser={user} initialRole={role} />
        {children}
      </body>
    </html>
  );
}