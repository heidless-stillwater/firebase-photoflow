'use client';

import { useState } from 'react';
import type { Photo } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Wand2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';

interface TransformCardProps {
  photo: Photo;
}

const transformationStyles = [
    { id: 'watercolor', name: 'Watercolor' },
    { id: 'cartoon', name: 'Cartoon' },
    { id: 'pixel-art', name: 'Pixel Art' },
    { id: 'sci-fi', name: 'Sci-Fi' },
    { id: 'fantasy', name: 'Fantasy' },
];

export default function TransformCard({ photo }: TransformCardProps) {
    const [selectedStyle, setSelectedStyle] = useState<string>('');
    const [transformedImageUrl, setTransformedImageUrl] = useState<string | null>(null);
    const [isTransforming, setIsTransforming] = useState(false);

    const handleTransform = async () => {
        if (!selectedStyle) {
            toast({
                variant: 'destructive',
                title: 'No Style Selected',
                description: 'Please select a transformation style.',
            });
            return;
        }

        setIsTransforming(true);
        setTransformedImageUrl(null);

        // Placeholder for AI transformation logic
        console.log(`Transforming photo ${photo.id} with style ${selectedStyle}`);
        
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Placeholder for the result
        const placeholderUrl = `https://picsum.photos/seed/${photo.id}-${selectedStyle}/600/600`;
        setTransformedImageUrl(placeholderUrl);
        setIsTransforming(false);
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4 grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Original Image */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-center text-muted-foreground">Original</h3>
                        <div className="aspect-square w-full rounded-md overflow-hidden border">
                            <Image
                                src={photo.imageUrl}
                                alt="Original photo"
                                width={600}
                                height={600}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>

                    {/* Transformed Image */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-center text-muted-foreground">Transformed</h3>
                         <div className="aspect-square w-full rounded-md overflow-hidden border flex items-center justify-center bg-muted/30">
                            {isTransforming ? (
                                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                            ) : transformedImageUrl ? (
                                <Image
                                    src={transformedImageUrl}
                                    alt={`Transformed photo in ${selectedStyle} style`}
                                    width={600}
                                    height={600}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                     <Wand2 className="mx-auto h-8 w-8" />
                                     <p className="text-xs mt-2">Select a style and click Transform</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                        <label htmlFor={`style-select-${photo.id}`} className="text-sm font-medium text-muted-foreground">Style</label>
                        <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                            <SelectTrigger id={`style-select-${photo.id}`}>
                                <SelectValue placeholder="Select a style" />
                            </SelectTrigger>
                            <SelectContent>
                                {transformationStyles.map(style => (
                                    <SelectItem key={style.id} value={style.id}>
                                        {style.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleTransform} disabled={isTransforming || !selectedStyle}>
                        {isTransforming ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Transforming...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Transform
                            </>
                        )}
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}
