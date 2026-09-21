export interface AdConfig {
  enabled: boolean;
  client?: string; // e.g. 'ca-pub-XXXXXXXXXXXXXXXX'
  slots: {
    toolBottom: string;
    sidebar: string;
    banner: string;
    inContent: string;
  };
  testMode: boolean;
}

export const adsConfig: AdConfig = {
  enabled: true,
  client: process.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-sample-demo',
  slots: {
    toolBottom: '1234567890',
    sidebar: '2345678901',
    banner: '3456789012',
    inContent: '4567890123',
  },
  testMode: true, // Shows safe, elegant placeholders in development/preview without breaking UX
};
