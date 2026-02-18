import { Helmet } from 'react-helmet-async';

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

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      <link rel="canonical" href={url} />
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImageUrl} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
    </Helmet>
  );
}
