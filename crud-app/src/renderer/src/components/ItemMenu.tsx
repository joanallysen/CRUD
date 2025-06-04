import {Item} from '../../../types/item'

export default function ItemMenu(
    {onAddToCart, items} :
    {
        onAddToCart: (item: Item) => void;
        items:Item[];
    }
) : React.JSX.Element{
    return(
        <>
            
            {/* Make sure item is loaded first */}
            {items.length > 0 && <h3 className='mb-10'>{items[0].category}</h3>} 
            <div className="scrollbar-custom grid grid-cols-4 gap-10 overflow-y-auto">
        
            {/* Card */}
            {items?.map((item, idx) => {
                return (
                    <div key={idx} className=''>
                        <div className='w-full mb-5'>
                            <img 
                            className='w-full h-70 object-cover rounded-2xl' 
                            src={`data:${item.img.mime};base64,${item.img.data}`} alt="" />
                        </div>
                        <p className='font-bold'>{item.name}</p>
                        <p className='text-gray-400'>{item.description}</p>
                        
                        <div className='flex justify-between text-center'>
                            {item.discount > 0 ?
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-500 line-through text-lg">${item.price}</span>
                                <span className="text-red-600">
                                    <p>${(item.price * (item.discount/100)).toFixed(2)}</p>
                                </span>
                            </div>
                        </div>
                        : <div>
                            <span className='text-gray-500'>${item.price}</span>
                        </div>}
                        
                    
                        <button 
                            className="bg-primary-500 hover:bg-primary-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors" 
                            onClick={() => onAddToCart(item)}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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