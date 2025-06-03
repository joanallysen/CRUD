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
    const tax = (taxInt: number) => (taxInt/100).toFixed(2);

    const total = Math.round(subTotalInt);
    const priceAfterTax = (total: number) => (total/100).toFixed(2);
    
    return (
        <>
            {Array.from(cartMap.values()).map((cart, idx) =>{

                return (
                    <div key={idx} className='flex items-center justify-between' >
                        <div className='flex-1'>
                            <h5>{cart.item.name}</h5>
                            <p>${cart.item.price}</p>
                        </div>
                        <div className='flex'>
                            <button onClick={() => onIncrease(cart.item.id!)}>+</button>
                            <p>{cart.amount}</p>
                            <button onClick={() => onDecrease(cart.item.id!)}>-</button>
                            <button onClick={() => onRemove(cart.item.id!)}>X</button>
                        </div>
                    </div>
                )
            })}
            <h5 className='mt-4'>GST: {tax(taxInt)}</h5>
            <h5>Total Price : {priceAfterTax(total)}</h5>
            <button 
                onClick={handleCheckout}
                className='w-full bg-primary-500 hover:bg-primary-600 font-bold py-3 rounded-lg transition-colors mt-4'
            >Go To Checkout</button>
        </>
    )
}