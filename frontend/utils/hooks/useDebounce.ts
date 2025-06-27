import { useState, useEffect } from 'react';

/**
 * A hook to debounce a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay has passed,
    // or if the component unmounts.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // This effect runs only when the value or delay changes

  return debouncedValue;
}

export default useDebounce; 