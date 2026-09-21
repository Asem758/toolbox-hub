export type AnalyticsEventName =
  | 'tool_view'
  | 'tool_use'
  | 'tool_copy'
  | 'tool_download'
  | 'tool_favorite'
  | 'tool_search'
  | 'category_view'
  | 'theme_change';

export function trackEvent(name: AnalyticsEventName, properties?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', name, properties);
  }
  // Safe development log
  if (process.env.NODE_ENV === 'development') {
    // console.debug('[Analytics]', name, properties);
  }
}
