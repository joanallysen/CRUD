import {useState, useEffect} from "react"

type PageName = 'userPage' | 'adminPage' | 'loginPage';

import {Item} from '../../../types/item';

export default function UserPage({onChangePage}:{onChangePage: (p: PageName) => void}) : React.JSX.Element{
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [currentCategory, setCurrentCategory] = useState<string>('');

    const handleGetItems = async (category:string, search:string) => {
        setItems(await window.electron.ipcRenderer.invoke('get-item', category, search));
        console.log('items in frontend', items);
    }

    const handleGetCategories = async () =>{
        setCategories(await window.electron.ipcRenderer.invoke('get-unique-category'));
        console.log('categry front end:', categories);
    }

    const changeCategory = async(category) =>{
        handleGetItems(category, '');
    }
    
    useEffect(() =>{
        handleGetItems('food3', '');
        handleGetCategories();
    }, [])

    return (
        <>

        <div className="grid grid-cols-[1fr_3fr_1fr] gap-4 h-full">
            {/* SideBar */}
            <div className="bg-black">
                <ul>
                    {categories?.map((category, idx) =>{
                        return (
                            <li key={idx}>
                                <button className="cursor-pointer" onClick={() => changeCategory(category)}><h2>{category}</h2></button>
                            </li>
                        )
                    })}
                    <li>Food</li>
                    <li>Drink</li>
                </ul>

                <h1 className="text-white">Current: User Page</h1>
                <button className="text-white" onClick={() => onChangePage('loginPage')}>Back to User Page</button>

                
            </div>
            {/* Menu Page */}

            <div className="grid grid-cols-4 gap-4">
                
                {items?.map((item, idx) => {
                    return (
                        <div key={idx}>
                            <img src={`data:${item.img.mime};base64,${item.img.data}`} alt="" />
                            <h2>{item.name}</h2>
                            <h2>${item.price}</h2>
                            <button>Add to cart</button>
                        </div>
                    );
                })}

            </div>

            <div className="bg-black">
                <h1 className="text-white">Current: User Page</h1>
                <button className="text-white" onClick={() => onChangePage('loginPage')}>Back to User Page</button>

                
            </div>
        </div>
        </>
    )
}

