import {useState, useRef, useEffect, useCallback, useMemo} from "react"
import { Item } from "src/types/item";
import AdminSidebar from '@renderer/components/AdminSidebar'
import MenuEditor from '@renderer/components/MenuEditor'
import LoadingBlur from "@renderer/components/LoadingBlur";
import CategorySidebar from "@renderer/components/CategorySidebar";
import SearchBar from "@renderer/components/SearchBar";

const useItems = () => {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [itemMenuTitle, setItemMenuTitle] = useState<string>('All Items')
  const categoryAndItem = useRef<Map<string, Item[]>>(new Map())

  const handleGetItems = useCallback(async (category: string, search: string) => {
    // Handle search
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
        const allItems = await window.electron.ipcRenderer.invoke('get-item', '', '')
        
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

    // Fetch new category
    const fetchedItems = await window.electron.ipcRenderer.invoke('get-item', category, search)
    categoryAndItem.current.set(category, fetchedItems)
    setItems(fetchedItems)
    setItemMenuTitle(category)
  }, [])

  const isLoading = useMemo(() => categoryAndItem.current.size <= 0, [categoryAndItem.current.size])

  return {
    items,
    categories,
    setCategories,
    itemMenuTitle,
    handleGetItems,
    isLoading
  }
}

export default function AdminPage({onChangePage}: {onChangePage:(p: PageName) => void}): React.JSX.Element{
    type AdminSection = 'Profile' | 'Dashboard' | 'MenuEditor';
    const [currentSection, setCurrentSection] = useState<AdminSection>('Dashboard');

    const handleChangeSection = (adminSection: AdminSection) =>{
        setCurrentSection(adminSection)
        console.log('called changing to: ', adminSection)
    }

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

    // save item cache, after updated, item inside this Category and Item change,
    // after admin has exited the section, item will then be updated to the databse? 
    // update to database directly, using this id, but don't fetch the data again only change in the cache

    const itemOperations = useItems()

    const renderSectionContent = () =>{
        switch(currentSection){
            case 'Dashboard':
                return(
                    <h1>Dashboard</h1>
                )
            case 'MenuEditor':
                return(
                    <>
                        {itemOperations.isLoading && <LoadingBlur />}
                        <div className="grid grid-cols-[10rem_1fr] gap-0 h-full">
                            <div className="bg-gray-900">
                            <CategorySidebar 
                                onGetItem={itemOperations.handleGetItems}
                                categories={itemOperations.categories}
                            />
                            </div>
                            <div className="p-6 overflow-y-auto bg-gray-960">
                            <SearchBar onGetItems={itemOperations.handleGetItems} />
                            <MenuEditor
                                items={itemOperations.items}
                                itemMenuTitle={itemOperations.itemMenuTitle}
                            />
                            </div>
                        </div>
                    </>
                )
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