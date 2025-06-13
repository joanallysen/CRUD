import {useEffect} from 'react'

export default function Notification(
    {notificationMessage, onNotificationEnd}: 
    {
        notificationMessage: string
        onNotificationEnd: () => void;
    }
    ): React.JSX.Element{
        
        useEffect(() => {
            setTimeout(() => {
                onNotificationEnd();
            }, 5000);
        }, []);
        
    return(
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-black px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5 1.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
          </svg>
          <span>{notificationMessage}</span>
        </div>
    )
}


