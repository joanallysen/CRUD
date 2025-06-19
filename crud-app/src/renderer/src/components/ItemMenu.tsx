import { useState, useMemo } from 'react';
import {Item} from '../../../types/item'

export default function ItemMenu(
    {onAddToCart, items,  itemMenuTitle, onAddToFavorites, onRemoveFromFavorites, isItemFavorited} :
    {
        onAddToCart: (item: Item) => void;
        items:Item[];
        itemMenuTitle: string;

        onAddToFavorites: (item: Item) => void;
        onRemoveFromFavorites: (itemId: string) => void;
        isItemFavorited: (itemId: string) => boolean;
    }
) : React.JSX.Element{

    // need to hide unavailable item
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const aIsFavorited = isItemFavorited(a.id!);
            const bIsFavorited = isItemFavorited(b.id!);

            // Favorited items come first
            if (aIsFavorited && !bIsFavorited) return -1;
            if (!aIsFavorited && bIsFavorited) return 1;

            // If both have same favorite status, sort by popularity descending
            if (a.popularity > b.popularity) return -1;
            if (a.popularity < b.popularity) return 1;

            // Maintain original order if all else equal
            return 0;
        });
    }, [items, isItemFavorited]);

    return(
        <>
            
            {/* Make sure item is loaded first */}
            <h3 className='mb-10 font-bold'>{itemMenuTitle}</h3> 
            <div
                className={`scrollbar-custom grid gap-5 overflow-y-auto w-full}`}
                style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 320px))",
                }}
            >
        
            {/* Card */}
            {sortedItems?.map((item) => {
                return (
                    <div key={item.id} className='bg-accent-50 rounded-lg transition-transform relative'>
                        <div className='w-full flex justify-center items-center overflow-hidden'>
                            <img 
                                className='w-80 h-80 p-6 object-cover rounded-4xl pt-7' 
                                src={`data:${item.img.mime};base64,${item.img.data}`} 
                                alt="" 
                            />
                        </div>
                        <div className='p-6'>
                            <p className='font-bold'>{item.name}</p>
                            <p className='text-gray-400'>{item.description}</p>

                            <span className='flex gap-3'>
                            {item.discount > 0 ?
                            <>
                                <h3 className= "line-through text-lg">${item.price}</h3>    
                                <h3 className="text-red-600">${(item.price -(item.price * (item.discount/100))).toFixed(2)}</h3>
                            </>   
                            : <h3>${item.price}</h3>}
                            <div className="flex-1"></div>
                            <button 
                                className="bg-accent-500 hover:bg-accent-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors cursor-pointer" 
                                onClick={() => onAddToCart(item)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                            </span>
                        </div>
                        <div className="absolute top-2 right-2 z-10">
                            <button 
                                onClick={() => {
                                    if (isItemFavorited && isItemFavorited(item.id!)) {
                                        onRemoveFromFavorites?.(item.id!);
                                    } else {
                                        onAddToFavorites?.(item);
                                    }
                                }}
                                className={`p-2 rounded-full transition-colors cursor-pointer ${
                                    isItemFavorited && isItemFavorited(item.id!) 
                                    ? 'text-pink-500 hover:text-pink-400' 
                                    : 'text-gray-400 hover:text-pink-400'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                                    <path 
                                        fill="currentColor" 
                                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                        
                );
            })}

            </div>
        </>
    )
}