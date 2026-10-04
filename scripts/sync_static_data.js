const fs = require('fs');
const path = require('path');

const geojsonPath = path.join(process.cwd(), 'public', 'data', 'districts.geojson');
const rawData = fs.readFileSync(geojsonPath, 'utf-8');

// 1. public/data/districts.json 복사
fs.writeFileSync(path.join(process.cwd(), 'public', 'data', 'districts.json'), rawData, 'utf-8');

// 2. lib/constants/districtsData.ts 생성 (직접 import용)
const tsContent = `import { DistrictFeatureCollection } from "@/lib/types/district";

export const DISTRICTS_GEOJSON: DistrictFeatureCollection = ${rawData};
`;
fs.writeFileSync(path.join(process.cwd(), 'lib', 'constants', 'districtsData.ts'), tsContent, 'utf-8');

console.log('[SUCCESS] 정적 데이터 모듈 동기화 완료: public/data/districts.json & lib/constants/districtsData.ts');
