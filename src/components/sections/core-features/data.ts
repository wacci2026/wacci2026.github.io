import { withBasePath } from "@/lib/base-path";

export const INVITED_SPEAKERS = [
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
    affiliation: "Pontificia Universidad Católica de Valparaiso",
    country: "Chile",
    imageUrl: withBasePath("/images/speakers/esteban-vera.jpg"),
    scholarUrl:
      "https://scholar.google.com/citations?hl=es&user=ymoqnSgAAAAJ&view_op=list_works&sortby=pubdate",
  },
];
