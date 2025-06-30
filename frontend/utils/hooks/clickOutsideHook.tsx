import { useEffect, RefObject } from "react";

type AnyEvent = MouseEvent | TouchEvent;

export default function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  onClose: () => void
): void {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      const el = ref?.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      onClose();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, onClose]); // Reload only if ref or handler changes
}