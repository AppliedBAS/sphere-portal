"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type NavBarPage = "dashboard" | "search";

interface NavBarContextType {
  page: NavBarPage;
  setPage: (page: NavBarPage) => void;
}

const NavBarContext = createContext<NavBarContextType | undefined>(undefined);

export const NavBarProvider = ({ children }: { children: ReactNode }) => {
  const [page, setPage] = useState<NavBarPage>("dashboard");

  return (
    <NavBarContext.Provider value={{ page, setPage }}>
      {children}
    </NavBarContext.Provider>
  );
};

export function useNavBar() {
  const context = useContext(NavBarContext);
  if (!context) {
    throw new Error("useNavBar must be used within a NavBarProvider");
  }
  return context;
}
