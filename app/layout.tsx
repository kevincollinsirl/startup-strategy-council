import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Strategy Council - Echofold",
  description: "Multi-agent strategic decision system",
};

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/arms", label: "Business Arms", icon: "🏗️" },
  { href: "/market", label: "Market Intel", icon: "🎯" },
  { href: "/context", label: "Company Context", icon: "🏢" },
  { href: "/decisions/new", label: "New Decision", icon: "➕" },
  { href: "/decisions", label: "History", icon: "📜" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-100 min-h-screen`}
      >
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-white">Strategy Council</h1>
              <p className="text-sm text-gray-400">Echofold.ai</p>
            </div>

            <nav className="flex-1">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                Powered by Claude Code CLI
              </p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
