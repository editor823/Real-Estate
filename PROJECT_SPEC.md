# 개발 프로젝트.md: 서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼

---

## 1. 프로젝트 개요 (Overview)

* **프로젝트 목적**: 서울시 내 분산 관리되는 공식 정비구역(재개발·재건축)과 비공식 후보지(신속통합기획·모아타운) 데이터를 통합 수집·가공하여, 공간 정보 기반의 실시간 인허가 단계 변화 및 투자 안전성 지표를 제공한다.


* **타깃 유저**:
* **정비사업 투자자 및 실수요자**: 동의율 충족 여부, 입주권 전매 제한(지위양도 유예 조항), 현금청산 위험 구역 확인.


* **도시계획/프롭테크 실무자**: 서울시 전역의 정비구역 공간 경계 및 인접 개발 호재 데이터 분석.




* **핵심 가치**:
* 서울시 약 496개 법정 정비구역과 200+개 신통기획·모아타운 후보지 공간 데이터 통합 서빙.


* 지번 조서(PNU) 기반 비공식 후보지의 동적 지적도 경계 생성(Spatial Dissolve) 자동화.


* 일일 고시·공고 원천 데이터의 Diff 감지를 통한 100% 이벤트 기반 타임라인 추적.





---

## 2. 기술 스택 (Tech Stack)

* **Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand (클라이언트 상태 관리), TanStack Query v5
* **WebGIS / Mapping**: Mapbox GL JS (v3) / Leaflet, Supercluster (광역 마커 클러스터링), Turf.js (클라이언트 지오메트리 보조 연산)
* **Backend & Database**: Supabase (PostgreSQL 16 + PostGIS 3.4), Edge Functions
* **Data Pipeline & Automation**: Python 3.11, GeoPandas, Shapely, PyProj, Playwright (JS 렌더링 크롤링), GitHub Actions / Cron 배치
* **Vector Tile Engine**: Tippecanoe (GeoJSON ➔ PMTiles/MBTiles 변환)



---

## 3. 데이터베이스 설계 (Database Schema)

PostGIS 확장 모듈을 활성화하고, 지리공간 쿼리 성능을 보장하기 위한 GiST 인덱스를 적용한다.

```sql
-- PostGIS 확장 활성화
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. 통합 정비사업 마스터 테이블
CREATE TABLE redevelopment_projects (
    master_uid          VARCHAR(64) PRIMARY KEY,       -- 결정론적 공간-시간 식별자 (예: SEOUL_RDEV_11215_2026_A9B3)
    name                VARCHAR(255) NOT NULL,         -- 구역/사업지 공식 명칭
    biz_type            VARCHAR(32) NOT NULL,          -- REDEVELOPMENT, RECONSTRUCTION, SINTHONG, MOA
    stage_code          VARCHAR(32) NOT NULL,          -- CANDIDATE, DESIGNATED, PROMOT_COMM, UNION_AUTH, BIZ_PLAN, MGMT_DISP, CONSTRUCTION, COMPLETED, DISSOLVED
    stage_seq           INT NOT NULL DEFAULT 1,        -- 진행 단계 선형 순서 가중치 (1 ~ 8, 99: DISSOLVED)
    sido_sugg_code      VARCHAR(10) NOT NULL,          -- 법정동 코드 앞 5자리 (자치구 코드)
    legal_dong          VARCHAR(64) NOT NULL,          -- 법정동 명칭
    approval_date       DATE,                          -- 현재 단계 인허가/고시 일자
    geom                GEOMETRY(MultiPolygon, 4326),  -- WGS84 구역 경계선
    centroid            GEOMETRY(Point, 4326),         -- 중심점 (마커/클러스터링용)
    
    -- 정책 및 투자 분석 속성 지표
    consent_rate        NUMERIC(5, 2),                 -- 주민 동의율 (%)
    is_transferable     BOOLEAN DEFAULT FALSE,         -- 조합원 지위양도 가능 여부
    transfer_exemption  VARCHAR(64),                   -- 지위양도 예외 조항 (예: 3년 지연 예외 허용)
    is_adjacent_public  BOOLEAN DEFAULT FALSE,         -- 탄천물재생센터 등 특수 공공개발 인접 여부
    
    -- 운영 메타데이터
    source_type         VARCHAR(32) NOT NULL,          -- VWORLD, NOTICE, CLEANUP
    is_active           BOOLEAN DEFAULT TRUE,          -- 구역 유효성 플래그 (해제 시 FALSE)
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 타임라인 및 변경 이력 추적 테이블
CREATE TABLE project_timeline (
    timeline_id         BIGSERIAL PRIMARY KEY,
    master_uid          VARCHAR(64) NOT NULL REFERENCES redevelopment_projects(master_uid) ON DELETE CASCADE,
    previous_stage      VARCHAR(32),
    new_stage           VARCHAR(32) NOT NULL,
    stage_seq           INT NOT NULL,
    notice_no           VARCHAR(128),                  -- 고시/공고 번호 (예: 서울시고시 제2026-142호)
    notice_date         DATE NOT NULL,
    source_type         VARCHAR(32) NOT NULL,          -- NOTICE, PRESS, CLEANUP
    source_title        TEXT NOT NULL,
    source_url          TEXT NOT NULL,
    source_payload_hash CHAR(64) NOT NULL,             -- 원문 SHA-256
    is_backward_jump    BOOLEAN DEFAULT FALSE,         -- 단계 역행 감지 플래그
    manual_review_flag  BOOLEAN DEFAULT FALSE,         -- 관리자 검수 대기열 플래그
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_timeline_event UNIQUE (master_uid, new_stage, notice_no)
);

-- 3. 후보지 필지 단위(지번) 매핑 테이블
CREATE TABLE target_parcels (
    parcel_id           BIGSERIAL PRIMARY KEY,
    master_uid          VARCHAR(64) NOT NULL REFERENCES redevelopment_projects(master_uid) ON DELETE CASCADE,
    pnu                 VARCHAR(19) NOT NULL,          -- 19자리 필지고유번호
    address_jibun       VARCHAR(255) NOT NULL,         -- 원천 지번 주소
    is_excluded         BOOLEAN DEFAULT FALSE,         -- 지번 변경/제척 여부
    geom                GEOMETRY(Polygon, 4326),       -- 개별 필지 지오메트리
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_master_pnu UNIQUE (master_uid, pnu)
);

-- 공간 및 성능 인덱스
CREATE INDEX idx_redev_geom ON redevelopment_projects USING GIST (geom);
CREATE INDEX idx_redev_centroid ON redevelopment_projects USING GIST (centroid);
CREATE INDEX idx_redev_stage_active ON redevelopment_projects (stage_code, is_active);
CREATE INDEX idx_timeline_master ON project_timeline (master_uid, notice_date DESC);
CREATE INDEX idx_parcels_pnu ON target_parcels (pnu);

```

