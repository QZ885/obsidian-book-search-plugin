export interface KakaoBookItem {
  title: string; // 책 제목
  contents: string; // 책 소개
  url: string; // 다음 책 상세 페이지
  isbn: string; // "ISBN10 ISBN13" 형태로 공백 결합되어 내려온다
  datetime: string; // ISO 8601 (예: 2023-06-07T00:00:00.000+09:00)
  authors: string[]; // 저자
  publisher: string; // 출판사
  translators: string[]; // 번역자
  price: number; // 정가
  sale_price: number; // 판매가
  thumbnail: string; // 표지 썸네일 (R120x174 리사이즈 URL)
  status: string; // 판매 상태
}

export interface KakaoBooksResponse {
  documents: KakaoBookItem[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}
