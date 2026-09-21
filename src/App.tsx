import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Layout } from './components/layout/Layout';

// Pages
import HomePage from './pages/Home/HomePage';
import AllToolsPage from './pages/Tools/AllToolsPage';
import ToolDetailPage from './pages/Tools/ToolDetailPage';
import CategoryDetailPage from './pages/Categories/CategoryDetailPage';
import BlogIndexPage from './pages/Blog/BlogIndexPage';
import BlogPostPage from './pages/Blog/BlogPostPage';
import AboutPage from './pages/Trust/AboutPage';
import ContactPage from './pages/Trust/ContactPage';
import PrivacyPage from './pages/Trust/PrivacyPage';
import TermsPage from './pages/Trust/TermsPage';
import DisclaimerPage from './pages/Trust/DisclaimerPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

export default function App() {
  // Hash-based router state
  const [route, setRoute] = useState<string>(() => {
    const hash = window.location.hash.slice(1);
    return hash ? (hash.startsWith('/') ? hash : `/${hash}`) : '/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const cleanRoute = hash ? (hash.startsWith('/') ? hash : `/${hash}`) : '/';
      setRoute(cleanRoute);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newRoute: string) => {
    window.location.hash = newRoute.startsWith('/') ? newRoute : `/${newRoute}`;
  };

  // Route matching logic
  const renderCurrentPage = () => {
    if (route === '/' || route === '') {
      return (
        <HomePage
          onOpenSearch={() => {
            // Handled via global event or search modal
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
            window.dispatchEvent(event);
          }}
          onSelectTool={(slug) => navigate(`/tools/${slug}`)}
        />
      );
    }

    if (route === '/tools') {
      return <AllToolsPage onSelectTool={(slug) => navigate(`/tools/${slug}`)} />;
    }

    if (route.startsWith('/tools/')) {
      const slug = route.replace('/tools/', '').split('/')[0];
      return <ToolDetailPage slug={slug} />;
    }

    if (route.startsWith('/category/')) {
      const categoryId = route.replace('/category/', '').split('/')[0];
      return <CategoryDetailPage categoryId={categoryId} onSelectTool={(slug) => navigate(`/tools/${slug}`)} />;
    }

    if (route === '/blog') {
      return <BlogIndexPage onSelectPost={(slug) => navigate(`/blog/${slug}`)} />;
    }

    if (route.startsWith('/blog/')) {
      const slug = route.replace('/blog/', '').split('/')[0];
      return <BlogPostPage slug={slug} onSelectTool={(slug) => navigate(`/tools/${slug}`)} />;
    }

    if (route === '/about') return <AboutPage />;
    if (route === '/contact') return <ContactPage />;
    if (route === '/privacy') return <PrivacyPage />;
    if (route === '/terms') return <TermsPage />;
    if (route === '/disclaimer') return <DisclaimerPage />;

    return <NotFoundPage />;
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <FavoritesProvider>
          <Layout currentRoute={route} onNavigate={navigate}>
            {renderCurrentPage()}
          </Layout>
        </FavoritesProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
