'use client';

import React from "react";
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

const blogPostMaxCount = 6;

const blogPosts = [
  {
    title: 'Introducing Blink Protocol: Universal KYC Revolution',
    url: '#',
    imageUrl: '/VBlog1.avif',
  },
  {
    title: 'Privacy-First KYC: How Zero-Knowledge Works',
    url: '#',
    imageUrl: '/VBlog2.avif',
  },
  {
    title: 'Cross-Platform Identity: The Future of Verification',
    url: '#',
    imageUrl: '/VBlog3.avif',
  },
  // Add more posts as needed
];

type BlogPost = typeof blogPosts[number];

type ProgressButtonProps = {
  post: BlogPost;
  index: number;
  currentIndex: number;
  selectSlide: (index: number) => void;
  nextSlide: () => void;
  isInView: boolean;
  isPlaying: boolean;
};

function ProgressButton({ post, index, currentIndex, selectSlide, nextSlide, isInView, isPlaying }: ProgressButtonProps) {
  const onClickHandler = useCallback(() => {
    selectSlide(index);
  }, [index, selectSlide]);

  const onAnimationEndHandler = useCallback(() => {
    nextSlide();
  }, [nextSlide]);

  const progressClasses = `h-full bg-[#E3E7E9] will-change-[width] ${
    index === currentIndex && isInView && isPlaying ? 'animate-[progress_5s_linear] group-hover:[animation-play-state:paused]' : ''
  } ${index < currentIndex ? 'w-full' : ''} ${index > currentIndex ? 'w-0' : ''}`;

  return (
    <button
      key={post.url}
      aria-label={`View blog post: ${post.title}`}
      type="button"
      className="h-2 w-1/6 overflow-hidden rounded-full bg-black/20 backdrop-blur-[0.5rem] hover:h-4 transition-all duration-200"
      onClick={onClickHandler}
    >
      <div className={progressClasses} data-index={index} onAnimationEnd={onAnimationEndHandler} />
    </button>
  );
}

export default function BlogSection() {
  const limitedBlogPosts = useMemo(() => blogPosts.slice(0, blogPostMaxCount), []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState<boolean>(false);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % limitedBlogPosts.length);
  }, [limitedBlogPosts.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + limitedBlogPosts.length) % limitedBlogPosts.length);
  }, [limitedBlogPosts.length]);

  const selectSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-slide functionality
  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
    if (isPlaying && isInView) {
      autoSlideRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
  }, [isPlaying, isInView, nextSlide]);

  const toggleAutoSlide = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 },
    );
    const section = sectionRef.current;
    if (section) {
      observer.observe(section);
    }
    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  // Start/stop auto-slide based on play state and visibility
  useEffect(() => {
    startAutoSlide();
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [startAutoSlide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, []);

  const svgNoiseBackgroundUrl = useMemo(
    () =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    [],
  );

  return (
    <section ref={sectionRef} className="group">
      <h2 className="mb-6 text-3xl font-heading">Read the latest from Blink Protocol</h2>
      <div className="relative mx-auto w-full">
        <div className="relative overflow-hidden rounded-xl">
          {/* Top blur/gradient for title visibility */}
          <div
            className="absolute left-0 right-0 top-0 z-10 h-[10rem] bg-black/30 backdrop-blur-[3rem]"
            style={{
              maskImage: 'linear-gradient(to bottom, black, transparent)',
              backgroundImage: `${svgNoiseBackgroundUrl}, linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))`,
              WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
            }}
          />
          <div
            className="flex transition-transform duration-300 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {limitedBlogPosts.map((post) => (
              <div key={post.title} className="relative h-auto w-full flex-shrink-0">
                <figure className="relative h-full min-h-[20rem] w-full md:min-h-[40rem]">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </figure>
              </div>
            ))}
          </div>
          {/* Bottom blur/gradient for progress lines visibility */}
          <div
            className="absolute bottom-0 left-0 right-0 z-10 h-[10rem] bg-black/30 backdrop-blur-[3rem]"
            style={{
              maskImage: 'linear-gradient(to top, black, transparent)',
              backgroundImage: `${svgNoiseBackgroundUrl}, linear-gradient(to top, transparent, rgba(0,0,0,0.5))`,
              WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
            }}
          />
        </div>

        <div className="absolute left-0 top-0 z-20 flex min-h-[17rem] w-full flex-col justify-between gap-4 px-4 pt-4 md:min-h-0 md:flex-row md:px-8 md:pt-6">
          <h3 className="flex w-full items-center gap-4 text-white drop-shadow-md text-xl font-heading">
            {limitedBlogPosts[currentIndex].title}
          </h3>
          <div className="ml-auto flex items-center gap-4">
            <Link href={limitedBlogPosts[currentIndex].url} target="_blank" className="inline-block px-6 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-primary transition">
              Read
            </Link>
            <Link href="#" target="_blank" className="inline-block px-6 py-2 border border-secondary text-secondary rounded-lg font-medium hover:bg-primary hover:text-white transition">
              Subscribe
            </Link>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md border-white/20 text-white hover:bg-black/40 hover:text-white transition-all duration-200"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md border-white/20 text-white hover:bg-black/40 hover:text-white transition-all duration-200"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Play/Pause Button */}
        <div className="absolute right-4 bottom-20 z-30">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleAutoSlide}
            className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md border-white/20 text-white hover:bg-black/40 hover:text-white transition-all duration-200"
            aria-label={isPlaying ? "Pause auto-slide" : "Play auto-slide"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
        <div className="absolute bottom-0 left-1/2 z-20 mx-auto flex w-full -translate-x-1/2 items-end justify-center space-x-4 p-4 md:max-w-[66%]">
          {limitedBlogPosts.map((post, index) => (
            <ProgressButton
              key={post.url}
              post={post}
              index={index}
              currentIndex={currentIndex}
              selectSlide={selectSlide}
              nextSlide={nextSlide}
              isInView={isInView}
              isPlaying={isPlaying}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
