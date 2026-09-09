import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

export function useParams<T extends Record<string, any>>(defaults: T) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialState = useCallback(() => {
    const state: any = {};
    Object.keys(defaults).forEach((key) => {
      const param = searchParams.get(key);
      state[key] = param !== null ? param : defaults[key];
    });
    return state as T;
  }, [searchParams, defaults]);

  const [state, setState] = useState<T>(getInitialState);

  const updateURL = useCallback(
    (newState: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());
      const merged = { ...state, ...newState };

      Object.keys(merged).forEach((key) => {
        const value = merged[key];
        if (value && value !== defaults[key]) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [state, defaults, router, searchParams],
  );

  useEffect(() => {
    const newState = getInitialState();
    setState((prev) => {
      const changed = Object.keys(newState).some(
        (key) => prev[key] !== newState[key],
      );
      return changed ? newState : prev;
    });
  }, [searchParams, getInitialState]);

  return [state, updateURL] as const;
}
