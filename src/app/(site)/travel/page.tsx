import Image from "next/image";
import type { Metadata } from "next";
import { withBasePath } from "@/lib/base-path";
import SectionDivider from "@/components/sections/section-divider";

export const metadata: Metadata = {
  title: "Travel – Pucón, Chile",
};

const facts = [
  {
    label: "Time Zone",
    value: "UTC−03:00 (Chile Summer Time)",
    note: "December",
  },
  {
    label: "Currency",
    value: "Chilean Peso (CLP)",
    note: "Credit/debit cards widely accepted",
  },
  {
    label: "Languages",
    value: "Spanish",
    note: "Mapudungun also spoken",
  },
  {
    label: "Avg. Temperature",
    value: "21°C / 8°C (70°F / 46°F)",
    note: "December average",
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
    title: "Termas de Huife",
    description:
      "Open-air thermal pools in the middle of native forest, a little over half an hour from Pucón. Shuttle or transport can usually be arranged through an agency or your hotel.",
    image: "/images/travel/Termas_huife.jpg",
  },
  {
    title: "Termas Los Pozones",
    description:
      "Natural thermal pools set in native forest, around half an hour from town. A convenient option for those without a car or much time.",
    image: "/images/travel/Termas_pozones.jpg",
  },
  {
    title: "Ojos del Caburgua",
    description:
      "Waterfalls and turquoise pools, 20 minutes by car outside Pucón. The main access requires only a short, flat walk to the first viewpoints.",
    image: "/images/travel/Ojos_del_Caburga2.jpg",
  },
  {
    title: "Plaza de Armas",
    description:
      "The historic heart of Pucón, right in front of the venue, with volcano views between the trees. Nearby Fresia and O'Higgins streets concentrate most shops, cafés, and restaurants.",
    image: "/images/travel/Plaza_armas.jpg",
  },
  {
    title: "Feria Artesanal",
    description:
      "A market just steps from the center with Mapuche wood and wool crafts, souvenirs, and regional products. A short but highly recommended stop.",
    image: "/images/travel/Feria_artesanal.jpg",
  },
  {
    title: "La Poza y la Costanera",
    description:
      "Pucón's most emblematic lakeside promenade, free to enter, with direct views of the lake and volcano. It features a viewpoint, wooden sculptures, boat rides (including the \"pirate ship\" tour), the classic \"Pucón\" letters, and connects to the Costanera path toward Playa Grande.",
    image: "/images/travel/La_Poza2.jpg",
  },
];

const accommodations = [
  {
    tier: "Basic",
    subtitle: "Hostels & Private Rooms",
    description:
      "For attendees requiring essential services, Pucón offers central options with private or shared rooms.",
    items: [
      {
        name: "Hostal Casa Trancura",
        description: "A traditional hostel in the urban area.",
        distance: "700m · 10 min walk",
        href: "https://www.booking.com/hotel/cl/hostal-casa-trancura-pucon.es.html",
      },
      {
        name: "Habitación Privada Centro Pucón (Airbnb)",
        description:
          "Private room in a private lodging with access to shared spaces.",
        distance: "800m · 10 min walk",
        href: "https://www.airbnb.cl/rooms/41885178",
      },
    ],
  },
  {
    tier: "Mid-Range",
    subtitle: "Standard Hotels & Cabins",
    description:
      "Options offering more privacy and acoustic isolation, aimed at professionals requiring rest and workspace.",
    items: [
      {
        name: "Cabaña Central (Airbnb)",
        description: "Independent cabin with basic equipment for two people.",
        distance: "700m · 10 min walk",
        href: "https://www.airbnb.cl/rooms/1492052425267236069",
      },
      {
        name: "Hotel Patagonia Pucón",
        description: "Standard-category hotel establishment.",
        distance: "350m · 5 min walk",
        href: "https://www.booking.com/hotel/cl/patagonia-pucon.es.html",
      },
      {
        name: "Hotel Pucón Indómito",
        description: "Modern infrastructure with facilities oriented toward rest.",
        distance: "250m · 3 min walk",
        href: "https://www.booking.com/hotel/cl/pucon-indomito.es.html",
      },
    ],
  },
  {
    tier: "Executive",
    subtitle: "Executive Hotels",
    description:
      "Establishments with comprehensive services that optimize logistics for researchers with limited time in the city.",
    items: [
      {
        name: "Hotel Huincahue",
        description: "Boutique hotel focused on personalized service and seclusion.",
        distance: "350m · 5 min walk",
        href: "https://www.booking.com/hotel/cl/huincahue.es.html",
      },
      {
        name: "Enjoy Pucón · Gran Hotel Pucón",
        description:
          "Executive-level hotel with comprehensive infrastructure and centralized services.",
        distance: "350m · 5 min walk",
        href: "https://www.booking.com/hotel/cl/enjoy-pucon-gran-pucon.es.html",
      },
    ],
  },
];

