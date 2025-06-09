import {useState, useEffect} from 'react';

import {Item} from '../../../types/item'
export default function Favorites(
    {favoriteItems, onAddToCart, onAddToFavorites, onRemoveFromFavorites, isItemFavorited }:
    {
        favoriteItems: Item[];
        onAddToCart: (item: Item) => void;
        onAddToFavorites: (item: Item) => void;
        onRemoveFromFavorites: (itemId: string) => void;
        isItemFavorited: (itemId: string) => boolean;
    }
) : React.JSX.Element {

    const [showNotification, setShowNotification] = useState(false);
    const [notificationItem, setNotificationItem] = useState('');

    const handleAddToCart = (item) => {
        onAddToCart?.(item);
        setNotificationItem(item.name);
        setShowNotification(true);
    };

    useEffect(() => {
        if (showNotification) {
        const timer = setTimeout(() => {
            setShowNotification(false);
        }, 2000);
        return () => clearTimeout(timer);
        }
    }, [showNotification]);


  return (
    <div className="p-6 overflow-y-auto bg-gray-900 h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 pl-6">My Favorites</h2>
        <p className="text-gray-400 pl-6">Items you've saved for later</p>
      </div>
      
      {favoriteItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" className="mb-4">
            <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
          <p className="text-center">Start adding items to your favorites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 relative">
          {favoriteItems.map((item) => (
            <div key={item.id} className='bg-accent-50 rounded-lg hover:scale-105 transition-transform relative'>
              <div className='w-full flex justify-center items-center overflow-hidden'>
                <img 
                  className='w-full h-80 p-6 object-cover rounded-lg pt-7' 
                  src={`data:${item.img.mime};base64,${item.img.data}`} 
                  alt={item.name || "Product image"} 
                />
              </div>
              
              <div className='p-6'>
                <p className='font-bold text-white'>{item.name}</p>
                <p className='text-gray-500 mb-4'>{item.description}</p>

                <div className='flex items-center justify-between'>
                  <div className='flex gap-3 items-center'>
                    {item.discount > 0 ? (
                      <>
                        <h3 className="line-through text-lg text-white">${item.price}</h3>    
                        <h3 className="text-red-600 font-bold">${(item.price * (1 - item.discount/100)).toFixed(2)}</h3>
                      </>   
                    ) : (
                      <h3 className="text-lg font-bold text-white">${item.price}</h3>
                    )}
                  </div>
                  
                  <button 
                    className="bg-accent-500 hover:bg-accent-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors cursor-pointer text-white" 
                    onClick={() => handleAddToCart(item)}
                    title="Add to cart"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="absolute top-2 right-2 z-10">
                <button 
                  onClick={() => {
                    if (isItemFavorited?.(item.id!)) {
                      onRemoveFromFavorites?.(item.id!);
                    } else {
                      onAddToFavorites?.(item);
                    }
                  }}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isItemFavorited?.(item.id!) 
                      ? 'text-pink-500 hover:text-pink-400' 
                      : 'text-gray-400 hover:text-pink-400'
                  }`}
                  title={isItemFavorited?.(item.id!) ? "Remove from favorites" : "Add to favorites"}
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
          ))}
        </div>
      )}

            {showNotification && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-black px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5 1.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
          </svg>
          <span className="font-medium">{notificationItem} added to cart!</span>
        </div>
      )}
    </div>




  );
};
