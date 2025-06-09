import {useState, useRef} from "react"
import { Item } from "src/types/item";
import AdminSidebar from '@renderer/components/AdminSidebar'
import MenuEditor from "@renderer/components/MenuEditor";


export default function AdminPage({onChangePage}: {onChangePage:(p: PageName) => void}): React.JSX.Element{
    type AdminSection = 'Profile' | 'Dashboard' | 'MenuEditor';
    const [currentSection, setCurrentSection] = useState<AdminSection>('Dashboard');

    const handleChangeSection = (adminSection: AdminSection) =>{
        setCurrentSection(adminSection)
        console.log('called changing to: ', adminSection)
    }

    return (
        <>
        <AdminSidebar onChangeSection={handleChangeSection} onChangePage={onChangePage}></AdminSidebar>
        {currentSection === 'Dashboard' && <h1>In DASHBOARD</h1>}
        {currentSection === 'MenuEditor' && (
        <>
            <h1>In Menu</h1>
            <MenuEditor />
        </>
        )}

        </>
    )
}