import {useState, useRef} from "react"
import uploadPicture from '../assets/uploadPicture.svg'; 


type PageName = 'userPage' | 'adminPage' | 'loginPage';

export default function AdminPage({onChangePage}: {onChangePage:(p: PageName) => void}): React.JSX.Element{
    const [imgSrc, setImgSrc] = useState<string>('');
    const [imgData, setImgData] = useState<{mime: string; data: string}>({mime: '', data: ''});
    // Buffer is undefined on frontend
    const [imgBuffer, setImgBuffer] = useState<string>('');
    const categoryRef = useRef<HTMLInputElement>(null);

    
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
        if (categoryRef.current) {
            console.log('categoryRef: ', categoryRef.current.value);
            categoryRef.current.value = categoryRef.current.value.trim();
        }

        await window.electron.ipcRenderer.invoke('add-item',
            'default name',
            'default description',
            0.00,
            imgData,
            categoryRef.current?.value,
            true,
            5,
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

                
                <div>
                    <label className="block text-white text-sm mb-2 text-left">
                    Category
                    </label>
                    <input
                    name="Category"
                    type="category"
                    placeholder="New Food"
                    className={`input`}
                    ref={categoryRef}
                    />
                </div>
                <button className={'button bg-white'} onClick={handleAddItem}>Add Item</button>

                

            </div>

        </>
    )
}