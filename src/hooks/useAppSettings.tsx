
import { useState, useEffect } from "react";

export type Theme = "default" | "forest" | "ocean" | "sunset";

export const useAppSettings = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isFileDrawerOpen, setIsFileDrawerOpen] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>("default");

  // Initialize dark mode based on system preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
    
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Update dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Update theme
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove("theme-forest", "theme-ocean", "theme-sunset");
    
    // Add the selected theme class
    if (theme !== "default") {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K for keyboard shortcuts
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setShowKeyboardShortcuts((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isDarkMode,
    isFileDrawerOpen,
    showKeyboardShortcuts,
    theme,
    setIsFileDrawerOpen,
    setShowKeyboardShortcuts,
    toggleDarkMode,
    setTheme,
  };
};

export default useAppSettings;
