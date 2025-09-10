const fetch = require('node-fetch');

async function shopifyFetch(shopDomain, accessToken, path, query) {
  const url = new URL(`https://${shopDomain}/admin/api/2024-10/${path}.json`);
  if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Shopify ${path} ${res.status}`);
  return res.json();
}

async function shopifyFetchRaw(shopDomain, accessToken, path, query) {
  const url = new URL(`https://${shopDomain}/admin/api/2024-10/${path}.json`);
  if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Shopify ${path} ${res.status}`);
  const json = await res.json();
  const link = res.headers.get('link') || res.headers.get('Link') || '';
  return { json, link };
}

function parseNextPageInfo(linkHeader) {
  // Example: <https://your-shop.myshopify.com/admin/api/2024-10/orders.json?page_info=xxxx&limit=250>; rel="next"
  if (!linkHeader) return null;
  const parts = linkHeader.split(',');
  for (const part of parts) {
    if (part.includes('rel="next"')) {
      const match = part.match(/page_info=([^&>]+)/);
      if (match) return match[1];
    }
  }
  return null;
}

module.exports = { shopifyFetch, shopifyFetchRaw, parseNextPageInfo };
