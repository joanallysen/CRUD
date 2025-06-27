import {Item} from 'src/types/item';
import {CartItem} from 'src/types/customer';
import CartItemUI from './CartItemUi';

type CustomerSection = 'Ordering' | 'Summary' | 'Payment';

type CartProps = {
    onIncrease: (id: string) => void;
    onDecrease: (id: string) => void;
    onRemove: (id: string) => void;     
    onChangeSection: (section: CustomerSection) => void;
    cartMap: Map<string, { item: Item; amount: number }>;
};

export default function Cart({
    onIncrease,
    onDecrease,
    onRemove,
    onChangeSection,
    cartMap,
}: CartProps): React.JSX.Element {
    const handleCheckout = () =>{
        let cartItems : CartItem[] = [];
        for(const[_, value] of cartMap){
            cartItems.push({itemId: value.item.id!, amount: value.amount});
        }

        // save current customer cart if user accidentally exit
        window.electron.ipcRenderer.invoke('save-customer-cart', cartItems);
        onChangeSection('Summary');
    }

    let subTotalInt = 0;
    
    cartMap.forEach((cart) =>{
        const itemPrice = cart.item.discount > 0 
        ? cart.item.price - cart.item.price * (cart.item.discount / 100)
        : cart.item.price;

        // for now times 100, because js can't do float well.
        subTotalInt += Math.round(itemPrice * 100) * cart.amount;
    })

    console.log('cart is called, sub total int:', subTotalInt);

    const TAX_RATE = 0.15;
    const taxInt = Math.round(subTotalInt * TAX_RATE);
    const tax = (taxInt/100).toFixed(2);

    const subTotal = (subTotalInt/100).toFixed(2);
    const priceAfterTax = ((subTotalInt + taxInt)/100).toFixed(2);
    
    return (
        <>
            <div className="fixed p-4 w-100 flex flex-col h-screen right-0">
                <div className='flex-grow-[8] overflow-y-auto'>
                    <h3 className='mb-6 font-bold'>Your Cart</h3>
                    <div className='space-y-2'>
                        {(cartMap.size <= 0) && <p className='text-gray-400 text-center p-6'>Click + icon on one of the item to start placing items!</p> }
                        {Array.from(cartMap.values()).map((cart, idx) =>{

                        return (
                            <CartItemUI
                            key={cart.item.id || idx}
                            cart = {cart}
                            onIncrease={onIncrease}
                            onDecrease={onDecrease}
                            onRemove={onRemove}
                            />
                        )
                        })}
                    </div>

                </div>

                <div className='space-y-4'>
                        <div className='flex justify-between items-center py-2'>
                            <span className='text-gray-300'>Sub Total</span>
                            <span className='font-semibold'>${subTotal}</span>
                        </div>

                        <div className='flex justify-between items-center py-2'>
                            <span className='text-gray-300'>GST</span>
                            <span className='font-semibold'>${tax}</span>
                        </div>
                        
                        <hr className='border-gray-700 my-4' />
                        
                        <div className='flex justify-between items-center py-2'>
                            <span className='text-lg font-bold'>Total</span>
                            <span className='text-2xl font-bold text-primary-400'>${priceAfterTax}</span>
                        </div>
                    <button 
                        onClick={handleCheckout}
                        className='w-full bg-green-500 text-gray-900 hover:bg-green-400 font-bold py-4 rounded-xl transition-colors mt-4 cursor-pointer'
                    >Go To Checkout</button>
                </div>
            </div>
        </>
    )
}