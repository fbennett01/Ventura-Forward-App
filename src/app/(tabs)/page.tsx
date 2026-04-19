'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { PlayCircle, Clock, Heart, ArrowRight } from 'lucide-react';
import { mockFeed } from '@/data/mock-feed';
import type { FeedItem } from '@/types';

function BlogCard({ item }: { item: FeedItem & { type: 'blog' } }) {
  return (
    <motion.div
      className="rounded-2xl bg-vf-navy-100/50 border border-vf-light overflow-hidden shadow-vf-soft hover:shadow-vf-medium transition-all duration-300 group cursor-pointer"
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -4 }}
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
      </div>
      <div className="p-5 space-y-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-vf-orange/15 text-vf-orange text-xs font-bold tracking-widest uppercase">
          BLOG
        </span>
        <p className="font-poppins font-bold text-lg leading-tight text-vf-sand line-clamp-2">
          {item.title}
        </p>
        <p className="text-sm text-vf-sand/60 line-clamp-2 leading-relaxed">{item.excerpt}</p>
        <div className="flex justify-between items-center pt-2 border-t border-vf-light/50">
          <span className="text-xs text-vf-sand/50">
            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs font-bold text-vf-orange group-hover:translate-x-1 transition-transform">
            Read <ArrowRight className="inline w-3 h-3 ml-1" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function PodcastCard({ item }: { item: FeedItem & { type: 'podcast' } }) {
  return (
    <motion.div
      className="rounded-2xl bg-vf-navy-100/50 border border-vf-light p-4 flex gap-4 shadow-vf-soft hover:shadow-vf-medium transition-all duration-300 group cursor-pointer"
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
    >
      <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-vf-soft">
        <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" unoptimized />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-all">
          <PlayCircle className="size-8 text-white" />
        </div>
      </div>
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <span className="inline-flex px-2.5 py-1 rounded-full bg-vf-sea/20 text-vf-sea text-xs font-bold tracking-wide">
            EP {item.meta.episode}
          </span>
          <p className="font-poppins font-semibold text-base leading-snug text-vf-sand line-clamp-2 mt-2">
            {item.title}
          </p>
        </div>
        <div className="flex items-center gap-2 text-vf-sand/50 text-xs font-medium">
          <Clock className="size-3.5" />
          <span>{item.meta.duration}</span>
        </div>
      </div>
    </motion.div>
  );
}

function InstagramCard({ item }: { item: FeedItem & { type: 'instagram' } }) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden relative aspect-square shadow-vf-soft hover:shadow-vf-medium transition-all duration-300 group cursor-pointer"
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -4 }}
    >
      <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" unoptimized />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:via-black/50 transition-all" />
      <p className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm font-semibold line-clamp-3 leading-relaxed">
        {item.excerpt}
      </p>
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <Heart className="size-4 text-white" />
        <span className="text-white text-xs font-semibold">{item.meta.likes}</span>
      </div>
    </motion.div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  if (item.type === 'blog') return <BlogCard item={item as FeedItem & { type: 'blog' }} />;
  if (item.type === 'podcast') return <PodcastCard item={item as FeedItem & { type: 'podcast' }} />;
  if (item.type === 'instagram') return <InstagramCard item={item as FeedItem & { type: 'instagram' }} />;
  return null;
}

export default function HomePage() {
  const reduced = useReducedMotion();

  return (
    <div className="min-h-screen bg-vf-navy/55 texture-grain">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-5 bg-vf-navy/60 backdrop-blur-xl border-b border-vf-light shadow-vf-soft">
        <div className="flex flex-row items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-vf-orange to-vf-orange/60" />
          <span className="font-poppins font-black text-sm tracking-widest text-vf-sand drop-shadow-sm">
            VENTURA FORWARD
          </span>
        </div>
        <span className="text-xs text-vf-sand/50 font-light tracking-wide">Share the Stoke</span>
      </header>

      {/* Hero Section */}
      <div className="relative px-5 py-12 text-center border-b border-vf-light/20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3 max-w-2xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl font-poppins font-bold text-vf-sand tracking-tight">
            Stay Connected
          </h1>
          <p className="text-vf-sand/70 text-lg leading-relaxed">
            Discover inspiring stories, podcasts, and moments from our community
          </p>
        </motion.div>
      </div>

      {/* Content Grid */}
      <div className="pt-8 pb-32 px-5 space-y-6">
        {mockFeed.map((item, index) => (
          <motion.div
            key={item.id}
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: index * 0.08, duration: 0.4, ease: 'easeOut' },
                })}
          >
            <FeedCard item={item} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
