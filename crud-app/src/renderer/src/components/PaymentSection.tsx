import {useState} from 'react'
import { CartItem } from 'src/types/customer'
import { Item } from 'src/types/item'
import Notification from './Notification'

type CustomerSection = 'Ordering' | 'Summary' | 'Payment' | 'Favorite' | 'History'

export default function PaymentSection(
  {onChangeSection, cartMap, clearCart}: {
  onChangeSection: (section: CustomerSection) => void;
  cartMap: Map<string, {item: Item, amount: number}>;
  clearCart: () => void;
}): React.JSX.Element {

  const [notification, setNotification] = useState<Boolean>(false);

  const handlePay = async (paymentMethod: 'Card' | 'Cash') =>{
    const cartItems = Array.from(cartMap.values()).map(entry =>({
      itemId: entry.item.id!,
      amount: entry.amount
    }))

    const result = await window.electron.ipcRenderer.invoke('add-order', {
      cartItems, paymentMethod
    })

    // if success remove customer cart
    if(result.success){
      await window.electron.ipcRenderer.invoke('save-customer-cart', [])
      clearCart();
      onChangeSection('Ordering')
    }
  }

  return (
    <>
      {notification && <Notification notificationMessage={'Successfully ordered!'} onNotificationEnd={() => setNotification(false)}/>}
        <div className="w-full h-full flex items-center justify-center text-center gap-40 relative">
        <h2 className='text-center absolute top-20'>Payment Method</h2>
        <div className='bg-accent-200 p-20 flex flex-col items-center justify-center text-center rounded-4xl hover:scale-105 transition-transform cursor-pointer'
        onClick={() => handlePay('Card')}>
            <svg className='mb-20'
            xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-8h16V8H4z"/>
            </svg>
            <h3>Pay by Card</h3>
        </div>
        <div className='bg-accent-200 p-20 flex flex-col items-center justify-center text-center rounded-4xl hover:scale-105 transition-transform cursor-pointer'
        onClick={() => handlePay('Cash')}>
            <svg className='mb-20'
            xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 14 14"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 11h1M10 5V3m2-1.25A1.25 1.25 0 0 1 10.75 3h-1.5a1.25 1.25 0 0 1 0-2.5h1.5A1.25 1.25 0 0 1 12 1.75ZM5.5 5V1.5h-3V5"/><rect width="13" height="5" x=".5" y="8.5" rx="1"/><path d="M12.5 8.5V6a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v2.5"/></g></svg>
            <h3>Pay on Cashier</h3>
        </div>
    </div>
    </>

  )
}