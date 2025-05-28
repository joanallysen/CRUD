import {useState, useRef} from "react"
import uploadPicture from '../assets/uploadPicture.svg'; 


export default function AdminPage({onChangePage}: {onChangePage:(p: PageName) => void}): React.JSX.Element{
    const [imgSrc, setImgSrc] = useState<string>('');
    const [imgData, setImgData] = useState<{mime: string; data: string}>({mime: '', data: ''});
    // Buffer is undefined on frontend

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
        const desc = descRef.current?.value.trim() ?? '';
        const price = parseFloat(priceRef.current?.value.trim() ?? '0');
        const category = categoryRef.current?.value.trim() ?? '';
        const discount = discountRef.current?.value.trim() ?? '';
        const available = availableRef.current?.checked ?? false;

        await window.electron.ipcRenderer.invoke('add-item',
            name,
            desc,
            price,
            imgData,
            category, 
            discount,
            available, // availability
            0, // popularity, similar to number buyed, default
        );
    }

    return (
        <>
            <h1>Current: Admin Page</h1>
            <button className="button" onClick={() => onChangePage('loginPage')}>Go to Login Page</button>

            <div className="flex m-auto flex-col w-120">
                <button className='button bg-white inline-flex items-center text-center justify-center' onClick={chooseImage}>
                    Choose Image
                    <img src={uploadPicture} alt="PLACEHOLDER" className="invert" />
                </button>
                    {imgSrc !== '' ? (
                            <img src={imgSrc} alt="IMAGE" />
                        ) : null
                    }

                {/* Todo form required is pretty nmuch useless */}
                <label className="block text-white text-sm mb-2 text-left">Name </label>
                <input  name="name" type="text" placeholder="Name" className={`input`} ref={nameRef}/>
                <label className="block text-white text-sm mb-2 text-left">Description </label>
                <input  name="name" type="text" placeholder="Description" className={`input`} ref={descRef}/>
                <label className="block text-white text-sm mb-2 text-left">Price </label>
                <input  name="category" type="number" placeholder="5" className={`input`} ref={priceRef}/>

                <label className="block text-white text-sm mb-2 text-left"> Category </label>
                <input  name="name" type="text" placeholder="Food" className={`input`} ref={categoryRef}/>

                <label className="block text-white text-sm mb-2 text-left">Discount </label>
                <input name="name" type="number" placeholder="%" className={'input'} ref={discountRef}/>

                <label className="block text-white text-sm mb-2 text-left">Available </label>
                <input name="name" type="checkbox" className={`input`} ref={availableRef}/>
                <button onClick={handleAddItem}>Submit</button>

            </div>

        </>
    )
}