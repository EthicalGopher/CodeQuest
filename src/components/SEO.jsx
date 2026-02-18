import { useHead } from '@unhead/react';

export default function SEO({ 
  title, 
  description, 
  keywords = [], 
  ogImage,
  canonicalUrl,
  noIndex = false 
}) {
  const siteName = 'CodeQuest';
  const defaultDescription = 'An epic RPG adventure game built with React and Phaser';
  const defaultKeywords = ['game', 'rpg', 'adventure', 'phaser', 'react', 'javascript'];
  const siteUrl = 'https://codequest.game';

  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || defaultDescription;
  const metaKeywords = [...defaultKeywords, ...keywords].join(', ');
  const ogImageUrl = ogImage || `${siteUrl}/og-image.png`;
  const url = canonicalUrl || siteUrl;

  useHead({
    title: fullTitle,
    meta: [
      { name: 'description', content: metaDescription },
      { name: 'keywords', content: metaKeywords },
      ...(noIndex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: metaDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { property: 'og:site_name', content: siteName },
      { property: 'og:image', content: ogImageUrl },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: metaDescription },
      { name: 'twitter:image', content: ogImageUrl },
    ],
    link: [
      { rel: 'canonical', href: url }
    ]
  });

  return null;
}
