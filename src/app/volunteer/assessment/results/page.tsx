'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSpiritualGift } from '@/data/spiritualGifts'

interface AssessmentResults {
  topGifts: string[]
  giftCounts: { [key: string]: number }
  totalQuestions: number
}

export default function AssessmentResults() {
  const { data: session } = useSession()
  const router = useRouter()
  const [results, setResults] = useState<AssessmentResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState<any[]>([])

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      // Get user profile with assessment results
      const profileResponse = await fetch('/api/volunteer/profile')
      const profileData = await profileResponse.json()
      
      if (profileData.profile?.spiritualGifts) {
        const gifts = JSON.parse(profileData.profile.spiritualGifts)
        
        // Calculate gift counts from assessment logic (simulate the assessment calculation)
        const giftCounts: { [key: string]: number } = {}
        gifts.forEach((gift: string) => {
          giftCounts[gift] = (giftCounts[gift] || 0) + 1
        })

        setResults({
          topGifts: gifts,
          giftCounts,
          totalQuestions: 5
        })

        // Fetch matching opportunities
        fetchMatchingOpportunities(gifts)
      } else {
        // No assessment results found, redirect to assessment
        router.push('/volunteer/assessment')
      }
    } catch (error) {
      console.error('Error fetching results:', error)
      router.push('/volunteer/assessment')
    } finally {
      setLoading(false)
    }
  }

  const fetchMatchingOpportunities = async (gifts: string[]) => {
    try {
      const response = await fetch('/api/opportunities')
      const data = await response.json()
      setOpportunities(data.opportunities || [])
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    }
  }

  const getGiftPercentage = (gift: string) => {
    if (!results) return 0
    const count = results.giftCounts[gift] || 0
    return Math.round((count / results.totalQuestions) * 100)
  }

  const getMatchingOpportunities = (giftName: string) => {
    const gift = getSpiritualGift(giftName)
    if (!gift) return []
    
    return opportunities.filter(opp => 
      gift.matchingMinistries.some(ministry => 
        opp.ministry.toLowerCase().includes(ministry.toLowerCase())
      )
    ).slice(0, 3)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your results</h2>
          <Link href="/auth/signin" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your spiritual gifts results...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Assessment Results Found</h2>
          <p className="text-gray-600 mb-6">Please complete the spiritual gifts assessment to see your results.</p>
          <Link href="/volunteer/assessment" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Take Assessment
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Spiritual Gifts Results</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            God has uniquely gifted you for ministry. Here are your top spiritual gifts and how you can use them to serve others.
          </p>
        </div>

        {/* Top Gifts Overview */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Top Spiritual Gifts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {results.topGifts.map((giftName, index) => {
              const gift = getSpiritualGift(giftName)
              const percentage = getGiftPercentage(giftName)
              
              return (
                <div key={giftName} className="text-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {percentage}%
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{giftName}</h3>
                  <p className="text-gray-600 text-sm">{gift?.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detailed Gift Information */}
        <div className="space-y-8 mb-8">
          {results.topGifts.map((giftName) => {
            const gift = getSpiritualGift(giftName)
            if (!gift) return null

            const matchingOpps = getMatchingOpportunities(giftName)

            return (
              <div key={giftName} className="bg-white rounded-lg shadow-lg p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Gift Details */}
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{gift.name}</h3>
                    <p className="text-gray-700 mb-6">{gift.description}</p>
                    
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Biblical Foundation</h4>
                      <p className="text-gray-600 mb-3">{gift.biblicalFoundation}</p>
                      <div className="space-y-2">
                        {gift.keyScriptures.map((scripture, index) => (
                          <p key={index} className="text-sm text-gray-600 italic">{scripture}</p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Practical Applications</h4>
                      <ul className="space-y-2">
                        {gift.practicalApplications.map((application, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">{application}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Matching Opportunities */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Matching Opportunities</h4>
                    {matchingOpps.length > 0 ? (
                      <div className="space-y-3">
                        {matchingOpps.map((opportunity) => (
                          <div key={opportunity.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-gray-900">{opportunity.title}</h5>
                              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                {opportunity.ministry}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{opportunity.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">{opportunity.timeCommitment}</span>
                              <Link
                                href="/volunteer/opportunities"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View Details →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 mb-4">No matching opportunities available right now.</p>
                        <Link
                          href="/volunteer/opportunities"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View All Opportunities
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Next Steps</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Apply to Serve</h3>
              <p className="text-gray-600 text-sm mb-4">Start using your gifts in ministry right away.</p>
              <Link
                href="/volunteer/opportunities"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Browse Opportunities
              </Link>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Complete Profile</h3>
              <p className="text-gray-600 text-sm mb-4">Add more details to help ministries find you.</p>
              <Link
                href="/dashboard"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Update Profile
              </Link>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Results</h3>
              <p className="text-gray-600 text-sm mb-4">Discuss your gifts with ministry leaders.</p>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Spiritual Gifts Results',
                      text: `I discovered my top spiritual gifts: ${results?.topGifts.join(', ')}`,
                      url: window.location.href
                    })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Results link copied to clipboard!')
                  }
                }}
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Share Results
              </button>
            </div>
          </div>
        </div>

        {/* Retake Assessment */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Feel these results don't reflect your calling? You can retake the assessment.
          </p>
          <Link
            href="/volunteer/assessment"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Retake Assessment
          </Link>
        </div>
      </div>
    </div>
  )
}