---

## 4. 데이터 수집 및 정제 파이프라인 (Data Pipeline)

### 4.1 VWorld WFS 정비구역 GeoJSON 자동 호출

국토교통부 VWorld WFS API(Layer: `lt_c_upis_uq101` 등)를 호출하여 법정 정비구역 폴리곤 및 속성을 수집한다.

```python
import os
import requests
import geopandas as gpd

VWORLD_API_KEY = os.getenv("VWORLD_API_KEY")
WFS_URL = "https://api.vworld.kr/req/wfs"

def fetch_vworld_redevelopment_zones(sugg_code: str = "11215") -> gpd.GeoDataFrame:
    """
    지정 자치구의 정비구역 벡터 피처를 BBox/속성 조건으로 수집하여 EPSG:4326으로 정규화
    """
    params = {
        "service": "WFS",
        "version": "1.1.0",
        "request": "GetFeature",
        "key": VWORLD_API_KEY,
        "typename": "lt_c_upis_uq101",
        "output": "application/json",
        "srsname": "EPSG:4326",
        "maxFeatures": "1000"
    }
    
    response = requests.get(WFS_URL, params=params, timeout=15)
    response.raise_for_status()
    data = response.json()
    
    if not data.get("features"):
        return gpd.GeoDataFrame()
        
    gdf = gpd.GeoDataFrame.from_features(data["features"], crs="EPSG:4326")
    # Geometry 유효성 검사 및 정제
    gdf["geometry"] = gdf["geometry"].apply(lambda g: g.buffer(0) if not g.is_valid else g)
    return gdf

```

### 4.2 후보지 지번 조서 ➔ 공간 병합(Dissolve) 및 Simplify 스크립트

고시문 PDF/HWP에서 추출한 19자리 PNU 목록과 연속지적도를 결합하여 단일 후보지 경계를 생성한다.

