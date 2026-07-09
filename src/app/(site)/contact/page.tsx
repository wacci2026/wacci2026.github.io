import Image from "next/image";
import { Subheading } from "@/components/sections/hero-section/subheading.tsx";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function Contact() {
  return (
    <section className="relative overflow-hidden pt-14 pb-24 sm:pt-18 sm:pb-30 lg:pt-20 lg:pb-36">
      <Image
        src="/images/hero/pucon.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 object-cover opacity-80 pointer-events-none"
      />
      <div className="max-w-[120rem] mx-auto relative z-20">
        <div className="wrapper">
          <div className="max-w-[860px] mx-auto">
            <div className="text-center">
              <div className="animate-soft-scale animate-delay-1 mt-5 mx-auto inline-flex w-full max-w-[760px] flex-col items-center gap-4 rounded-2xl border border-white/25 bg-black/25 px-5 py-6 text-white shadow-2xl shadow-black/25 backdrop-blur-md sm:mt-7 sm:gap-5 sm:px-10 sm:py-9">
                <h1 className="animate-fade-up animate-delay-2 mx-auto max-w-[680px] text-3xl font-bold leading-tight text-gray-100 sm:text-[46px] sm:leading-[56px]">
                  Contact Us
                </h1>
                <div className="animate-fade-up animate-delay-3 h-px w-24 bg-white/35" />
                <p className="animate-fade-up animate-delay-3 text-3xl font-semibold leading-tight sm:text-3xl">
                  <a href="mailto:wacci2026@gmail.com">wacci2026@gmail.com</a>
                </p>
                <p className="animate-fade-up animate-delay-4 text-lg font-medium text-white/85 sm:text-2xl">
                  For inquiries regarding abstract submission, registration, or
                  technical issues, please contact us at the email address
                  above. We will respond to your inquiry as soon as possible.
                </p>
                <div className="animate-fade-up animate-delay-4 h-px w-16 bg-white/25" />
                <p className="animate-fade-up animate-delay-4 text-base font-medium text-white/75 sm:text-lg">
                  Pucón, Araucanía, Chile
                </p>
              </div>
              {/*<p className="animate-fade-up animate-delay-4 mt-12 text-center mx-auto text-lg font-medium text-white/90 sm:text-xl">
                See you soon!
              </p>*/}
            </div>
          </div>
          <div className="max-w-[1000px] mx-auto relative">
            <div className="absolute hidden lg:block z-10 -top-20 -translate-y-20 left-1/2 -translate-x-1/2">
              <svg
                width="1300"
                height="1001"
                viewBox="0 0 1300 1001"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.7" filter="url(#filter0_f_9279_7148)">
                  <circle cx="800" cy="500.03" r="300" fill="#073A4B" />
                </g>
                <g opacity="0.3" filter="url(#filter1_f_9279_7148)">
                  <circle cx="500" cy="500.03" r="300" fill="#3f879a" />
                </g>
                <defs>
                  <filter
                    id="filter0_f_9279_7148"
                    x="300"
                    y="0.029541"
                    width="1000"
                    height="1000"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur
                      stdDeviation="100"
                      result="effect1_foregroundBlur_9279_7148"
                    />
                  </filter>
                  <filter
                    id="filter1_f_9279_7148"
                    x="0"
                    y="0.029541"
                    width="1000"
                    height="1000"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur
                      stdDeviation="100"
                      result="effect1_foregroundBlur_9279_7148"
                    />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-glow-bg pointer-events-none w-full h-167.5 absolute z-10 bottom-0"></div>
    </section>
  );
}
