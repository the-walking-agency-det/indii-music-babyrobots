import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Welcome to Your Project
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            This is a modern React app with TypeScript and Tailwind CSS
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">⚡ Fast</h3>
              <p className="text-gray-600">Built with Vite for lightning-fast development</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">🎨 Beautiful</h3>
              <p className="text-gray-600">Styled with Tailwind CSS for modern UI</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">🔧 TypeScript</h3>
              <p className="text-gray-600">Type-safe development with TypeScript</p>
            </div>
          </div>
          
          <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors duration-200">
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default App