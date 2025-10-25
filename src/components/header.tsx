
'use client';

import Link from 'next/link';
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Upload, Camera, LogOut } from "lucide-react";
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUser } from '@/firebase';


interface HeaderProps {
  onUploadFinished: (photo: Photo) => void;
}

export default function Header({ onUploadFinished }: HeaderProps) {
  const auth = useAuth();
  const router = useRouter();
  const { user } = useUser();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/gallery" className="flex items-center gap-2">
            <Camera className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-headline tracking-tight text-foreground">
              PhotoFlow
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href="/upload">
                <Upload />
                Upload
              </Link>
            </Button>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user.photoURL ?? ''} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