```python
import geopandas as gpd
from shapely.validation import make_valid
from shapely.ops import unary_union

def build_candidate_boundary(pnu_list: list[str], cadastre_gdf: gpd.GeoDataFrame) -> dict:
    """
    PNU 집합을 필터링하여 내부 경계를 제거(ST_UnaryUnion)하고 위상 오류를 보정
    """
    # 1. PNU 필터링
    matched_parcels = cadastre_gdf[cadastre_gdf["pnu"].isin(pnu_list)]
    if matched_parcels.empty:
        raise ValueError("일치하는 연속지적도 필지가 없습니다.")
        
    # 2. 공간 결합 (Dissolve/Unary Union)
    raw_union = unary_union(matched_parcels["geometry"])
    
    # 3. Topology 보정: make_valid 및 buffer(0) 적용 (Sliver polygon, Gap 제거)
    valid_geom = make_valid(raw_union)
    if valid_geom.geom_type in ["Polygon", "MultiPolygon"]:
        clean_geom = valid_geom.buffer(0)
    else:
        # GeometryCollection 예외 처리: Polygon 요소만 추출
        polygons = [g for g in valid_geom.geoms if g.geom_type in ["Polygon", "MultiPolygon"]]
        clean_geom = unary_union(polygons).buffer(0)
        
    # 4. 경량화: WebGIS 서빙을 위한 단순화 (0.00001 = 약 1m 허용 오차)
    simplified_geom = clean_geom.simplify(0.00001, preserve_topology=True)
    centroid = simplified_geom.centroid
    
    return {
        "geom": simplified_geom,
        "centroid": centroid,
        "area_m2": clean_geom.area
    }

```

### 4.3 일일 상태 변화 감지 (Diff Detection 배치 프로세스)

`Playwright`로 서울시 고시·공고 페이지를 스크래핑한 후 SHA-256 및 상태 머신(State Machine) 검증을 실행한다.

```python
import hashlib
import json
from datetime import datetime

STAGE_WEIGHT = {
    "CANDIDATE": 1, "DESIGNATED": 2, "PROMOT_COMM": 3,
    "UNION_AUTH": 4, "BIZ_PLAN": 5, "MGMT_DISP": 6,
    "CONSTRUCTION": 7, "COMPLETED": 8, "DISSOLVED": 99
}

def process_diff_pipeline(parsed_notice: dict, db_connection):
    """
    1차 해시 비교 스크리닝 -> 2차 상태 전이 게이트키퍼 -> 3차 단일 트랜잭션 커밋
    """
    cursor = db_connection.cursor()
    
    # 1. SHA-256 해시 검증
    payload_str = json.dumps(parsed_notice, sort_keys=True)
    current_hash = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()
    
    cursor.execute(
        "SELECT source_payload_hash FROM project_timeline WHERE master_uid = %s ORDER BY created_at DESC LIMIT 1",
        (parsed_notice["master_uid"],)
    )
    last_record = cursor.fetchone()
    if last_record and last_record[0] == current_hash:
        return {"status": "SKIPPED_NO_DIFF"}

    # 2. 마스터 현재 단계 조회
    cursor.execute(
        "SELECT stage_code, stage_seq FROM redevelopment_projects WHERE master_uid = %s",
        (parsed_notice["master_uid"],)
    )
    master = cursor.fetchone()
    current_stage, current_seq = master[0], master[1]
    new_stage = parsed_notice["extracted_stage"]
    new_seq = STAGE_WEIGHT.get(new_stage, 0)

    # 3. 비정상 전이(역행) 검증
    is_backward = (new_seq < current_seq) and (new_stage != "DISSOLVED")
    manual_review = is_backward or (new_seq == 0)

    # 4. 트랜잭션 반영
    try:
        cursor.execute("BEGIN;")
        
        # Timeline Insert
        cursor.execute("""
            INSERT INTO project_timeline (
                master_uid, previous_stage, new_stage, stage_seq,
                notice_no, notice_date, source_type, source_title,
                source_url, source_payload_hash, is_backward_jump, manual_review_flag
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (master_uid, new_stage, notice_no) DO NOTHING;
        """, (
            parsed_notice["master_uid"], current_stage, new_stage, new_seq,
            parsed_notice["notice_no"], parsed_notice["notice_date"], parsed_notice["source_type"],
            parsed_notice["title"], parsed_notice["url"], current_hash, is_backward, manual_review
        ))

        # 정상 단계 진행일 경우 마스터 갱신
        if not manual_review and not is_backward:
            is_active = False if new_stage == "DISSOLVED" else True
            cursor.execute("""
                UPDATE redevelopment_projects
                SET stage_code = %s, stage_seq = %s, updated_at = NOW(), is_active = %s
                WHERE master_uid = %s;
            """, (new_stage, new_seq, is_active, parsed_notice["master_uid"]))
            
        cursor.execute("COMMIT;")
        return {"status": "SUCCESS", "new_stage": new_stage, "manual_review": manual_review}
    except Exception as e:
        cursor.execute("ROLLBACK;")
        raise e

```

