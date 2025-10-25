export interface Photo {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  tags: string[];
  uploadDate: Date;
}
