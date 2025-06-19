import {useState} from "react";

export default function CategorySidebar(
    {onGetItem, categories}:
    {
        onGetItem:(category: string, search: string) => void;
        categories: string[];
    }
) : React.JSX.Element{
    const [activeCategory, setActiveCategory] = useState<string>('') // Track active category
    
    const handleCategoryClick = (category: string) => {
        setActiveCategory(category);
        onGetItem(category, '');
    }
    
    return(
        <>
        <div className="h-full fixed w-40">
            <h3 className="font-bold pl-6 pt-6 mb-6">Order</h3>
            <ul className="list-none p-0 m-0">
                <li>
                    <button 
                        className={`cursor-pointer font-bold w-full flex items-center p-6 text-left transition ${
                            activeCategory === '' 
                                ? 'bg-accent-300' 
                                : 'hover:bg-accent-300'
                        }`}
                        onClick={() => handleCategoryClick('')}
                    >
                        All items
                    </button>
                </li>

                <li>
                    <button 
                        className={`cursor-pointer font-bold w-full flex items-center p-6 text-left transition ${
                            activeCategory === "Special deals" 
                                ? 'bg-accent-300' 
                                : 'hover:bg-accent-300'
                        }`}
                        onClick={() => handleCategoryClick("Special deals")}
                    >
                        Special deals
                    </button>
                </li>
                {categories?.map((category, idx) =>{
                    return (
                        <li key={idx}>
                            <button 
                                className={`cursor-pointer font-bold w-full flex items-center p-6 text-left transition ${
                                    activeCategory === category 
                                        ? 'bg-accent-300' 
                                        : 'hover:bg-accent-300'
                                }`}
                                onClick={() => handleCategoryClick(category)}
                            >
                                {category}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
        </>
    )
}