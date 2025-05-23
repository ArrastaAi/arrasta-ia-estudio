
import { useState, useEffect } from "react";
import { useFirebaseGalleryImages } from "@/hooks/useFirebaseGalleryImages";

interface GalleryImage {
  name: string;
  url: string;
}

export const useGalleryImages = (userId: string | undefined, carouselId: string) => {
  // Delegate to Firebase implementation
  return useFirebaseGalleryImages(userId, carouselId);
};
