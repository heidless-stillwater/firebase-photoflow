export interface Photo {
  id: string;
  userId: string;
  imageUrl: string;
  generatedCaption: string;
  tags: string[];
  uploadDate: Date;
}
