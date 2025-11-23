'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Opportunity {
  id: string
  title: string
  description: string
  ministry: string
  location: string
  requirements: string[]
  timeCommitment: string
  startDate?: string
  endDate?: string
  status: string
  _count: {
    applications: number
  }
}

export default function LeaderDashboard() {
  const { data: session } = useSession()
  const user = session?.user
  const router = useRouter()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showApplications, setShowApplications] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ministry: '',
    location: '',
    requirements: '',
    timeCommitment: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    if (user.role !== 'MINISTRY_LEADER') {
      router.push('/dashboard')
      return
    }

    fetchOpportunities()
  }, [user, router])

  useEffect(() => {
    if (user && showApplications) {
      fetchApplications()
    }
  }, [user, showApplications])

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities')
      const data = await response.json()
      setOpportunities(data.opportunities || [])
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
        const response = await fetch('/api/opportunities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            requirements: JSON.parse(formData.requirements),
            leaderId: user?.id || ''
          }),
        })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({
          title: '',
          description: '',
          ministry: '',
          location: '',
          requirements: '',
          timeCommitment: '',
          startDate: '',
          endDate: ''
        })
        fetchOpportunities()
      }
    } catch (error) {
      console.error('Error creating opportunity:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h2>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (user?.role !== 'MINISTRY_LEADER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">This page is only available to ministry leaders.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ministry Leader Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage volunteer opportunities and recruit passionate servants</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Opportunity
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Opportunity</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ministry</label>
                  <input
                    type="text"
                    required
                    value={formData.ministry}
                    onChange={(e) => setFormData({...formData, ministry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Commitment</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 2 hours per week"
                    value={formData.timeCommitment}
                    onChange={(e) => setFormData({...formData, timeCommitment: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Background check, Training session"
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (optional)</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{opportunity.title}</h3>
                  <span className="inline-block px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full mt-2">
                    {opportunity.ministry}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                    opportunity.status === 'ACTIVE' 
                      ? 'text-blue-800 bg-blue-100' 
                      : 'text-gray-800 bg-gray-100'
                  }`}>
                    {opportunity.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {opportunity._count.applications} applications
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{opportunity.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {opportunity.location}
                </div>
                
                <div className="flex items-center text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {opportunity.timeCommitment}
                </div>
                
                {opportunity.startDate && (
                  <div className="flex items-center text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Starts {new Date(opportunity.startDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                <p className="text-sm text-gray-600">{opportunity.requirements}</p>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => setShowApplications(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Applications →
                </button>
              </div>
            </div>
          ))}
        </div>

        {opportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities created yet</h3>
            <p className="text-gray-500 mb-4">Start by creating your first volunteer opportunity.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Create Your First Opportunity
            </button>
          </div>
        )}

        {/* Applications Modal */}
        {showApplications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Volunteer Applications</h2>
                <button
                  onClick={() => setShowApplications(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No applications received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{app.volunteer.name}</h3>
                          <p className="text-sm text-gray-600">{app.volunteer.email}</p>
                          <p className="text-sm text-blue-600">Applied for: {app.opportunity.title}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {app.message && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Message:</p>
                          <p className="text-sm text-gray-600">{app.message}</p>
                        </div>
                      )}

                      {app.volunteer.profile && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Spiritual Gifts:</p>
                          <p className="text-sm text-gray-600">{app.volunteer.profile.spiritualGifts || 'Not specified'}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                          Approve
                        </button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
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
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}