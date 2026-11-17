import { useEffect } from "react";

export function useTitle(title) {
  useEffect(() => { document.title = `${title} · Learning Institutions by Design`; }, [title]);
}
