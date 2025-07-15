import React from 'react'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Setup Interview
          </h1>
          <p className="text-lg text-gray-600">
            Let&apos;s configure your interview environment
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Camera & Microphone</h2>
              <p className="text-gray-600">Please ensure your devices are working properly for the best interview experience.</p>
            </div>
            
            <div className="flex justify-center">
              <a 
                href="/working-interview"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Interview
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
