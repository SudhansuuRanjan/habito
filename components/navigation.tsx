"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Calendar, Home, BarChart3, Settings, Menu, X } from "lucide-react"

// Dark mode toggle icon
import { Moon, Sun } from "lucide-react"

// Helper to get/set theme
function getTheme() {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem("theme") || "light";
}

function setTheme(theme: "light" | "dark") {
  if (typeof window === "undefined") return;
  localStorage.setItem("theme", theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Dark mode state
  const [theme, setThemeState] = useState<string>(typeof window !== "undefined" ? getTheme() : "light");

  // Sync theme on mount
  React.useEffect(() => {
    const currentTheme = getTheme() === "dark" ? "dark" : "light";
    setTheme(currentTheme);
    setThemeState(currentTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/habits", label: "Habits", icon: Settings },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center justify-between gap-6 w-full">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            >
              Habitto
            </Link>
            <div className="hidden md:flex items-center gap-5">
                {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  </Button>
                )
              })}
              {/* Dark mode toggle for desktop */}
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="ml-2 cursor-pointer border"
                aria-label="Toggle dark mode"
                onClick={toggleTheme}
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
          </div>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold">Menu</span>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Button
                        key={item.href}
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start"
                        asChild
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <Icon className="size-5" />
                          {item.label}
                        </Link>
                      </Button>
                    )
                  })}
                  {/* Dark mode toggle for mobile */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    aria-label="Toggle dark mode"
                    onClick={() => { toggleTheme(); setIsOpen(false); }}
                  >
                    {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
                    <span className="ml-2">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
