import {useCallback, useRef, useState} from 'react'
import {Item} from '../../../types/item'
import Notification from './Notification';

export default function AddItemPanel(
    {onClosePanel, onAddItemCache}:
    {
        onClosePanel: () => void;
        onAddItemCache: (item: Item) => void;
    }

): React.JSX.Element{
    const [imgSrc, setImgSrc] = useState<string>('');
    const [imgData, setImgData] = useState<{mime: string; data: string}>({mime: '', data: ''});
    // Buffer is undefined on frontend
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>('');
    const deactivateNotification = useCallback(() =>{
        setNotificationMessage('');
        setShowNotification(false);
    }, [])

    const nameRef = useRef<HTMLInputElement>(null);
    const descRef = useRef<HTMLInputElement>(null);
    const priceRef = useRef<HTMLInputElement>(null);
    const categoryRef = useRef<HTMLInputElement>(null);
    const discountRef = useRef<HTMLInputElement>(null);
    const availableRef = useRef<HTMLInputElement>(null);

    
    const chooseImage = async () =>{
        const result = await window.electron.ipcRenderer.invoke('choose-image');
        if (result){
            console.log('Image selected', result.mime, result.data);
            setImgSrc(`data:${result.mime};base64,${result.data}`);
            setImgData({mime: result.mime, data: result.data});
        }
    }

    const handleAddItem = async () =>{
        console.log(`adding, adminpage.tsx handle add item`);
        
        const name = nameRef.current?.value.trim() ?? '';
        setNotificationMessage(`${name} has been added to the menu!`);
        setShowNotification(true);

        const desc = descRef.current?.value.trim() ?? '';
        const price = parseFloat(priceRef.current?.value.trim() ?? '0');
        const category = categoryRef.current?.value.trim() ?? '';
        const discount = parseFloat(discountRef.current?.value.trim() ?? '0');
        const available = availableRef.current?.checked ?? false;

        const item : Item = {
            name: name,
            description: desc,
            price: price,
            img: imgData,
            category: category,
            discount: discount,
            available: available,
            popularity: 0,
            modifiedAt: new Date
        };
        // handle to the cloud
        await window.electron.ipcRenderer.invoke('add-item', item);
        // handle temp cache
        onAddItemCache(item);

        // remove input box value
        nameRef.current!.value = '';
        descRef.current!.value = '';
        priceRef.current!.value = '';
        categoryRef.current!.value = '';
        discountRef.current!.value = '';
        availableRef.current!.checked = false;
        setImgSrc('');
        setImgData({mime: '', data: ''});
    }


    return(
        <div className="flex m-auto flex-col w-full p-6 relative">
        <h2 className='p-6 text-center'>Add New Item</h2>

        <label className="block  mb-2 text-left">Item image </label>


        {imgSrc !== '' ? (
            <div className='relative'>
                <img className='object-cover w-full h-100' src={imgSrc} alt="IMAGE" />
                <button className='absolute top-5 right-5 cursor-pointer' onClick={() => setImgSrc('')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <defs>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.5"/>
                            </filter>
                        </defs>
                        <path
                            filter="url(#shadow)"
                            fill="white"
                            d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                        />
                    </svg>
                </button>
            </div>
            ) :         
            <button className='mb-6 flex flex-col items-center justify-center text-center border-dashed border-white border-2 cursor-pointer w-full h-100' onClick={chooseImage}>
                <span className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="72" stroke-dashoffset="72" d="M3 14v-9h18v14h-18v-5"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="72;0"/></path><path stroke-dasharray="24" stroke-dashoffset="24" stroke-width="1" d="M3 16l4 -3l3 2l6 -5l5 4"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.4s" values="24;0"/></path></g><circle cx="7.5" cy="9.5" r="1.5" fill="currentColor" fill-opacity="0"><animate fill="freeze" attributeName="fill-opacity" begin="1s" dur="0.2s" values="0;1"/></circle></svg>
                </span>
                <label className='text-gray-500'>Add Picture</label>
            </button>
        }

            <label className="block  mb-2 text-left">Name </label>
            <input  name="name" type="text" placeholder="Name" className={`input`} ref={nameRef}/>
            <label className="block  mb-2 text-left">Description </label>
            <input  name="name" type="text" placeholder="Description" className={`input`} ref={descRef}/>
            <label className="block  mb-2 text-left">Price </label>
            <input  name="category" type="number" placeholder="5" className={`input`} ref={priceRef}/>

            <label className="block  mb-2 text-left"> Category </label>
            <input  name="name" type="text" placeholder="Food" className={`input`} ref={categoryRef}/>

            <label className="block  mb-2 text-left">Discount </label>
            <input name="name" type="number" placeholder="%" className={'input mb-8'} ref={discountRef}/>

            <div className="flex items-center mb-8 justify-between">
                
                <label  className=" select-none cursor-pointer">
                    Available
                </label>

                <input
                    name="available"
                    type="checkbox"
                    className="w-6 h-6 border-2 border-white rounded-full checked:bg-green cursor-pointer transition-all"
                    ref={availableRef}
                />
            </div>

            <button className='button' onClick={handleAddItem}>Submit</button>

            
            
            <button className='absolute top-5 right-5 cursor-pointer' onClick={onClosePanel}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="white" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"/></svg>
            </button>

            {showNotification && (
                <Notification notificationMessage={notificationMessage} onNotificationEnd={deactivateNotification} />
            )}
    </div>
    )
}