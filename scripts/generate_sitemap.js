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

const SEOUL_25_GUS = [
  "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
  "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구",
  "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
];

const urls = [
  `  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
  `  <url>
    <loc>${DOMAIN}/districts/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`,
  `  <url>
    <loc>${DOMAIN}/privacy/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`,
  `  <url>
    <loc>${DOMAIN}/terms/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`
];

// 25개 자치구별 모아보기 페이지 sitemap 등록
SEOUL_25_GUS.forEach((gu) => {
  urls.push(`  <url>
    <loc>${DOMAIN}/districts/gu/${encodeURIComponent(gu)}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
});

// 496개 개별 구역 분석 리포트 페이지 sitemap 등록
features.forEach((feat) => {
  const props = feat.properties || {};
  const id = props.master_uid || feat.id;
  if (!id) return;

  const lastmod = props.approval_date && props.approval_date.length === 10 ? props.approval_date : today;

  urls.push(`  <url>
    <loc>${DOMAIN}/districts/${id}/</loc>
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
console.log(`[SUCCESS] sitemap.xml 갱신 완료: 총 ${urls.length}개 URL (기본 4 + 자치구 25 + 구역 ${features.length}개)`);