const traditionalFoods = [
  {
    name: "Empanada de Pino",
    description:
      "Baked pastry filled with beef, onion, olive, and hard-boiled egg. An efficient option for a quick lunch between conference sessions.",
    image: "/images/travel/pino.jpg",
  },
  {
    name: "Asado Tradicional",
    description:
      "Cuts of meat prepared over the grill or on the spit (often lamb or beef). Suggested for dinners or closing sessions of the conference.",
    image: "/images/travel/asado.jpg",
  },
  {
    name: "Pastel de Choclo",
    description:
      "Baked dish with a sweet corn (choclo) topping over a meat base with chicken, olive, and hard-boiled egg.",
    image: "/images/travel/pastel.jpg",
  },
  {
    name: "Pulmay",
    description:
      "A traditional southern Chile stew, cooked in a pot, combining shellfish, pork, chicken, sausages, and potatoes. A high-calorie dish with generous portions.",
    image: "/images/travel/Pulmay.jpg",
  },
];

const restaurants = [
  {
    name: "Sabor a Mar",
    description:
      "Restaurant specializing in seafood and coastal Chilean cuisine.",
    href: "https://www.tripadvisor.cl/Restaurant_Review-g294297-d11961841-Reviews-Sabor_a_Mar-Pucon_Araucania_Region.html",
  },
  {
    name: "Criolla Pucón",
    description: "Classic Chilean flavors with local identity.",
    href: "https://www.tripadvisor.cl/Restaurant_Review-g294297-d15091335-Reviews-Criolla_Pucon-Pucon_Araucania_Region.html",
  },
  {
    name: "La Maga",
    description: "Specializing in grilled cuts of meat and traditional asado.",
    href: "https://www.tripadvisor.cl/Restaurant_Review-g294297-d1382834-Reviews-La_Maga-Pucon_Araucania_Region.html",
  },
  {
    name: "El Maderero",
    description: "An establishment serving typical national cuisine.",
    href: "https://www.tripadvisor.cl/Restaurant_Review-g294297-d13440824-Reviews-Restaurant_El_Maderero-Pucon_Araucania_Region.html",
  },
  {
    name: "Café Berlin Pucón",
    description: "Café and pastry shop representing the German colonist tradition.",
    href: "https://www.tripadvisor.cl/Restaurant_Review-g294297-d10120516-Reviews-Cafe_Berlin_Pucon-Pucon_Araucania_Region.html",
  },
  {
    name: "Chocolates Rucamalal",
    description: "Artisanal chocolate production with tastings available for visitors.",
    href: "https://www.tripadvisor.cl/Attraction_Review-g294297-d10415801-Reviews-Chocolates_Rucamalal-Pucon_Araucania_Region.html",
  },
];

