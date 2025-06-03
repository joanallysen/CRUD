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
            {items.length > 0 && <h2>{items[1].category}</h2>} 
            <div className="grid grid-cols-4 gap-4">
        
            {/* Card */}
            {items?.map((item, idx) => {
                return (
                    <div key={idx} className='rounded-xl bg-background-50 p-6 hover:shadow-lg transition-shadow'>
                        <div className='w-40 aspect-square overflow-hidden rounded-xl mb-4'>
                            <img className="w-full h-full object-cover" src={`data:${item.img.mime};base64,${item.img.data}`} alt="" />
                        </div>
                        <h5 className='font-bold'>{item.name}</h5>
                        <p>{item.description}</p>
                        
                        <div className='flex justify-between text-center'>
                            {item.discount > 0 ?
                        <div>
                            <span className='inline-block bg-red-100 text-red-600 font-semibold px-2 py-1 rounded-full mb-2'>
                                {item.discount}% OFF
                            </span>

                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 line-through text-lg">${item.price}</span>
                                    <span className="text-xl font-bold text-red-600">
                                        ${(item.price * (item.discount/100)).toFixed(2)}
                                    </span>
                                </div>
                        </div>
                        : <div>
                            <span className="text-xl font-bold text-text">${item.price}</span>
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