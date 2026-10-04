const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://seoul-redevelopment.pages.dev';
const geojsonPath = path.join(__dirname, '..', 'public', 'data', 'districts.geojson');
const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

console.log('[SITEMAP] sitemap.xml 생성 시작...');

if (!fs.existsSync(geojsonPath)) {
  console.error(`[ERROR] ${geojsonPath} 파일이 존재하지 않습니다.`);
  process.exit(1);
}

const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
const features = geojson.features || [];
const today = new Date().toISOString().split('T')[0];

const urls = [
  `  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
  `  <url>
    <loc>${DOMAIN}/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`
];

features.forEach((feat) => {
  const props = feat.properties || {};
  const id = props.master_uid || feat.id;
  if (!id) return;

  const lastmod = props.approval_date && props.approval_date.length === 10 ? props.approval_date : today;

  urls.push(`  <url>
    <loc>${DOMAIN}/districts/${id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
});

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8');
console.log(`[SUCCESS] sitemap.xml 생성 완료: 총 ${urls.length}개 URL (루트 + 구역 ${features.length}개)`);