export default function TravelPage() {
  return (
    <>
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <Image
          src={withBasePath("/images/pucon_chile.png")}
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

      <section className="py-16 md:py-14 relative overflow-hidden">
        <div className="wrapper">
          <div className="max-w-[1000px] mx-auto">
            <div className="grid md:grid-cols-5 gap-10">
              <div className="md:col-span-3">
                <h2 className="text-3xl md:text-title-lg font-bold text-gray-900 mb-4">
                  Welcome to Pucón
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed text-justify">
                  <p>
                    Pucón, located in the Araucanía Region of southern Chile, is
                    renowned as a hub for both adventure and relaxation. Nestled by
                    Lake Villarrica and shadowed by the active Villarrica Volcano,
                    it offers visitors a unique blend of breathtaking landscapes,
                    national parks, and thermal springs.
                  </p>
                  <p>
                    The town provides an exceptional environment to unwind after a
                    productive day of scientific sessions.
                  </p>
                </div>
                <h2 className="mt-10 text-3xl md:text-title-lg font-bold text-gray-900 mb-3">
                  Visa Information
                </h2>
                <p className="text-gray-700 max-w-2xl text-justify">
                  Obtain information about required documentation needed to travel to Chile.
                </p>
                <div className="text-center mb-12">
                  <a
                    href=" https://chile.travel/en/good-to-know/entry-and-visa-requirements/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Visa Information
                  </a>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="sticky rounded-2xl border border-gray-100 bg-white p-6 shadow-theme-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Quick Facts
                  </h3>
                  <div className="space-y-4">
                    {facts.map((fact) => (
                      <div
                        key={fact.label}
                        className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {fact.label}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {fact.value}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 shrink-0 text-right max-w-[120px]">
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

       {/*<SectionDivider />

      <section className="py-16 md:py-20 bg-gray-50 relative overflow-hidden">
        <div className="wrapper">
          <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-title-lg font-bold text-gray-900 mb-3">
                Visa Information
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Obtain information about required documentation needed to travel to Chile.
              </p>
              <a
                href=" https://chile.travel/en/good-to-know/entry-and-visa-requirements/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
              >
                Visa Information
              </a>
            </div>
          </div>
        </div>
     </section>*/}


       <SectionDivider />

       <section className="py-16 md:py-20 bg-gray-50 relative overflow-hidden">
         <div className="wrapper">
           <div className="max-w-[1000px] mx-auto">
             <div className="text-center mb-12">
               <h2 className="text-3xl md:text-title-lg font-bold text-gray-900 mb-3">
                 Food in Pucón
               </h2>
               <p className="text-gray-700 max-w-2xl mx-auto">
                 Traditional dishes and dining spots to fuel your stay.
               </p>
             </div>

             <h3 className="text-2xl font-bold text-gray-900 mb-1 text-center">
               Traditional Chilean Food
             </h3>
             <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8 text-center">
               Don&apos;t miss these regional specialties while you are in town.
             </p>
             <div className="grid sm:grid-cols-2 gap-6 mb-14">
               {traditionalFoods.map((food) => (
                 <div
                   key={food.name}
                   className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-theme-sm"
                 >
                   <div className="relative h-40 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                     {food.image ? (
                       // eslint-disable-next-line @next/next/no-img-element
                       <img
                         src={food.image}
                         alt={food.name}
                         className="h-full w-full object-cover"
                       />
                     ) : (
                       <span className="text-sm text-gray-600">
                         🍽️ Image coming soon
                       </span>
                     )}
                   </div>
                   <div className="p-6 text-center">
                     <h4 className="text-lg font-bold text-gray-900 mb-2">
                       {food.name}
                     </h4>
                     <p className="text-sm text-gray-700 leading-relaxed text-center">
                       {food.description}
                     </p>
                   </div>
                 </div>
               ))}
             </div>

             <h3 className="text-2xl font-bold text-gray-900 mb-1 text-center">
               Where to Eat
             </h3>
             <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8 text-center">
               A selection of recommended restaurants in Pucón.
             </p>
             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
               {restaurants.map((restaurant) => (
                 <a
                   key={restaurant.name}
                   href={restaurant.href || "#"}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-theme-sm hover:-translate-y-1 hover:border-primary-200 hover:shadow-theme-lg transition-all duration-300 cursor-pointer"
                 >
                   <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">
                     {restaurant.name}
                   </h4>
                   <p className="text-sm text-gray-700 leading-relaxed text-center">
                     {restaurant.description}
                   </p>
                   <p className="text-center text-sm font-bold text-primary-500 mt-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                     View website ↗
                   </p>
                 </a>
               ))}
             </div>

             <p className="text-sm text-gray-700 max-w-3xl mx-auto text-center leading-relaxed">
               Those preferring something more casual can also explore <strong>Fresia</strong> and
              <strong> O&apos;Higgins</strong> streets, where cafés, sandwich shops, and bars with
               craft beer are concentrated, all a short distance from the Campus.
             </p>
           </div>
         </div>
       </section>

      <SectionDivider />

      <section className="py-16 md:py-20 bg-gray-50 relative overflow-hidden">
        <div className="wrapper">
          <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-title-lg font-bold text-gray-900 mb-3">
                Accommodation in Pucón
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                From hostels to executive hotels, find a place to stay within
                walking distance of the venue.
              </p>
            </div>

              <div className="space-y-12">
              {accommodations.map((accommodation) => (
                <div key={accommodation.tier}>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">
                    {accommodation.subtitle}
                  </h3>
                  <p className="text-gray-700 text-sm mb-6 max-w-2xl mx-auto leading-relaxed text-center">
                    {accommodation.description}
                  </p>
                  <div className="flex flex-wrap justify-center gap-6">
                    {accommodation.items.map((item) => (
                      <a
                        key={item.name}
                        href={item.href || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] rounded-2xl border border-gray-100 bg-white p-6 shadow-theme-sm hover:-translate-y-1 hover:border-primary-200 hover:shadow-theme-lg transition-all duration-300 cursor-pointer"
                      >
                        <span className="text-sm font-bold text-primary-500 mb-2 block text-center">
                          {accommodation.tier}
                        </span>
                        <h4 className="text-center text-lg font-bold text-gray-900 mb-2">
                          {item.name}
                        </h4>
                        <p className="text-center text-sm text-gray-700 leading-relaxed">
                          {item.description}
                        </p>
                        <p className="text-center text-xs font-semibold text-gray-600 mt-3">
                          {item.distance} from venue
                        </p>
                        <p className="text-center text-sm font-bold text-primary-500 mt-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          View website ↗
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="wrapper">
          <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-title-lg font-bold text-gray-900 mb-3">
                Things to Do in Pucón
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                From volcano treks to thermal soaks, every day brings a new
                adventure in Pucón.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {activities.map((activity) => (
                <div
                  key={activity.title}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-theme-sm"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {activity.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">
                        Image coming soon
                      </span>
                    )}
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*<SectionDivider />

      <section className="py-16 md:py-20 bg-gray-50 relative overflow-hidden">
        <div className="wrapper">
          <div className="max-w-[1000px] mx-auto">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Travel Guides
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Pucón is often considered Chile&apos;s adventure capital, offering a wide range of
                  outdoor activities. From trekking Villarrica Volcano and exploring Huerquehue
                  National Park to relaxing in thermal hot springs like Termas Geométricas,
                  there&apos;s something for every nature lover.
                </p>
                <div className="space-y-3">
                  <a
                    href="https://www.chile.travel/en/destinations/pucon/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-theme-sm hover:shadow-theme-lg transition-shadow"
                  >
                    <span className="text-xl">📖</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        Chile Travel: Pucón
                      </h3>
                      <p className="text-xs text-primary-500">English</p>
                    </div>
                  </a>
                  <a
                    href="https://www.lonelyplanet.com/chile/araucania/pucon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-theme-sm hover:shadow-theme-lg transition-shadow"
                  >
                    <span className="text-xl">🌍</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        Lonely Planet: Pucón
                      </h3>
                      <p className="text-xs text-primary-500">English</p>
                    </div>
                  </a>
                  <a
                    href="https://puraaventura.com/chile/pucon/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-theme-sm hover:shadow-theme-lg transition-shadow"
                  >
                    <span className="text-xl">🏔️</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        Pura Aventura: Pucón
                      </h3>
                      <p className="text-xs text-primary-500">English</p>
                    </div>
                  </a>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Dining
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Pucón has a diverse food scene shaped by Mapuche traditions, German influence,
                  and modern Chilean cuisine. You&apos;ll find great local meats, fresh trout, and
                  artisanal chocolates, especially around the town center and main streets.
                </p>
                <div className="space-y-3">
                  <a
                    href="https://www.tripadvisor.com/Restaurants-g303681-Pucon_Araucania_Region.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-theme-sm hover:shadow-theme-lg transition-shadow"
                  >
                    <span className="text-xl">🍽️</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        Top 10 Best Restaurants in Pucón
                      </h3>
                      <p className="text-xs text-gray-500">
                        Discover the best dining options in the Araucanía region
                      </p>
                    </div>
                  </a>
                  <a
                    href="https://www.tripadvisor.com/Restaurants-g303681-zfp2552-Pucon_Araucania_Region.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-theme-sm hover:shadow-theme-lg transition-shadow"
                  >
                    <span className="text-xl">🥗</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        Best spots for lunch in Pucón
                      </h3>
                      <p className="text-xs text-gray-500">
                        Great options for a midday meal during your stay
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>*/}

      <SectionDivider />

      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="wrapper">
          <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-title-lg font-bold text-gray-900 mb-3">
                Getting There
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Pucón is easily accessible by road from major Chilean cities.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-theme-sm text-center">
                <span className="text-2xl block mb-2">✈️</span>
                <h3 className="font-bold text-gray-900 mb-1">
                  By Air
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Fly to La Araucanía International Airport (ZCO) in Temuco,
                  then drive 1.5 hours to Pucón.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-theme-sm text-center">
                <span className="text-2xl block mb-2">🚌</span>
                <h3 className="font-bold text-gray-900 mb-1">
                  By Bus
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Direct buses from Santiago (10–12 hrs) and other cities arrive
                  at Pucón&apos;s central terminal.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-theme-sm text-center">
                <span className="text-2xl block mb-2">🚗</span>
                <h3 className="font-bold text-gray-900 mb-1">
                  By Car
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Take Route 5 south to Temuco, then Route 199-CH east. About 10
                  hours from Santiago.
                </p>
              </div>
            </div>

            <div className="w-full overflow-hidden rounded-xl shadow-theme-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13000!2d-71.9694800224182!3d-39.28042714631469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x96147f42351988d1%3A0x3c5c238b02dc5935!2zUHVjb24sIFB1Y8OzbiwgQXJhdWNhbsOtYSwgQ2hpbGU!5e0!3m2!1ses!2sco!4v1788578990871!5m2!1ses!2sco"
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
