import { useState } from 'react';
import {Item} from '../../../types/item'

export default function ItemMenu(
    {onAddToCart, items,  itemMenuTitle} :
    {
        onAddToCart: (item: Item) => void;
        items:Item[];
        itemMenuTitle: string;
    }
) : React.JSX.Element{

    return(
        <>
            
            {/* Make sure item is loaded first */}
            <h3 className='mb-10 font-bold'>{itemMenuTitle}</h3> 
            <div className="scrollbar-custom grid grid-cols-4 gap-5 overflow-y-auto">
        
            {/* Card */}
            {items?.map((item, idx) => {
                return (
                    <div key={idx} className='bg-accent-50 rounded-lg hover:scale-105 transition-transform'>
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
                                <h3 className="text-red-600">${(item.price * (item.discount/100)).toFixed(2)}</h3>
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

                        
                    </div>
                        
                );
            })}

            </div>
        </>
    )
}