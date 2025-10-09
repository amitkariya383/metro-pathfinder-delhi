import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';
import { Home, Route as RouteIcon, Map, TramFront } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/route', icon: RouteIcon, label: t('nav.route') },
    { path: '/lines', icon: TramFront, label: t('nav.lines') },
    { path: '/map', icon: Map, label: t('nav.map') }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-full">
          <div className="flex items-center justify-center relative">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0">
                <TramFront className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-foreground truncate">{t('app.title')}</h1>
                <p className="text-xs text-muted-foreground truncate">{t('app.subtitle')}</p>
              </div>
            </Link>
            <div className="absolute right-0">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t bg-card sticky bottom-0 z-50 shadow-lg md:hidden">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop Navigation Sidebar */}
      <nav className="hidden md:block fixed left-0 top-[73px] bottom-0 w-64 border-r bg-card p-4 z-40 overflow-hidden">
        <div className="flex flex-col gap-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
