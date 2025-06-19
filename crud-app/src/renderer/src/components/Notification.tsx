export default function Notification(
    {notificationMessage, onNotificationEnd}: 
    {
        notificationMessage: string
        onNotificationEnd: () => void;
    }
    ): React.JSX.Element{
        
    return(
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-black w-80 px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in-up">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M7.3 21q-.95 0-1.625-.687T5 18.675V9.4L3.175 5H1V3h3.525l1.65 4H20.95q.575 0 .875.475t.025.975L19 14.025q1.275.2 2.138 1.175T22 17.5q0 1.45-1.012 2.475T18.525 21q-1.475 0-2.487-1.025T15.025 17.5q0-.5.125-.925t.35-.825l-3.275-.3l-3 4.5q-.325.5-.837.775T7.3 21m9.55-7.125L19.325 9H7l1.25 3q.2.5.638.838t1.012.387zm-9.525 5.1q.05 0 .225-.125l2.425-3.6q-1.225-.125-1.925-.587T7 13.7v5q0 .125.1.2t.225.075M18.5 19q.65 0 1.075-.437T20 17.5q0-.65-.425-1.075T18.5 16q-.625 0-1.062.425T17 17.5q0 .625.438 1.063T18.5 19m-1.65-5.125l-6.95-.65z"/></svg>
            <span>{notificationMessage}</span>
            <svg className='absolute top-1 right-1 cursor-pointer'
                onClick={onNotificationEnd}
            xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"/></svg>
        </div>
    )
}


