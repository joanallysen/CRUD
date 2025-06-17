import React from 'react'
import {idAmountAndItemObject} from 'src/types/order' 

export default function HistoryItem({
    idAmountAndItemObject
}: {
    idAmountAndItemObject: idAmountAndItemObject;
}): React.JSX.Element {
    

    // item could be deleted by admin
    if(idAmountAndItemObject.itemDetails){
        const totalPrice = (idAmountAndItemObject.itemDetails.price * idAmountAndItemObject.amount).toFixed(2)
        return (
            <div className='flex items-center gap-6 p-4 bg-accent-50 rounded-xl relative sm:gap-4'>
        
              {/* Item Image */}
              <div className='w-24 h-24 flex-shrink-0'>
                <img
                  className='w-full h-full object-cover rounded-lg border'
                  src={`data:${idAmountAndItemObject.itemDetails.img.mime};base64,${idAmountAndItemObject.itemDetails.img.data}`}
                  alt={idAmountAndItemObject.itemDetails.name}
                />
              </div>
        
              {/* Item Details */}
              <div className='flex-1 min-w-0'>
                <p className='font-bold text-white mb-1 truncate'>{idAmountAndItemObject.itemDetails.name}</p>
                <p className='text-white mb-2'>${idAmountAndItemObject.itemDetails.price - idAmountAndItemObject.itemDetails.price * (idAmountAndItemObject.itemDetails.discount / 100)} each</p>
                <p className='font-semibold text-gray-400'>Total: ${totalPrice}</p>
              </div>
        
            </div>
          )
    } else{
        return(
            <div className='flex items-center align-center p-4 bg-accent-50 rounded-xl'>
                <p className='font-bold'>Item removed from menu or not found</p>
            </div>
        )
    }

}