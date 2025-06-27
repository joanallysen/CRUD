import {useState, useRef, useEffect, useCallback} from "react"
import { Item } from "src/types/item";
import AdminSidebar from '@renderer/components/AdminSidebar'
import MenuEditor from '@renderer/components/MenuEditor'
import CategorySidebar from "@renderer/components/CategorySidebar";
import AdminDashboard from "@renderer/components/AdminDashboard";

const useItems = () => {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [itemMenuTitle, setItemMenuTitle] = useState<string>('All Items')
  const categoryAndItem = useRef<Map<string, Item[]>>(new Map())

  // refresh admin view after adding/updating/removing
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentSearch, setCurrentSearch] = useState<string>('');

  const handleGetItems = useCallback(async (category: string, search: string) => {
    setCurrentCategory(category);
    setCurrentSearch(search);

    // Handle search if there's any
    if (search !== '') {
      const regex = new RegExp(search, 'i')
      const itemsMatched: Item[] = []
      
      categoryAndItem.current.forEach((items: Item[]) => {
        items.forEach((item) => {
          if (regex.test(item.name)) {
            itemsMatched.push(item)
          }
        })
      })
      
      setItemMenuTitle(`Showing '${search}'`)
      setItems(itemsMatched)
      return
    }

    // Handle "all items" case
    if (category === '') {
      if (categoryAndItem.current.size === 0) {
        const allItems = await window.electron.ipcRenderer.invoke('get-item')
        
        // Cache items by category
        allItems.forEach((item) => {
          const categoryItems = categoryAndItem.current.get(item.category) || []
          categoryItems.push(item)
          categoryAndItem.current.set(item.category, categoryItems)
        })
        
        setItems(allItems)
      } else {
        const allItems = Array.from(categoryAndItem.current.values()).flat()
        setItems(allItems)
      }

      setItemMenuTitle('All Items')
      return
    }


    // Handle specific category
    if (categoryAndItem.current.has(category)) {
      setItems(categoryAndItem.current.get(category) ?? [])
      setItemMenuTitle(category)
      return
    }

    // temp to see if this still necessary?
    // Fetch new category if new category are made
    // const fetchedItems = await window.electron.ipcRenderer.invoke('get-item', category, search)
    // console.log('is this even ever called');
    // categoryAndItem.current.set(category, fetchedItems)
    // setItems(fetchedItems)
    // setItemMenuTitle(category)
  }, [])


  const refreshCurrentView = useCallback(() => {
    if (currentSearch !== '') {
      // Re-run search
      const regex = new RegExp(currentSearch, 'i')
      const itemsMatched: Item[] = []
      
      categoryAndItem.current.forEach((items: Item[]) => {
        items.forEach((item) => {
          if (regex.test(item.name)) {
            itemsMatched.push(item)
          }
        })
      })
      
      setItems(itemsMatched)
    } else if (currentCategory === '') {
      // Show all items
      const allItems = Array.from(categoryAndItem.current.values()).flat()
      setItems(allItems)
    } else {
      // Show specific category
      setItems(categoryAndItem.current.get(currentCategory) ?? [])
    }
  }, [currentCategory, currentSearch])


  // add to the cache
  const addItemCache = useCallback((item: Item) => {
    if (categoryAndItem.current.has(item.category)) {
      categoryAndItem.current.get(item.category)!.push(item);
    } else {
      categoryAndItem.current.set(item.category, [item]);
      setCategories(prev =>
        prev.includes(item.category) ? prev : [...prev, item.category]
      );
    }
    refreshCurrentView();
  }, [refreshCurrentView]);

  // update an item in the cache
  const updateItemCache = useCallback((updatedItem: Item) => {
    for (const [category, items] of categoryAndItem.current.entries()) {
      const index = items.findIndex(item => item.id === updatedItem.id);
      if (index === -1) continue;

      if (category === updatedItem.category) {
        // Same category, just update
        const newItems = [...items];
        newItems[index] = updatedItem;
        categoryAndItem.current.set(category, newItems);
        refreshCurrentView();
        return;
      } else {
        const newItems = items.filter(item => item.id !== updatedItem.id);
        if (newItems.length === 0) {
          categoryAndItem.current.delete(category);
          setCategories(prev => prev.filter(cat => cat !== category));
        } else {
          categoryAndItem.current.set(category, newItems);
        }
        break;
      }
    }
  
    // add to new category
    if (categoryAndItem.current.has(updatedItem.category)) {
      categoryAndItem.current.get(updatedItem.category)!.push(updatedItem);
    } else {
      categoryAndItem.current.set(updatedItem.category, [updatedItem]);
      setCategories(prev => prev.includes(updatedItem.category) ? prev : [...prev, updatedItem.category]);
    }
    
    refreshCurrentView();
  }, [refreshCurrentView]);

  // remove an item from the cache
  const removeItemCache = useCallback((itemId: string, category: string) => {
    if (categoryAndItem.current.has(category)) {
      const item = categoryAndItem.current.get(category)!.filter(item => item.id !== itemId);
      categoryAndItem.current.set(category, item);
    }
    refreshCurrentView();
  }, [refreshCurrentView]);


  
  return {
    items,
    categories,
    setCategories,
    itemMenuTitle,
    handleGetItems,
    addItemCache, updateItemCache, removeItemCache
  }
}

export default function AdminPage({onChangePage}: {onChangePage:(p: PageName) => void}): React.JSX.Element{
    type AdminSection = 'Profile' | 'Dashboard' | 'MenuEditor';
    const [currentSection, setCurrentSection] = useState<AdminSection>('Dashboard');

    const handleChangeSection = (adminSection: AdminSection) =>{
        setCurrentSection(adminSection)
        console.log('called changing to: ', adminSection)
    }

    const itemOperations = useItems()

    useEffect(() => {
        const loadData = async () => {
          try {
            // Load items and categories
            await itemOperations.handleGetItems('', '')
            const categoriesData = await window.electron.ipcRenderer.invoke('get-unique-category')
            itemOperations.setCategories(categoriesData)
          } catch (error) {
            console.error('Error loading initial data:', error)
          }
        }
    
        loadData()
      }, [])



    const renderSectionContent = () =>{
        switch(currentSection){
            case 'Dashboard':
                return(
                    <AdminDashboard />
                )
            case 'MenuEditor':
                return(
                    <>
                        <div className="grid grid-cols-[10rem_1fr] gap-0 h-full">
                            <div className="bg-gray-900">
                            <CategorySidebar 
                                onGetItem={itemOperations.handleGetItems}
                                categories={itemOperations.categories}
                                isAdmin={true}
                            />
                            </div>
                            <div className="p-6 overflow-y-auto bg-gray-960">
                            <MenuEditor
                                items={itemOperations.items}
                                itemMenuTitle={itemOperations.itemMenuTitle}
                                onGetItems={itemOperations.handleGetItems}
                                onAddItemCache={itemOperations.addItemCache}
                                onUpdateItemCache={itemOperations.updateItemCache}
                                onRemoveItemCache={itemOperations.removeItemCache}
                            />
                            </div>
                        </div>
                    </>
                )
                default:
                  return;
        }
    }
    return (
    <div className="grid grid-cols-[4rem_1fr] h-screen bg-background">
      <div className="bg-gray-800">
        <AdminSidebar onChangeSection={handleChangeSection} onChangePage={onChangePage}/>
      </div>
      <div className="h-full w-full">
        {renderSectionContent()}
      </div>
    </div>

        )
}