import { useState, useMemo } from 'react';
import {Item} from '../../../types/item'
import SearchBar from './SearchBar';
import AddItemPanel from './AddItemPanel';
import UpdateItemPanel from './UpdateItemPanel';

export default function MenuEditor(
    {items,  itemMenuTitle, onGetItems, onAddItemCache, onUpdateItemCache, onRemoveItemCache} :
    {
        items:Item[];
        itemMenuTitle: string;
        onGetItems: (category: string, search: string) => void; 
        onAddItemCache: (item: Item) => void;
        onUpdateItemCache: (updatedItem: Item) => void;
        onRemoveItemCache: (itemId: string, category: string) => void;
    }
) : React.JSX.Element{
    const [currentEditedItem, setCurrentEditedItem] = useState<Item>();
    const [editPanelOpen, setEditPanelOpen] = useState<boolean>(false);
    const [addPanelOpen, setAddPanelOpen] = useState<boolean>(false);

    const handleEdit = (item: Item) => {
        if(editPanelOpen && currentEditedItem?.id === item.id){
            setEditPanelOpen(false);
            return;
        }
        // Otherwise, open the panel and set the new item to edit
        setEditPanelOpen(true);
        setCurrentEditedItem(item);
    }

    const handleAdd = () => {
        if(addPanelOpen){
            setAddPanelOpen(false);
            return;
        }
        setAddPanelOpen(true);
    }

    const handleRemove = (itemId: string, category: string) =>{
        onRemoveItemCache(itemId, category);
        window.electron.ipcRenderer.invoke('remove-item', itemId);
    }

    const closeEditPanel = () => {
        setEditPanelOpen(false);
    }
    
    return(
        <>
            {/* Make sure item is loaded first */}
            <div className={`${editPanelOpen ? 'w-[75%]' : 'w-[90%]'}  `}>
                <SearchBar onGetItems={onGetItems}></SearchBar>
            </div>
            <h3 className='mb-10 font-bold'>{itemMenuTitle}</h3> 
            <div
                className={`scrollbar-custom grid gap-5 overflow-y-auto ${editPanelOpen ? 'w-[80%]' : 'w-full'}`}
                style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 320px))",
                }}
            >
            {/* Card */}
            {items?.map((item) => {
                return (
                    <div key={item.id} className='bg-accent-50 rounded-lg hover:scale-105 transition-transform relative'>
                        <div className='w-full flex justify-center items-center overflow-hidden'>
                            <img 
                                className='w-80 h-80 p-6 object-cover rounded-4xl pt-7' 
                                src={`data:${item.img.mime};base64,${item.img.data}`} 
                                alt="" 
                            />
                        </div>
                        <div className='p-6'>
                            <p className='font-bold'>{item.name}</p>
                            <p className='text-gray-400'>{item.description}</p>

                            <span className='flex gap-3'>
                            {item.discount > 0 ?
                            <>
                                <h3 className= "line-through text-lg">${item.price}</h3>    
                                <h3 className="text-red-600">${(item.price-(item.price * (item.discount/100))).toFixed(2)}</h3>
                            </>   
                            : <h3>${item.price}</h3>}

                            <div className="flex-1"></div>

                            <div className='flex gap-2'>
                                <button
                                    className="bg-red-500 hover:bg-red-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors cursor-pointer" 
                                    onClick={() => handleRemove(item.id!, item.category)}
                                    aria-label="Delete item"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"/>
                                    </svg>
                                </button>
                                <button
                                    className="bg-accent-500 hover:bg-accent-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors cursor-pointer" 
                                    onClick={() => handleEdit(item)}
                                    aria-label="Edit item"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M4 21q-.425 0-.712-.288T3 20v-2.425q0-.4.15-.763t.425-.637L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.437.65T21 6.4q0 .4-.138.763t-.437.662l-12.6 12.6q-.275.275-.638.425t-.762.15zM17.6 7.8L19 6.4L17.6 5l-1.4 1.4z"/>
                                    </svg>
                                </button>
                            </div>
                            </span>
                        </div>
                    </div>  
                );
            })}
            {/* Add new item card */}
            <div
                className="flex flex-col items-center justify-center bg-accent-100 rounded-lg cursor-pointer hover:scale-105 transition-transform min-h-[22rem] min-w-[18rem] h-80"
                onClick={() => (false)}
            >
                <button
                    className="flex flex-col items-center justify-center w-full h-full focus:outline-none"
                    onClick={() => setEditPanelOpen(false)}
                    tabIndex={-1}
                >
                    <span className="text-accent-500">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="12" fill="#e0e7ff"/>
                            <path d="M12 7v10M7 12h10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </span>
                    <span className="mt-4 text-accent-500 font-semibold text-lg">Add New Item</span>
                </button>
            </div>

            </div>
            <div className={`fixed top-0 bottom-0 right-0 w-110 bg-accent-50 shadow-lg transition-transform duration-300 z-50 ${editPanelOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ overflowY: 'auto' }}>
                {currentEditedItem && ( <UpdateItemPanel onClosePanel={closeEditPanel} onUpdateItemCache={onUpdateItemCache} currentItem={currentEditedItem}></UpdateItemPanel>)}
            </div>

        </>
    )
}