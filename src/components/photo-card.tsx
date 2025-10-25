import Image from "next/image";
import type { Photo } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface PhotoCardProps {
  photo: Photo;
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <Card className="overflow-hidden group relative animate-fade-in aspect-w-1 aspect-h-1">
      <Image
        src={photo.imageUrl}
        alt={photo.generatedCaption}
        width={600}
        height={600}
        className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="p-4 flex flex-col justify-end h-full text-white">
          <p className="font-semibold text-base mb-2 line-clamp-2">{photo.generatedCaption}</p>
          {photo.tags && photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <Tag className="h-4 w-4 text-primary" />
              {photo.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
