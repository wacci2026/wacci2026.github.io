import { withBasePath } from "@/lib/base-path";

export const INVITED_SPEAKERS = [
  {
    name: "David Brady",
    affiliation: "University of Arizona",
    country: "United States",
    imageUrl: withBasePath("/images/speakers/david-brady.webp"),
    scholarUrl: "https://scholar.google.com.mx/citations?user=CcSZwTsAAAAJ&hl=es&oi=ao",
  },
  {
    name: "Enrique Tajahuerce",
    affiliation: "University Jaume I",
    country: "Spain",
    imageUrl: withBasePath("/images/speakers/enrique-tajahuerce.jpeg"),
    scholarUrl: "https://scholar.google.com/citations?user=wvDwqPQAAAAJ&hl=es",
  },
  {
    name: "Demetri Psaltis",
    affiliation: "Ecole Polytechnique Federale de Lausanne",
    country: "Switzerland",
    imageUrl: withBasePath("/images/speakers/demetri-psaltis.jpg"),
    scholarUrl: "https://scholar.google.com/citations?user=-CVR2h8AAAAJ&hl=en",
  },
  {
    name: "Xin Yuan",
    affiliation: "Westlake University",
    country: "China",
    imageUrl: withBasePath("/images/speakers/xin-yuan.jpg"),
    scholarUrl: "https://scholar.google.com/citations?user=cS9CbWkAAAAJ&hl=en",
  },
  {
    name: "Marcus Carlsson",
    affiliation: "Lund University",
    country: "Sweden",
    imageUrl: withBasePath("/images/speakers/marcus-carlsson.webp"),
    scholarUrl: "https://scholar.google.com/citations?user=m6lEHxAAAAAJ&hl=sv",
  },
];
