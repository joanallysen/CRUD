import {useState, useEffect, useRef} from "react"

import {Item} from '../../../types/item';
import Cart from "@renderer/components/Cart";
import CustomerSidebar from "@renderer/components/Sidebar";
import ItemMenu from "@renderer/components/ItemMenu";

export default function CustomerPage({onChangePage}:{onChangePage: (p: PageName) => void}) : React.JSX.Element{
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [cartMap, setCartMap] = useState<Map<string, {item:Item, amount:number}>>(new Map());
    
    type CustomerSection = 'Ordering' | 'Summary' | 'Payment' 
    const[currentSection, setCurrentSection] = useState<CustomerSection>('Ordering'); 
    
    const addToCart = (newItem: Item) => {
        // first check if it exist
        setCartMap(prevCart =>{
            const newCart = new Map(prevCart);
            if (newCart.has(newItem.id!)){
                const entry = newCart.get(newItem.id!);
                newCart.set(newItem.id!, {item: entry!.item, amount: entry!.amount + 1});
            } else {
                newCart.set(newItem.id!, {item: newItem!, amount: 1})
            }
            return newCart;
        })
    }
    
    const removeFromCart = (id: string) =>{
        setCartMap(prevCart =>{
            const newCart = new Map(prevCart);
            newCart.delete(id);
            return newCart;
        })
    }

    const decreaseQuantity = (id:string) =>{
        setCartMap(prevCart => {
            const newCart = new Map(prevCart);
            const entry = newCart.get(id);
            if(!entry){console.log('entry issues decrease quantity'); return prevCart};
            if(entry.amount <= 1){
                newCart.delete(id);
            } else{
                newCart.set(id, {...entry, amount: entry.amount-1});
            }
            return newCart;
        })
    } 

    const increaseQuantity = (id:string) =>{
        setCartMap(prevCart => {
            const newCart = new Map(prevCart);
            const entry = newCart.get(id);
            if(!entry){console.log('entry issues increase quantity'); return prevCart};
            newCart.set(id, {...entry, amount: entry.amount + 1});
            return newCart;
        })
    }


    const searchRef = useRef<HTMLInputElement>(null);

    const handleGetItems = async (category:string, search:string) => {
        setItems(await window.electron.ipcRenderer.invoke('get-item', category, search));
        console.log('items in frontend', items);
    }

    const handleChangeSection = (customerSection: CustomerSection) =>{
        setCurrentSection(customerSection);
    }

    useEffect(() => {
    const loadData = async () => {
        const itemsData = await window.electron.ipcRenderer.invoke('get-item', '', ''); // empty meant get all
        const categoriesData = await window.electron.ipcRenderer.invoke('get-unique-category');
        const cartData = await window.electron.ipcRenderer.invoke('get-customer-cart');
        
        setItems(itemsData);
        setCategories(categoriesData);
        setCartMap(prevCart =>{
            let newCart = new Map(prevCart);
            for (const itemAndAmounts of cartData){
                newCart.set(itemAndAmounts.item.id, {item: itemAndAmounts.item, amount:itemAndAmounts.amount});
            }
            return newCart;
        })
    };
    
    loadData();
}, []);

    switch(currentSection){
        case 'Ordering':
          return(  
                <>
                    <div className="grid grid-cols-[280px_1fr_320px] gap-0 h-screen bg-background">
                        <div className="bg-background shadow-lg">
                            <CustomerSidebar onGetItem={handleGetItems} categories={categories}></CustomerSidebar>   
                        </div>

                        <div className="p-6 overflow-y auto">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input type="text" name="search" placeholder="Search..." ref={searchRef} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"/>
                                </div>
                                
                            </div>
                            
                            <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors" onClick={() => handleGetItems('', (searchRef.current)!.value.trim())}>Search</button>
                            <ItemMenu onAddToCart={addToCart} items={items}></ItemMenu>
                        </div>
                        
                        
                        <div>
                            <div className="p-6">
                                <button onClick={() => onChangePage('customerHistoryPage')} className="w-full mb-4 text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors">View Order History (temp)</button>
                                <Cart onIncrease={increaseQuantity}  onDecrease={decreaseQuantity} onRemove={removeFromCart} cartMap={cartMap}></Cart>
                                <button onClick={() => handleChangeSection('Summary')} className="w-full bg-primary-500 hover:bg-primary-600 text-background font-bold py-3 px-4 rounded-lg transition-colors mt-4">Continue</button>
                            </div>
                        </div>
                        
                    </div> 
                </>
        )
        case 'Summary':
            return(
                <>
                    <h1>User summary</h1>
                    <div className="grid grid-cols-[3fr_1fr] gap-4 h-full">
                        {Array.from(cartMap.values()).map((cart, idx) =>{
                        return (
                            <div key={idx}>
                                <img src={`data:${cart.item.img.mime};base64,${cart.item.img.data}`} alt="" className='w-full h-full object-cover'/>
                                <h2>{cart.item.name}, ${cart.item.price}, {cart.amount}</h2>
                                <button onClick={() => increaseQuantity(cart.item.id!)}>+</button>
                                <button onClick={() => decreaseQuantity(cart.item.id!)}>-</button>
                                <button onClick={() => removeFromCart(cart.item.id!)}>X</button>
                            </div>
                        )
                    })}
                    </div>
                    <button onClick={() => handleChangeSection('Ordering')}>Return to order</button>
                    <button onClick={() => handleChangeSection('Payment')}>Continue to payment</button>
                </>
            )
        case 'Payment':
            return(
                <>
                    <button onClick={() => handleChangeSection('Ordering')}>Return to order</button>
                    <h1>Payment</h1>
                </>
            )
    }
}

