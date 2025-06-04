import {Item} from '../../../types/item';
import {Customer, CartItem} from '../../../types/customer';

type CartProps = {
    onIncrease: (id: string) => void;
    onDecrease: (id: string) => void;
    onRemove: (id: string) => void;
    cartMap: Map<string, { item: Item; amount: number }>;
};

export default function Cart({
    onIncrease,
    onDecrease,
    onRemove,
    cartMap,
}: CartProps): React.JSX.Element {
    const handleCheckout = () =>{
        let cartItems : CartItem[] = [];
        for(const[_, value] of cartMap){
            cartItems.push({itemId: value.item.id!, amount: value.amount});
        }
        window.electron.ipcRenderer.invoke('save-customer-cart', cartItems);
    }

    let subTotalInt = 0;
    
    cartMap.forEach((cart) =>{
        subTotalInt += Math.round(cart.item.price * 100) * cart.amount;
    })

    console.log('cart is called, sub total int:', subTotalInt);

    const TAX_RATE = 0.15;
    const taxInt = Math.round(subTotalInt * TAX_RATE);
    const tax = (taxInt/100).toFixed(2);

    const subTotal = (subTotalInt/100).toFixed(2);
    const priceAfterTax = ((subTotalInt + taxInt)/100).toFixed(2);
    
    return (
        <>
            
            <div className="fixed top-0 right-0 p-6 h-screen flex flex-col overflow-hidden z-50 w-[400px]">
                <div className='flex-grow-[8] overflow-y-auto'>
                    <h3 className='mb-2 font-bold'>Your Cart</h3>
                    {Array.from(cartMap.values()).map((cart, idx) =>{

                        return (
                            <div key={idx} className='flex items-center justify-between relative mb-10 gap-2' >
                                <div className='flex-1 h-20'>
                                    <img className='object-cover w-full h-full'
                                    src={`data:${cart.item.img.mime};base64,${cart.item.img.data}`} alt="" />
                                </div>
                                <div className='flex-1'>
                                    <p className='font-bold'>{cart.item.name}</p>
                                    <p className='text-gray-500'>${cart.item.price}</p>
                                </div>
                                <div className='flex flex-1 gap-5 flex-row'>
                                    <button onClick={() => onIncrease(cart.item.id!)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-.425 0-.712-.288T11 20v-7H4q-.425 0-.712-.288T3 12t.288-.712T4 11h7V4q0-.425.288-.712T12 3t.713.288T13 4v7h7q.425 0 .713.288T21 12t-.288.713T20 13h-7v7q0 .425-.288.713T12 21"/></svg>
                                    </button>
                                    <p>{cart.amount}</p>
                                    <button onClick={() => onDecrease(cart.item.id!)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M6 13v-2h12v2z"/></svg>
                                    </button>
                                </div>
                                <button className='absolute top-0 right-0 rounded-2xl'
                                onClick={() => onRemove(cart.item.id!)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="grey" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"/></svg></button>
                            </div>
                        )
                    })}
                </div>

                <div className='flex justify-center text-center flex-col'>
                    <h5 className='font-bold'>Payment Summary</h5>
                    <div className='grid grid-cols-2 gap-2 mt-4'>
                        <p className='text-left'>Sub Total</p>
                        <p className='text-right'>${subTotal}</p>
                        <p className='text-left'>GST </p>
                        <p className='text-right'>${tax}</p>
                        <p className='text-left mt-4'>Total</p>
                        <p className ='text-right mt-4'> ${priceAfterTax}</p>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        className='w-full bg-primary-500 hover:bg-primary-600 font-bold py-3 rounded-xl transition-colors mt-4'
                    >Go To Checkout</button>
                </div>
            </div>
        </>
    )
}