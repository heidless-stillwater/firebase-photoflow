'use client';

import { useState, useMemo, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Photo } from '@/lib/types';
import Header from '@/components/header';
import PhotoGallery from '@/components/photo-gallery';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

const initialPhotos: Photo[] = PlaceHolderImages.map((p) => ({
  id: p.id,
  url: p.imageUrl,
  caption: p.description,
  tags: p.imageHint.split(' ').filter(Boolean),
  imageHint: p.imageHint,
}));

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleUploadFinished = (newPhoto: Photo) => {
    setPhotos((prevPhotos) => [newPhoto, ...prevPhotos]);
  };

  const filteredPhotos = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return photos;
    
    return photos.filter(
      (photo) =>
        photo.caption.toLowerCase().includes(query) ||
        photo.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        )
    );
  }, [photos, searchQuery]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header onUploadFinished={handleUploadFinished} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by caption or tags..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <PhotoGallery photos={filteredPhotos} />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Built for PhotoFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
