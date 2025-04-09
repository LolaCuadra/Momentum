import { useUser, SignInButton } from "@clerk/nextjs";

export default function Schedule() {
  const { user } = useUser();

  if (!user) return <div className="text-center mt-20"><SignInButton /></div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">AI Schedule</h1>
      <p className="mb-4">Coming soon: Smart suggestions powered by ML 🤖</p>
      <div className="text-left max-w-md mx-auto">
        <p>🕘 9:00 AM - Deep Work</p>
        <p>☕ 11:00 AM - Break</p>
        <p>🏃 1:00 PM - Workout</p>
      </div>
    </div>
  );
}
