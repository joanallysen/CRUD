import {useState, useEffect, useRef} from 'react'

import {Item} from '../../../types/item';
import Cart from "@renderer/components/Cart";
import CategorySidebar from "@renderer/components/CategorySidebar";
import ItemMenu from "@renderer/components/ItemMenu";
import SearchBar from "@renderer/components/SearchBar";
import LoadingBlur from '@renderer/components/LoadingBlur';
import CustomerSidebar from '@renderer/components/CustomerSidebar';
import Favorites from '@renderer/components/Favorites';

export default function CustomerPage({onChangePage}:{onChangePage: (p: PageName) => void}) : React.JSX.Element{
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [cartMap, setCartMap] = useState<Map<string, {item:Item, amount:number}>>(new Map());
    const [itemMenuTitle, setItemMenuTitle] = useState<string>('All Item');
    const categoryAndItem = useRef<Map<string, Item[]>>(new Map());

    // Favorite
    const [favoriteItems, setFavoriteItems] = useState<Item[]>([]);
    const [favoriteItemIds, setFavoriteItemIds] = useState<Set<string>>(new Set());

    // Add these new functions
    const addToFavorites = async (item: Item) => {
        try {
            const result = await window.electron.ipcRenderer.invoke('add-to-favorites', item.id);
            if (result.success) {
                setFavoriteItems(prev => [...prev, item]);
                setFavoriteItemIds(prev => new Set([...prev, item.id!]));
                console.log('Item added to favorites');
            } else {
                console.log('Failed to add to favorites:', result.message);
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };

    const removeFromFavorites = async (itemId: string) => {
        try {
            const result = await window.electron.ipcRenderer.invoke('remove-from-favorites', itemId);
            if (result.success) {
                setFavoriteItems(prev => prev.filter(item => item.id !== itemId));
                setFavoriteItemIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(itemId);
                    return newSet;
                });
                console.log('Item removed from favorites');
            } else {
                console.log('Failed to remove from favorites:', result.message);
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    const loadFavorites = async () => {
        try {
            const favorites = await window.electron.ipcRenderer.invoke('get-customer-favorites');
            setFavoriteItems(favorites);
            setFavoriteItemIds(new Set(favorites.map((item: Item) => item.id!)));
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const isItemFavorited = (itemId: string) => {
        return favoriteItemIds.has(itemId);
    };



    type CustomerSection = 'Ordering' | 'Summary' | 'Payment' | 'Favorite' | 'History' ;
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

        await loadFavorites();
    };

    
    
    loadData();
}, []);

return (
    <div className="grid grid-cols-[4rem_1fr] h-screen bg-background">
        {/* Sidebar always visible */}
        <div className="bg-gray-800">
            <CustomerSidebar onChangeSection={handleChangeSection} onChangePage={onChangePage}/>
        </div>
        {/* Main content changes by section */}
        <div className="h-full w-full">
            {(() => {
                switch (currentSection) {
                    case 'Ordering':
                        return (
                            <>
                                {categoryAndItem.current.size <= 0 ? <LoadingBlur /> : null}
                                <div className="grid grid-cols-[10rem_1fr_24rem] gap-0 h-full">
                                    <div className="bg-gray-900">
                                        <CategorySidebar onGetItem={handleGetItems} categories={categories} />
                                    </div>
                                    <div className="p-6 overflow-y-auto bg-gray-960">
                                        <SearchBar onGetItems={handleGetItems} />
                                        <ItemMenu onAddToCart={addToCart} items={items} itemMenuTitle={itemMenuTitle} 
                                        onAddToFavorites={addToFavorites} onRemoveFromFavorites={removeFromFavorites} isItemFavorited={isItemFavorited}/>
                                    </div>
                                    <div className="bg-gray-900">
                                        <Cart
                                            onIncrease={increaseQuantity}
                                            onDecrease={decreaseQuantity}
                                            onRemove={removeFromCart}
                                            onChangeSection={handleChangeSection}
                                            cartMap={cartMap}
                                        />
                                    </div>
                                </div>
                            </>
                        );
                    case 'Summary':
                        return (
                            <>
                                <div className="grid grid-cols-[3fr_1fr] gap-4 h-full">
                                    <div className="flex flex-col p-6">
                                        <h3 className="mb-2 font-bold">Order</h3>
                                        {Array.from(cartMap.values()).map((cart, idx) => (
                                            <div key={idx} className='flex items-center justify-between relative mb-10 gap-2'>
                                                <div className='w-60 h-40'>
                                                    <img className='w-full h-full object-cover'
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
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="grey" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"/></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='flex justify-center text-center flex-col'>
                                        <h5 className='font-bold'>Payment Summary</h5>
                                        <div className='grid grid-cols-2 gap-2 mt-4'>
                                            {/* Payment summary details */}
                                        </div>
                                        <button
                                            onClick={() => handleChangeSection}
                                            className='w-full bg-primary-500 hover:bg-primary-600 font-bold py-3 rounded-xl transition-colors mt-4'
                                        >Go To Checkout</button>
                                    </div>
                                </div>
                                <button onClick={() => handleChangeSection('Ordering')}>Return to order</button>
                                <button onClick={() => handleChangeSection('Payment')}>Continue to payment</button>
                            </>
                        );
                    case 'Payment':
                        return (
                            <>
                                <button onClick={() => handleChangeSection('Ordering')}>Return to order</button>
                                <h1>Payment</h1>
                            </>
                        );
                    case 'Favorite':
                        return (
                            <Favorites 
                                favoriteItems={favoriteItems}
                                onAddToCart={addToCart}
                                onAddToFavorites={addToFavorites}
                                onRemoveFromFavorites={removeFromFavorites}
                                isItemFavorited={isItemFavorited}
                            />
                        );
                    case 'History':
                        return (
                            <div className="p-6 overflow-y-auto bg-gray-960 h-screen">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-white mb-2">Order History</h2>
                                    <p className="text-gray-400">Your previous orders</p>
                                </div>
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" className="mb-4">
                                        <path fill="currentColor" d="M13 3c4.97 0 9 4.03 9 9H20c0-3.87-3.13-7-7-7s-7 3.13-7 7-3.13 7-7 7c0 4.97 4.03 9 9 9v-2c-3.87 0-7-3.13-7-7s3.13-7 7-7z"/>
                                    </svg>
                                    <h3 className="text-lg font-medium mb-2">No order history</h3>
                                    <p className="text-center">Your order history will appear here</p>
                                </div>
                                <button
                                    onClick={() => handleChangeSection('Ordering')}
                                    className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Back to Menu
                                </button>
                            </div>
                        );
                    default:
                        return null;
                }
            })()}
        </div>
    </div>
);
}

