import { useEffect } from 'react';
import { useSettings } from '../App';

export default function GASetup() {
  const { settings, contentLoaded } = useSettings();
  const gaId = settings?.analytics?.gaId || '';

  useEffect(() => {
    if (!contentLoaded || !gaId) return;

    // Prevent double-load
    if (document.querySelector(`script[data-ga-id="${gaId}"]`)) return;

    // Set default consent before loading GA
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      wait_for_update: 500,
    });

    // Load gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.setAttribute('data-ga-id', gaId);
    script.onload = () => {
      gtag('js', new Date());
      gtag('config', gaId, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
      });
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup not needed; GA persists on page
    };
  }, [contentLoaded, gaId]);

  return null; // Invisible component
}
