"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { setupListeners } from "@reduxjs/toolkit/query";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    return setupListeners(store.dispatch);
  }, []);

  return <Provider store={store}>{children}</Provider>;
}