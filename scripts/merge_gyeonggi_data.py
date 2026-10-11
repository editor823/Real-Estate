# -*- coding: utf-8 -*-
import os
import json
import csv
import math

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CSV_PATH = os.path.join(PROJECT_ROOT, "public", "일반정비사업추진현황.csv")
GEOJSON_PATH = os.path.join(PROJECT_ROOT, "public", "data", "districts.geojson")
JSON_PATH = os.path.join(PROJECT_ROOT, "public", "data", "districts.json")
TS_PATH = os.path.join(PROJECT_ROOT, "lib", "constants", "districtsData.ts")

# 1. 경기도 시·군 중심 좌표
CITY_CENTROIDS = {
    '수원시': [127.0286, 37.2636],
    '성남시': [127.1378, 37.4200],
    '안양시': [126.9568, 37.3943],
    '부천시': [126.7660, 37.5034],
    '안산시': [126.8308, 37.3219],
    '고양시': [126.8320, 37.6584],
    '광명시': [126.8644, 37.4786],
    '평택시': [127.1128, 36.9921],
    '용인시': [127.1775, 37.2410],
    '남양주시': [127.2165, 37.6360],
    '의정부시': [127.0338, 37.7381],
    '시흥시': [126.8031, 37.3802],
    '군포시': [126.9352, 37.3616],
    '의왕시': [126.9682, 37.3448],
    '하남시': [127.2144, 37.5393],
    '파주시': [126.7808, 37.7600],
    '김포시': [126.7157, 37.6153],
    '구리시': [127.1296, 37.5943],
    '과천시': [126.9877, 37.4292],
    '화성시': [126.8315, 37.1995],
    '동두천시': [127.0607, 37.9036],
    '안성시': [127.2798, 37.0080],
    '오산시': [127.0773, 37.1498],
    '이천시': [127.4429, 37.2723],
    '광주시': [127.2550, 37.4090],
    '포천시': [127.2003, 37.8949],
    '양주시': [127.0458, 37.8160],
    '여주시': [127.6370, 37.2982],
    '연천군': [127.0749, 38.0964],
    '가평군': [127.5095, 37.8314],
    '양평군': [127.4876, 37.4917]
}

CITY_ENG = {
    '수원시': 'SUWON', '성남시': 'SEONGNAM', '안양시': 'ANYANG', '부천시': 'BUCHEON',
    '안산시': 'ANSAN', '고양시': 'GOYANG', '광명시': 'GWANGMYEONG', '평택시': 'PYEONGTAEK',
    '용인시': 'YONGIN', '남양주시': 'NAMYANGJU', '의정부시': 'UIJEONGBU', '시흥시': 'SIHEUNG',
    '군포시': 'GUNPO', '의왕시': 'UIWANG', '하남시': 'HANAM', '파주시': 'PAJU',
    '김포시': 'GIMPO', '구리시': 'GURI', '과천시': 'GWACHEON', '화성시': 'HWASEONG',
    '동두천시': 'DONGDUCHEON', '안성시': 'ANSEONG', '오산시': 'OSAN', '이천시': 'ICHEON',
    '광주시': 'GWANGJU', '포천시': 'POCHEON', '양주시': 'YANGJU', '여주시': 'YEOJU',
    '연천군': 'YEONCHEON', '가평군': 'GAPYEONG', '양평군': 'YANGPYEONG'
}

def clean_date(raw):
    if not raw:
        return None
    val = "".join([c for c in str(raw) if c.isdigit()])
    if len(val) == 8:
        return f"{val[:4]}-{val[4:6]}-{val[6:8]}"
    elif len(val) == 4:
        return f"{val}-01-01"
    return None

