import {useState, useEffect, useRef} from 'react'

import {Item} from '../../../types/item';
import Cart from "@renderer/components/Cart";
import CategorySidebar from "@renderer/components/CategorySidebar";
import ItemMenu from "@renderer/components/ItemMenu";
import SearchBar from "@renderer/components/SearchBar";
import LoadingBlur from '@renderer/components/LoadingBlur';
import CustomerSidebar from '@renderer/components/CustomerSidebar';

export default function CustomerPage({onChangePage}:{onChangePage: (p: PageName) => void}) : React.JSX.Element{
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [cartMap, setCartMap] = useState<Map<string, {item:Item, amount:number}>>(new Map());
    const [itemMenuTitle, setItemMenuTitle] = useState<string>('All Item');
    const categoryAndItem = useRef<Map<string, Item[]>>(new Map());


    type CustomerSection = 'Ordering' | 'Summary' | 'Payment' ;
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

    const handleGetItems = async (category: string, search: string) => {
        if (search !== '') {
            const regex = new RegExp(search, 'i');
            let itemsMatched : Item[] = []
            categoryAndItem.current.forEach((items: Item[], _: string) => {
                items.forEach((item) => {
                    if (regex.test(item.name)) {
                        itemsMatched.push(item);
                    }
                });
            });
            setItemMenuTitle(`Showing '${search}'`);
            setItems(itemsMatched);
            return;
        }
        
        // this will pretty much be called when dom loaded
        console.log('category string: ', category);
        if (category === '') {
            if (categoryAndItem.current.size === 0) {
                console.log('Sorting the item based on the category.');
                const allItems = await window.electron.ipcRenderer.invoke('get-item', '', '');
                
                allItems.forEach((item) => {
                    if (categoryAndItem.current.has(item.category)) {
                        categoryAndItem.current.get(item.category)!.push(item);
                    } else {
                        categoryAndItem.current.set(item.category, [item]);
                    }
                });
                
                setItems(allItems);
                setItemMenuTitle('All Item');
            } else {
                const valuesArray = Array.from(categoryAndItem.current.values());
                setItems(valuesArray.flat());
                setItemMenuTitle('All Item');
            }

            console.log('items in frontend', items);
            console.log('items in categoryAndItem', categoryAndItem.current);
            return;
        }
        
        console.log('categoryAndItemMap: ', categoryAndItem);
        if (categoryAndItem.current.has(category)) {
            console.log('THIS CATEGORY HAS BEEN SEEN BEFORE!');
            setItems(categoryAndItem.current.get(category) ?? []);
            setItemMenuTitle(category);
                    
            console.log('items in frontend', items);
            console.log('items in categoryAndItem', categoryAndItem.current);
            return;
        }
        
        // Fetch new data and cache it, rarely gonna be called

        console.log("Detected new category");
        const fetchedItems = await window.electron.ipcRenderer.invoke('get-item', category, search);
        categoryAndItem.current.set(category, fetchedItems);
        setItems(fetchedItems);
        setItemMenuTitle(category);
                
        console.log('items in frontend', items);
        console.log('items in categoryAndItem', categoryAndItem.current);
        return;
    }

    const handleChangeSection = (customerSection: CustomerSection) =>{
        setCurrentSection(customerSection);
    }

    useEffect(() => {
    const loadData = async () => {
        // load all required data
        handleGetItems('', '');
        const categoriesData = await window.electron.ipcRenderer.invoke('get-unique-category');
        const cartData = await window.electron.ipcRenderer.invoke('get-customer-cart');
        
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
                {(categoryAndItem.current.size <= 0 ? <LoadingBlur /> : null)}
                    <div className="grid grid-cols-[4rem_10rem_1fr_24rem] gap-0 h-screen bg-background">
                        <div className='bg-gray-800'>
                            <CustomerSidebar></CustomerSidebar>
                        </div>


                        <div className="bg-gray-900">
                            <CategorySidebar onGetItem={handleGetItems} categories={categories}></CategorySidebar>
                        </div>



                        <div className="p-6 overflow-y-auto bg-gray-960">
                            <SearchBar onGetItems={handleGetItems}></SearchBar>
                            <ItemMenu onAddToCart={addToCart} items={items} itemMenuTitle={itemMenuTitle}/>
                            </div>                      
                        
                        <div className="bg-gray-900">
                            {/* <button onClick={() => onChangePage('customerHistoryPage')} className="w-full mb-4 text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors">View Order History (temp)</button> */}
                            <Cart onIncrease={increaseQuantity}  
                            onDecrease={decreaseQuantity} 
                            onRemove={removeFromCart}
                            onChangeSection={handleChangeSection} 
                            cartMap={cartMap}></Cart>
                        </div>
                        
                    </div> 
                </>
        )
        case 'Summary':
            return(
                <>
                    <div className="grid grid-cols-[3fr_1fr] gap-4 h-full">
                        {/* Order */}
                        <div className="flex flex-col p-6">
                            <h3 className="mb-2 font-bold">Order</h3>
                            {Array.from(cartMap.values()).map((cart, idx) =>{
                            return (
                                <div key={idx} className='flex items-center justify-between relative mb-10 gap-2' >
                                <div className='w-60 h-40'>
                                    <img className=' w-full h-full object-cover'
                                    src={`data:${cart.item.img.mime};base64,${cart.item.img.data}`} alt="" />
                                </div>
                                <div className='flex-1 align-text-top'>
                                    <p className='font-bold'>{cart.item.name}</p>
                                    <p className='text-gray-500'>${cart.item.price}</p>
                                </div>
                                <div className='flex flex-1 gap-5 flex-row'>
                                    <button onClick={() => increaseQuantity(cart.item.id!)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-.425 0-.712-.288T11 20v-7H4q-.425 0-.712-.288T3 12t.288-.712T4 11h7V4q0-.425.288-.712T12 3t.713.288T13 4v7h7q.425 0 .713.288T21 12t-.288.713T20 13h-7v7q0 .425-.288.713T12 21"/></svg>
                                    </button>
                                    <p>{cart.amount}</p>
                                    <button onClick={() => decreaseQuantity(cart.item.id!)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M6 13v-2h12v2z"/></svg>
                                    </button>
                                </div>
                                <button className='absolute top-0 right-0 rounded-2xl'
                                onClick={() => removeFromCart(cart.item.id!)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="grey" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"/></svg></button>
                            </div>
                            )
                            })}

                        </div>
                        <div className='flex justify-center text-center flex-col'>
                    <h5 className='font-bold'>Payment Summary</h5>
                    <div className='grid grid-cols-2 gap-2 mt-4'>
                        {/* <p className='text-left'>Sub Total</p>
                        <p className='text-right'>${subTotal}</p>
                        <p className='text-left'>GST </p>
                        <p className='text-right'>${tax}</p>
                        <p className='text-left mt-4'>Total</p>
                        <p className ='text-right mt-4'> ${priceAfterTax}</p> */}
                    </div>
                    <button 
                        onClick= {() => handleChangeSection}
                        className='w-full bg-primary-500 hover:bg-primary-600 font-bold py-3 rounded-xl transition-colors mt-4'
                    >Go To Checkout</button>
                </div>
                            


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

