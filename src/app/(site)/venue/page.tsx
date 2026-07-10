import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Venue",
};

export default function VenuePage() {
  return (
    <>
      <section className="py-20 md:py-28 relative overflow-hidden bg-[#FAFAFA]">
        <div className="absolute top-20 -left-20 h-96 w-96 rounded-full bg-blue-100 opacity-60 mix-blend-multiply blur-3xl" aria-hidden="true" />
        <div className="absolute top-20 -right-20 h-96 w-96 rounded-full bg-blue-100 opacity-60 mix-blend-multiply blur-3xl" aria-hidden="true" />
        <div className="wrapper relative z-10">
          <div className="max-w-[800px] mx-auto">
            <h1 className="text-4xl md:text-title-lg font-bold text-gray-900 mb-4">
              Venue
            </h1>

            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              The Venue for the Workshop will be{" "}
              <a
                href="https://www.marriott.com/en-us/hotels/mvdal-aloft-montevideo-hotel/overview/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-600 font-semibold"
              >
                Aloft Montevideo Hotel
              </a>
              .
            </p>

            <h2 className="mb-6 text-3xl font-semibold text-gray-900 md:text-title-lg">
              Transportation to the hotel from Carrasco International Airport
            </h2>

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              By taxi or Uber
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              The journey to downtown Montevideo takes approximately 40 minutes.
              Official airport taxis charge around 55 USD and accept credit
              cards (
              <a
                href="http://www.taxisaeropuerto.com/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-600"
              >
                taxisaeropuerto.com
              </a>
              ). Uber is usually a convenient and affordable option. Pickups are
              located at the departure level on the upper floor (cost depending
              on demand).{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Important note:
              </span>{" "}
              Please be aware that the availability of services like Uber or
              public taxis from the airport may vary depending on the time of
              your arrival.
            </p>

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              By bus
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-10">
              The journey takes approximately 1 hour. Public buses offer a more
              economical option at around 5 USD (payable in Uruguayan pesos).
              The airport provides currency exchange services. Information about
              available bus lines can be obtained at the airport&apos;s
              information desk (
              <a
                href="https://aeropuertodecarrasco.com.uy/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-600"
              >
                aeropuertodecarrasco.com.uy
              </a>
              ).
            </p>

            <div className="w-full overflow-hidden rounded-xl shadow-theme-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1635.6417500088794!2d-56.158852289105496!3d-34.92442626258438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f817818a890d7%3A0x82d7f9d9b2de1fe!2sAloft%20Montevideo%20Hotel!5e0!3m2!1ses!2suy!4v1722984527784!5m2!1ses!2suy"
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
      </section>
    </>
  );
}
