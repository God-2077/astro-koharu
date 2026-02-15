import { useEffect, useRef } from 'react';
import { commentConfig } from '@/constants/site-config';

// Config is module-level static data parsed from YAML at build time - won't change at runtime
const config = commentConfig.twikoo;

export default function Twikoo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config || !containerRef.current) return;

    // Load Twikoo script dynamically
    const loadScript = async () => {
      if (window.twikoo) {
        initTwikoo();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.6.30/dist/twikoo.all.min.js';
      script.defer = true;
      script.onload = initTwikoo;
      script.onerror = () => {
        console.error('Failed to load Twikoo script');
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    };

    // Initialize Twikoo
    const initTwikoo = () => {
      if (!window.twikoo || !containerRef.current) return;

      window.twikoo.init({
        el: containerRef.current,
        envId: config.envId,
        region: config.region ?? 'ap-shanghai',
        lang: config.lang ?? 'zh-CN',
        dark: config.dark ?? 'html.dark', // CSS selector to auto-follow theme
        placeholder: config.placeholder ?? '说点什么吧...',
        master: config.master,
        requiredMeta: config.requiredMeta ?? ['nick'],
        pageSize: config.pageSize ?? 10,
        emoji: config.emoji ?? true,
        upload: config.upload ?? false,
        codeHighlight: config.codeHighlight ?? true,
        math: config.math ?? false,
        metaPlaceholder: config.metaPlaceholder,
        admin: config.admin,
        commentSorting: config.commentSorting ?? 'latest',
      });
    };

    // Handle Astro page transitions - update path when navigating
    const handlePageLoad = () => {
      if (window.twikoo) {
        // For Twikoo, we need to reinit on page load since it doesn't have an update method
        if (containerRef.current) {
          // Clear container
          containerRef.current.innerHTML = '';
          // Reinit Twikoo
          window.twikoo.init({
            el: containerRef.current,
            envId: config.envId,
            region: config.region ?? 'ap-shanghai',
            lang: config.lang ?? 'zh-CN',
            dark: config.dark ?? 'html.dark',
            placeholder: config.placeholder ?? '说点什么吧...',
            master: config.master,
            requiredMeta: config.requiredMeta ?? ['nick'],
            pageSize: config.pageSize ?? 10,
            emoji: config.emoji ?? true,
            upload: config.upload ?? false,
            codeHighlight: config.codeHighlight ?? true,
            math: config.math ?? false,
            metaPlaceholder: config.metaPlaceholder,
            admin: config.admin,
            commentSorting: config.commentSorting ?? 'latest',
          });
        }
      }
    };

    loadScript();
    document.addEventListener('astro:page-load', handlePageLoad);

    return () => {
      document.removeEventListener('astro:page-load', handlePageLoad);
    };
  }, []);

  if (!config) return null;

  return <div ref={containerRef} />;
}

// Declare global Twikoo type
declare global {
  interface Window {
    twikoo: {
      init: (options: any) => void;
    };
  }
}
