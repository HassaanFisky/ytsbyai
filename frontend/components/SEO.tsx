import Head from 'next/head'

type SEOProps = {
  title: string
  description: string
  image?: string
  url?: string
  type?: string
  keywords?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

export default function SEO({ 
  title, 
  description, 
  image = '/og-image.png', 
  url = 'https://ytsbyai.vercel.app',
  type = 'website',
  keywords = 'AI summary, YouTube summarizer, voice notes, GPT-4, Whisper, video summarization',
  author = 'YTS by AI',
  publishedTime,
  modifiedTime,
  section = 'Technology',
  tags = ['AI', 'YouTube', 'Summarization', 'GPT-4', 'Whisper']
}: SEOProps) {
  const fullUrl = url.startsWith('http') ? url : `https://ytsbyai.vercel.app${url}`
  const fullImageUrl = image.startsWith('http') ? image : `https://ytsbyai.vercel.app${image}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="YTS by AI" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@ytsbyai" />
      <meta name="twitter:creator" content="@ytsbyai" />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="YTS by AI" />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "YTS by AI",
            "description": description,
            "url": fullUrl,
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Organization",
              "name": author
            },
            "publisher": {
              "@type": "Organization",
              "name": "YTS by AI",
              "url": "https://ytsbyai.vercel.app"
            },
            "potentialAction": {
              "@type": "UseAction",
              "target": fullUrl
            }
          })
        }}
      />
      
      {/* Additional Structured Data for Article if type is article */}
      {type === 'article' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": title,
              "description": description,
              "image": fullImageUrl,
              "url": fullUrl,
              "author": {
                "@type": "Organization",
                "name": author
              },
              "publisher": {
                "@type": "Organization",
                "name": "YTS by AI",
                "url": "https://ytsbyai.vercel.app"
              },
              "datePublished": publishedTime,
              "dateModified": modifiedTime || publishedTime,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": fullUrl
              }
            })
          }}
        />
      )}
    </Head>
  )
} 