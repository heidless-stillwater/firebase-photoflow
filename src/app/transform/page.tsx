'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Photo } from '@/lib/types';
import Header from '@/components/header';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import TransformCard from '@/components/transform-card';

export default function TransformPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const photosQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'photos'), orderBy('uploadDate', 'desc'));
  }, [firestore, user]);

  const { data: photos, isLoading: isLoadingPhotos } = useCollection<Photo>(photosQuery);

  const handleUploadFinished = (newPhoto: Photo) => {
    // The gallery will update automatically via the real-time listener
    console.log('Upload finished, gallery will update.', newPhoto);
  };

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
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight">AI Image Transformations</h1>
            <p className="text-lg text-muted-foreground mt-2">
                Select a photo and a style to create a new masterpiece.
            </p>
        </div>
        
        {isLoadingPhotos ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="grid gap-4">
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="aspect-square w-full" />
                    </div>
                ))}
            </div>
        ) : photos && photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {photos.map((photo) => (
                    <TransformCard key={photo.id} photo={photo} />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 text-muted-foreground">
                <h2 className="text-2xl font-semibold">No Photos to Transform</h2>
                <p className="mt-2">Upload some photos to get started.</p>
            </div>
        )}

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Built for PhotoFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
