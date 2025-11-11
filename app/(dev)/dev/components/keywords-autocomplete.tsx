import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {useEffect, useRef, useState} from "react";

interface KeywordsAutocompleteProps {
    keywords: string;
    setKeywords: (keywords: string) => void;
}

interface KeywordOption {
    label: string;
    rank: number;
}

export function KeywordsAutocomplete({keywords, setKeywords}: KeywordsAutocompleteProps) {
    const [keywordOptions, setKeywordOptions] = useState<KeywordOption[]>([]);
    const [filteredOptions, setFilteredOptions] = useState<KeywordOption[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load keywords from JSON file
    useEffect(() => {
        const loadKeywords = async () => {
            try {
                const response = await fetch('/keywords.json');
                const data = await response.json() as string[];

                // Convert to KeywordOption format with rank based on position
                const options = data.map((label, index) => ({
                    label,
                    rank: data.length - index // First item gets highest rank
                }));

                setKeywordOptions(options);

            } catch (error) {
                console.error('Error loading keywords:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadKeywords();
    }, []);

    // Filter options based on input
    useEffect(() => {
        if (keywords.trim().length === 0) {
            setFilteredOptions([]); // Don't show suggestions when empty
            setIsOpen(false);
        } else {
            const searchTerm = keywords.toLowerCase();

            // Separate into starts-with and contains
            const startsWithMatches: KeywordOption[] = [];
            const containsMatches: KeywordOption[] = [];

            // Filter by starts-with and contains
            keywordOptions.forEach(option => {
                const label = option.label.toLowerCase();
                if (label.startsWith(searchTerm)) {
                    startsWithMatches.push(option);
                } else if (label.includes(searchTerm)) {
                    containsMatches.push(option);
                }
            });

            // Combine results and set variables
            const filtered = [...startsWithMatches, ...containsMatches].slice(0, 10);
            setFilteredOptions(filtered);
            setIsOpen(filtered.length > 0);
        }
    }, [keywords, keywordOptions]);

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

    // HANDLE KEYBOARD NAVIGATION OF THE KEYWORD SUGGESTIONS
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
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    setKeywords(filteredOptions[highlightedIndex].label);
                    setIsOpen(false);
                    setHighlightedIndex(-1);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleSelect = (option: KeywordOption) => {
        setKeywords(option.label);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    const handleFocus = () => {
        if (keywords.trim().length > 0) {
            setIsOpen(true);
        }
    };

    return (
        <div ref={wrapperRef} className="relative flex-1 h-full">
            <div className="relative h-full">
                <div className="flex items-center gap-2 h-full px-3 py-2.5
                               border border-gray-300 rounded-lg bg-white
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
                        placeholder={isLoading ? "Loading keywords..." : "Activities, attractions, keywords..."}
                        disabled={isLoading}
                        className="w-full text-md text-gray-700 placeholder-gray-400
                                 bg-transparent border-0 focus:outline-none focus:ring-0
                                 disabled:text-gray-400"
                        autoComplete="off"
                        data-1p-ignore
                        data-lpignore
                        data-form-type="other"
                    />
                </div>

                {/* Dropdown */}
                {isOpen && filteredOptions.length > 0 && (
                    <ul className="absolute w-full z-50 mt-1 max-h-60 overflow-y-auto
                                   bg-white border border-gray-300 rounded-md shadow-lg">
                        {filteredOptions.map((option, index) => (
                            <li
                                key={option.label}
                                onClick={() => handleSelect(option)}
                                className={`px-4 py-2 cursor-pointer text-left text-sm transition-colors duration-150 ${
                                    index === highlightedIndex
                                        ? 'bg-blue-50 text-blue-900'
                                        : 'text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
