import * as React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Home, BookOpen, Image, Moon, Sun, User, FileText, LogOut, LogIn, Settings, Wrench, ExternalLink, Cloud, Bookmark } from 'lucide-react';
import { Toaster } from 'sonner';

interface User {
  email: string;
  firstName: string;
  lastName: string;
  screenName: string;
  profilePicture?: string;
}

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  user?: User | null;
  onLogout?: () => void;
}

export function Layout({ children, currentPage, onNavigate, user, onLogout }: LayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const menuItems = [
    { title: 'Home', icon: Home, page: 'home' },
    { title: 'References', icon: BookOpen, page: 'references' },
    { title: 'Art', icon: Image, page: 'art' },
    { title: 'Documents', icon: FileText, page: 'documents' },
    { title: 'Tools', icon: Wrench, page: 'tools' },
    { title: 'Resources', icon: ExternalLink, page: 'resources' },
    { title: 'Public', icon: Cloud, page: 'public'},
    { title: 'Bookmarks', icon: Bookmark, page: 'bookmarks'}
  ];

  return (
      <div className="flex min-h-screen w-full">
        <Toaster position="top-right" expand={true} richColors />
        {/* Hover trigger area */}
        <div
            className="fixed left-0 top-0 w-6 h-full z-50"
            onMouseEnter={() => setIsHovered(true)}
        />

        {/* Sidebar */}
        <div
            className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-40 hover-sidebar-trigger shadow-lg ${
                isHovered ? 'w-64' : 'w-16'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-medium text-sm">M</span>
              </div>
              <h2 className={`font-medium text-sidebar-foreground sidebar-text whitespace-nowrap ${
                  isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                MuralDB
              </h2>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="p-4">
            <div className={`text-xs uppercase tracking-wide text-sidebar-foreground/60 mb-3 sidebar-text whitespace-nowrap ${
                isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              Navigation
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                  <button
                      key={item.title}
                      onClick={() => onNavigate?.(item.page)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md sidebar-item relative group ${
                          currentPage === item.page
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      }`}
                      title={!isHovered ? item.title : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className={`sidebar-text whitespace-nowrap ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                  {item.title}
                </span>
                    {/* Tooltip for collapsed state */}
                    {!isHovered && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-border">
                          {item.title}
                        </div>
                    )}
                  </button>
              ))}
            </nav>
          </div>

          {/* Theme Toggle */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground sidebar-item relative group"
                title={!isHovered ? (isDark ? 'Light Mode' : 'Dark Mode') : undefined}
            >
              {isDark ? <Sun className="h-5 w-5 flex-shrink-0" /> : <Moon className="h-5 w-5 flex-shrink-0" />}
              <span className={`sidebar-text whitespace-nowrap ${
                  isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
              {/* Tooltip for collapsed state */}
              {!isHovered && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-border">
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </div>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className={`flex-1 main-content ${
            isHovered ? 'ml-64' : 'ml-16'
        }`}>
          {/* Header */}
          <div className="border-b border-border p-4 flex items-center justify-between bg-background">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-medium text-foreground">MuralDB</h1>
            </div>

            {/* User Menu */}
            {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.profilePicture} alt={user.screenName} />
                        <AvatarFallback className="text-xs">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">{user.screenName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm">
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-muted-foreground">{user.screenName}</div>
                      <div className="text-muted-foreground text-xs">{user.email}</div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate?.('profile')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Profile & Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate?.('login')}
                    className="flex items-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
            )}
          </div>

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Optional: Subtle overlay when sidebar is expanded */}
        {isHovered && (
            <div
                className="fixed inset-0 bg-black/5 z-30 pointer-events-none"
            />
        )}
      </div>
  );
}