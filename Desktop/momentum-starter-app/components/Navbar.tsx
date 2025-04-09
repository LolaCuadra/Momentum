import Link from 'next/link'
import { useUser, SignOutButton } from '@clerk/nextjs'

export default function Navbar() {
  const { user } = useUser()

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-pink-500">Momentum</h1>
      <div className="flex gap-4 items-center">
        <Link href="/" className="text-pink-600 hover:underline">Home</Link>
        <Link href="/tasks" className="text-pink-600 hover:underline">Tasks</Link>
        <Link href="/habits" className="text-pink-600 hover:underline">Habits</Link>
        <Link href="/schedule" className="text-pink-600 hover:underline">Schedule</Link>
        {user && (
          <SignOutButton>
            <button className="bg-gray-200 px-3 py-1 rounded">Sign out</button>
          </SignOutButton>
        )}
      </div>
    </nav>
  )
}