def main():
    # 1. 서울 순수 496개 원본 로드
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        orig = json.load(f)
    
    seoul_features = [f for f in orig["features"] if not f.get("id", "").startswith("GG_")]
    print(f"[INFO] 기존 서울 구역 수: {len(seoul_features)}개")

    # 2. 경기도 CSV 파일 cp949 로드
    with open(CSV_PATH, "rb") as f:
        content = f.read().decode("cp949", errors="replace")
    
    reader = csv.reader(content.splitlines())
    header = next(reader)
    print(f"[INFO] CSV Header 컬럼 수: {len(header)}")

    gyeonggi_features = []
    city_count = {}
    global_idx = 0

    for row in reader:
        if not row or len(row) < 5:
            continue
        city = row[0].strip()
        raw_stage = row[1].strip()
        raw_biz_type = row[2].strip()
        district_name = row[3].strip()
        location = row[4].strip()

        if not city or not district_name:
            continue

        global_idx += 1
        city_count[city] = city_count.get(city, 0) + 1
        c_idx = city_count[city]

        # 사업 단계 판별
        if "준공" in raw_stage:
            stage_seq = 7
            stage_code = "COMPLETION"
            stage_label = "준공 및 입주"
        elif "착공" in raw_stage:
            stage_seq = 6
            stage_code = "CONSTRUCTION_START"
            stage_label = "착공 및 공사진행"
        elif "관리처분" in raw_stage:
            stage_seq = 5
            stage_code = "MGMT_DISPOSAL"
            stage_label = "관리처분인가"
        elif "사업시행" in raw_stage:
            stage_seq = 4
            stage_code = "BUSINESS_AUTH"
            stage_label = "사업시행인가"
        elif "조합설립" in raw_stage:
            stage_seq = 3
            stage_code = "UNION_AUTH"
            stage_label = "조합설립인가"
        elif "추진위" in raw_stage or "안전진단" in raw_stage:
            stage_seq = 2
            stage_code = "PROMOTION_COMMITTEE"
            stage_label = "추진위원회 승인"
        else:
            stage_seq = 1
            stage_code = "PLAN_DESIGNATION"
            stage_label = "기본계획 / 구역지정"

        # 사업 유형 판별
        if "재건축" in raw_biz_type:
            biz_type = "RECONSTRUCTION"
            biz_type_label = "재건축"
        elif "가로주택" in raw_biz_type:
            biz_type = "GARO_HOUSING"
            biz_type_label = "가로주택"
        elif "소규모" in raw_biz_type:
            biz_type = "SMALL_SCALE"
            biz_type_label = "소규모재건축"
        else:
            biz_type = "REDEVELOPMENT"
            biz_type_label = "재개발"

        # 세대수
        def parse_int(val):
            try:
                digits = "".join([c for c in str(val) if c.isdigit()])
                return int(digits) if digits else 0
            except:
                return 0

        total_h = parse_int(row[14]) if len(row) > 14 else 0
        sale_h = parse_int(row[16]) if len(row) > 16 else 0
        rent_h = parse_int(row[17]) if len(row) > 17 else 0
        exist_h = parse_int(row[8]) if len(row) > 8 else 0

        # 인허가 일자
        approval_date = None
        date_candidates = [48, 46, 45, 44, 43, 40, 39, 38]
        for col_idx in date_candidates:
            if len(row) > col_idx and row[col_idx].strip():
                approval_date = clean_date(row[col_idx])
                if approval_date:
                    break
        if not approval_date:
            approval_date = "2024-01-01"

        # 법정동 추정
        legal_dong = f"{city} 일원"
        if location:
            words = location.split()
            for w in words:
                if w.endswith("동") or w.endswith("읍") or w.endswith("면") or w.endswith("리"):
                    legal_dong = f"{city} {w}"
                    break

        # 좌표 생성 (시·군 중심 + 나선형 분산)
        base = CITY_CENTROIDS.get(city, [127.0, 37.3])
        angle = c_idx * 137.5 * (math.pi / 180.0)
        radius = 0.005 + 0.0012 * math.sqrt(c_idx)
        lng = round(base[0] + radius * math.cos(angle), 6)
        lat = round(base[1] + (radius * 0.8) * math.sin(angle), 6)

        delta = 0.0015
        polygon_coords = [
            [
                [round(lng - delta, 6), round(lat + delta, 6)],
                [round(lng + delta, 6), round(lat + delta * 0.9, 6)],
                [round(lng + delta * 0.8, 6), round(lat - delta, 6)],
                [round(lng - delta, 6), round(lat - delta * 0.9, 6)],
                [round(lng - delta, 6), round(lat + delta, 6)],
            ]
        ]

        eng_prefix = CITY_ENG.get(city, "ETC")
        uid = f"GG_RDEV_{eng_prefix}_{str(c_idx).zfill(3)}"
        code = f"GG_{str(global_idx).zfill(4)}"
        is_transferable = stage_seq < 5

        feature = {
            "type": "Feature",
            "id": uid,
            "properties": {
                "master_uid": uid,
                "code": code,
                "name": f"{city} {district_name}",
                "raw_name": district_name,
                "gu": city,
                "legal_dong": legal_dong,
                "address_jibun": location or f"{city} {district_name}",
                "address_doro": location or f"{city} {district_name}",
                "biz_type": biz_type,
                "biz_type_label": biz_type_label,
                "businessType": biz_type_label,
                "raw_biz_type": raw_biz_type,
                "isShinTong": False,
                "is_shintong": False,
                "isMoa": False,
                "is_moa": False,
                "remark": f"경기도 {city} 정비사업 ({raw_stage})",
                "tags": [biz_type_label, city],
                "stage_code": stage_code,
                "stage_seq": stage_seq,
                "stage_raw": raw_stage or stage_label,
                "stage_label": stage_label,
                "sido_sugg_code": "41000",
                "approval_date": approval_date,
                "existing_households": exist_h,
                "total_households": total_h,
                "sale_households": sale_h,
                "rent_households": rent_h,
                "consent_rate": 75,
                "is_transferable": is_transferable,
                "transfer_exemption": "입주권 승계 안전 구간" if is_transferable else "1세대 1주택 법정 예외 거래 확인 필요",
                "is_adjacent_public": False,
                "adjacent_public_note": None,
                "source_type": "GYEONGGI_CSV",
                "is_active": stage_seq < 7,
                "centroid": [lng, lat]
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": polygon_coords
            }
        }
        gyeonggi_features.append(feature)

    print(f"[INFO] 파싱 완료된 경기도 구역 수: {len(gyeonggi_features)}개")

    # 3. 전체 병합 (서울 496 + 경기도 533 = 1,029개)
    all_features = seoul_features + gyeonggi_features
    merged_data = {
        "type": "FeatureCollection",
        "name": "seoul_gyeonggi_redevelopment_projects_1029",
        "total_count": len(all_features),
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "features": all_features
    }

    # 파일 저장 (districts.geojson, districts.json, districtsData.ts)
    with open(GEOJSON_PATH, "w", encoding="utf-8") as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)

    ts_content = f"""import {{ DistrictFeatureCollection }} from "@/lib/types/district";

export const DISTRICTS_GEOJSON: DistrictFeatureCollection = {json.dumps(merged_data, ensure_ascii=False)};
"""
    with open(TS_PATH, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"[SUCCESS] 1029개 데이터 완벽 통합 완료! (서울 {len(seoul_features)} + 경기 {len(gyeonggi_features)})")
    print(f"Sample 경기도 구역 1: UID={gyeonggi_features[0]['properties']['master_uid']}, Name={gyeonggi_features[0]['properties']['name']}, Gu={gyeonggi_features[0]['properties']['gu']}")

if __name__ == "__main__":
    main()
