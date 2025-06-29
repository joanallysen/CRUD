import { useState } from "react";

type AdminSection = 'Profile' | 'Dashboard' | 'MenuEditor';
export default function AdminSidebar(
    {onChangeSection, onChangePage}:
    {   
        onChangeSection : (adminSection : AdminSection) => void;
        onChangePage: (newPage : PageName) => void;
    }
) : React.JSX.Element {

    const [activeIcon, setActiveIcon] = useState<string>('Ordering');

    const handleIconClick = (section: AdminSection) => {
        setActiveIcon(section);
        onChangeSection(section);
    }

    return (
        <div className="fixed top-0 left-0 w-16 h-screen flex flex-col items-center py-8 bg-gray-800 z-50">
            <ul className="flex flex-col items-center space-y-8 flex-1">
                {/* Profile/User - Maps to Ordering */}
                <li className="group relative">
                    <svg 
                        className={`transition-colors cursor-pointer ${
                            activeIcon === 'Profile' ? '' : 'text-gray-400 hover:'
                        }`}
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24"
                        onClick={() => handleIconClick('Profile')}
                    >
                        <path fill="currentColor" d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                    </svg>
                    <span className="absolute w-auto p-2 min-w-max left-16 top-1/2 -translate-y-1/2 rounded-md shadow-md  bg-gray-900 text-sm transition-all duration-200 scale-0 origin-left group-hover:scale-100 z-[999] border border-gray-700">
                        Profile
                    </span>
                </li>

                {/* Dashboard */}
                <li className="group relative">
                    <svg 
                        className={`transition-colors cursor-pointer ${
                            activeIcon === 'Dashboard' ? '' : 'text-gray-400 hover:'
                        }`} 
                        onClick={() => handleIconClick('Dashboard')}
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24"
                    >
                        <g fill="none" stroke="currentColor">
                            <rect width="18.5" height="18.5" x="2.75" y="2.75" strokeWidth="1.5" rx="6"/>
                            <path strokeLinecap="round" strokeWidth="1.6" d="M7.672 16.222v-5.099m4.451 5.099V7.778m4.205 8.444V9.82"/>
                        </g>
                    </svg>
                    <span className="absolute w-auto p-2 min-w-max left-16 top-1/2 -translate-y-1/2 rounded-md shadow-md  bg-gray-900 text-sm transition-all duration-200 scale-0 origin-left group-hover:scale-100 z-50 border border-gray-700">
                        Dashboard
                    </span>
                </li>

                {/* Edit Menu */}
                <li className="group relative">
                    <svg 
                        className={`transition-colors cursor-pointer ${
                            activeIcon === 'MenuEditor' ? '' : 'text-gray-400 hover:'
                        }`}
                        onClick={() => handleIconClick('MenuEditor')}
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24"
                    >
                        <path fill="currentColor" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m0 14H4v-6h16zm0-10H4V6h16z"/>
                    </svg>
                    <span className="absolute w-auto p-2 min-w-max left-16 top-1/2 -translate-y-1/2 rounded-md shadow-md  bg-gray-900 text-sm transition-all duration-200 scale-0 origin-left group-hover:scale-100 z-50 border border-gray-700">
                        Edit Menu
                    </span>
                </li>
            </ul>

            {/* Logout at bottom */}
            <div className="group relative mt-auto">
                <svg 
                    className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24"
                    onClick={() => onChangePage('loginPage')}
                >
                    <path fill="currentColor" d="M12 18.25a.75.75 0 0 0 0 1.5h6A1.75 1.75 0 0 0 19.75 18V6A1.75 1.75 0 0 0 18 4.25h-6a.75.75 0 0 0 0 1.5h6a.25.25 0 0 1 .25.25v12a.25.25 0 0 1-.25.25z"/>
                    <path fill="currentColor" fillRule="evenodd" d="M14.503 14.365c.69 0 1.25-.56 1.25-1.25v-2.24c0-.69-.56-1.25-1.25-1.25H9.89l-.02-.22l-.054-.556a1.227 1.227 0 0 0-1.751-.988a15 15 0 0 0-4.368 3.164l-.099.103a1.253 1.253 0 0 0 0 1.734l.1.103a15 15 0 0 0 4.367 3.164a1.227 1.227 0 0 0 1.751-.988l.054-.556l.02-.22zm-5.308-1.5a.75.75 0 0 0-.748.704q-.028.435-.07.871l-.016.162a13.6 13.6 0 0 1-3.516-2.607a13.6 13.6 0 0 1 3.516-2.607l.016.162q.042.435.07.871a.75.75 0 0 0 .748.704h5.058v1.74z" clipRule="evenodd"/>
                </svg>
                <span className="absolute w-auto p-2 min-w-max left-16 top-1/2 -translate-y-1/2 rounded-md shadow-md  bg-gray-900 text-sm transition-all duration-200 scale-0 origin-left group-hover:scale-100 z-50 border border-gray-700">
                    Logout
                </span>
            </div>
        </div>
    )
}