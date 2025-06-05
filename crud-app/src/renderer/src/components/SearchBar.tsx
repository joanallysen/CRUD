import {Item} from '../../../types/item'
import {useRef} from 'react'
export default function SearchBar({onGetItems}: {onGetItems: (category: string, search:string) => void}): React.JSX.Element {
    const searchRef = useRef<HTMLInputElement>(null);

    return(
        <div className="mb-6 bg-accent-100">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            {/* Search Icon */}
            <div className="pl-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Input */}
            <input
                type="text"
                name="search"
                placeholder="Search..."
                ref={searchRef}
                className="flex-grow px-3 py-3 focus:outline-none text-white bg-transparent"
            />

            {/* Search button INSIDE the border */}
            <button
                className="bg-primary-500 hover:bg-primary-600 px-4 py-3 transition-colors rounded-2x1"
                onClick={() => onGetItems('', searchRef.current!.value.trim())}
            >
                Search
            </button>
            </div>
        </div>
    )
}