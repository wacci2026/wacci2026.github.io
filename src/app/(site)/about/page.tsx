"use client";

import SectionDivider from "@/components/sections/section-divider";
import WorkshopChairs from "@/components/sections/workshop-chairs";
import { motion } from "framer-motion";
import Image from "next/image";
import { withBasePath } from "@/lib/base-path";

const topics = [
  "Compressive sensing",
  "Unconventional imaging modalities",
  "Imaging at extreme scales",
  "3D Imaging",
  "Superresolution",
  "Lensless imaging",
  "Deep learning for computational imaging",
  "Imaging through turbid media",
  "Spectral imaging",
  "Phase retrieval",
  "Wavefront sensing",
  "Adaptive optics",
  "Inverse problems",
  "Fourier Ptychography",
];

const archiveItems = [
  {
    title: "WACCI 2019",
    location: "Valparaiso, Chile",
    imageUrl: withBasePath("/archive/valp-1400x878.jpg"),
    href: "https://wacci2019.pucv.cl/",
  },
  {
    title: "WACCI 2022",
    location: "Bucaramanga, Colombia",
    imageUrl: withBasePath("/archive/bucaramanga.jpg"),
    href: "https://wacci2022.github.io/",
  },
  {
    title: "WACCI 2024",
    location: "Montevideo, Uruguay",
    imageUrl: withBasePath("/archive/Kibon.png"),
    href: "https://wacci2024.github.io/index.html",
  },
];

const programCommittee = [
  {
    name: "Member to be announced",
    affiliation: "Affiliation to be announced",
    country: "Country to be announced",
    imageUrl: withBasePath("/images/speakers/pablo-meza.jpg"),
  },
  {
    name: "Member to be announced",
    affiliation: "Affiliation to be announced",
    country: "Country to be announced",
    imageUrl: withBasePath("/images/speakers/esteban-vera.jpg"),
  },
  {
    name: "Member to be announced",
    affiliation: "Affiliation to be announced",
    country: "Country to be announced",
    imageUrl: withBasePath("/images/speakers/nelson-diaz.jpg"),
  },
];

const organizingCommittee = [
  {
    name: "Member to be announced",
    affiliation: "Affiliation to be announced",
    country: "Country to be announced",
    imageUrl: withBasePath("/images/speakers/pablo-meza.jpg"),
  },
  {
    name: "Member to be announced",
    affiliation: "Affiliation to be announced",
    country: "Country to be announced",
    imageUrl: withBasePath("/images/speakers/esteban-vera.jpg"),
  },
  {
    name: "Member to be announced",
    affiliation: "Affiliation to be announced",
    country: "Country to be announced",
    imageUrl: withBasePath("/images/speakers/nelson-diaz.jpg"),
  },
];

const partnerItems = [
  {
    name: "Partner One",
    initials: "P1",
  },
  {
    name: "Imaging Hub",
    initials: "IH",
  },
  {
    name: "Photonics Group",
    initials: "PG",
  },
];

const sponsorItems = [
  {
    name: "Optica",
    imageUrl: withBasePath("/sponsors/logo_optica_knockout_rgb_300dpi.png"),
  },
  {
    name: "Air Force Research Laboratory",
    imageUrl: withBasePath("/sponsors/Air_Force_Research_Laboratory.png"),
  },
  {
    name: "United States Army",
    imageUrl: withBasePath("/sponsors/Logo_of_the_United_States_Army.svg.webp"),
  },
  {
    name: "Office of Naval Research",
    imageUrl: withBasePath("/sponsors/logo.png"),
  },
  {
    name: "Thorlabs",
    imageUrl: withBasePath("/sponsors/logo_red_rgb.svg"),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
};

const cardFadeUp = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

function TopicIcon({ index }: { index: number }) {
  const icons = [
    <path key="aperture" d="M12 3l4.5 7.8L12 21 7.5 10.8 12 3Zm0 0h9l-4.5 7.8M12 3H3l4.5 7.8M12 21h9l-4.5-10.2M12 21H3l4.5-10.2" />,
    <path key="scan" d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10" />,
    <path key="cube" d="M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Zm0 0v8.8m7.5-4.6L12 11.8 4.5 7.2" />,
    <path key="spark" d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Zm6 11 1 2.6 2.5.9-2.5.9-1 2.6-1-2.6-2.5-.9 2.5-.9 1-2.6Z" />,
  ];

  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[index % icons.length]}
    </svg>
  );
}

type CommitteePerson = {
  name: string;
  affiliation: string;
  country: string;
  imageUrl: string;
};

