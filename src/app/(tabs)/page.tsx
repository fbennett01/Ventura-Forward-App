'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { PlayCircle, Clock, Heart } from 'lucide-react';
import { mockFeed } from '@/data/mock-feed';
import type { FeedItem } from '@/types';

function BlogCard({ item }: { item: FeedItem & { type: 'blog' } }) {
  return (
    <motion.div
      className="rounded-2xl bg-vf-navy-100 border border-white/5 overflow-hidden"
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative w-full aspect-[16/9]">
        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
      </div>
      <div className="p-4 space-y-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-vf-orange/15 text-vf-orange text-[10px] font-bold tracking-widest uppercase">
          BLOG
        </span>
        <p className="font-display font-bold text-lg leading-tight text-vf-sand line-clamp-2">
          {item.title}
        </p>
        <p className="text-sm text-vf-sand/60 line-clamp-2 leading-relaxed">{item.excerpt}</p>
        <div className="flex justify-between items-center pt-1">
          <span className="text-xs text-vf-sand/40">
            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs font-semibold text-vf-orange">Read →</span>
        </div>
      </div>
    </motion.div>
  );
}

function PodcastCard({ item }: { item: FeedItem & { type: 'podcast' } }) {
  return (
    <motion.div
      className="rounded-2xl bg-vf-navy-100 border border-white/5 p-3 flex gap-3"
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <PlayCircle className="size-8 text-white" />
        </div>
      </div>
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <span className="inline-flex px-2 py-0.5 rounded-full bg-vf-sea/20 text-vf-sea text-[10px] font-bold tracking-wide">
            EP {item.meta.episode}
          </span>
          <p className="font-display font-semibold text-base leading-snug text-vf-sand line-clamp-2 mt-1">
            {item.title}
          </p>
        </div>
        <div className="flex items-center gap-1 text-vf-sand/40 text-xs">
          <Clock className="size-3" />
          <span>{item.meta.duration}</span>
        </div>
      </div>
    </motion.div>
  );
}

function InstagramCard({ item }: { item: FeedItem & { type: 'instagram' } }) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden relative aspect-square"
      whileTap={{ scale: 0.98 }}
    >
      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <p className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm font-medium line-clamp-2">
        {item.excerpt}
      </p>
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 rounded-full px-2 py-1">
        <Heart className="size-3 text-white" />
        <span className="text-white text-xs">{item.meta.likes}</span>
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
    <div className="min-h-screen bg-vf-navy">
      <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-vf-navy/70 backdrop-blur-xl border-b border-white/5">
        <div className="flex flex-row items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-vf-orange" />
          <span className="font-display font-extrabold text-sm tracking-widest text-vf-sand">
            VENTURA FORWARD
          </span>
        </div>
        <span className="text-xs text-vf-sand/40 italic">Share the Stoke</span>
      </header>

      <div className="pt-4 pb-28 px-4 space-y-4">
        {mockFeed.map((item, index) => (
          <motion.div
            key={item.id}
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: index * 0.05, duration: 0.35, ease: 'easeOut' },
                })}
          >
            <FeedCard item={item} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
