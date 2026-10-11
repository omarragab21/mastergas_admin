/**
 * Product Data Feed Exporter for Tijara CMS
 * Transforms product data into Facebook Catalog CSV, Google Shopping XML, and JSON feeds.
 */

// Helper to escape CSV strings
function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  // Strip HTML tags if present for plain text description
  str = str.replace(/<[^>]*>?/gm, '');
  // Clean newlines
  str = str.replace(/[\r\n]+/g, ' ');
  return `"${str.trim()}"`;
}

// Helper to escape XML special characters
function escapeXML(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/<[^>]*>?/gm, '') // strip HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .trim();
}

/**
 * Generate Meta / Facebook Catalog Feed in CSV format
 * Fields: id, title, description, availability, condition, price, link, image_link, brand, google_product_category
 */
export function generateMetaCSV(products = [], storeUrl = 'https://mastergas.sa', currency = 'JOD') {
  const headers = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
    'google_product_category'
  ];

  const rows = products.map(product => {
    const id = product.id;
    const title = product.name_ar || product.name_en || product.name || `Product #${id}`;
    const description = product.description_ar || product.description_en || product.description || title;
    
    // Availability calculation
    const isAvailable = product.is_active !== false && product.is_active !== 0 && (product.quantity === undefined || product.quantity > 0);
    const availability = isAvailable ? 'in stock' : 'out of stock';
    
    const condition = 'new';
    const numPrice = parseFloat(product.price || 0).toFixed(2);
    const priceFormatted = `${numPrice} ${currency}`;
    
    // Links
    const baseUrl = storeUrl.replace(/\/$/, '');
    const link = `${baseUrl}/product/${id}`;
    
    // Image Link
    let imageLink = product.image_url || product.image || (Array.isArray(product.images) && product.images[0]) || '';
    if (imageLink && !imageLink.startsWith('http')) {
      imageLink = `${baseUrl}${imageLink.startsWith('/') ? '' : '/'}${imageLink}`;
    }

    const brand = product.brand_name || product.brand?.name || 'Mastergas';
    const category = product.category_name || product.category?.name || 'Shopping';

    return [
      escapeCSV(id),
      escapeCSV(title),
      escapeCSV(description),
      escapeCSV(availability),
      escapeCSV(condition),
      escapeCSV(priceFormatted),
      escapeCSV(link),
      escapeCSV(imageLink),
      escapeCSV(brand),
      escapeCSV(category)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generate Google Merchant Center RSS 2.0 XML Feed
 */
export function generateGoogleXML(products = [], storeUrl = 'https://mastergas.sa', currency = 'JOD') {
  const baseUrl = storeUrl.replace(/\/$/, '');
  
  const itemsXML = products.map(product => {
    const id = escapeXML(product.id);
    const title = escapeXML(product.name_ar || product.name_en || product.name || `Product #${product.id}`);
    const description = escapeXML(product.description_ar || product.description_en || product.description || title);
    
    const isAvailable = product.is_active !== false && product.is_active !== 0 && (product.quantity === undefined || product.quantity > 0);
    const availability = isAvailable ? 'in stock' : 'out of stock';
    
    const numPrice = parseFloat(product.price || 0).toFixed(2);
    const priceFormatted = `${numPrice} ${currency}`;
    
    const link = escapeXML(`${baseUrl}/product/${product.id}`);
    let imageLink = product.image_url || product.image || (Array.isArray(product.images) && product.images[0]) || '';
    if (imageLink && !imageLink.startsWith('http')) {
      imageLink = `${baseUrl}${imageLink.startsWith('/') ? '' : '/'}${imageLink}`;
    }
    imageLink = escapeXML(imageLink);
    
    const brand = escapeXML(product.brand_name || product.brand?.name || 'Mastergas');
    const category = escapeXML(product.category_name || product.category?.name || 'Shopping');

    return `
    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:condition>new</g:condition>
      <g:brand>${brand}</g:brand>
      <g:product_type>${category}</g:product_type>
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Mastergas Product Catalog Feed</title>
    <link>${baseUrl}</link>
    <description>Live Product Data Feed for Google Merchant Center &amp; Meta Catalog</description>
    ${itemsXML}
  </channel>
</rss>`;
}

/**
 * Generate JSON Catalog Feed
 */
export function generateJSONFeed(products = [], storeUrl = 'https://mastergas.sa', currency = 'JOD') {
  const baseUrl = storeUrl.replace(/\/$/, '');
  
  const items = products.map(product => {
    const isAvailable = product.is_active !== false && product.is_active !== 0 && (product.quantity === undefined || product.quantity > 0);
    
    let imageLink = product.image_url || product.image || (Array.isArray(product.images) && product.images[0]) || '';
    if (imageLink && !imageLink.startsWith('http')) {
      imageLink = `${baseUrl}${imageLink.startsWith('/') ? '' : '/'}${imageLink}`;
    }

    return {
      id: String(product.id),
      title: product.name_ar || product.name_en || product.name || `Product #${product.id}`,
      description: (product.description_ar || product.description_en || product.description || '').replace(/<[^>]*>?/gm, ''),
      link: `${baseUrl}/product/${product.id}`,
      image_link: imageLink,
      availability: isAvailable ? 'in stock' : 'out of stock',
      price: `${parseFloat(product.price || 0).toFixed(2)} ${currency}`,
      currency: currency,
      condition: 'new',
      brand: product.brand_name || product.brand?.name || 'Tijara',
      category: product.category_name || product.category?.name || ''
    };
  });

  return JSON.stringify({
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Tijara Product Data Feed',
    home_page_url: baseUrl,
    feed_url: `${baseUrl}/api/feeds/products.json`,
    items: items
  }, null, 2);
}

/**
 * Trigger immediate browser download of the feed content file
 */
export function downloadFile(content, fileName, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
