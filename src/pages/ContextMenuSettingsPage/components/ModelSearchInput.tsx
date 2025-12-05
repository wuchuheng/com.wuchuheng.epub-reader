import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Props for searchable model input component.
 */
interface ModelSearchInputProps {
  /** Current selected model value. */
  value: string;
  /** Handler for model selection changes. */
  onChange: (model: string) => void;
  /** API endpoint URL for fetching models. */
  apiEndpoint: string;
  /** API key for authentication. */
  apiKey: string;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Default models to show when API is not available. */
  defaultModels?: string[];
}

/**
 * Searchable model input component with API fetching capabilities.
 * Provides a text input that can fetch models from an API and display them in a searchable dropdown.
 */
export const ModelSearchInput: React.FC<ModelSearchInputProps> = ({
  value,
  onChange,
  apiEndpoint,
  apiKey,
  placeholder = 'Search or enter model name...',
  defaultModels = [],
}) => {
  // 1. State management
  const [inputValue, setInputValue] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>(defaultModels);
  const [filteredModels, setFilteredModels] = useState<string[]>(defaultModels);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedModels, setHasFetchedModels] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper to update dropdown position
  const updatePosition = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = 200; // Approximate max height

    // Prefer down, unless space is tight and there is more space above
    const showAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(showAbove
        ? { bottom: window.innerHeight - rect.top + 5, maxHeight: Math.min(spaceAbove - 20, 300) }
        : { top: rect.bottom + 5, maxHeight: Math.min(spaceBelow - 20, 300) }),
    });
  };

  // Update position on scroll/resize when open
  useLayoutEffect(() => {
    if (isDropdownOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isDropdownOpen, filteredModels.length]); // Update when content changes too

  // 2. Effects
  // 2.1 Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      const clickedInput = inputRef.current && inputRef.current.contains(target);

      if (!clickedDropdown && !clickedInput) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2.2 Fetch models when API endpoint and key are available
  useEffect(() => {
    const fetchModels = async () => {
      if (!apiEndpoint || !apiKey || hasFetchedModels) return;

      setIsLoading(true);
      setError(null);

      try {
        // Try to fetch models from the API
        const response = await fetch(`${apiEndpoint}/models`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`);
        }

        const data = await response.json();

        // Extract model IDs from the response (handle different API formats)
        let models: string[] = [];
        if (data.data && Array.isArray(data.data)) {
          // OpenAI format
          models = data.data.map((model: { id: string }) => model.id);
        } else if (Array.isArray(data)) {
          // Direct array format
          models = data;
        } else if (data.models && Array.isArray(data.models)) {
          // Alternative format
          models = data.models;
        }

        if (models.length > 0) {
          setAvailableModels(models);
          setFilteredModels(models);
          setHasFetchedModels(true);
        }
      } catch (err) {
        console.warn('Failed to fetch models from API, using defaults:', err);
        setError('Using default models');
        // Keep using default models if API fails
        setAvailableModels(defaultModels);
        setFilteredModels(defaultModels);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [apiEndpoint, apiKey, hasFetchedModels, defaultModels]);

  // 2.3 Filter models based on input value
  useEffect(() => {
    const filtered = availableModels.filter((model) =>
      model.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredModels(filtered);
  }, [inputValue, availableModels]);

  // 2.4 Sync input value with prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 3. Event handlers
  // 3.1 Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsDropdownOpen(true);
    onChange(newValue);
  };

  // 3.2 Handle model selection from dropdown
  const handleModelSelect = (model: string) => {
    setInputValue(model);
    onChange(model);
    setIsDropdownOpen(false);
  };

  // 3.3 Handle input focus
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    if (!hasFetchedModels && apiEndpoint && apiKey) {
      setHasFetchedModels(true); // This will trigger the fetch effect
    }
  };

  // 3.4 Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) return;

    const items = filteredModels;
    const currentIndex = items.indexOf(inputValue);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          handleModelSelect(items[currentIndex + 1]);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          handleModelSelect(items[currentIndex - 1]);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (items.length > 0) {
          handleModelSelect(items[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        break;
    }
  };

  // 4. Render
  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      {/* Dropdown with model options */}
      {isDropdownOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="fixed z-[9999] rounded-md border border-gray-300 bg-white shadow-lg"
          >
            <div className="overflow-y-auto" style={{ maxHeight: dropdownStyle.maxHeight }}>
              {isLoading && (
                <div className="px-3 py-2 text-sm text-gray-500">Loading models...</div>
              )}

              {error && <div className="px-3 py-2 text-sm text-orange-600">{error}</div>}

              {!isLoading && !error && filteredModels.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No models found matching "{inputValue}"
                </div>
              )}

              {!isLoading && !error && filteredModels.length > 0 && (
                <div className="py-1">
                  {filteredModels.map((model) => (
                    <div
                      key={model}
                      className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${
                        model === inputValue ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                      }`}
                      onClick={() => handleModelSelect(model)}
                    >
                      {model}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
