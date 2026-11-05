/** Independent snapshot of the pre-renewal editorial selection; never derive this from the selector under test. */
export const expectedInspirationCollections = [
  {
    id: 'streetwear', title: '90s Streetwear', heroId: 'zendaya-8',
    celebrity: 'Zendaya', lookTitle: 'Leather and a long skirt', image: '/assets/first-sight/looks/zendaya-8.jpg',
    headline: 'A little attitude. A lasting impression.', credit: 'Neon Tommy',
    source: 'https://commons.wikimedia.org/wiki/File:Zendaya_2013.jpg',
    licence: 'CC BY-SA 2.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    looks: ['han-so-hee-3', 'lisa-blackpink-1', 'kim-kardashian-2', 'zendaya-8', 'g-dragon-4', 'v-bts-7'],
  },
  {
    id: 'denim', title: 'Vintage Denim', heroId: 'iu-singer-6',
    celebrity: 'IU', lookTitle: 'Print over denim', image: '/assets/first-sight/looks/iu-singer-6.jpg',
    headline: 'Blue, in every chapter of life.', credit: 'Michael Comella',
    source: 'https://commons.wikimedia.org/wiki/File:IU_Korean_Singer_at_G_By_Guess_Fansigning_2012-04-29_002.jpg',
    licence: 'CC BY-SA 3.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    looks: ['iu-singer-6', 'jisoo-2', 'han-so-hee-3', 'harry-styles-6', 'tom-holland-4', 'dua-lipa-1'],
  },
  {
    id: 'cinema', title: 'Retro Cinema', heroId: 'tom-holland-5',
    celebrity: 'Tom Holland', lookTitle: 'Classic black tie', image: '/assets/first-sight/looks/tom-holland-5.jpg',
    headline: 'Some looks deserve a second scene.', credit: 'Bollywood Hungama',
    source: 'https://commons.wikimedia.org/wiki/File:Tom_Holland_attending_the_Nita_Mukesh_Ambani_Cultural_Centre_Gala_on_Day_2.jpg',
    licence: 'CC BY 3.0', licenceUrl: 'https://creativecommons.org/licenses/by/3.0',
    looks: ['jennie-kim-8', 'tom-holland-5', 'kentaro-sakaguchi-1', 'xiao-zhan-1', 'jisoo-6', 'park-seo-joon-1'],
  },
  {
    id: 'accessories', title: 'Iconic Designer Accessories', heroId: 'lisa-blackpink-2',
    celebrity: 'Lisa', lookTitle: 'White and gold accents', image: '/assets/first-sight/looks/lisa-blackpink-2.png',
    headline: 'One detail. The whole story.', credit: 'E|ㅂ|텐 (TV10)',
    source: 'https://commons.wikimedia.org/wiki/File:Blackpink_Lisa_at_Bvulgari_Avrora_Awards_2022.png',
    licence: 'CC BY 3.0', licenceUrl: 'https://creativecommons.org/licenses/by/3.0',
    looks: ['dua-lipa-8', 'lisa-blackpink-2', 'han-so-hee-3', 'lisa-blackpink-7', 'nana-komatsu-2', 'cha-eun-woo-1'],
  },
] as const;

export const boardReference = {
  id: 'han-so-hee-3', celebrity: 'Han So-hee', title: 'Cropped leather, dark denim',
  image: '/assets/first-sight/looks/han-so-hee-3.jpg', credit: '티비텐 (TV10)',
  source: 'https://commons.wikimedia.org/wiki/File:HAN_SO_HEE_(%ED%95%9C%EC%86%8C%ED%9D%AC)_-_2025.07.11_-_P1.jpg',
  licence: 'CC BY 3.0', licenceUrl: 'https://creativecommons.org/licenses/by/3.0',
} as const;
