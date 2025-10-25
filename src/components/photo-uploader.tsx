"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import type { Photo } from "@/lib/types";
import { getAiCaption } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Upload, X, LoaderCircle, Image as ImageIcon } from "lucide-react";

interface PhotoUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadFinished: (photo: Photo) => void;
}

export function PhotoUploader({
  open,
  onOpenChange,
  onUploadFinished,
}: PhotoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = () => {
    setPreviewUrl(null);
    setCaption("");
    setTags("");
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 4MB.",
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      setPreviewUrl(dataUri);
      const result = await getAiCaption(dataUri);
      if ("error" in result) {
        toast({
          variant: "destructive",
          title: "AI Caption Failed",
          description: result.error,
        });
      } else {
        setCaption(result.caption);
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!previewUrl) {
      toast({
        variant: "destructive",
        title: "No photo selected",
        description: "Please select a photo to upload.",
      });
      return;
    }

    const newPhoto: Photo = {
      id: new Date().toISOString(),
      url: previewUrl,
      caption: caption,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      imageHint: "uploaded photo",
    };

    onUploadFinished(newPhoto);
    onOpenChange(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetState();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] grid-rows-[auto_1fr_auto]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Upload a New Photo</DialogTitle>
        </DialogHeader>
        <form id="upload-form" onSubmit={handleSubmit} className="grid gap-6 overflow-y-auto py-4">
          <div className="grid gap-2">
            <Label htmlFor="photo">Photo</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              className="relative aspect-video w-full border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    alt="Selected preview"
                    fill
                    className="object-cover rounded-md"
                  />
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
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto h-10 w-10" />
                  <p className="mt-2 text-sm">Click to browse or drag & drop</p>
                  <p className="text-xs">Max file size: 4MB</p>
                </div>
              )}
               {isLoading && !previewUrl && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                  <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
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
            />
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="upload-form" disabled={!previewUrl || isLoading}>
            {isLoading ? <><LoaderCircle className="animate-spin" /> Uploading...</> : 'Add to Gallery'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
