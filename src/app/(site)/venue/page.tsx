import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Venue | WACCI 2026",
  description: "Venue information for WACCI 2026 in Pucón, Chile.",
};

export default function VenuePage() {
  return (
    <main className="min-h-screen py-16 lg:py-24 bg-[#FAFAFA] relative overflow-hidden">
      <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60" />
      <div className="absolute top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60" style={{ animationDelay: "2000ms" }} />

      <div className="container px-4 mx-auto relative z-10 max-w-5xl">
        <div className="text-center mb-16 section-title-motion">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-500 mb-4">
            Venue
          </h1>
          <span className="text-primary-500 font-bold tracking-widest uppercase text-xs mb-6 block">
            Pucón, Chile
          </span>
        </div>

        <div className="bg-white rounded-[24px] shadow-lg shadow-gray-200/50 border border-gray-100 p-8 md:p-12 text-base md:text-lg text-gray-600 leading-relaxed space-y-6 animate-fade-up animate-delay-2">
          <h2 className="text-xl font-bold text-gray-900">
            Getting to Pucón
          </h2>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-primary-500 mb-4">By Taxi or Uber</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              From La Araucanía International Airport (ZCO) in Temuco, the journey to Pucón takes
              approximately 1.5 hours by car. Taxis and Uber are available at the airport. Official
              airport taxis accept credit cards. Ride-sharing apps like Uber are usually a convenient
              and affordable option.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              <span className="font-semibold text-gray-700">Important note:</span>{" "}
              Availability of services like Uber or public taxis may vary depending on the time of
              your arrival.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-primary-500 mb-4">By Bus</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Direct buses from Santiago (10–12 hrs) and other major cities arrive at Pucón&apos;s
              central terminal. Public buses offer a more economical option for traveling around
              the region.
            </p>
          </div>

          <div className="mt-6 text-center animate-fade-up animate-delay-3">
            <a
              href="https://www.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              Open in Google Maps
            </a>
          </div>
        </div>

        <div className="mt-10 bg-white rounded-[24px] shadow-lg shadow-gray-200/50 border border-gray-100 p-4 animate-fade-up animate-delay-4">
          <div className="w-full overflow-hidden rounded-xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d311399.9197434677!2d-72.09927454229588!3d-39.27289552721453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x96149e8b2eb5349b%3A0xae9dd2c89ad12cf4!2sPuc%C3%B3n%2C%20Araucan%C3%ADa%2C%20Chile!5e0!3m2!1ses!2suy!4v1722984527784!5m2!1ses!2suy"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
