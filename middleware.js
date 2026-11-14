// Vercel Routing Middleware: on the root page, send visitors to their language by IP country.
// Skipped when the visitor picked a language (cookie "lang"), came from another page of this site, or is a crawler.
export const config = { matcher: '/' };

const BY_COUNTRY = {
  ru: ['RU', 'BY', 'KZ', 'KG', 'UZ', 'TJ', 'TM', 'AM', 'AZ', 'MD', 'GE', 'UA'],
  zh: ['CN', 'TW', 'HK', 'MO'],
  es: ['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR'],
  de: ['DE', 'AT', 'CH', 'LI'],
  ko: ['KR'],
  ja: ['JP'],
};
const LANGS = ['en', 'ru', 'zh', 'es', 'de', 'ko', 'ja'];
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse/i;

export default function middleware(request) {
  const url = new URL(request.url);
  const cookie = request.headers.get('cookie') || '';
  const picked = (cookie.match(/(?:^|;\s*)lang=([a-z]{2})/) || [])[1];
  if (picked && LANGS.includes(picked)) {
    return picked === 'en' ? undefined : Response.redirect(new URL(`/${picked}/`, url), 302);
  }
  const ref = request.headers.get('referer') || '';
  if (ref.startsWith(url.origin)) return undefined;
  if (BOT.test(request.headers.get('user-agent') || '')) return undefined;

  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
  for (const [lang, list] of Object.entries(BY_COUNTRY)) {
    if (list.includes(country)) return Response.redirect(new URL(`/${lang}/`, url), 302);
  }
  return undefined;
}