---

## 5. 프론트엔드 아키텍처 및 화면 구조 (Architecture & UI)

### 5.1 폴더 구조

```text
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                       # 통합 대시보드 (Map + Split View)
│   ├── api/
│   │   ├── districts/route.ts         # PostGIS BBox 동적 GeoJSON API
│   │   └── timeline/route.ts          # 실시간 변경 타임라인 피드 API
│   └── globals.css
├── components/
│   ├── map/
│   │   ├── MapCanvas.tsx              # Mapbox GL / Leaflet 렌더러
│   │   ├── ClusterLayer.tsx           # 줌 8~11 클러스터링 뱃지
│   │   └── PolygonLayer.tsx           # 줌 12~18 Fill & Line 레이어
│   ├── sidebar/
│   │   ├── TimelineFeed.tsx           # 고시·공고 실시간 피드
│   │   └── DistrictCard.tsx           # 구역 상세 Slide-over 패널
│   └── ui/
│       ├── FloatingFilterBar.tsx      # 동의율/지위양도 플로팅 필터바
│       └── StageBadge.tsx             # 8단계 색상 라벨
├── lib/
│   ├── supabase/
│   │   └── client.ts                  # Supabase Client
│   ├── constants/
│   │   └── stages.ts                  # 단계 정의 및 컬러 팔레트 매핑
│   └── utils/
│       └── geojson.ts                 # Mapbox 피처 변환 유틸

```

### 5.2 화면 레이아웃

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Top Floating Filter Bar]                                              │
│  [전체 유형 ▼] [동의율 ≥ 70% □] [지위양도 가능 □] [탄천 공공연계 □]   │
├──────────────────────────────────────┬─────────────────────────────────┤
│                                      │  [Slide-over Side Panel]        │
│                                      │  ┌───────────────────────────┐  │
│                                      │  │  [Tab: 타임라인 | 구역상세] │  │
│                                      │  ├───────────────────────────┤  │
│                                      │  │  자양4동 신속통합기획      │  │
│             Map Canvas               │  │  [조합설립인가] 단계       │  │
│      (Mapbox GL JS 렌더링)           │  │  동의율: 74.2% (완화 충족) │  │
│                                      │  │  지위양도: 3년 지연 예외  │  │
│   ● 클러스터 마커 (Zoom 8-11)        │  │  탄천물재생 공원화 도보5분│  │
│   ■ 폴리곤 레이어 (Zoom 12-18)       │  │  -----------------------  │  │
│                                      │  │  [최신 행정고시 링크]     │  │
│                                      │  └───────────────────────────┘  │
└──────────────────────────────────────┴─────────────────────────────────┘

```

### 5.3 상태 단계별 색상 정책 (Theme Tokens)

Tailwind CSS 변수 및 Mapbox Expression에 직접 매핑하는 색상 코드 표준입니다.

| 단계 코드 | 단계 명칭 | HEX 코드 | Tailwind 클래스 | 상태 의미 |
| --- | --- | --- | --- | --- |
| `CANDIDATE` | 후보지 선정 | `#FACC15` | `bg-yellow-400` | 초기 후보지 단계 (미확정) |
| `DESIGNATED` | 구역지정 고시 | `#FB923C` | `bg-orange-400` | 법정 정비구역 공식 확정 |
| `PROMOT_COMM` | 추진위 승인 | `#F97316` | `bg-orange-500` | 공공지원 및 추진위 구성 |
| `UNION_AUTH` | 조합설립 인가 | `#3B82F6` | `bg-blue-500` | 본격 사업 주체 확립 |
| `BIZ_PLAN` | 사업시행 인가 | `#6366F1` | `bg-indigo-500` | 건축 심의 및 설계 확정 |
| `MGMT_DISP` | 관리처분 인가 | `#8B5CF6` | `bg-purple-500` | 분양/철거 직전 확정 단계 |
| `CONSTRUCTION` | 착공 | `#10B981` | `bg-emerald-500` | 공사 착수 (투자 리스크 해소) |
| `COMPLETED` | 준공 / 입주 | `#059669` | `bg-emerald-600` | 사업 완료 |
| `DISSOLVED` | 구역 해제 | `#94A3B8` | `bg-slate-400` | 사업 취소 / 철회 |

---

## 6. 단계별 개발 로드맵 (Milestones)

