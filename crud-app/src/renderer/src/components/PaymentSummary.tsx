import React from 'react'
import { Item } from '../../../types/item'

type CustomerSection = 'Ordering' | 'Summary' | 'Payment' | 'Favorite' | 'History'

export default function PaymentSummary({
  onChangeSection,
  cartMap
}: {
  onChangeSection: (section: CustomerSection) => void
  cartMap?: Map<string, {item: Item, amount: number}>
}): React.JSX.Element {
  // Calculate subtotal using same logic as Cart component
  let subTotalInt = 0;
  
  if (cartMap) {
    cartMap.forEach((cart) => {
      // Handle discounted items like in Cart component
      const itemPrice = cart.item.discount > 0 
        ? cart.item.price - cart.item.price * (cart.item.discount / 100)
        : cart.item.price;
      
      subTotalInt += Math.round(itemPrice * 100) * cart.amount;
    });
  }

  // Use same tax rate as Cart component
  const TAX_RATE = 0.15; // 15% GST to match Cart component
  const taxInt = Math.round(subTotalInt * TAX_RATE);

  // Convert back to decimal for display
  const subTotal = (subTotalInt / 100).toFixed(2);
  const tax = (taxInt / 100).toFixed(2);
  const total = ((subTotalInt + taxInt) / 100).toFixed(2);

  // Calculate total items
  const cartItems = cartMap ? Array.from(cartMap.values()) : [];
  const totalItems = cartItems.reduce((sum, cart) => sum + cart.amount, 0);

  return (
    <div className='bg-gray-900 fixed p-4 w-100 flex flex-col h-screen right-0 top-0'>
      <div className='mb-8'>
        <h3 className='mb-2'>Payment Summary</h3>
        <p className='text-gray-400'>Review your order details</p>
      </div>

      {/* Order Details */}
      <div className='flex-1'>
        <div className='space-y-4'>
          <div className='flex justify-between items-center py-2'>
            <span className='text-gray-300'>Sub Total</span>
            <span className=''>${subTotal}</span>
          </div>
          
          <div className='flex justify-between items-center py-2'>
            <span className='text-gray-300'>GST</span>
            <span className=''>${tax}</span>
          </div>
          
          <hr className='border-gray-700 my-4' />
          
          <div className='flex justify-between items-center py-2 mb-6'>
            <span className='text-lg '>Total</span>
            <span className='text-primary-400'>${total}</span>
          </div>
        </div>

        {/* Order Items Count */}
        <div className='bg-gray-800 rounded-lg p-4 mb-6'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-300'>Items in cart</span>
            <span className=''>{totalItems}</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => onChangeSection('Ordering')}
        className='w-full bg-gray-800 hover:bg-gray-700 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer mb-5' 
        disabled={cartItems.length === 0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="14" x="2" y="5" rx="2"/>
          <line x1="2" x2="22" y1="10" y2="10"/>
        </svg>
        Continue Ordering
      </button>

      {/* Checkout Button */}
      <button
        onClick={() => onChangeSection('Payment')}
        className='w-full text-gray-900 bg-green-500 hover:bg-green-400 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer' 
        disabled={cartItems.length === 0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="14" x="2" y="5" rx="2"/>
          <line x1="2" x2="22" y1="10" y2="10"/>
        </svg>
        Proceed to Checkout
      </button>
    </div>
  )
}