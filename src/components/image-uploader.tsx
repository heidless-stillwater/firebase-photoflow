'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import type { Photo } from '@/lib/types';
import { getAiCaption } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { X, LoaderCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth, useFirestore, useStorage } from '@/firebase';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent } from './ui/card';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface ImageUploaderProps {
  onUploadFinished: (photo: Photo) => void;
}

export function ImageUploader({ onUploadFinished }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();

  const resetState = () => {
    setPreviewUrl(null);
    setFileData(null);
    setCaption('');
    setTags('');
    setIsLoading(false);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload an image smaller than 4MB.',
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      setPreviewUrl(dataUri);
      setFileData(dataUri);

      try {
        const result = await getAiCaption(dataUri);
        if ('error' in result) {
          toast({
            variant: 'destructive',
            title: 'AI Caption Failed',
            description: result.error,
          });
        } else {
          setCaption(result.caption);
        }
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!fileData || !auth.currentUser) {
      toast({
        variant: 'destructive',
        title: 'Upload Error',
        description: 'No photo selected or user not logged in.',
      });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload to Firebase Storage
      const photoId = new Date().toISOString();
      const storageRef = ref(
        storage,
        `photos/${auth.currentUser.uid}/${photoId}`
      );
      
      const uploadTask = await uploadString(storageRef, fileData, 'data_url');
      const downloadURL = await getDownloadURL(uploadTask.ref);

      // 2. Save metadata to Firestore
      const photoDoc: Omit<Photo, 'id'> = {
        userId: auth.currentUser.uid,
        imageUrl: downloadURL,
        generatedCaption: caption,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        // @ts-ignore
        uploadDate: serverTimestamp(),
      };
      
      const photosCollectionRef = collection(firestore, 'users', auth.currentUser.uid, 'photos');
      const docRef = await addDocumentNonBlocking(photosCollectionRef, photoDoc);

      const finalPhoto: Photo = {
        id: docRef.id,
        ...photoDoc,
        uploadDate: new Date(),
      };

      onUploadFinished(finalPhoto);
      toast({
        title: 'Upload Successful',
        description: 'Your photo has been added to the gallery.',
      });
    } catch (error: any) {
      console.error('Upload failed: ', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Could not upload photo.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form
          id="upload-form"
          onSubmit={handleSubmit}
          className="grid gap-6"
        >
          <div className="grid gap-2">
            <Label htmlFor="photo">Photo</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading || isUploading}
            />
            <div
              className="relative aspect-video w-full border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
              onClick={() =>
                !(isLoading || isUploading) && fileInputRef.current?.click()
              }
            >
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    alt="Selected preview"
                    fill
                    className="object-cover rounded-md"
                  />
                  {!isUploading && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetState();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto h-10 w-10" />
                  <p className="mt-2 text-sm">
                    Click to browse or drag & drop
                  </p>
                  <p className="text-xs">Max file size: 4MB</p>
                </div>
              )}
              {(isLoading || isUploading) && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                  <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">
                    {isUploading ? 'Uploading...' : 'Processing...'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-2 relative">
            <Label htmlFor="caption">AI Generated Caption</Label>
            <Textarea
              id="caption"
              placeholder="Your AI-generated caption will appear here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="pr-10"
              disabled={isLoading || isUploading}
            />
            {isLoading && (
              <div className="absolute right-3 bottom-3">
                <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="e.g. travel, nature, sunset"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isUploading}
              onClick={() => resetState()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={!previewUrl || isLoading || isUploading}
            >
              {isUploading ? (
                <>
                  <LoaderCircle className="animate-spin mr-2" /> Uploading...
                </>
              ) : (
                'Upload Image'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
