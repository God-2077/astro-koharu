import { useEffect, useRef } from 'react';
import { commentConfig } from '@/constants/site-config';
import { getHtmlLang, getLocaleFromUrl } from '@/i18n/utils';
import 'twikoo/dist/twikoo.css';
import '@/styles/components/twikoo.css';

// Config is module-level static data parsed from YAML at build time - won't change at runtime
const config = commentConfig.twikoo;

export default function Twikoo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(1);
    if (!config || !containerRef.current) return;
    console.log(2);
    const initTwikoo = async () => {
      console.log(3);
      if (!containerRef.current) return;
      console.log(4);
      // Clear container to avoid duplicate init (Twikoo has no destroy/update API)
      containerRef.current.innerHTML = '';
      console.log(5);
      const locale = getLocaleFromUrl(window.location.pathname);
      console.log(6);
      // Dynamic import: twikoo is a UMD bundle (~500KB) with no type definitions,
      // and accesses `document` at module load time — lazy loading is the cleanest approach
      const { init } = await import('twikoo/dist/twikoo.nocss.js');
      if (!containerRef.current) return;
      console.log(7);
      init({
        envId: config.envId,
        el: containerRef.current,
        region: config.region,
        path: config.path ?? window.location.pathname,
        lang: config.lang ?? getHtmlLang(locale),
      });
      console.log(8);
    };
    console.log(9);
    // @ts-expect-error
    // window.initTwikoo = initTwikoo;
    // astro:page-load fires on initial load AND on subsequent navigations
    document.addEventListener('astro:page-load', () => {
      console.log(12);
    });
    document.addEventListener('astro:page-load', initTwikoo);
    return () => {
      document.removeEventListener('astro:page-load', initTwikoo);
    };
  }, []);

  if (!config) return null;
  return <div ref={containerRef} id="tcomment" />;
}
