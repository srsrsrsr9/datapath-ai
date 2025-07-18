import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChartLine, User, Settings, LogOut, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";

export function Navigation() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <ChartLine className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-semibold">DataPath.ai</span>
            </a>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && user && (
              <>
                <Link href="/">
                  <a className={`hover:text-blue-400 transition-colors ${
                    location === "/" ? "text-blue-400" : ""
                  }`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/roadmap">
                  <a className={`hover:text-blue-400 transition-colors ${
                    location === "/roadmap" ? "text-blue-400" : ""
                  }`}>
                    Roadmap
                  </a>
                </Link>
                <Link href="/questionnaire">
                  <a className={`hover:text-blue-400 transition-colors ${
                    location === "/questionnaire" ? "text-blue-400" : ""
                  }`}>
                    Assessment
                  </a>
                </Link>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <a href="#" className="hover:text-blue-400 transition-colors">Roadmaps</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Community</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Resources</a>
              </>
            )}
          </div>

          {/* User Menu / Sign In */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl || ''} alt={user.firstName || ''} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.firstName && (
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <a className="w-full flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/roadmap">
                      <a className="w-full flex items-center">
                        <ChartLine className="mr-2 h-4 w-4" />
                        My Roadmap
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <a className="w-full flex items-center text-blue-600">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </a>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => window.location.href = '/api/logout'}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-primary hover:bg-secondary px-4 py-2 rounded-lg transition-colors"
                onClick={() => window.location.href = '/api/login'}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
