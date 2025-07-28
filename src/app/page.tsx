import Link from "next/link";

import { InputSelector } from "~/app/_components/InputSelector";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                SkyLens<span className="text-blue-600">AI</span>
              </h1>
              <div className="flex items-center gap-4">
                {session?.user && (
                  <span className="text-sm text-gray-600">
                    Welcome, {session.user.name}
                  </span>
                )}
                <Link
                  href={session ? "/api/auth/signout" : "/api/auth/signin"}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {session ? "Sign out" : "Sign in"}
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Analyze Your Drone Data
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload your drone log files or describe your issue to get AI-powered 
              insights and troubleshooting recommendations for your flight systems.
            </p>
          </div>

          {/* Input Selector */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <InputSelector 
              onSubmit={(data) => {
                console.log("Submitted data:", data);
                // TODO: Handle submission in Task 4
              }}
            />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
