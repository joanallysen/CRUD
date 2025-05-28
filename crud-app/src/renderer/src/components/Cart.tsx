import {Item} from '../../../types/item';


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
        const cartObject = Object.fromEntries(cartMap);
        window.electron.ipcRenderer.invoke('save-customer-cart', cartObject);
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
        <div className="bg-black">
            {Array.from(cartMap.values()).map((cart, idx) =>{

                return (
                    <div key={idx}>
                        <h2>{cart.item.name}, ${cart.item.price}, {cart.amount}</h2>
                        <button onClick={() => onIncrease(cart.item.id)}>+</button>
                        <button onClick={() => onDecrease(cart.item.id)}>-</button>
                        <button onClick={() => onRemove(cart.item.id)}>X</button>
                    </div>
                )
            })}
            <h4>GST: {tax(taxInt)}</h4>
            <h4>Total Price : {priceAfterTax(total)}</h4>
            <button onClick={handleCheckout}>Go To Checkout</button>
        </div>
    )
}