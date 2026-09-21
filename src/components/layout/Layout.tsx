import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlobalSearchModal } from '../tools/GlobalSearchModal';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentRoute, onNavigate }) => {
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);

  const handleSelectTool = (slug: string) => {
    onNavigate(`/tools/${slug}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top Navigation */}
      <Header
        onOpenSearch={() => setSearchModalOpen(true)}
        currentRoute={currentRoute}
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full">{children}</div>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectTool={handleSelectTool}
      />

      {/* Footer & Sitemap */}
      <Footer />
    </div>
  );
};
export default Layout;
