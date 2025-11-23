/**
 * Google Tag Manager Component
 *
 * Domain: Analytics and tracking
 * Responsibility: Initialize GTM script for production analytics
 * Boundaries: Analytics only, no business logic
 */

'use client';

import Script from 'next/script';

interface GTMProps {
  gtmId?: string;
}

export function GoogleTagManager({ gtmId }: GTMProps) {
  // Only load GTM in production with valid ID
  if (!gtmId || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      {/* GTM Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />

      {/* GTM NoScript */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `
            <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>
          `,
        }}
      />
    </>
  );
}
