import React from 'react'

type CustomerSection = 'Ordering' | 'Summary' | 'Payment' | 'Favorite' | 'History'

export default function OrderHistory({
  onChangeSection
}: {
  onChangeSection: (section: CustomerSection) => void
}): React.JSX.Element {
  return (
    <div className="p-6 overflow-y-auto bg-gray-960 h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Order History</h2>
        <p className="text-gray-400">Your previous orders</p>
      </div>
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" className="mb-4">
          <path fill="currentColor" d="M13 3c4.97 0 9 4.03 9 9H20c0-3.87-3.13-7-7-7s-7 3.13-7 7-3.13 7-7 7c0 4.97 4.03 9 9 9v-2c-3.87 0-7-3.13-7-7s3.13-7 7-7z"/>
        </svg>
        <h3 className="text-lg font-medium mb-2">No order history</h3>
        <p className="text-center">Your order history will appear here</p>
      </div>
      <button
        onClick={() => onChangeSection('Ordering')}
        className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Back to Menu
      </button>
    </div>
  )
}