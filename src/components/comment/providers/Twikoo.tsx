import { useEffect, useRef } from 'react';
import { commentConfig } from '@/constants/site-config';

// Config is module-level static data parsed from YAML at build time - won't change at runtime
const config = commentConfig.twikoo;

export default function Twikoo() {
  const twikooInstanceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config || !containerRef.current) return;

    // 动态加载 Twikoo 脚本
    const loadTwikoo = async () => {
      if (window.twikoo) {
        initTwikoo();
      } else {
        // 加载 Twikoo 脚本
        const script = document.createElement('script');
        script.src = 'https://cdn.staticfile.org/twikoo/1.6.30/twikoo.all.min.js';
        script.onload = initTwikoo;
        script.onerror = () => {
          console.error('Failed to load Twikoo script');
        };
        document.head.appendChild(script);

        return () => {
          document.head.removeChild(script);
        };
      }
    };

    // 初始化 Twikoo
    const initTwikoo = () => {
      if (!window.twikoo || !containerRef.current) return;

      // 确保容器元素存在
      const container = containerRef.current;
      
      // 清空容器内容，避免重复初始化
      container.innerHTML = '';

      // 初始化 Twikoo
      window.twikoo.init({
        envId: config.envId,
        el: container,
        region: config.region,
        path: config.path || window.location.pathname,
        lang: config.lang,
      });
    };

    // 加载并初始化 Twikoo
    loadTwikoo();

    // Handle Astro page transitions - reload Twikoo when navigating
    const handlePageLoad = () => {
      initTwikoo();
    };
    document.addEventListener('astro:page-load', handlePageLoad);

    return () => {
      document.removeEventListener('astro:page-load', handlePageLoad);
    };
  }, []);

  if (!config) return null;

  return <div ref={containerRef} id={config.el?.replace('#', '') || 'tcomment'} />;
}
