import { KakaoBooksApi } from './kakao_books_api';
import { KakaoBookItem } from './models/kakao_books_response';

// 카카오 책 검색 API의 실제 응답(query=토지)에서 가져온 항목
const item: KakaoBookItem = {
  authors: ['박경리'],
  contents: '명실상부 한국 문학사의 기념비적 작품으로 자리하고 있는 박경리의 대하소설',
  datetime: '2023-06-07T00:00:00.000+09:00',
  isbn: '1130699463 9791130699462',
  price: 17000,
  publisher: '다산책방',
  sale_price: 15300,
  status: '정상판매',
  thumbnail:
    'https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F6363233',
  title: '토지 1(1부 1권)',
  translators: [],
  url: 'https://search.daum.net/search?w=bookpage&bookId=6363233',
};

describe('KakaoBooksApi.createBookItem', () => {
  const api = new KakaoBooksApi('dummy-key');

  it('실제 응답을 Book 모델로 매핑한다', () => {
    const book = api.createBookItem(item);

    expect(book.title).toBe('토지 1(1부 1권)');
    expect(book.author).toBe('박경리');
    expect(book.authors).toEqual(['박경리']);
    expect(book.publisher).toBe('다산책방');
    expect(book.link).toBe('https://search.daum.net/search?w=bookpage&bookId=6363233');
  });

  it('datetime에서 출판 연도만 뽑는다', () => {
    expect(api.createBookItem(item).publishDate).toBe('2023');
  });

  it('공백으로 붙어 오는 ISBN을 10자리/13자리로 분리한다', () => {
    const book = api.createBookItem(item);

    expect(book.isbn10).toBe('1130699463');
    expect(book.isbn13).toBe('9791130699462');
    expect(book.isbn).toBe('9791130699462'); // 13자리를 대표값으로 쓴다
  });

  it('ISBN이 한쪽만 있거나 비어 있어도 처리한다', () => {
    const only13 = api.createBookItem({ ...item, isbn: '9791130699462' });
    expect(only13.isbn13).toBe('9791130699462');
    expect(only13.isbn10).toBeUndefined();
    expect(only13.isbn).toBe('9791130699462');

    const none = api.createBookItem({ ...item, isbn: '' });
    expect(none.isbn).toBe('');
  });

  it('표지 썸네일을 더 큰 해상도로 바꾼다', () => {
    const book = api.createBookItem(item);

    expect(book.coverUrl).toContain('/thumb/R400x0.');
    expect(book.coverUrl).not.toContain('R120x174');
    expect(book.coverSmallUrl).toBe(item.thumbnail); // 원본 썸네일은 보존
  });

  it('저자가 여러 명이면 쉼표로 합친다', () => {
    const book = api.createBookItem({ ...item, authors: ['박경리', '김약국'] });
    expect(book.author).toBe('박경리, 김약국');
  });

  it('저자가 없어도 빈 문자열을 준다', () => {
    const book = api.createBookItem({ ...item, authors: [] });
    expect(book.author).toBe('');
    expect(book.authors).toEqual([]);
  });
});
