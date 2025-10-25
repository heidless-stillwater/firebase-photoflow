"use client";

import { useState } from 'react';
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PhotoUploader } from "@/components/photo-uploader";
import { Upload, Camera } from "lucide-react";

interface HeaderProps {
  onUploadFinished: (photo: Photo) => void;
}

export default function Header({ onUploadFinished }: HeaderProps) {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Camera className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-headline tracking-tight text-foreground">
              PhotoFlow
            </h1>
          </div>
          <Button onClick={() => setIsUploaderOpen(true)}>
            <Upload />
            Upload
          </Button>
        </div>
      </header>
      <PhotoUploader 
        open={isUploaderOpen}
        onOpenChange={setIsUploaderOpen}
        onUploadFinished={onUploadFinished}
      />
    </>
  );
}
