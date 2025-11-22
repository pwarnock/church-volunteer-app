'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h2>
          <Link href="/auth/signin" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const isVolunteer = session.user.role === 'VOLUNTEER'
  const isLeader = session.user.role === 'MINISTRY_LEADER'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-xl text-gray-600">
            {isVolunteer 
              ? "Discover opportunities to serve and use your spiritual gifts"
              : isLeader 
              ? "Manage your ministry opportunities and connect with volunteers"
              : "Manage the church volunteer platform"
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {isVolunteer && (
            <>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Spiritual Gifts Assessment
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Take our assessment to discover your spiritual gifts and find the perfect place to serve.
                  </p>
                  <Link 
                    href="/volunteer/assessment"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Take Assessment
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Browse Opportunities
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Explore available volunteer opportunities across different ministries.
                  </p>
                  <Link 
                    href="/volunteer/opportunities"
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    View Opportunities
                  </Link>
                </div>
              </div>
            </>
          )}

          {isLeader && (
            <>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Create Opportunity
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Post new volunteer opportunities for your ministry and recruit passionate servants.
                  </p>
                  <Link 
                    href="/leader"
                    className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Manage Opportunities
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    View Applications
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Review and manage volunteer applications for your ministry opportunities.
                  </p>
                  <Link 
                    href="/leader/applications"
                    className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    View Applications
                  </Link>
                </div>
              </div>
            </>
          )}

          {session.user.role === 'ADMIN' && (
            <>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Admin Dashboard
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Manage users, opportunities, and platform settings.
                  </p>
                  <Link 
                    href="/admin"
                    className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Admin Panel
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Analytics
                  </h2>
                  <p className="text-gray-600 mb-6">
                    View platform statistics and engagement metrics.
                  </p>
                  <Link 
                    href="/admin/analytics"
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    View Analytics
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={async () => {
              try {
                await signOut({ redirect: false })
                router.push('/')
              } catch (error) {
                console.error('Sign out error:', error)
              }
            }}
            className="text-gray-600 hover:text-gray-900 underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}