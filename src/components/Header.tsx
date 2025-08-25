"use client";

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bloom</h1>
        <nav className="space-x-6">
          <a href="/" className="hover:underline">Home</a>
          <a href="/transfers" className="hover:underline">Transfers</a>
          <a href="/insurance" className="hover:underline">Insurance</a>
        </nav>
      </div>
    </header>
  );
}
