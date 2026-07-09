import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel – Pucón, Chile",
};

const facts = [
  {
    label: "Time Zone",
    value: "UTC−4 (CLT)",
    note: "DST: UTC−3 (CLST)",
  },
  {
    label: "Currency",
    value: "Chilean Peso (CLP)",
    note: "≈ $1 USD = $950 CLP",
  },
  {
    label: "Languages",
    value: "Spanish",
    note: "Mapudungun also spoken",
  },
  {
    label: "Avg. Temperature",
    value: "14°C (57°F)",
    note: "Summer 25°C / Winter 5°C",
  },
  {
    label: "Elevation",
    value: "227 m (745 ft)",
    note: "At the foot of Villarrica Volcano",
  },
  {
    label: "Population",
    value: "~28,000",
    note: "Peak season swells significantly",
  },
];

const activities = [
  {
    title: "Villarrica Volcano",
    description:
      "Hike to the summit of one of Chile's most active volcanoes. The 6–8 hour guided trek rewards you with breathtaking views of the crater and the surrounding lakes.",
    icon: "🌋",
  },
  {
    title: "Lake & Water Sports",
    description:
      "Enjoy swimming, kayaking, paddleboarding, and fishing in the crystal-clear waters of Lake Villarrica. The black sand beaches are a unique feature of the area.",
    icon: "🏄",
  },
  {
    title: "Thermal Springs",
    description:
      "Relax in natural hot springs scattered around the region. Popular spots include Termas Geométricas, Termas de Huife, and Termas Los Pozones, each offering a unique mountain setting.",
    icon: "♨️",
  },
  {
    title: "Ojos del Caburgua",
    description:
      "Visit these stunning turquoise waterfalls located in the Huerquehue National Park. A short hike leads you to multiple cascades and natural pools surrounded by ancient araucaria trees.",
    icon: "💧",
  },
  {
    title: "Whitewater Rafting",
    description:
      "Experience adrenaline-pumping rapids on the Trancura River. Choose from the milder upper section (class III) or the challenging lower section (class III–IV) for an unforgettable ride.",
    icon: "🛶",
  },
  {
    title: "Huerquehue National Park",
    description:
      "Explore lush temperate rainforests, pristine lakes, and ancient araucaria forests. The park offers well-marked trails for all levels, with opportunities to spot native wildlife.",
    icon: "🌲",
  },
];

export default function TravelPage() {
  return (
    <>
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <Image
          src="/images/pucon_chile.png"
          alt="Villarrica Volcano and Lake Villarrica, Pucón"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="wrapper">
            <div className="max-w-3xl">
              <p className="text-primary-300 font-semibold text-sm md:text-base mb-2 tracking-wider uppercase">
                Chile &bull; Araucanía Region
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 leading-tight">
                Welcome to Pucón
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl leading-relaxed">
                Adventure capital of Chile &mdash; where the volcano meets the
                lake, and every trail leads to wonder.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="wrapper">
          <div className="max-w-[1000px] mx-auto">
            <div className="grid md:grid-cols-5 gap-10">
              <div className="md:col-span-3">
                <h2 className="text-3xl md:text-title-lg font-bold text-gray-900 mb-4">
                  About Pucón
                </h2>
                <div className="space-y-4 text-gray-500 dark:text-gray-400 leading-relaxed">
                  <p>
                    Nestled on the shores of Lake Villarrica at the foot of the
                    majestic Villarrica Volcano, Pucón is Chile&apos;s premier
                    adventure tourism destination. Located in the heart of the
                    Chilean Lake District, this charming town of approximately
                    28,000 residents comes alive with travelers from around the
                    globe seeking outdoor thrills, natural beauty, and
                    world-class relaxation.
                  </p>
                  <p>
                    Pucón serves as the gateway to an extraordinary array of
                    natural wonders. From the snow-capped peak of the active
                    Villarrica Volcano to the ancient araucaria forests of
                    Huerquehue National Park, from steaming thermal springs to
                    pristine rivers perfect for rafting &mdash; the region
                    offers an unmatched variety of experiences in every season.
                  </p>
                  <p>
                    The town itself blends modern tourism infrastructure with
                    authentic Chilean culture. You&apos;ll find excellent
                    restaurants serving fresh lake fish and traditional cuisine,
                    cozy lodges and luxury resorts, craft markets, and a
                    welcoming local community. Whether you&apos;re seeking
                    adrenaline-fueled adventures or serene moments in nature,
                    Pucón delivers an unforgettable experience.
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="sticky top-28 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-primary p-6 shadow-theme-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Quick Facts
                  </h3>
                  <div className="space-y-4">
                    {facts.map((fact) => (
                      <div
                        key={fact.label}
                        className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            {fact.label}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {fact.value}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0 text-right max-w-[120px]">
                          {fact.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50 dark:bg-[#141b29] relative overflow-hidden">
        <div className="wrapper">
          <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-title-lg font-bold text-gray-900 mb-3">
                Things to Do in Pucón
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                From volcano treks to thermal soaks, every day brings a new
                adventure in Pucón.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <div
                  key={activity.title}
                  className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-primary p-6 shadow-theme-sm hover:shadow-theme-lg transition-shadow"
                >
                  <span className="text-3xl block mb-3">{activity.icon}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="wrapper">
          <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-title-lg font-bold text-gray-900 mb-3">
                Getting There
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Pucón is easily accessible by road from major Chilean cities.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-primary p-6 shadow-theme-sm text-center">
                <span className="text-2xl block mb-2">✈️</span>
                <h3 className="font-bold text-gray-900 mb-1">
                  By Air
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Fly to La Araucanía International Airport (ZCO) in Temuco,
                  then drive 1.5 hours to Pucón.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-primary p-6 shadow-theme-sm text-center">
                <span className="text-2xl block mb-2">🚌</span>
                <h3 className="font-bold text-gray-900 mb-1">
                  By Bus
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Direct buses from Santiago (10–12 hrs) and other cities arrive
                  at Pucón&apos;s central terminal.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-primary p-6 shadow-theme-sm text-center">
                <span className="text-2xl block mb-2">🚗</span>
                <h3 className="font-bold text-gray-900 mb-1">
                  By Car
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Take Route 5 south to Temuco, then Route 199-CH east. About 10
                  hours from Santiago.
                </p>
              </div>
            </div>

            <div className="w-full overflow-hidden rounded-xl shadow-theme-sm">
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
      </section>
    </>
  );
}
