"use client";

import { createContext, useContext, type ReactNode } from "react";

const PlaceholderImageContext = createContext<string | undefined>(undefined);

export function PlaceholderImageProvider({
  value,
  children,
}: {
  value: string | undefined;
  children: ReactNode;
}) {
  return <PlaceholderImageContext.Provider value={value}>{children}</PlaceholderImageContext.Provider>;
}

export function usePlaceholderImage() {
  return useContext(PlaceholderImageContext);
}
