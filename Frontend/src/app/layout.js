import "./globals.css";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Raghav Poshaak",
  description: "Raghav Poshak store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen">
        {/* Page gap wrapper */}
        <div className="max-w-full mx-auto px-4">
          <Navbar />

          <main className="rounded-b-2xl pt-20 h-[calc(100vh-16px)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
