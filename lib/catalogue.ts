export const stories = [
  {
    id: "leather",
    title: "An everyday rebellion",
    eyebrow: "THE LEATHER JACKET",
    image: 0,
    summary:
      "A leather jacket can carry the visual language of an era without carrying the provenance of its icons.",
    context:
      "Palais Galliera records an anonymous leather blouson dated around 1970. Its collection entry documents leather, metal and cotton construction.",
    publisher: "Paris Musées · Palais Galliera",
    sourceTitle: "Blouson, anonymous, circa 1970",
    url: "https://www.parismuseescollections.paris.fr/en/node/951903",
    locator: "Object 2021.6.29 · dating and materials",
    tags: ["leather", "outerwear", "1970s"],
    collection: "After hours",
  },
  {
    id: "trench",
    title: "From utility to uniform",
    eyebrow: "THE TRENCH COAT",
    image: 1,
    summary:
      "Some silhouettes outlive the purpose they were designed for. The trench is one of them.",
    context:
      "The National Army Museum describes the trench coat’s use by British officers in the First World War and its continued place in civilian dress afterward.",
    publisher: "National Army Museum",
    sourceTitle: "Army fashion statements",
    url: "https://www.nam.ac.uk/explore/armys-been-responsible-many-fashion-statements",
    locator: "The trench coat section",
    tags: ["trench", "utility", "outerwear"],
    collection: "City uniform",
  },
  {
    id: "denim",
    title: "The fabric of everyday life",
    eyebrow: "THE DENIM EDIT",
    image: 2,
    summary: "Workwear, youth culture, and the pieces we reach for every day.",
    context:
      "Europeana traces denim’s path from work clothing to popular fashion, including its connections to Hollywood westerns and twentieth-century youth culture.",
    publisher: "Europeana · European Fashion Heritage Association",
    sourceTitle: "Denim and jeans: the making of a fashion icon",
    url: "https://www.europeana.eu/en/stories/denim-and-jeans-making-of-a-fashion-icon",
    locator: "Marta Franceschini, 11 December 2019 · cultural significance",
    tags: ["denim", "workwear", "cinema"],
    collection: "Off duty",
  },
  {
    id: "tailoring",
    title: "A different kind of structure",
    eyebrow: "THE TAILORING NOTE",
    image: 3,
    summary:
      "A shoulder, a line, a way of moving. Tailoring is a vocabulary all its own.",
    context:
      "The Metropolitan Museum of Art holds a French House of Chanel suit dated 1963–67, made with wool and silk. This is a museum reference for studying tailored dress, not an attribution of our sample blazer.",
    publisher: "The Metropolitan Museum of Art",
    sourceTitle: "House of Chanel · Suit · 1963–67",
    url: "https://www.metmuseum.org/art/collection/search/83589",
    locator: "Object page · date, culture and medium",
    tags: ["tailoring", "wool", "city"],
    collection: "City uniform",
  },
  {
    id: "knit",
    title: "A softer kind of heritage",
    eyebrow: "KNITWEAR NOTES",
    image: 4,
    summary: "Texture tells a story, even when the label is missing.",
    context:
      "The V&A describes knitted undershirts being worn for sport by the 1870s and the role of machine knitting in making knitted garments more widely available.",
    publisher: "Victoria and Albert Museum",
    sourceTitle: "A history of sweaters",
    url: "https://www.vam.ac.uk/articles/a-history-of-sweaters",
    locator: "Early sportswear and machine-knitting history",
    tags: ["knitwear", "texture", "sportswear"],
    collection: "Off duty",
  },
  {
    id: "mini",
    title: "The shape of a new generation",
    eyebrow: "SIXTIES IN MOTION",
    image: 5,
    summary:
      "An above-the-knee silhouette, and a shift in how a generation dressed.",
    context:
      "The V&A explains that the miniskirt developed gradually, with rising hemlines influenced by London street style. It cautions against crediting one person with its invention.",
    publisher: "Victoria and Albert Museum",
    sourceTitle: "The miniskirt myth",
    url: "https://www.vam.ac.uk/articles/the-miniskirt-myth",
    locator: "Opening historical discussion · updated 17 April 2024",
    tags: ["1960s", "mini", "london"],
    collection: "After hours",
  },
];
export const collections = [
  {
    name: "After hours",
    subtitle: "Leather, sharp lines & late nights",
    image: 0,
    count: 6,
  },
  {
    name: "City uniform",
    subtitle: "Everyday pieces. Lasting character.",
    image: 1,
    count: 6,
  },
  {
    name: "Off duty",
    subtitle: "Denim, texture & slower days",
    image: 4,
    count: 6,
  },
];
const titles = [
  "The patinated leather blouson",
  "The belted city trench",
  "The straight-leg blue jean",
  "The charcoal wool blazer",
  "The oxblood cable knit",
  "The contrast-collar mini",
];
export const seedItems = Array.from({ length: 18 }, (_, i) => {
  const k = i % 6,
    s = stories[k],
    variant = Math.floor(i / 6),
    id = `archive-${String(i + 1).padStart(3, "0")}`;
  return {
    id,
    itemId: `item-${id}`,
    modelId: `model-${k}`,
    title:
      titles[k] +
      (variant ? ` · ${["", "second study", "third study"][variant]}` : ""),
    brand: "Unlabelled · sample",
    category: ["Jackets", "Coats", "Denim", "Tailoring", "Knitwear", "Dresses"][
      k
    ],
    era: ["1980s", "1990s", "1990s", "1980s", "1970s", "1960s"][k],
    year: "Unknown · era is a fictional styling reference",
    size: ["M", "L", "S"][variant],
    condition: variant === 1 ? "Good" : "Very good",
    conditionNotes:
      "Fictional condition record. Light surface wear and no recorded structural damage.",
    price: [18500, 22500, 8500, 14500, 9500, 12500][k] + variant * 1000,
    currency: "EUR",
    image: k,
    storyId: s.id,
    collection: s.collection,
    materials: [
      "Leather (sample)",
      "Cotton blend (sample)",
      "Cotton denim (sample)",
      "Wool blend (sample)",
      "Wool (sample)",
      "Wool blend (sample)",
    ][k],
    measurements: {
      chest: 104 + variant * 4,
      length: k === 1 ? 112 : k === 5 ? 82 : 64,
      shoulder: 46 + variant * 2,
    },
    description:
      "An imagined archive piece, selected to demonstrate how a garment, a cultural reference, and a transparent review can live together.",
    isDemo: true,
    fictional: true,
    identity: "sample_review",
    authenticity: "not_assessed",
    provenance: "not_established",
    claim: {
      type: "context_only",
      status: "prepared_reference",
      assertion: s.context,
      sources: [
        {
          url: s.url,
          title: s.sourceTitle,
          publisher: s.publisher,
          locator: s.locator,
          accessed: "2026-11-03",
        },
      ],
      reason:
        "The source supports the historical context only. It does not identify this fictional item or establish a same-model or screen-used connection.",
    },
    mediaRights:
      "AI-generated fictional garment imagery, created for this prototype. Reused across sample variations.",
  };
});
export const alternatives = [
  {
    id: "alt-1",
    image: 0,
    title: "Leather blouson jacket",
    merchant: "COS",
    url: "https://www.cos.com/en-eu-e/men/menswear/coatsjackets/jackets/product/leather-blouson-jacket-steel-1324237001",
    storyId: "leather",
    description:
      "A collared leather blouson silhouette; finish and construction differ from the sample.",
    similarity: "Similar style",
    affiliate: false,
    destination:
      "External product page · check current details and availability with the merchant",
    checked: "2026-11-03",
  },
  {
    id: "alt-2",
    image: 1,
    title: "Check-detail belted trench",
    merchant: "COS",
    url: "https://www.cos.com/en-eu/women/womenswear/coatsjackets/coats/product/check-detail-belted-cotton-trench-coat-beige-checked-1350912001",
    storyId: "trench",
    description: "Belted cotton-blend outerwear with heritage-style details.",
    similarity: "Similar style",
    affiliate: false,
    destination:
      "External product page · check current details and availability with the merchant",
    checked: "2026-11-03",
  },
  {
    id: "alt-3",
    image: 2,
    title: "501 Original straight-leg jean",
    merchant: "Levi’s",
    url: "https://www.levi.com/FR/fr_FR/vetements/vetements-homme-levis/jeans/droits/jean-501-original/p/005013788",
    storyId: "denim",
    description:
      "A straight-leg denim reference. The linked colour and finish differ from the illustration.",
    similarity: "Similar style",
    affiliate: false,
    destination:
      "External product page · check current details and availability with the merchant",
    checked: "2026-11-03",
  },
  {
    id: "alt-4",
    image: 3,
    title: "Brushed-wool blazer",
    merchant: "COS",
    url: "https://www.cos.com/en-eu/women/womenswear/coatsjackets/blazers/product/brushed-wool-blazer-charcoal-mlange-1357253001",
    storyId: "tailoring",
    description:
      "Charcoal wool tailoring, selected for texture and silhouette.",
    similarity: "Similar style",
    affiliate: false,
    destination:
      "External product page · check current details and availability with the merchant",
    checked: "2026-11-03",
  },
  {
    id: "alt-5",
    image: 4,
    title: "Cable-knit cashmere jumper",
    merchant: "COS",
    url: "https://www.cos.com/en-eu/women/womenswear/knitwear/jumpers/cashmere/product/cable-knit-cashmere-jumper-navy-1345058001",
    storyId: "knit",
    description:
      "A cable-knit texture reference. The linked knit is navy cashmere, not the burgundy sample.",
    similarity: "Similar style",
    affiliate: false,
    destination:
      "External product page · check current details and availability with the merchant",
    checked: "2026-11-03",
  },
  {
    id: "alt-6",
    image: 5,
    title: "Scuba A-line mini dress",
    merchant: "COS",
    url: "https://www.cos.com/en-ww/women/womenswear/dresses/alinedresses/product/scuba-a-line-mini-dress-black-1361912001",
    storyId: "mini",
    description:
      "An A-line mini silhouette; collar and fabric differ. International merchant page.",
    similarity: "Similar style",
    affiliate: false,
    destination:
      "External product page · check current details and availability with the merchant",
    checked: "2026-11-03",
  },
  {
    id: "alt-7",
    image: 1,
    title: "Wool-blend long trench",
    merchant: "COS",
    url: "https://www.cos.com/en-eu/women/womenswear/coatsjackets/coats/product/wool-blend-trench-coat-navy-1308449002",
    storyId: "trench",
    description:
      "Long trench proportions in navy wool blend, rather than the sample’s camel cotton.",
    similarity: "Similar style",
    affiliate: false,
    destination:
      "External product page · check current details and availability with the merchant",
    checked: "2026-11-03",
  },
  {
    id: "alt-8",
    image: 5,
    title: "Wool-blend mini pinafore",
    merchant: "COS",
    url: "https://www.cos.com/en-ww/women/womenswear/dresses/minidresses/product/boiled-wool-blend-mini-pinafore-dress-black-1351546001",
    storyId: "mini",
    description:
      "A short wool-blend silhouette without the sample’s contrasting collar. International merchant page.",
    similarity: "Similar style",
    affiliate: false,
    destination:
      "External product page · check current details and availability with the merchant",
    checked: "2026-11-03",
  },
];
export const euro = (n: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n / 100);
