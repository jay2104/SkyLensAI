import Link from "next/link";

import { InputSelectorWrapper } from "~/app/_components/InputSelectorWrapper";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import AuthGuard from "~/components/auth/auth-guard";
import LogoutButton from "~/components/auth/logout-button";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <h1 className="text-3xl font-bold text-gray-900">
                SkyLens<span className="text-blue-600">AI</span>
              </h1>
              <div className="flex items-center gap-4">
                {session?.user && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <span className="text-sm text-gray-600">
                      Welcome, {session.user.name || session.user.email}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {session.user.subscriptionTier}
                    </span>
                  </div>
                )}
                {session ? (
                  <LogoutButton variant="default" size="sm" />
                ) : (
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign in
                  </Link>
                )}
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
              {!session && (
                <span className="block mt-2 text-blue-600 font-medium">
                  Please sign in to save your uploads and analysis results.
                </span>
              )}
            </p>
          </div>

          {/* Input Selector with Authentication Protection */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <AuthGuard
              fallback={
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Authentication Required
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Please sign in to upload files and save your analysis results to your account.
                    </p>
                    <Link
                      href="/auth/signin"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In to Continue
                    </Link>
                  </div>
                </div>
              }
            >
              <InputSelectorWrapper />
            </AuthGuard>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
