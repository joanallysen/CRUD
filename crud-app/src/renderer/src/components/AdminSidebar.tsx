export default function AdminSidebar(
   {categories, onGetItems}:
   {
      categories: string[];
      onGetItems: (category: string, search: string) => void;
   }
) : React.JSX.Element{
    return (
      <div className="h-full">
            <h3 className="font-bold pl-6 pt-6 mb-6">Order</h3>
            <ul className="space-y-2">
                <li>
                    <button className="w-full flex items-center p-6 hover:bg-accent-300" onClick={() => onGetItems('', '')}>All items</button>
                    </li>
                {categories?.map((category, idx) =>{
                    return (
                        <li key={idx}>
                            <button className="w-full flex items-center p-6 text-left hover:bg-accent-300 transition" onClick={() => onGetItems(category, '')}>{category}</button>
                        </li>
                    )
                })}
            </ul>
            
        </div>
    )
}