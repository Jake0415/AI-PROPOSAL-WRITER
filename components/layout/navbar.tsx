import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "./theme-toggle"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              AIPROWRITER
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              대시보드
            </Link>
            <Link
              href="/templates"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              템플릿
            </Link>
            <Link
              href="/settings"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              설정
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Badge variant="secondary" className="mr-2">
              v1.0.0
            </Badge>
          </div>
          <nav className="flex items-center">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}