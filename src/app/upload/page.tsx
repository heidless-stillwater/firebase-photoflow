'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { ImageUploader } from '@/components/image-uploader';
import type { Photo } from '@/lib/types';

export default function UploadPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleUploadFinished = (newPhoto: Photo) => {
    console.log('Upload finished, redirecting to gallery.', newPhoto);
    router.push('/');
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Upload a New Photo</h1>
          <ImageUploader onUploadFinished={handleUploadFinished} />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Built for PhotoFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
