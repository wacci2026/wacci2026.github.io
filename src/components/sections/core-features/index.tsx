"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { INVITED_SPEAKERS } from "./data";

const sectionContent = {
 hidden: { opacity: 0, y: 56 },
 visible: {
 opacity: 1,
 y: 0,
 },
};

const cardMotion = {
 hidden: { opacity: 0, y: 42, scale: 0.96 },
 visible: {
 opacity: 1,
 y: 0,
 scale: 1,
 },
};

export function SpeakersSection() {
 return (
 <section className="relative overflow-hidden bg-[#FAFAFA] px-5 py-12 sm:py-15">
 <div className="absolute top-20 -left-20 h-96 w-96 rounded-full bg-blue-100 opacity-60 mix-blend-multiply blur-3xl" aria-hidden="true" />
 <div className="absolute top-20 -right-20 h-96 w-96 rounded-full bg-blue-100 opacity-60 mix-blend-multiply blur-3xl" aria-hidden="true" />
 <motion.div
 className="relative z-10 max-w-[72rem] mx-auto"
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, amount: 0.2 }}
 variants={sectionContent}
 transition={{ type: "spring", stiffness: 70, damping: 18, mass: 0.7 }}
 >
 <motion.div
 className="mb-12 text-center"
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, amount: 0.45 }}
 variants={sectionContent}
 transition={{ type: "spring", stiffness: 80, damping: 20 }}
 >
 <h2 className="font-bold text-gray-800 text-3xl md:text-title-lg max-w-xl mx-auto">
 Invited Speakers
 </h2>
 <div
 className="mx-auto mt-5 h-px w-24 bg-linear-to-r from-transparent via-primary-500 to-transparent"
 aria-hidden="true"
 />
 </motion.div>

 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
 {INVITED_SPEAKERS.map((speaker, index) => (
 <motion.a
 key={speaker.name}
 href={speaker.scholarUrl}
 target="_blank"
 rel="noreferrer"
 aria-label={`View ${speaker.name} on Google Scholar`}
 className="person-card-motion group relative min-h-[380px] overflow-hidden rounded-[24px] border border-white/20 bg-gray-900 shadow-[0px_28px_70px_-36px_rgba(14,23,38,0.55)] focus:outline-none focus:ring-2 focus:ring-primary-500"
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, amount: 0.25 }}
 variants={cardMotion}
 transition={{ type: "spring", stiffness: 85, damping: 18, delay: index * 0.12 }}
 >
 <div className="absolute inset-0">
 <Image
 src={speaker.imageUrl}
 alt={speaker.name}
 fill
 sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
 className={`object-cover transition duration-500 ${
 speaker.name === "Dr. Pablo Meza"
 ? "scale-110 group-hover:scale-[1.15]"
 : "group-hover:scale-105"
 }`}
 />
 </div>
 <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
 <div className="relative flex h-full min-h-[380px] flex-col items-center justify-end p-5 text-center text-white">
 <h3 className="text-2xl font-bold leading-tight">
 {speaker.name}
 </h3>
 <p className="mt-1 text-base font-medium leading-snug text-white/85">
 {speaker.affiliation}
 </p>
 <p className="text-sm uppercase tracking-[0.18em] text-white/65">
 {speaker.country}
 </p>
 </div>
 </motion.a>
 ))}
 </div>
 </motion.div>
 </section>
 );
}
