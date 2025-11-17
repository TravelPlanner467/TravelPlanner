import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {useEffect, useRef, useState} from "react";
import {getSearchSuggestions} from "@/lib/actions/search-actions";

interface KeywordsAutocompleteProps {
    keywords: string;
    setKeywords: (keywords: string) => void;
}

export function KeywordsAutocomplete({keywords, setKeywords}: KeywordsAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Fetch suggestions from API with debouncing
    useEffect(() => {
        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Don't search if query is too short
        if (keywords.trim().length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        // Debounce API call by 300ms
        debounceTimer.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const result = await getSearchSuggestions(keywords.trim());

                if ('suggestions' in result && Array.isArray(result.suggestions)) {
                    setSuggestions(result.suggestions);
                    setIsOpen(result.suggestions.length > 0);
                } else {
                    setSuggestions([]);
                    setIsOpen(false);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
                setIsOpen(false);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        // Cleanup
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [keywords]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation of keywords dropdown
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen && e.key === 'ArrowDown') {
            setIsOpen(true);
            return;
        }
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    handleSelect(suggestions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const handleSelect = (suggestion: string) => {
        setKeywords(suggestion);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    const handleFocus = () => {
        if (keywords.trim().length >= 2 && suggestions.length > 0) {
            setIsOpen(true);
        }
    };

    return (
        <div ref={wrapperRef} className="relative flex-1 h-full">
            <div className="relative h-full">
                <div className="flex items-center gap-2 h-full px-3 py-2.5
                               border border-gray-400 rounded-4xl bg-white
                               focus-within:ring-1 focus-within:ring-blue-500
                               transition-all duration-200">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        onFocus={handleFocus}
                        onKeyDown={handleKeyDown}
                        placeholder="Activities, attractions, keywords..."
                        className="w-full text-md text-gray-700 placeholder-gray-400
                                 bg-transparent border-0 focus:outline-none focus:ring-0"
                        autoComplete="off"
                        data-1p-ignore
                        data-lpignore
                        data-form-type="other"
                    />
                    {isLoading && (
                        <div className="flex-shrink-0">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600
                                          rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {/* Dropdown */}
                {isOpen && suggestions.length > 0 && (
                    <ul className="absolute w-full z-50 mt-1 max-h-60 overflow-y-auto
                                   bg-white border border-gray-300 rounded-md shadow-lg">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelect(suggestion);
                                }}
                                className={`px-4 py-2 cursor-pointer text-left text-sm
                                            transition-colors duration-150
                                            ${index === highlightedIndex
                                                ? 'bg-blue-50 text-blue-900'
                                                : 'text-gray-900 hover:bg-gray-100'}`
                                }
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
