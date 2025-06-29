import { Item } from 'src/types/item'
import {useState, useCallback, useEffect} from 'react'
import Notification from '../components/Notification'


export default function UpdateItemPanel(
    {onClosePanel, onUpdateItemCache, currentItem}:
    {
        onClosePanel: () => void;
        onUpdateItemCache: (updatedItem: Item) => void;
        currentItem: Item
    }
) : React.JSX.Element{
    const [imgSrc, setImgSrc] = useState<string>(`data:${currentItem.img.mime};base64,${currentItem.img.data}`);
    const [imgData, setImgData] = useState<{mime: string, data:string}>({
        mime: currentItem.img.mime,
        data: typeof currentItem.img.data === 'string'
            ? currentItem.img.data
            : currentItem.img.data
                ? Buffer.isBuffer(currentItem.img.data)
                    ? currentItem.img.data.toString('base64')
                    : String(currentItem.img.data)
                : ''
    });

    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>('Item successfully updated!');

    const deactivateNotification = useCallback(() =>{
        setNotificationMessage('');
        setShowNotification(false);
    }, [])

    const handleUpdateItem = () =>{
        const updatedItem : Item = {
            id: currentItem.id,
            name: name || '',
            description: description || '',
            price: parseFloat(price) || 0,
            img: imgData,
            category: category || '',
            discount: parseFloat(discount) || 0, 
            available: available || false,
            popularity: currentItem.popularity,
            modifiedAt: new Date
        }
        
        onUpdateItemCache(updatedItem)
        setShowNotification(true);
        setNotificationMessage(`${name} has been updated!`)
        window.electron.ipcRenderer.invoke('update-item', updatedItem)
    }

    const chooseImage = async () =>{
        const result = await window.electron.ipcRenderer.invoke('choose-image');
        if (result){
            console.log('Image selected', result.mime, result.data);
            setImgSrc(`data:${result.mime};base64,${result.data}`);
            setImgData({mime: result.mime, data: result.data});
        }
    }

    // useState for easier intial value
    const [name, setName] = useState(currentItem.name || '');
    const [description, setDescription] = useState(currentItem.description || '');
    const [price, setPrice] = useState(String(currentItem.price) || '');
    const [category, setCategory] = useState(currentItem.category || '');
    const [discount, setDiscount] = useState(String(currentItem.discount ?? '') || '');
    const [available, setAvailable] = useState(!!currentItem.available);

    useEffect(() => {
        setName(currentItem.name || '');
        setDescription(currentItem.description || '');
        setPrice(String(currentItem.price) || '');
        setCategory(currentItem.category || '');
        setDiscount(String(currentItem.discount ?? '') || '');
        setAvailable(!!currentItem.available);
        setImgSrc(`data:${currentItem.img.mime};base64,${currentItem.img.data}`);
        setImgData({
            mime: currentItem.img.mime,
            data: typeof currentItem.img.data === 'string'
                ? currentItem.img.data
                : currentItem.img.data
                    ? Buffer.isBuffer(currentItem.img.data)
                        ? currentItem.img.data.toString('base64')
                        : String(currentItem.img.data)
                    : ''
        });
    }, [currentItem]);

    return(
        <div className="flex m-auto flex-col w-full p-6 relative">
            <h2 className='p-6 text-center'>Update {name}</h2>

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

            {/* Todo form required is pretty nmuch useless */}
            <label className="block  mb-2 text-left">Name </label>
            <input className='input' value={name} onChange={(e) => setName(e.target.value)} />
            <label className="block  mb-2 text-left">Description </label>
            <input className='input' value={description} onChange={(e) => setDescription(e.target.value)} />
            <label className="block  mb-2 text-left">Price </label>
            <input className='input' value={price} onChange={(e) => setPrice(e.target.value)} />
            <label className="block  mb-2 text-left">Category </label>
            <input className='input' value={category} onChange={(e) => setCategory(e.target.value)} />
            <label className="block  mb-2 text-left">Discount </label>
            <input className='input' value={discount} onChange={(e) => setDiscount(e.target.value)} />

            <div className="flex items-center mb-8 justify-between">
                <label className="block  mb-2 text-left">Availability </label>
            <input className='w-6 h-6 border-2 border-white rounded-full checked:bg-green cursor-pointer transition-all' checked={available} onChange={(e) => setAvailable(e.target.checked)} type="checkbox" />
            </div>
            
            <button className='button' onClick={handleUpdateItem}>Update</button>

            
            
            <button className='absolute top-5 right-5 cursor-pointer' onClick={onClosePanel}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="white" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"/></svg>
            </button>

            {showNotification && (
                <Notification notificationMessage={notificationMessage} onNotificationEnd={deactivateNotification} />
            )}
    </div>
    )
}