function CommitteeSection({
  title,
  people,
  className = "bg-white",
  showBackgroundAccent = true,
}: {
  title: string;
  people: CommitteePerson[];
  className?: string;
  showBackgroundAccent?: boolean;
}) {
  return (
    <section className={`${className} relative overflow-hidden px-5 py-16 sm:py-20`}>
      {showBackgroundAccent && (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(7,58,75,0.08),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(63,135,154,0.12),transparent_36%)]"
          aria-hidden="true"
        />
      )}
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-10 max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          <h2 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            {title}
          </h2>
          <div
            className="mx-auto mt-5 h-px w-24 bg-linear-to-r from-transparent via-primary-500 to-transparent"
            aria-hidden="true"
          />
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {people.map((person, index) => (
            <motion.article
              key={`${title}-${index}`}
              className="person-card-motion group relative min-h-[380px] overflow-hidden rounded-[24px] border border-white/20 bg-gray-900 shadow-[0px_28px_70px_-36px_rgba(14,23,38,0.55)]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardFadeUp}
              transition={{
                type: "spring",
                stiffness: 85,
                damping: 18,
                delay: index * 0.12,
              }}
            >
              <div className="absolute inset-0">
                <Image
                  src={person.imageUrl}
                  alt={person.name}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-black/5" />
              <div className="relative flex h-full min-h-[380px] flex-col items-center justify-end p-5 text-center text-white">
                <h3 className="text-2xl font-bold leading-tight">
                  {person.name}
                </h3>
                <p className="mt-1 text-base font-medium leading-snug text-white/85">
                  {person.affiliation}
                </p>
                <p className="text-sm uppercase tracking-[0.18em] text-white/65">
                  {person.country}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

type SupportItem = {
  name: string;
  initials?: string;
  imageUrl?: string;
};

function SupportGrid({
  title,
  items,
}: {
  title: string;
  items: SupportItem[];
}) {
  return (
    <div className="relative">
      <motion.div
        className="mx-auto mb-8 max-w-2xl text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeUp}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
      >
        <h3 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
          {title}
        </h3>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <motion.article
            key={item.name}
            className="group relative flex min-h-44 flex-col items-center justify-center gap-5 overflow-hidden rounded-xl border border-white/20 bg-white/96 p-6 text-center shadow-[0_24px_70px_-42px_rgba(0,0,0,0.65)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/60 hover:bg-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardFadeUp}
            transition={{
              type: "spring",
              stiffness: 85,
              damping: 18,
              delay: index * 0.08,
            }}
          >
            <div
              className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary-500/45 to-transparent"
              aria-hidden="true"
            />
            <div className="relative flex h-24 w-full max-w-56 shrink-0 items-center justify-center p-2 transition duration-300 group-hover:scale-105">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="224px"
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-2xl font-bold text-primary-500">
                  {item.initials}
                </span>
              )}
            </div>
            <h4 className="text-base font-bold leading-snug text-gray-900">
              {item.name}
            </h4>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function SponsorsSection() {
  return (
    <section className="relative overflow-hidden bg-[#073A4B] px-5 py-16 sm:py-20">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(63,135,154,0.42),transparent_38%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="space-y-16">
          <SupportGrid title="Support Partners" items={partnerItems} />
          <SupportGrid title="Sponsors" items={sponsorItems} />
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="bg-gray-50">
      <section className="px-5 py-10 sm:py-18">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={fadeUp}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          >
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              About the Workshop
            </h1>
            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">
              Scope
            </p>
            <p className="mx-auto mt-7 text-lg leading-8 text-gray-600 sm:text-xl sm:leading-9">
              The 4th International Workshop on Adaptive, Compressive and
              Computational Imaging WACCI 2026 covers the most recent and
              exciting advances in state-of-the-art computational imaging
              topics, with plenary speakers, and special sessions. In addition,
              several matchmaking events targeting students and professionals
              will be featured in WACCI 2026.
            </p>
          </motion.div>

          <motion.div
            className="mt-18"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            variants={fadeUp}
            transition={{ type: "spring", stiffness: 70, damping: 18 }}
          >
            <motion.div
              className="mx-auto mb-10 max-w-2xl text-center"
              variants={fadeUp}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">
                Topics of Interest
              </p>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
              {topics.map((topic, index) => (
                <motion.article
                  key={topic}
                  className="group flex min-h-28 flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-center shadow-theme-xs transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-theme-sm"
                  variants={cardFadeUp}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 18,
                    delay: index * 0.035,
                  }}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500 transition group-hover:bg-primary-500 group-hover:text-white">
                    <TopicIcon index={index} />
                  </span>
                  <h3 className="text-sm font-semibold leading-snug text-gray-800">
                    {topic}
                  </h3>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      <section className="bg-white px-5 py-15 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mx-auto mb-10 max-w-2xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          >
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Archive
            </h1>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {archiveItems.map((item, index) => (
              <motion.a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group relative min-h-72 overflow-hidden rounded-lg border border-white/20 shadow-[0px_28px_70px_-36px_rgba(14,23,38,0.8)] transition duration-300 hover:-translate-y-1 hover:border-white/40"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={cardFadeUp}
                transition={{
                  type: "spring",
                  stiffness: 85,
                  damping: 18,
                  delay: index * 0.12,
                }}
              >
                <Image
                  src={item.imageUrl}
                  alt={`${item.title} ${item.location}`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/5" />
                <div className="relative flex h-full min-h-72 flex-col justify-end p-6 text-white">
                  <h3 className="text-2xl font-bold leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-base font-medium text-white/80">
                    {item.location}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="bg-gray-50 px-5 py-16 sm:py-20">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.55 }}
          variants={fadeUp}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">
            Code of Conduct
          </p>
          <p className="text-lg leading-8 text-gray-600 sm:text-xl">
            WACCI 2026 adheres to the{" "}
            <a
              href="https://www.optica.org/events/code_of_conduct/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary-500 underline underline-offset-4 transition hover:text-primary-700"
            >
              Optica Anti-harassment Policy and Code of Conduct
            </a>
            .
          </p>
        </motion.div>
      </section>

      <SectionDivider />

      <WorkshopChairs />
      <SectionDivider />
      <CommitteeSection title="Program Committee" people={programCommittee} />
      <SectionDivider />
      <CommitteeSection
        title="Organizing Committee"
        people={organizingCommittee}
        className="bg-gray-50"
        showBackgroundAccent={false}
      />
      <SectionDivider />
      <SponsorsSection />
    </main>
  );
}
