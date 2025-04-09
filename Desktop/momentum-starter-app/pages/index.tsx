import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-100 text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Momentum 🌟</h1>
      <p className="mb-6">The Duolingo of Productivity</p>

      {!user ? (
        <SignInButton>
          <button className="bg-pink-500 text-white py-2 px-4 rounded">Sign In</button>
        </SignInButton>
      ) : (
        <>
          <p className="mb-4">Welcome, {user.firstName}!</p>
          <div className="flex gap-4">
            <Link href="/habits" className="underline">Habit Tracker</Link>
            <Link href="/schedule" className="underline">Schedule</Link>
            <SignOutButton>
              <button className="bg-gray-300 px-4 py-2 rounded">Sign Out</button>
            </SignOutButton>
          </div>
        </>
      )}
    </div>
  );
}
