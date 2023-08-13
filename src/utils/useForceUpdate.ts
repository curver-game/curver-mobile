import { useCallback, useState } from "react";

export function useForceUpdate() {
  const [, setState] = useState(0);
  return useCallback(() => setState((state) => state + 1), []);
}
