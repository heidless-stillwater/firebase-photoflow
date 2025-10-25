import type { Photo } from "@/lib/types";
import PhotoCard from "./photo-card";

interface PhotoGalleryProps {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <h2 className="text-2xl font-semibold">No Photos Found</h2>
        <p className="mt-2">Try a different search or upload a new photo.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
