import {useState, useEffect, useRef} from "react"

import {Item} from '../../../types/item';
import Cart from '../components/Cart';

export default function CustomerPage({onChangePage}:{onChangePage: (p: PageName) => void}) : React.JSX.Element{
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [cartMap, setCartMap] = useState<Map<string, {item:Item, amount:number}>>(new Map());
    
    
    
    const addToCart = (newItem: Item) => {
        // first check if it exist
        setCartMap(prevCart =>{
            const newCart = new Map(prevCart);
            if (newCart.has(newItem.id)){
                const entry = newCart.get(newItem.id);
                newCart.set(newItem.id, {item: entry!.item, amount: entry!.amount + 1});
            } else {
                newCart.set(newItem.id, {item: newItem, amount: 1})
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

    return (
        <>

        <div className="grid grid-cols-[1fr_3fr_1fr] gap-4 h-full">
            {/* SideBar */}
            <div className="bg-black">
                <ul>
                    <li><button className="cursor-pointer" onClick={() => handleGetItems('', '')}>All</button></li>
                    {categories?.map((category, idx) =>{
                        return (
                            <li key={idx}>
                                <button className="cursor-pointer" onClick={() => handleGetItems(category, '')}><h2>{category}</h2></button>
                            </li>
                        )
                    })}
                </ul>

                <h1 className="text-white">Current: User Page</h1>
                <button className="text-white" onClick={() => onChangePage('loginPage')}>Back to User Page</button>

                
            </div>
            {/* Menu Page */}

            <div>
                <input type="text" name="search" placeholder="Search..." ref={searchRef}/>
                <button className="cursor-pointer" onClick={() => handleGetItems('', (searchRef.current)!.value.trim())}>Search</button>
                {/* Make sure item is loaded first */}
                {items.length > 0 && <h1>{items[0].category}</h1>} 
                <div className="grid grid-cols-4 gap-4">
            
                {items?.map((item, idx) => {
                    return (
                        <div key={idx}>
                            <img src={`data:${item.img.mime};base64,${item.img.data}`} alt="" />
                            <h2>{item.name}</h2>
                            
                            {item.discount > 0 ?
                            <>
                                <h2>Special Deal!</h2>
                                <h2><span className="line-through">${item.price}</span>${item.price * (item.discount/100)}</h2>
                                <h2>{item.discount}%</h2>
                            </>
                            : <h2> No special deal</h2>}
                            
                        
                            <button className="cursor-pointer" onClick={() => addToCart(item)}>Add to cart</button>
                        </div>
                    );
                })}

                </div>
            </div>
            

            <Cart onIncrease={increaseQuantity} 
                onDecrease={decreaseQuantity}
                onRemove={removeFromCart} 
                cartMap={cartMap}
                ></Cart>
        </div>
        </>
    )
}

