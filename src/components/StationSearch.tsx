import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Station } from '@/types/metro';
import { searchStations } from '@/utils/metroData';
import { getLineColor } from '@/utils/metroData';
import { cn } from '@/lib/utils';

interface StationSearchProps {
  stations: Station[];
  onSelect: (station: Station) => void;
  placeholder?: string;
  value?: string;
}

export function StationSearch({ stations, onSelect, placeholder, value = '' }: StationSearchProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Station[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Sync internal query state with external value prop
  useEffect(() => {
    setQuery(value);
    if (value) setIsSelected(true);
  }, [value]);

  useEffect(() => {
    // Don't show results if a station was just selected
    if (isSelected) return;
    
    if (query.length > 0) {
      const searchResults = searchStations(stations, query, i18n.language);
      setResults(searchResults);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query, stations, i18n.language, isSelected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is inside results or input - if so, don't close
      if (
        resultsRef.current?.contains(event.target as Node) ||
        inputRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setShowResults(false);
    };

    // Use click instead of mousedown to allow onMouseDown selection to complete first
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelect = (station: Station) => {
    setQuery(i18n.language === 'hi' ? station.nameHi : station.name);
    setShowResults(false);
    setIsSelected(true);
    onSelect(station);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setIsSelected(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSelected(false);
    setQuery(e.target.value);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.length > 0 && !isSelected) setShowResults(true);
          }}
          placeholder={placeholder || t('home.searchPlaceholder')}
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <Card
          ref={resultsRef}
          className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 shadow-xl"
        >
          <div className="p-2">
            {results.map((station) => (
              <button
                key={station.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(station);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="font-medium text-foreground">
                  {i18n.language === 'hi' ? station.nameHi : station.name}
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {station.lines.map((line) => (
                    <span
                      key={line}
                      className={cn(
                        "metro-line-badge text-[10px]",
                        getLineColor(line)
                      )}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
