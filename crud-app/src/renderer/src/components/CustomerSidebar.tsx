export default function CustomerSidebar() {
    return (
        <div className="relative h-screen flex flex-col items-center py-8">
            <ul className="flex flex-col items-center space-y-8 flex-1">
                {/* Profile/User */}
                <li className="group relative">
                    <svg 
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24"
                    >
                        <path fill="currentColor" d="M12 11q.825 0 1.413-.588Q14 9.825 14 9t-.587-1.413Q12.825 7 12 7q-.825 0-1.412.587Q10 8.175 10 9q0 .825.588 1.412Q11.175 11 12 11Zm0 2q-1.65 0-2.825-1.175Q8 10.65 8 9q0-1.65 1.175-2.825Q10.35 5 12 5q1.65 0 2.825 1.175Q16 7.35 16 9q0 1.65-1.175 2.825Q13.65 13 12 13Zm0 11q-2.475 0-4.662-.938q-2.188-.937-3.825-2.574Q1.875 18.85.938 16.663Q0 14.475 0 12t.938-4.663q.937-2.187 2.575-3.825Q5.15 1.875 7.338.938Q9.525 0 12 0t4.663.938q2.187.937 3.825 2.574q1.637 1.638 2.574 3.825Q24 9.525 24 12t-.938 4.663q-.937 2.187-2.574 3.825q-1.638 1.637-3.825 2.574Q14.475 24 12 24Zm0-2q1.8 0 3.375-.575T18.25 19.8q-.825-.925-2.425-1.612q-1.6-.688-3.825-.688t-3.825.688q-1.6.687-2.425 1.612q1.3 1.05 2.875 1.625T12 22Zm-7.7-3.6q1.2-1.3 3.225-2.1q2.025-.8 4.475-.8q2.45 0 4.463.8q2.012.8 3.212 2.1q1.1-1.325 1.713-2.95Q22 13.825 22 12q0-2.075-.788-3.887q-.787-1.813-2.15-3.175q-1.362-1.363-3.175-2.151Q14.075 2 12 2q-2.05 0-3.875.787q-1.825.788-3.187 2.151Q3.575 6.3 2.788 8.113Q2 9.925 2 12q0 1.825.6 3.463q.6 1.637 1.7 2.937Z"/>
                    </svg>
                    <span className="absolute w-auto p-2 min-w-max left-12 top-1/2 -translate-y-1/2 rounded-md shadow-md text-white bg-gray-800 text-sm transition-all duration-100 scale-0 origin-left group-hover:scale-100">
                        Profile
                    </span>
                </li>

                {/* Home */}
                <li className="group relative">
                    <svg 
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24"
                    >
                        <path fill="currentColor" d="M5 20v-9.15L2.2 13L1 11.4L12 3l4 3.05V4h3v4.35l4 3.05l-1.2 1.6l-2.8-2.15V20h-6v-6h-2v6zm2-2h2v-6h6v6h2V9.325l-5-3.8l-5 3.8zm3-7.975h4q0-.8-.6-1.313T12 8.2t-1.4.513t-.6 1.312M9 18v-6h6v6v-6H9z"/>
                    </svg>
                    <span className="absolute w-auto p-2 min-w-max left-12 top-1/2 -translate-y-1/2 rounded-md shadow-md text-white bg-gray-800 text-sm transition-all duration-100 scale-0 origin-left group-hover:scale-100">
                        Home
                    </span>
                </li>

                {/* Favorites */}
                <li className="group relative">
                    <svg 
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24"
                    >
                        <path fill="currentColor" d="m12 21l-1.45-1.3q-2.525-2.275-4.175-3.925T3.75 12.812T2.388 10.4T2 8.15Q2 5.8 3.575 4.225T7.5 2.65q1.3 0 2.475.55T12 4.75q.85-1 2.025-1.55t2.475-.55q2.35 0 3.925 1.575T22 8.15q0 1.15-.387 2.25t-1.363 2.412t-2.625 2.963T13.45 19.7zm0-2.7q2.4-2.15 3.95-3.687t2.45-2.675t1.25-2.026T20 8.15q0-1.5-1-2.5t-2.5-1q-1.175 0-2.175.662T12.95 7h-1.9q-.375-1.025-1.375-1.687T7.5 4.65q-1.5 0-2.5 1t-1 2.5q0 .875.35 1.763t1.25 2.025t2.45 2.675T12 18.3m0-6.825"/>
                    </svg>
                    <span className="absolute w-auto p-2 min-w-max left-12 top-1/2 -translate-y-1/2 rounded-md shadow-md text-white bg-gray-800 text-sm transition-all duration-100 scale-0 origin-left group-hover:scale-100">
                        Favorites
                    </span>
                </li>

                {/* History */}
                <li className="group relative">
                    <svg 
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer" 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24"
                    >
                        <path fill="currentColor" d="M12 22q-3.875 0-6.725-2.575T2.05 13h2.025q.375 3.025 2.638 5.013T12 20q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4Q9.85 4 8.012 5.062T5.1 8H8v2H2.2q.725-3.5 3.475-5.75T12 2q2.075 0 3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m2.8-5.8L11 12.4V7h2v4.6l3.2 3.2z"/>
                    </svg>
                    <span className="absolute w-auto p-2 min-w-max left-12 top-1/2 -translate-y-1/2 rounded-md shadow-md text-white bg-gray-800 text-sm transition-all duration-100 scale-0 origin-left group-hover:scale-100">
                        History
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
                >
                    <path fill="currentColor" d="M12 18.25a.75.75 0 0 0 0 1.5h6A1.75 1.75 0 0 0 19.75 18V6A1.75 1.75 0 0 0 18 4.25h-6a.75.75 0 0 0 0 1.5h6a.25.25 0 0 1 .25.25v12a.25.25 0 0 1-.25.25z"/><path fill="currentColor" fillRule="evenodd" d="M14.503 14.365c.69 0 1.25-.56 1.25-1.25v-2.24c0-.69-.56-1.25-1.25-1.25H9.89l-.02-.22l-.054-.556a1.227 1.227 0 0 0-1.751-.988a15 15 0 0 0-4.368 3.164l-.099.103a1.253 1.253 0 0 0 0 1.734l.1.103a15 15 0 0 0 4.367 3.164a1.227 1.227 0 0 0 1.751-.988l.054-.556l.02-.22zm-5.308-1.5a.75.75 0 0 0-.748.704q-.028.435-.07.871l-.016.162a13.6 13.6 0 0 1-3.516-2.607a13.6 13.6 0 0 1 3.516-2.607l.016.162q.042.435.07.871a.75.75 0 0 0 .748.704h5.058v1.74z" clipRule="evenodd"/>
                </svg>
                <span className="absolute w-auto p-2 m-2 min-w-max left-14 rounded-md shadow-md text-white bg-gray-800 text-sm transition-all duration-100 scale-0 origin-left group-hover:scale-100">
                    Logout
                </span>
            </div>
        </div>
    )
}