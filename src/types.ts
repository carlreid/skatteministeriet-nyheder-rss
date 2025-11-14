export interface SkmItem {
  id: string;
  gId: string;
  articleId: string;
  domainName: string;
  types: string[];
  tags: string[];
  expirationDate: string;
  parentId: number;
  parentGId: string;
  contentImage: string;
  date: string;
  description: string;
  seoDescription: string;
  seoTitle: string;
  title: string;
  url: string;
  culture: string;
  siteName: string;
  oid: string;
  createDate: string;
  updateDate: string;
}

export type IndexSearchResponse = SkmItem[];
