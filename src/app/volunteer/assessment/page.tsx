'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const spiritualGiftsQuestions = [
  {
    id: 1,
    question: "When you see someone in need, what's your first instinct?",
    options: [
      { text: "I want to help them directly and meet their practical needs", gift: "Service" },
      { text: "I feel compelled to give them resources to help", gift: "Giving" },
      { text: "I want to understand their situation and guide them", gift: "Wisdom" },
      { text: "I feel called to pray for them and encourage them", gift: "Encouragement" }
    ]
  },
  {
    id: 2,
    question: "In group settings, what role do you naturally take?",
    options: [
      { text: "I help organize and coordinate activities", gift: "Administration" },
      { text: "I enjoy teaching and explaining concepts", gift: "Teaching" },
      { text: "I naturally lead and guide the group forward", gift: "Leadership" },
      { text: "I prefer to work behind the scenes to support others", gift: "Service" }
    ]
  },
  {
    id: 3,
    question: "How do you typically respond to someone who is struggling spiritually?",
    options: [
      { text: "I share relevant Bible passages and principles", gift: "Teaching" },
      { text: "I listen and offer words of hope and comfort", gift: "Encouragement" },
      { text: "I pray specifically for their needs", gift: "Faith" },
      { text: "I help them understand God's broader purpose", gift: "Wisdom" }
    ]
  },
  {
    id: 4,
    question: "What type of ministry energizes you most?",
    options: [
      { text: "Organizing events and managing logistics", gift: "Administration" },
      { text: "Leading worship or musical ministry", gift: "Creative Arts" },
      { text: "Visiting the sick and those in prison", gift: "Mercy" },
      { text: "Sharing the gospel with others", gift: "Evangelism" }
    ]
  },
  {
    id: 5,
    question: "When you study Scripture, what do you enjoy most?",
    options: [
      { text: "Finding practical applications for daily life", gift: "Wisdom" },
      { text: "Understanding deep theological concepts", gift: "Knowledge" },
      { text: "Discovering truths I can share with others", gift: "Teaching" },
      { text: "Receiving personal encouragement and direction", gift: "Faith" }
    ]
  }
]

export default function VolunteerAssessment() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!session) {
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

  const handleAnswer = (gift: string) => {
    // Prevent multiple submissions
    if (isSubmitting) return

    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: gift
    }))

    if (currentQuestion < spiritualGiftsQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      submitAssessment()
    }
  }

  const submitAssessment = async () => {
    setIsSubmitting(true)
    
    const giftCounts: { [key: string]: number } = {}
    Object.values(answers).forEach(gift => {
      giftCounts[gift] = (giftCounts[gift] || 0) + 1
    })

    const topGifts = Object.entries(giftCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([gift]) => gift)

    try {
      const response = await fetch('/api/volunteer/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          spiritualGifts: JSON.stringify(topGifts)
        })
      })

      if (response.ok) {
        router.push('/volunteer/assessment/results')
      } else {
        const errorData = await response.json()
        console.error('Assessment submission error:', errorData)
        alert('There was an error saving your results. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('There was an error saving your results. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentQuestion + 1) / spiritualGiftsQuestions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Spiritual Gifts Assessment</h1>
              <span className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {spiritualGiftsQuestions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {spiritualGiftsQuestions[currentQuestion].question}
            </h2>
            
            <div className="space-y-3">
              {spiritualGiftsQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.gift)}
                  disabled={isSubmitting}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <span className="text-gray-700">{option.text}</span>
                </button>
              ))}
            </div>
          </div>

          {isSubmitting && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Analyzing your spiritual gifts...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}