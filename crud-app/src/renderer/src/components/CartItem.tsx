import React from 'react'
import { Item } from '../../../types/item'

export default function CartItem({
  cart,
  onIncrease,
  onDecrease,
  onRemove
}: {
  cart: {item: Item, amount: number}
  onIncrease: (id: string) => void
  onDecrease: (id: string) => void
  onRemove: (id: string) => void
}): React.JSX.Element {
  const totalPrice = (cart.item.price * cart.amount).toFixed(2)

  return (
    <div className='flex items-center gap-6 p-4 bg-accent-50 rounded-xl relative'>
      {/* Remove Button */}
      <button
        className='absolute top-3 right-3 p-1 hover:bg-accent-200 rounded-full transition-colors'
        onClick={() => onRemove(cart.item.id!)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
          <path fill="#6b7280" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"/>
        </svg>
      </button>

      {/* Item Image */}
      <div className='w-24 h-24 flex-shrink-0'>
        <img
          className='w-full h-full object-cover rounded-lg border'
          src={`data:${cart.item.img.mime};base64,${cart.item.img.data}`}
          alt={cart.item.name}
        />
      </div>

      {/* Item Details */}
      <div className='flex-1 min-w-0'>
        <h4 className='font-semibold text-white text-lg mb-1 truncate'>{cart.item.name}</h4>
        <p className='text-white mb-2'>${cart.item.price} each</p>
        <p className='font-semibold text-gray-400'>Total: ${totalPrice}</p>
      </div>

      {/* Quantity Controls */}
      <div className='flex items-center gap-3 rounded-lg border border-gray-300 px-1'>
        <button 
          onClick={() => onDecrease(cart.item.id!)}
          className='p-2  rounded-md transition-colors cursor-pointer'
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6 13v-2h12v2z"/>
          </svg>
        </button>
        
        <span className='font-semibold text-white-900 min-w-[2rem] text-center'>{cart.amount}</span>
        
        <button 
          onClick={() => onIncrease(cart.item.id!)}
          className='p-2 rounded-md transition-colors cursor-pointer'
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 21q-.425 0-.712-.288T11 20v-7H4q-.425 0-.712-.288T3 12t.288-.712T4 11h7V4q0-.425.288-.712T12 3t.713.288T13 4v7h7q.425 0 .713.288T21 12t-.288.713T20 13h-7v7q0 .425-.288.713T12 21"/>
          </svg>
        </button>
      </div>
    </div>
  )
}