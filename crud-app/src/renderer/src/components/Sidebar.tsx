export default function CustomerSidebar(
    {onGetItem, categories}:
    {
        onGetItem:(category: string, search: string) => void;
        categories: string[];
    }
) : React.JSX.Element{
    return(
        <>
        <div className="p-6 h-full">
            <h1 className="font-bold mb-6">Order</h1>
            <ul className="space-y-2">
                <li>
                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-primary-600" onClick={() => onGetItem('', '')}>All items</button>
                    </li>
                {categories?.map((category, idx) =>{
                    return (
                        <li key={idx}>
                            <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-primary-600 transition" onClick={() => onGetItem(category, '')}>{category}</button>
                        </li>
                    )
                })}
            </ul>
        </div>
               
        </>
    )
}