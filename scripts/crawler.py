#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
서울시 정비사업 정보몽땅(cleanup.seoul.go.kr) 크롤러
- 공공데이터 포털 API 키 없이 공식 공개 웹페이지 테이블을 직접 스크래핑합니다.
- 신속통합기획 및 재개발 대상지 목록의 구역명, 추진단계, 고시일자, 세대수를 추출합니다.
- 기존 public/data/districts.geojson 과 비교(Diff)하여 변경사항이 있을 때만 파일에 반영합니다.
- 반영 시 public/data/districts.json 및 lib/constants/districtsData.ts 동기화를 함께 수행합니다.
"""

import os
import re
import json
import ssl
import sys
from datetime import datetime
import urllib3
import requests
from bs4 import BeautifulSoup

# 콘솔 출력 UTF-8 인코딩 설정 (Windows 터미널 호환)
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# SSL 인증서 경고 숨김 (공공기관 레거시 인증서 대응)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 프로젝트 루트 경로 계산
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
GEOJSON_PATH = os.path.join(PROJECT_ROOT, "public", "data", "districts.geojson")
JSON_PATH = os.path.join(PROJECT_ROOT, "public", "data", "districts.json")
TS_DATA_PATH = os.path.join(PROJECT_ROOT, "lib", "constants", "districtsData.ts")

# 스크래핑 대상 URL (정비사업 정보몽땅 - 신속통합기획 현황 테이블)
TARGET_URL = "https://cleanup.seoul.go.kr/cleanup/view/publicIntgrPlanSttn.do"

STAGE_MAP = {
    "기본계획": ("PLAN_DESIGNATION", 1, "구역지정 고시"),
    "정비구역지정": ("PLAN_DESIGNATION", 1, "구역지정 고시"),
    "구역지정": ("PLAN_DESIGNATION", 1, "구역지정 고시"),
    "추진위": ("PROMOTION_COMMITTEE", 2, "추진위 승인"),
    "추진위원회": ("PROMOTION_COMMITTEE", 2, "추진위 승인"),
    "조합": ("UNION_AUTH", 3, "조합설립 인가"),
    "조합설립": ("UNION_AUTH", 3, "조합설립 인가"),
    "시행자지정": ("UNION_AUTH", 3, "조합설립 인가"),
    "통심완료": ("BUSINESS_AUTH", 4, "사업시행 인가"),
    "통합심의": ("BUSINESS_AUTH", 4, "사업시행 인가"),
    "사업시행": ("BUSINESS_AUTH", 4, "사업시행 인가"),
    "사업시행인가": ("BUSINESS_AUTH", 4, "사업시행 인가"),
    "관리처분": ("MGMT_DISPOSAL", 5, "관리처분 인가"),
    "관리처분인가": ("MGMT_DISPOSAL", 5, "관리처분 인가"),
    "착공": ("CONSTRUCTION_START", 6, "착공"),
    "준공": ("COMPLETION", 7, "준공인가"),
    "해제": ("PLAN_DESIGNATION", 1, "구역해제"),
}


def normalize_name(name: str) -> str:
    """구역명 매칭을 위한 문자열 정규화 (공백, 특수문자, '일대', '구역' 제거)"""
    if not name:
        return ""
    clean = re.sub(r"[\s\-_(),·]", "", name)
    clean = re.sub(r"(구역|일대|재개발|재건축|아파트)", "", clean)
    return clean


def parse_stage(stage_raw: str):
    """원시 단계 문자열에서 정규화된 단계 코드, 순서, 라벨을 반환"""
    stage_raw = stage_raw.strip()
    for key, val in STAGE_MAP.items():
        if key in stage_raw:
            return val[0], val[1], val[2]
    return "PLAN_DESIGNATION", 1, stage_raw


def scrape_cleanup_data():
    """정보몽땅 공개 웹페이지에서 구역 목록 테이블을 크롤링하여 정제된 리스트 반환"""
    print(f"[1/4] 데이터 수집 시작: {TARGET_URL}")
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    try:
        response = requests.get(TARGET_URL, headers=headers, verify=False, timeout=15)
        response.raise_for_status()
    except Exception as e:
        print(f"[ERROR] 웹페이지 요청 실패: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    tables = soup.find_all("table")
    print(f"       수집된 테이블 수: {len(tables)}개")

    scraped_items = []

    for table in tables:
        rows = table.find_all("tr")
        if not rows:
            continue

        header_cells = [th.get_text(strip=True) for th in rows[0].find_all(["th", "td"])]
        # 자치구명, 구역명 컬럼 인덱스 찾기
        gu_idx = -1
        name_idx = -1
        households_idx = -1
        stage_idx = -1
        date_idx = -1

        for idx, text in enumerate(header_cells):
            if "자치구" in text:
                gu_idx = idx
            elif "구역" in text and "지정" not in text:
                name_idx = idx
            elif "세대수" in text:
                households_idx = idx
            elif "단계" in text or "추진" in text:
                stage_idx = idx
            elif "고시" in text or "일자" in text or "날짜" in text:
                date_idx = idx

        # 기본 인덱스 매핑 (실제 테이블 구조: [연번, 자치구명, 구역명, 면적, 세대수, 현 추진단계, 고시일])
        if gu_idx == -1 and len(header_cells) >= 2:
            gu_idx = 1
        if name_idx == -1 and len(header_cells) >= 3:
            name_idx = 2
        if households_idx == -1 and len(header_cells) >= 5:
            households_idx = 4
        if stage_idx == -1 and len(header_cells) >= 6:
            stage_idx = 5
        if date_idx == -1 and len(header_cells) >= 7:
            date_idx = 6

        for row in rows[1:]:
            cells = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
            if len(cells) < 3:
                continue

            gu = cells[gu_idx] if gu_idx < len(cells) else ""
            raw_name = cells[name_idx] if name_idx < len(cells) else ""

            if not gu or not raw_name or gu == "자치구명" or raw_name == "구역명":
                continue

            # 자치구명 표준화 (예: '중랑' -> '중랑구')
            if not gu.endswith("구"):
                gu = gu + "구"

            households = 0
            if households_idx < len(cells):
                h_str = re.sub(r"[^\d]", "", cells[households_idx])
                if h_str:
                    households = int(h_str)

            stage_raw = cells[stage_idx] if stage_idx < len(cells) else "구역지정"
            date_str = cells[date_idx] if date_idx < len(cells) else ""

            # 날짜 정규화 (YYYY-MM-DD)
            date_match = re.search(r"(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})", date_str)
            approval_date = (
                f"{date_match.group(1)}-{int(date_match.group(2)):02d}-{int(date_match.group(3)):02d}"
                if date_match
                else ""
            )

            stage_code, stage_seq, stage_label = parse_stage(stage_raw)

            scraped_items.append({
                "gu": gu,
                "raw_name": raw_name,
                "norm_name": normalize_name(raw_name),
                "households": households,
                "stage_raw": stage_raw,
                "stage_code": stage_code,
                "stage_seq": stage_seq,
                "stage_label": stage_label,
                "approval_date": approval_date,
            })

    # 중복 구역 제거 (테이블 간 중복 시 가장 진척된 단계 또는 최신 날짜 우선)
    deduped_dict = {}
    for item in scraped_items:
        key = f"{item['gu']}_{item['norm_name']}"
        if key not in deduped_dict:
            deduped_dict[key] = item
        else:
            prev = deduped_dict[key]
            # 더 최신 고시일자이거나 단계가 더 앞선 경우 갱신
            if (item["approval_date"] > prev["approval_date"]) or (
                item["stage_seq"] > prev["stage_seq"]
            ):
                deduped_dict[key] = item

    final_items = list(deduped_dict.values())
    print(f"       총 {len(final_items)}건의 구역 데이터 정제 완료 (중복 {len(scraped_items) - len(final_items)}건 정리)")
    return final_items


def sync_files_with_geojson(geojson_data):
    """districts.geojson 을 저장하고, districts.json 및 districtsData.ts를 자동 동기화"""
    geojson_str = json.dumps(geojson_data, ensure_ascii=False, indent=2)

    # 1. public/data/districts.geojson 저장
    with open(GEOJSON_PATH, "w", encoding="utf-8") as f:
        f.write(geojson_str)
    print(f"[저장] {GEOJSON_PATH} 갱신 완료")

    # 2. public/data/districts.json 저장
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        f.write(geojson_str)
    print(f"[저장] {JSON_PATH} 갱신 완료")

    # 3. lib/constants/districtsData.ts 저장 (컴포넌트 직접 import용)
    ts_content = (
        'import { DistrictFeatureCollection } from "@/lib/types/district";\n\n'
        f"export const DISTRICTS_GEOJSON: DistrictFeatureCollection = {geojson_str};\n"
    )
    with open(TS_DATA_PATH, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"[저장] {TS_DATA_PATH} 갱신 완료")


def is_safe_match(name1: str, name2: str) -> bool:
    """구역명 비교 시 숫자 불일치(신림1 vs 신림10) 및 오탐 방지"""
    if not name1 or not name2:
        return False
    if name1 == name2:
        return True
    num1 = re.findall(r"\d+", name1)
    num2 = re.findall(r"\d+", name2)
    if num1 or num2:
        return num1 == num2 and (name1 in name2 or name2 in name1)
    return (len(name1) >= 3 and name1 in name2) or (len(name2) >= 3 and name2 in name1)


def compare_and_update(scraped_items):
    """기존 districts.geojson 데이터와 비교(Diff)하고 변경사항이 있을 때만 업데이트"""
    print(f"[2/4] 기존 로컬 데이터 로드: {GEOJSON_PATH}")
    if not os.path.exists(GEOJSON_PATH):
        print(f"[ERROR] 파일이 존재하지 않습니다: {GEOJSON_PATH}")
        return False

    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)

    features = geojson_data.get("features", [])
    print(f"       기존 등록된 구역 수: {len(features)}개")

    # 기존 구역 인덱싱 (자치구 + 정규화된 구역명 기준)
    feature_lookup = {}
    for feat in features:
        props = feat.get("properties", {})
        gu = props.get("gu", "")
        raw_name = props.get("raw_name", "") or props.get("name", "")
        norm = normalize_name(raw_name)
        key = f"{gu}_{norm}"
        feature_lookup[key] = feat

    print("[3/4] 변경사항(Diff) 비교 분석 중...")
    diff_logs = []
    has_changes = False
    matched_feat_ids = set()

    for item in scraped_items:
        key = f"{item['gu']}_{item['norm_name']}"
        matched_feat = feature_lookup.get(key)

        if not matched_feat:
            # 안전한 부분 일치 탐색 (숫자 일치 검증)
            for exist_key, feat in feature_lookup.items():
                if feat.get("id") in matched_feat_ids:
                    continue
                if exist_key.startswith(item["gu"]):
                    exist_norm = exist_key.split("_", 1)[1]
                    if is_safe_match(item["norm_name"], exist_norm):
                        matched_feat = feat
                        break

        if matched_feat:
            feat_id = matched_feat.get("id")
            if feat_id:
                matched_feat_ids.add(feat_id)
            props = matched_feat.get("properties", {})
            district_name = props.get("name", item["raw_name"])
            changes = []

            # 1. 추진단계 변경 확인
            cur_stage = props.get("stage_raw", "")
            if item["stage_raw"] and cur_stage and item["stage_raw"] != cur_stage:
                changes.append(f"추진단계: '{cur_stage}' ➔ '{item['stage_raw']}'")
                props["stage_raw"] = item["stage_raw"]
                props["stage_code"] = item["stage_code"]
                props["stage_seq"] = item["stage_seq"]
                props["stage_label"] = item["stage_label"]
                has_changes = True

            # 2. 고시일자 최신화 확인
            cur_date = props.get("approval_date", "")
            if item["approval_date"] and cur_date and item["approval_date"] > cur_date:
                changes.append(f"고시일자: '{cur_date}' ➔ '{item['approval_date']}'")
                props["approval_date"] = item["approval_date"]
                has_changes = True

            # 3. 세대수 최신화 확인
            cur_households = props.get("total_households", 0)
            if item["households"] > 0 and cur_households == 0:
                changes.append(f"세대수: {cur_households}세대 ➔ {item['households']}세대")
                props["total_households"] = item["households"]
                has_changes = True

            if changes:
                diff_logs.append(f"  • [{district_name}] " + " | ".join(changes))

    # [4/4] 결과 반영 및 보고
    print("\n[4/4] 크롤링 & 비교 결과 보고")
    print("=" * 60)
    if has_changes:
        print(f"🎉 총 {len(diff_logs)}개 구역의 새로운 변경사항이 감지되었습니다!")
        for log in diff_logs[:20]:
            print(log)
        if len(diff_logs) > 20:
            print(f"  ... 외 {len(diff_logs) - 20}건 추가 변경")

        print("-" * 60)
        print("💾 변경사항을 파일에 반영합니다...")
        geojson_data["last_crawled_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sync_files_with_geojson(geojson_data)
        print("✅ 모든 데이터 파일 최신화 완료!")
        return True
    else:
        print("✨ 변경된 구역 정보가 없습니다. (기존 데이터가 최신 상태를 유지하고 있습니다.)")
        print("ℹ️ 불필요한 파일 수정을 방지하기 위해 파일을 변경하지 않습니다.")
        return False


def main():
    print("=" * 60)
    print(" 서울시 정비사업 정보몽땅 무키(Keyless) 자동 크롤러 실행 ")
    print(f" 실행 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    scraped_items = scrape_cleanup_data()
    if not scraped_items:
        print("[경고] 수집된 데이터가 없습니다. 프로세스를 종료합니다.")
        sys.exit(0)

    updated = compare_and_update(scraped_items)
    print("=" * 60)
    print(" 크롤러 작업이 성공적으로 완료되었습니다. ")
    print("=" * 60)


if __name__ == "__main__":
    main()
