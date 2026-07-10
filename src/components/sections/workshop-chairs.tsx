"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { withBasePath } from "@/lib/base-path";

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

const WORKSHOP_CHAIRS = [
 {
 name: "Dr. Pablo Meza",
 affiliation: "Universidad de La Frontera",
 country: "Chile",
 imageUrl: withBasePath("/images/speakers/pablo_peza.png"),
 scholarUrl:
 "https://scholar.google.com/citations?hl=es&user=X3UDDjoAAAAJ&view_op=list_works&sortby=pubdate",
 },
 {
 name: "Dr. Esteban Vera",
 affiliation: "Pontificia Universidad Catolica de Valparaiso",
 country: "Chile",
 imageUrl: withBasePath("/images/speakers/esteban-vera.jpg"),
 scholarUrl:
 "https://scholar.google.com/citations?hl=es&user=ymoqnSgAAAAJ&view_op=list_works&sortby=pubdate",
 },
];

export default function WorkshopChairs() {
 return (
 <section className="relative overflow-hidden py-16 sm:py-20 bg-[#073A4B] px-5">
 <div
 className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(63,135,154,0.42),transparent_38%)]"
 aria-hidden="true"
 />
 <motion.div
 className="relative max-w-[72rem] mx-auto"
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
 <h2 className="font-bold text-white text-3xl md:text-title-lg max-w-xl mx-auto">
 Workshop Chairs
 </h2>
 <div
 className="mx-auto mt-5 h-px w-24 bg-linear-to-r from-transparent via-primary-500 to-transparent"
 aria-hidden="true"
 />
 </motion.div>

 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
 {WORKSHOP_CHAIRS.map((chair, index) => (
 <motion.a
 key={chair.name}
 href={chair.scholarUrl}
 target="_blank"
 rel="noreferrer"
 aria-label={`View ${chair.name} on Google Scholar`}
 className="person-card-motion group relative min-h-[380px] overflow-hidden rounded-[24px] border border-white/20 bg-gray-900 shadow-[0px_28px_70px_-36px_rgba(14,23,38,0.55)] focus:outline-none focus:ring-2 focus:ring-white/70"
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, amount: 0.25 }}
 variants={cardMotion}
 transition={{ type: "spring", stiffness: 85, damping: 18, delay: index * 0.12 }}
 >
 <div className="absolute inset-0">
 <Image
 src={chair.imageUrl}
 alt={chair.name}
 fill
 sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
 className={`object-cover transition duration-500 ${
 chair.name === "Dr. Pablo Meza"
 ? "scale-110 group-hover:scale-[1.15]"
 : "group-hover:scale-105"
 }`}
 />
 </div>
 <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
 <div className="relative flex h-full min-h-[380px] flex-col items-center justify-end p-5 text-center text-white">
 <h3 className="text-2xl font-bold leading-tight">
 {chair.name}
 </h3>
 <p className="mt-1 text-base font-medium leading-snug text-white/85">
 {chair.affiliation}
 </p>
 <p className="text-sm uppercase tracking-[0.18em] text-white/65">
 {chair.country}
 </p>
 </div>
 </motion.a>
 ))}
 </div>
 </motion.div>
 </section>
 );
}
