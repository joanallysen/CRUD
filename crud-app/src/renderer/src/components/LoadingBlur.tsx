export default function LoadingBlur() : React.JSX.Element{
    return(
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-500 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-y-accent-950"></div>
            <p className="text-white font-bold">Loading menus...</p>
        </div>
    </div>
    )
}