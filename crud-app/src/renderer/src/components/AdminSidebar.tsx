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
                            activeIcon === 'Profile' ? 'text-white' : 'text-gray-400 hover:text-white'
                        }`}
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24"
                        onClick={() => handleIconClick('Profile')}
                    >
                        <path fill="currentColor" d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                    </svg>
                    <span className="absolute w-auto p-2 min-w-max left-16 top-1/2 -translate-y-1/2 rounded-md shadow-md text-white bg-gray-900 text-sm font-medium transition-all duration-200 scale-0 origin-left group-hover:scale-100 z-[999] border border-gray-700">
                        Profile
                    </span>
                </li>

                {/* Summary */}
                <li className="group relative">
                    <svg 
                        className={`transition-colors cursor-pointer ${
                            activeIcon === 'Dashboard' ? 'text-white' : 'text-gray-400 hover:text-white'
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
                    <span className="absolute w-auto p-2 min-w-max left-16 top-1/2 -translate-y-1/2 rounded-md shadow-md text-white bg-gray-900 text-sm font-medium transition-all duration-200 scale-0 origin-left group-hover:scale-100 z-50 border border-gray-700">
                        Dashboard
                    </span>
                </li>

                {/* Payment */}
                <li className="group relative">
                    <svg 
                        className={`transition-colors cursor-pointer ${
                            activeIcon === 'MenuEditor' ? 'text-white' : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => handleIconClick('MenuEditor')}
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24"
                    >
                        <path fill="currentColor" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m0 14H4v-6h16zm0-10H4V6h16z"/>
                    </svg>
                    <span className="absolute w-auto p-2 min-w-max left-16 top-1/2 -translate-y-1/2 rounded-md shadow-md text-white bg-gray-900 text-sm font-medium transition-all duration-200 scale-0 origin-left group-hover:scale-100 z-50 border border-gray-700">
                        Edit Menu
                    </span>
                </li>

                {/* Favorites */}
                <li className="group relative">
                    <svg 
                        className={`transition-colors cursor-pointer ${
                            activeIcon === 'Favorite' ? 'text-white' : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => handleIconClick('MenuEditor')}
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24"
                    >
                        <path fill="currentColor" d="m12 21l-1.45-1.3q-2.525-2.275-4.175-3.925T3.75 12.812T2.388 10.4T2 8.15Q2 5.8 3.575 4.225T7.5 2.65q1.3 0 2.475.55T12 4.75q.85-1 2.025-1.55t2.475-.55q2.35 0 3.925 1.575T22 8.15q0 1.15-.387 2.25t-1.363 2.412t-2.625 2.963T13.45 19.7z"/>
                    </svg>
                    <span className="absolute w-auto p-2 min-w-max left-16 top-1/2 -translate-y-1/2 rounded-md shadow-md text-white bg-gray-900 text-sm font-medium transition-all duration-200 scale-0 origin-left group-hover:scale-100 z-50 border border-gray-700">
                        Favorites
                    </span>
                </li>

                {/* History */}
                <li className="group relative">
                    <svg 
                        className={`transition-colors cursor-pointer ${
                            activeIcon === 'History' ? 'text-white' : 'text-gray-400 hover:text-white'
                        }`}
                        onClick={() => handleIconClick('MenuEditor')}
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24"
                    >
                        <path fill="currentColor" d="M12 22q-3.875 0-6.725-2.575T2.05 13h2.025q.375 3.025 2.638 5.013T12 20q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4Q9.85 4 8.012 5.062T5.1 8H8v2H2.2q.725-3.5 3.475-5.75T12 2q2.075 0 3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m2.8-5.8L11 12.4V7h2v4.6l3.2 3.2z"/>
                    </svg>
                    <span className="absolute w-auto p-2 min-w-max left-16 top-1/2 -translate-y-1/2 rounded-md shadow-md text-white bg-gray-900 text-sm font-medium transition-all duration-200 scale-0 origin-left group-hover:scale-100 z-50 border border-gray-700">
                        Order History
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
                <span className="absolute w-auto p-2 min-w-max left-16 top-1/2 -translate-y-1/2 rounded-md shadow-md text-white bg-gray-900 text-sm font-medium transition-all duration-200 scale-0 origin-left group-hover:scale-100 z-50 border border-gray-700">
                    Logout
                </span>
            </div>
        </div>
    )
}