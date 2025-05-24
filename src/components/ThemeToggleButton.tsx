"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
      variant="outline"
      className="cursor-pointer"
    >
      {theme === "light" ? (
      // Moon icon for dark mode
      <Moon />
      ) : (
      // Sun icon for light mode
      <Sun />
      )}
    </Button>
  );
}
