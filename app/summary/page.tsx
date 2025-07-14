export default function SummaryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Interview Complete! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your interview results and detailed feedback are being generated...
          </p>
        </div>
        
        <div className="text-center">
          <div className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold">
            Overall Score: 87%
          </div>
          <p className="mt-4 text-gray-600">
            Great job! You demonstrated strong communication skills and technical knowledge.
          </p>
        </div>
      </div>
    </div>
  )
}