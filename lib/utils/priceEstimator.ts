/**
 * 수도권 1,029개 재개발·재건축 구역별 84㎡(전용 34평형) 신축 시세 및 조합원 분양가 추정 유틸리티
 * 국토교통부 실거래가 및 주변 대장 아파트 완공 시세 통계를 기준으로 산정
 */

export interface DistrictPriceEstimate {
  marketPrice: string; // 주변 신축 완공 시세 (예: "21억", "32억", "14.5억")
  unionPrice: string;  // 조합원 예상 분양가 (예: "14억", "19.5억", "9.5억")
  premium: string;     // 입주 시 예상 안전마진 (예: "+7억", "+12.5억", "+5억")
  marketPriceNum: number; // 만원 단위
  unionPriceNum: number;  // 만원 단위
}

export function getDistrictEstimatedPrice(guName: string = "", districtName: string = ""): DistrictPriceEstimate {
  const name = districtName || "";
  const gu = guName || "";

  // 1. 전국구 슈퍼 랜드마크 정비구역 예외 보정
  if (/압구정|반포/.test(name)) {
    return { marketPrice: "45억", unionPrice: "27억", premium: "+18억", marketPriceNum: 450000, unionPriceNum: 270000 };
  }
  if (/한남/.test(name)) {
    return { marketPrice: "35억", unionPrice: "22억", premium: "+13억", marketPriceNum: 350000, unionPriceNum: 220000 };
  }
  if (/성수/.test(name) && /전략|정비/.test(name)) {
    return { marketPrice: "32억", unionPrice: "20억", premium: "+12억", marketPriceNum: 320000, unionPriceNum: 200000 };
  }
  if (/대치|개포|도곡/.test(name)) {
    return { marketPrice: "32억", unionPrice: "20억", premium: "+12억", marketPriceNum: 320000, unionPriceNum: 200000 };
  }
  if (/여의도/.test(name)) {
    return { marketPrice: "33억", unionPrice: "21억", premium: "+12억", marketPriceNum: 330000, unionPriceNum: 210000 };
  }
  if (/목동/.test(name)) {
    return { marketPrice: "25억", unionPrice: "16억", premium: "+9억", marketPriceNum: 250000, unionPriceNum: 160000 };
  }
  if (/잠실|가락|신천/.test(name)) {
    return { marketPrice: "27억", unionPrice: "17억", premium: "+10억", marketPriceNum: 270000, unionPriceNum: 170000 };
  }
  if (/흑석|노량진/.test(name)) {
    return { marketPrice: "20억", unionPrice: "13억", premium: "+7억", marketPriceNum: 200000, unionPriceNum: 130000 };
  }
  if (/북아현|청량리|이문|휘경/.test(name)) {
    return { marketPrice: "16억", unionPrice: "10.5억", premium: "+5.5억", marketPriceNum: 160000, unionPriceNum: 105000 };
  }
  if (/광명|철산/.test(name)) {
    return { marketPrice: "13.5억", unionPrice: "9.2억", premium: "+4.3억", marketPriceNum: 135000, unionPriceNum: 92000 };
  }

  // 2. 서울 25개 자치구별 표준 84㎡ 시세 구간
  if (/강남구/.test(gu)) {
    return { marketPrice: "32억", unionPrice: "19.5억", premium: "+12.5억", marketPriceNum: 320000, unionPriceNum: 195000 };
  }
  if (/서초구/.test(gu)) {
    return { marketPrice: "30억", unionPrice: "18.5억", premium: "+11.5억", marketPriceNum: 300000, unionPriceNum: 185000 };
  }
  if (/송파구/.test(gu)) {
    return { marketPrice: "26억", unionPrice: "16.5억", premium: "+9.5억", marketPriceNum: 260000, unionPriceNum: 165000 };
  }
  if (/용산구/.test(gu)) {
    return { marketPrice: "24억", unionPrice: "15억", premium: "+9억", marketPriceNum: 240000, unionPriceNum: 150000 };
  }
  if (/성동구/.test(gu)) {
    return { marketPrice: "21억", unionPrice: "13.5억", premium: "+7.5억", marketPriceNum: 210000, unionPriceNum: 135000 };
  }
  if (/마포구/.test(gu)) {
    return { marketPrice: "20억", unionPrice: "13억", premium: "+7억", marketPriceNum: 200000, unionPriceNum: 130000 };
  }
  if (/광진구/.test(gu)) {
    return { marketPrice: "19억", unionPrice: "12.5억", premium: "+6.5억", marketPriceNum: 190000, unionPriceNum: 125000 };
  }
  if (/양천구/.test(gu)) {
    return { marketPrice: "19억", unionPrice: "12.5억", premium: "+6.5억", marketPriceNum: 190000, unionPriceNum: 125000 };
  }
  if (/동작구/.test(gu)) {
    return { marketPrice: "18.5억", unionPrice: "12억", premium: "+6.5억", marketPriceNum: 185000, unionPriceNum: 120000 };
  }
  if (/영등포구/.test(gu)) {
    return { marketPrice: "18억", unionPrice: "12억", premium: "+6억", marketPriceNum: 180000, unionPriceNum: 120000 };
  }
  if (/강동구/.test(gu)) {
    return { marketPrice: "16.5억", unionPrice: "11억", premium: "+5.5억", marketPriceNum: 165000, unionPriceNum: 110000 };
  }
  if (/종로구|중구/.test(gu)) {
    return { marketPrice: "16억", unionPrice: "10.5억", premium: "+5.5억", marketPriceNum: 160000, unionPriceNum: 105000 };
  }
  if (/서대문구/.test(gu)) {
    return { marketPrice: "15억", unionPrice: "10억", premium: "+5억", marketPriceNum: 150000, unionPriceNum: 100000 };
  }
  if (/동대문구/.test(gu)) {
    return { marketPrice: "14.5억", unionPrice: "9.8억", premium: "+4.7억", marketPriceNum: 145000, unionPriceNum: 98000 };
  }
  if (/성북구/.test(gu)) {
    return { marketPrice: "13.5억", unionPrice: "9.2억", premium: "+4.3억", marketPriceNum: 135000, unionPriceNum: 92000 };
  }
  if (/은평구/.test(gu)) {
    return { marketPrice: "13억", unionPrice: "8.8억", premium: "+4.2억", marketPriceNum: 130000, unionPriceNum: 88000 };
  }
  if (/관악구/.test(gu)) {
    return { marketPrice: "13억", unionPrice: "8.8억", premium: "+4.2억", marketPriceNum: 130000, unionPriceNum: 88000 };
  }
  if (/구로구|강서구/.test(gu)) {
    return { marketPrice: "12.5억", unionPrice: "8.5억", premium: "+4억", marketPriceNum: 125000, unionPriceNum: 85000 };
  }
  if (/노원구|중랑구/.test(gu)) {
    return { marketPrice: "11.5억", unionPrice: "8억", premium: "+3.5억", marketPriceNum: 115000, unionPriceNum: 80000 };
  }
  if (/강북구|도봉구|금천구/.test(gu)) {
    return { marketPrice: "10.5억", unionPrice: "7.5억", premium: "+3억", marketPriceNum: 105000, unionPriceNum: 75000 };
  }

  // 3. 경기도 주요 31개 시·군 시세 구간
  if (/과천시/.test(gu)) {
    return { marketPrice: "23억", unionPrice: "15억", premium: "+8억", marketPriceNum: 230000, unionPriceNum: 150000 };
  }
  if (/분당구/.test(gu) || (/성남시/.test(gu) && /분당/.test(name))) {
    return { marketPrice: "20억", unionPrice: "13.5억", premium: "+6.5억", marketPriceNum: 200000, unionPriceNum: 135000 };
  }
  if (/성남시|수정구|중원구/.test(gu)) {
    return { marketPrice: "13.5억", unionPrice: "9.2억", premium: "+4.3억", marketPriceNum: 135000, unionPriceNum: 92000 };
  }
  if (/하남시/.test(gu)) {
    return { marketPrice: "14억", unionPrice: "9.5억", premium: "+4.5억", marketPriceNum: 140000, unionPriceNum: 95000 };
  }
  if (/광명시/.test(gu)) {
    return { marketPrice: "13.5억", unionPrice: "9.2억", premium: "+4.3억", marketPriceNum: 135000, unionPriceNum: 92000 };
  }
  if (/안양시|동안구/.test(gu)) {
    return { marketPrice: "13억", unionPrice: "8.8억", premium: "+4.2억", marketPriceNum: 130000, unionPriceNum: 88000 };
  }
  if (/수원시|영통구/.test(gu)) {
    return { marketPrice: "12.5억", unionPrice: "8.5억", premium: "+4억", marketPriceNum: 125000, unionPriceNum: 85000 };
  }
  if (/용인시|수지구/.test(gu)) {
    return { marketPrice: "12억", unionPrice: "8.2억", premium: "+3.8억", marketPriceNum: 120000, unionPriceNum: 82000 };
  }
  if (/구리시/.test(gu)) {
    return { marketPrice: "11.5억", unionPrice: "8억", premium: "+3.5억", marketPriceNum: 115000, unionPriceNum: 80000 };
  }
  if (/고양시|덕양구|일산/.test(gu)) {
    return { marketPrice: "10.5억", unionPrice: "7.2억", premium: "+3.3억", marketPriceNum: 105000, unionPriceNum: 72000 };
  }
  if (/부천시|원미구|소사구|오정구/.test(gu)) {
    return { marketPrice: "10억", unionPrice: "7억", premium: "+3억", marketPriceNum: 100000, unionPriceNum: 70000 };
  }
  if (/남양주시|의왕시|군포시/.test(gu)) {
    return { marketPrice: "9.8억", unionPrice: "6.8억", premium: "+3억", marketPriceNum: 98000, unionPriceNum: 68000 };
  }
  if (/시흥시|김포시|화성시/.test(gu)) {
    return { marketPrice: "8.5억", unionPrice: "6억", premium: "+2.5억", marketPriceNum: 85000, unionPriceNum: 60000 };
  }
  if (/의정부시|파주시|평택시|안산시/.test(gu)) {
    return { marketPrice: "7.5억", unionPrice: "5.3억", premium: "+2.2억", marketPriceNum: 75000, unionPriceNum: 53000 };
  }

  // 4. 기본 수도권 평균
  return { marketPrice: "7억", unionPrice: "5억", premium: "+2억", marketPriceNum: 70000, unionPriceNum: 50000 };
}
