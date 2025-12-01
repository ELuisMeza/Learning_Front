import { useState, useEffect, useRef } from "react";

interface UseDebouncedSearchParams {
  initialValue?: string;
  delay?: number;
  onUpdate: (value: string) => void;
}

export const useDebouncedSearch = ({ 
  initialValue = '', 
  delay = 500,
  onUpdate 
}: UseDebouncedSearchParams) => {
  const [searchInput, setSearchInput] = useState(initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const isFirstMount = useRef(true);
  const previousSearchInputRef = useRef(initialValue);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const cleanup = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    // No ejecutar en el montaje inicial
    if (isFirstMount.current) {
      isFirstMount.current = false;
      previousSearchInputRef.current = searchInput;
      return cleanup;
    }

    // Solo ejecutar si el valor realmente cambió
    if (previousSearchInputRef.current === searchInput) {
      return cleanup;
    }

    previousSearchInputRef.current = searchInput;

    cleanup();
    timeoutRef.current = setTimeout(() => {
      onUpdateRef.current(searchInput);
    }, delay);

    return cleanup;
  }, [searchInput, delay]);

  return {
    searchInput,
    setSearchInput,
  };
};

