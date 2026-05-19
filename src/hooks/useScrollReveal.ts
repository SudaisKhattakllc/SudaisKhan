import { useRef, useEffect } from "react";

export function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    // Basic implementation for scroll reveal hook
  }, []);
  
  return ref;
}
