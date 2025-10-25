'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Photo } from '@/lib/types';
import Header from '@/components/header';
import PhotoGallery from '@/components/photo-gallery';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy } from 'firebase/firestore';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const photosQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'photos'), orderBy('uploadDate', 'desc'));
  }, [firestore, user]);

  const { data: photos, isLoading: isLoadingPhotos } = useCollection<Photo>(photosQuery);

  const handleUploadFinished = (newPhoto: Photo) => {
    // The gallery will update automatically via the real-time listener
    console.log('Upload finished, gallery will update.', newPhoto);
  };

  const filteredPhotos = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!photos) return [];
    if (!query) return photos;
    
    return photos.filter(
      (photo) =>
        photo.generatedCaption.toLowerCase().includes(query) ||
        (photo.tags && photo.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        ))
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
        <PhotoGallery photos={filteredPhotos} isLoading={isLoadingPhotos} />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Built for PhotoFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
