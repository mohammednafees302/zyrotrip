"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface DestinationImage {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
}

interface EditorialGalleryProps {
  images: DestinationImage[];
  destinationName: string;
}

function ImageWithFallback({ 
  src, 
  fallbackSrc, 
  alt, 
  ...props 
}: any) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
}

export function EditorialGallery({ images, destinationName }: EditorialGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Handle Keyboard Navigation for Lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev! + 1) % images.length);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev! - 1 + images.length) % images.length);
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    },
    [selectedIndex, images.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!images || images.length === 0) return null;

  // The editorial layout: First image large, next two smaller, etc.
  return (
    <div className="w-full space-y-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-light text-charcoal-950 dark:text-white tracking-tight">
            Visual Journey
          </h2>
          <p className="text-charcoal-500 dark:text-gray-400 mt-2">Authentic captures of {destinationName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
        {images.slice(0, 7).map((img, index) => {
          // Calculate dynamic spans to create an asymmetric editorial feel
          const isLarge = index === 0;
          const isTall = index === 3;
          const isWide = index === 4;

          return (
            <motion.div
              key={img.id}
              whileHover={{ scale: 0.98 }}
              className={cn(
                "relative group cursor-pointer overflow-hidden rounded-2xl bg-stone-100 dark:bg-white/5",
                isLarge && "md:col-span-2 md:row-span-2",
                isTall && "md:col-span-1 md:row-span-2",
                isWide && "md:col-span-2 md:row-span-1",
                !isLarge && !isTall && !isWide && "md:col-span-1 md:row-span-1"
              )}
              onClick={() => setSelectedIndex(index)}
            >
              <ImageWithFallback
                src={img.url}
                fallbackSrc="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80"
                alt={img.alt || `Photo of ${destinationName}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                <p className="text-white text-sm font-medium truncate">
                  {img.caption || destinationName}
                </p>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          >
            <button
              className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors z-50"
              onClick={() => setSelectedIndex(null)}
            >
              <X className="w-8 h-8" />
            </button>

            <button
              className="absolute left-6 p-4 text-white/50 hover:text-white transition-colors z-50"
              onClick={() => setSelectedIndex((prev) => (prev! - 1 + images.length) % images.length)}
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <button
              className="absolute right-6 p-4 text-white/50 hover:text-white transition-colors z-50"
              onClick={() => setSelectedIndex((prev) => (prev! + 1) % images.length)}
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            <div className="relative w-full max-w-6xl h-[80vh] px-16">
              <Image
                src={images[selectedIndex!]?.url || ""}
                alt={images[selectedIndex!]?.alt || ""}
                fill
                className="object-contain"
                priority
              />
              {images[selectedIndex!]?.caption && (
                <div className="absolute bottom-[-40px] left-0 right-0 text-center">
                  <p className="text-white/70 text-sm">{images[selectedIndex!]?.caption}</p>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === selectedIndex ? "bg-white w-6" : "bg-white/30"
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
