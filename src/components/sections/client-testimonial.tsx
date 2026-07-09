"use client";

import Image from 'next/image';
import { useState } from 'react';
import { withBasePath } from '@/lib/base-path';

 const testimonials = [
 {
 id: 1,
 name: 'Ralph Edwards',
 company: 'Big Kahuna Burger Ltd',
 image: withBasePath('/images/users/user-1.png'),
 testimonial:
 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects, which some are production already.',
 },
 {
 id: 2,
 name: 'Albert Flores',
 company: 'Biffco Enterprises Ltd.',
 image: withBasePath('/images/users/user-2.png'),
 testimonial:
 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects, which some are production already.',
 },
 {
 id: 3,
 name: 'Jenny Wilson',
 company: 'Acme Co.',
 image: withBasePath('/images/users/user-3.png'),
 testimonial:
 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects, which some are production already.',
 },
 {
 id: 4,
 name: 'Esther Howard',
 company: 'Barone LLC.',
 image: withBasePath('/images/users/user-4.png'),
 testimonial:
 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects, which some are production already.',
 },
 {
 id: 5,
 name: 'Darlene Robertson',
 company: 'Abstergo Ltd.',
 image: withBasePath('/images/users/user-1.png'),
 testimonial:
 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects, which some are production already.',
 },
 {
 id: 6,
 name: 'Devon Lane',
 company: 'Binford Ltd.',
 image: withBasePath('/images/users/user-2.png'),
 testimonial:
 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects, which some are production already.',
 },
 {
 id: 7,
 name: 'Ralph Edwards',
 company: 'Big Kahuna Burger Ltd',
 image: withBasePath('/images/users/user-1.png'),
 testimonial:
 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects, which some are production already.',
 },
 {
 id: 8,
 name: 'Darlene Robertson',
 company: 'Abstergo Ltd.',
 image: withBasePath('/images/users/user-2.png'),
 testimonial:
 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects, which some are production already.',
 },
 {
 id: 9,
 name: 'Devon Lane',
 company: 'Binford Ltd.',
 image: withBasePath('/images/users/user-3.png'),
 testimonial:
 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects, which some are production already.',
 },
 ];

 export default function TestimonialsSection() {
 const [showAll, setShowAll] = useState(false);

 // Determine which testimonials to display
 const visibleTestimonials = showAll
 ? testimonials
 : testimonials.slice(0, 6);

 return (
 <section className="md:py-28 py-14 relative">
 <div className="wrapper">
 <div>
 <div className="max-w-2xl mx-auto mb-12 text-center">
 <h2 className="mb-3 font-bold text-center text-gray-800 text-3xl md:text-title-lg">
 What our users say
 </h2>
 <p className="max-w-xl mx-auto leading-6 text-gray-500 ">
 Unlock the Potential of Innovation. Discover the Advanced AI
 Tools Transforming Your Ideas into Reality with Unmatched
 Precision and Intelligence.
 </p>
 </div>

 {/* Testimonials Grid */}
 <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 max-w-[72rem] mx-auto">
 {visibleTestimonials.map((testimonial) => (
 <TestimonialCard
 key={testimonial.id}
 testimonial={testimonial}
 />
 ))}
 </div>

 {/* Show More Button */}
 <div className="mt-8 text-center relative z-10">
 <button
 onClick={() => setShowAll(!showAll)}
 className="inline-flex items-center px-6 py-3.5 text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded-full shadow-theme-xs hover:bg-gray-50 focus:outline-none"
 >
 <span>{showAll ? 'Show less...' : 'Show more...'}</span>
 </button>
 </div>
 </div>
 </div>

 {/* Gradient overlay when collapsed */}
 {!showAll && (
 <div className="white-gradient h-[264px] w-full absolute bottom-0"></div>
 )}
 </section>
 );
 }

 // Testimonial Card Component
 function TestimonialCard({
 testimonial,
 }: {
 testimonial: (typeof testimonials)[number];
 }) {
 return (
 <div className="p-2 bg-gray-50 border rounded-[20px] border-gray-100 hover:border-primary-200 transition">
 <div className="flex items-center p-3 mb-3 bg-white/90 rounded-2xl">
 <div>
 <Image
 src={testimonial.image || '/placeholder.svg'}
 alt={testimonial.name}
 width={52}
 height={52}
 className="size-13 object-cover ring-2 ring-white mr-4 rounded-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
 />
 </div>
 <div>
 <h3 className="text-gray-800 font-base ">
 {testimonial.name}
 </h3>
 <p className="text-sm text-gray-500 ">
 {testimonial.company}
 </p>
 </div>
 </div>
 <div className="p-5 rounded-2xl bg-white/90 ">
 <p className="text-base leading-6 text-gray-700 ">
 {testimonial.testimonial}
 </p>
 </div>
 </div>
 );
 }