```
[Phase 1: MVP Core] ───> [Phase 2: Automated Pipeline] ───> [Phase 3: Production & Alerts]
(수동 적재 & 정적 서빙)       (일일 배치 크롤링 & MVT 타일셋)     (유저 제보 & 카카오/웹훅 알림)

```

* **Phase 1: MVP 수동 적재 및 코어 맵 뷰어 구축 (기한: 3주)**
* 서울시 공식 정비구역(496개) VWorld SHP 일괄 취득 및 PostGIS 초기 마이그레이션.


* 신통기획·모아타운 대상지(200+) 지번 조서 기반 수동 Dissolve 스크립트 실행 및 적재.


* Next.js + Mapbox GL 캔버스 구현 (기본 폴리곤 렌더링 및 클릭 시 기초 속성 팝업 표출).


* **Phase 2: 일일 자동 수집 배치 & Vector Tile 최적화 (기한: 4주)**
* Playwright 크롤러를 이용한 서울시 고시·공고 일일 스크래퍼 구축 및 GitHub Actions 연동.
* SHA-256 기반 Diff 감지 엔진 및 `project_timeline` 자동 생성 파이프라인 가동.
* Tippecanoe 연동을 통한 MVT 사전 빌드 및 CloudFront 서빙 파이프라인 전환.


* 정책 지표(동의율, 지위양도 예외 조건) 필터링 UI 탑재.


* **Phase 3: 상용화, 검수 백오피스 및 알림 서비스 (기한: 4주)**
* Entity Resolution 점수 0.60~0.85 대상자용 관리자 검수(Admin Dashboard) 화면 구현.
* 특정 구역 즐겨찾기 유저 대상 상태 변경 웹훅/알림톡 발송 모듈 연동.
* 현금청산 위험 구역 분석 알고리즘 고도화.



---

## 7. 예외 처리 및 성능 최적화 가이드

### 7.1 대용량 GeoJSON 렌더링 성능 가이드

1. **줌 레벨별 공차($\epsilon$) 분기 서빙**:
* 광역 뷰(Zoom < 12): `ST_SimplifyPreserveTopology(geom, 0.001)`을 통해 꼭짓점을 90% 이상 감축한다.


* 상세 뷰(Zoom $\ge$ 15): `ST_SnapToGrid(geom, 0.00001)`을 적용하여 소수점을 5자리로 제한하고 유효 페이로드를 줄인다.


2. **클러스터링 레이어 분리**:
* Zoom 8~11 구간에서는 브라우저의 지오메트리 렌더링을 차단하고, `centroid` 필드만 가져와 `Supercluster` 엔진으로 집계 뱃지만 노출한다.



### 7.2 PostGIS BBox 쿼리 최적화 패턴

클라이언트 뷰포트 이동 시 정밀 연산 함수(`ST_Intersects`)를 단독 호출하지 않고, 바운딩 박스 오버랩 연산자(`&&`)를 선행 적용하여 인덱스 스캔을 강제한다.

```sql
-- Viewport BBox API 쿼리 구현부
SELECT 
    master_uid,
    name,
    biz_type,
    stage_code,
    consent_rate,
    is_transferable,
    ST_AsGeoJSON(
        CASE 
            WHEN :zoom < 12 THEN ST_SimplifyPreserveTopology(geom, 0.001)
            WHEN :zoom BETWEEN 12 AND 14 THEN ST_SimplifyPreserveTopology(geom, 0.0001)
            ELSE ST_SnapToGrid(geom, 0.00001)
        END
    )::json AS geometry
FROM redevelopment_projects
WHERE geom && ST_MakeEnvelope(:min_lon, :min_lat, :max_lon, :max_lat, 4326)
  AND is_active = TRUE;

```

### 7.3 파이프라인 예외 처리(Error Handling) 가이드

* **공간 위상 오류 (Non-valid Topology)**:
* 후보지 PNU 병합 중 `Self-intersection` 발생 시 즉시 `ST_MakeValid`를 실행하고, 유효성 회복 실패 시 `is_active = FALSE` 처리 후 에러 로그 테이블에 적재한다.




* **고시 문서 파싱 실패 (PDF Format Drift)**:
* 문서 내 표(Table) 형식이 변경되어 PNU 정규식 매칭 건수가 0건일 경우, 수동 검수 플래그(`manual_review_flag = TRUE`)를 활성화하고 슬랙(Slack) 웹훅으로 알림을 전송한다.


* **WFS API 다운타임 방어**:
* VWorld API 호출 실패 시 직전 생성된 로컬 스냅샷 캐시 파일(`.geojson.cache`)을 참조하는 Fallback 모드로 즉각 전환한다.