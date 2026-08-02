import { Book } from '@models/book.model';
import { apiGet, BaseBooksApiImpl } from './base_api';
import { KakaoBookItem, KakaoBooksResponse } from './models/kakao_books_response';

// 카카오 썸네일은 R120x174로 리사이즈되어 내려온다. 표지 임베드에는 너무 작아 폭을 키워 쓴다.
const THUMBNAIL_RESIZE_PATTERN = /\/thumb\/R\d+x\d+\./;
const LARGE_COVER_RESIZE = '/thumb/R400x0.';

export class KakaoBooksApi implements BaseBooksApiImpl {
  constructor(private readonly restApiKey: string) {}

  async getByQuery(query: string) {
    try {
      const params = {
        query,
        size: 50,
      };
      const header = {
        Authorization: `KakaoAK ${this.restApiKey}`,
      };
      const searchResults = await apiGet<KakaoBooksResponse>(
        'https://dapi.kakao.com/v3/search/book',
        params,
        header,
      );
      if (!searchResults?.meta?.total_count) {
        return [];
      }
      return searchResults.documents.map(this.createBookItem);
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  createBookItem(item: KakaoBookItem): Book {
    const { isbn10, isbn13 } = splitIsbn(item.isbn);
    const authors = item.authors ?? [];
    return {
      title: item.title,
      author: authors.join(', '),
      authors,
      publisher: item.publisher,
      coverUrl: resizeCoverUrl(item.thumbnail),
      coverSmallUrl: item.thumbnail,
      coverLargeUrl: resizeCoverUrl(item.thumbnail),
      publishDate: item.datetime?.slice(0, 4) || '',
      link: item.url,
      description: item.contents,
      isbn: isbn13 || isbn10,
      ...(isbn13 ? { isbn13 } : {}),
      ...(isbn10 ? { isbn10 } : {}),
    } as Book;
  }
}

// 카카오는 ISBN10과 ISBN13을 공백으로 이어 하나의 문자열로 준다. 둘 중 하나만 있는 경우도 있다.
function splitIsbn(isbn?: string): { isbn10: string; isbn13: string } {
  const parts = (isbn ?? '').split(' ').filter(Boolean);
  return {
    isbn10: parts.find(part => part.length === 10) ?? '',
    isbn13: parts.find(part => part.length === 13) ?? '',
  };
}

function resizeCoverUrl(thumbnail?: string): string {
  if (!thumbnail) return '';
  return thumbnail.replace(THUMBNAIL_RESIZE_PATTERN, LARGE_COVER_RESIZE);
}
