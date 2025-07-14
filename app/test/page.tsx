import React from 'react'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test Page Working!
          </h1>
          <p className="text-lg text-gray-600">
            This proves React components can work in this Next.js setup.
          </p>
        </div>
      </div>
    </div>
  )
}
