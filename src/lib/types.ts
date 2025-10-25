export interface Photo {
  id: string;
  userId: string;
  url: string;
  caption: string;
  tags: string[];
  uploadDate: Date;
}
