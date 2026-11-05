# FirstSight image sources

## Cultural relationship metadata

All forty-four active references carry an authored `OutfitLook.relationship`. The forty Commons
references and the first two Chloé styling references use `styling-inspiration`; the two Chloé runway
references use `runway-reference`. The initial library therefore has forty-two styling connections
and two runway connections. `same-design` remains supported without being assigned by guesswork.

| Relationship | Meaning in this prototype |
| --- | --- |
| `styling-inspiration` | A visual, silhouette or styling connection; no exact designer/product identification is implied |
| `runway-reference` | Authored runway context; the photographed item is not automatically the same model or edition as the selected study |
| `same-design` | A manually established design-family connection, not the same physical object, production edition or authentication result |

The Style Journal, its detail dialogs and archive PDP notes use these relationship labels. The
Tendances board retains geographic labels and filters. Credits and relationships answer different
questions: attribution identifies a photograph's source; the relationship states its authored use
within the study. Neither establishes ownership, endorsement or the authenticity of an upload.

`recognitionStudies` supplies ordered `contextReferenceIds`. The local content provider resolves
those IDs and preserves the original source URL/label, credit, licence/link, dimensions, description
and relationship. It returns fresh arrays while treating reference records as immutable. The
gateway composes resolved `looks`; it does not infer stronger identity claims from visual similarity.
See the [content-adapter guide](../src/features/first-sight/services/content/providers/README.md) for
future source normalisation, server credential ownership and provider-specific rendering boundaries.
No Instagram, YouTube or other live content API is connected.

The repository browser tests substitute only ignored `/local-media/chloe/*` URLs with original test
artwork so a fresh checkout needs no supplied photographs or download access. That substitution is
test-only evidence for controls/layout, not verification of the exact Chloé photograph or its rights.
Real-photo framing remains a separate local-media-present check. The tests do not change any source
record, attribution table or tracked Commons asset below.

## Chloé analysis example

The Chloé example uses the supplied product photograph and four available styling references. The exact floral-dress and dog-walking originals are in ignored `src/images/`; reviewed public copies supply the two runway references. Those copies can differ in framing or resolution from the attachments. The optional TV still remains unavailable and is excluded from the active flow.

`chloePhoto`, `chloeAnalysis`, and `chloeLooks` in `src/features/first-sight/chloe.ts` retain the paths, captions, and actual image dimensions. Choosing the Chloé study shows these references in Section 3. The Tendances section stays available above; the other four studies draw their styling edits from the separate Commons library below.

Run `npm run setup:analysis-media` after cloning to restore available photographs into `public/local-media/chloe/`. The script first checks for supplied originals in `src/images/`, copies them while preserving source files, and uses reviewed download URLs as fallbacks. Both directories are ignored by Git: these photograph binaries are not included in GitHub. Browser paths begin `/local-media/chloe/`. Missing optional `styling-05.jpg` does not make setup fail. Keep screenshots containing supplied photos outside the repository as well.

Local-original mapping:

| Source file in ignored `src/images/` | Served copy | Content |
| --- | --- | --- |
| `WhatsApp Image 2026-11-03 at 17.00.43.jpeg` | `public/local-media/chloe/styling-01.jpg` | Exact floral-dress street photograph, 922 × 1560 |
| `WhatsApp Image 2026-11-03 at 17.00.44.jpeg` | `public/local-media/chloe/styling-02.jpg` | Exact dog-walking photograph, 934 × 1600; this is not the TV still |

Retain these filenames when supplying originals after a fresh clone so the setup script can find them. The original files are copied, not moved or committed.

| File | Role | Served dimensions | Caption basis |
| --- | --- | --- | --- |
| `paddington-bag.jpg` | Sample and analysis photograph | 1440 × 1920 | Brown suede bag with leather handles, padlock, and key |
| `styling-01.jpg` | Styling reference | 922 × 1560 | Street styling with a floral dress and brown bag |
| `styling-02.jpg` | Styling reference | 934 × 1600 | Street styling with a dark jacket, jeans, and brown bag |
| `styling-03.jpg` | Styling reference | 2001 × 3000 | Runway styling with a dark coat and burgundy bag |
| `styling-04.jpg` | Styling reference | 5057 × 7684 | Runway styling with a light outfit and dark bag |
| `styling-05.jpg` | Optional; not active | Not available | Supplied brief included a TV scene with a pale bag |

The table records the served copies used by the active fixture. Captions describe the photographs without inferring people's identities from their faces. Names established by a publisher's caption can be recorded as source metadata. No public reuse license is assumed for these photographs, and the Commons licenses below do not apply to them.

Recovered sources:

The TV still needs a source URL or local original before it can be added to `chloeLooks`. It has not been replaced with a similar shot or a guessed caption.

| Local file | Source | Attribution and copy used |
| --- | --- | --- |
| `paddington-bag.jpg` | [Chloé product photograph supplied by the user](https://www.chloe.com/dw/image/v2/BLMX_PRD/on/demandware.static/-/Sites-chloe-master/default/dw2be28163/images/all-images/CH26AS802S77206/pIZa7IUzSWycTjPimTeutw_c928d313.jpeg?sw=1440&sfrm=png&q=90) | Chloé product imagery |
| `styling-01.jpg` | User-provided `src/images/WhatsApp Image 2026-11-03 at 17.00.43.jpeg` | Exact supplied crop; neutral street-style caption; no photographer or public reuse license supplied |
| `styling-02.jpg` | User-provided `src/images/WhatsApp Image 2026-11-03 at 17.00.44.jpeg`; [Allure article](https://www.allure.com/story/past-it-bags-comeback) provides caption metadata and a fallback copy | Exact supplied crop is preferred. Allure credits Splash News and identifies Kate Bosworth and the Chloé Paddington; its downloadable copy has different framing |
| `styling-03.jpg` | [Who What Wear: Chloé Paddington launch retrospective](https://www.whowhatwear.com/fashion/fashion-flashback-chloe-paddington-launch) | Courtesy of Chloé; publisher identifies Alexa Chung at Chloé Fall/Winter 2025 |
| `styling-04.jpg` | [Who What Wear: Chloé Paddington launch retrospective](https://www.whowhatwear.com/fashion/fashion-flashback-chloe-paddington-launch) | Getty Images; Chloé Spring/Summer 2005 runway |

Preserve the downloaded image proportions in `chloeLooks` so the masonry cards retain their different heights. Source links and credits should remain attached to the corresponding image metadata.

## Chloé facts and illustrative valuation

The brief supplied the editorial concept. Its precise product claims were reviewed against primary references on 4 November 2026; `chloeSources` links those references from the dossier:

| Reference | Scope used in the example |
| --- | --- |
| [Chloé: pictured suede Paddington](https://www.chloe.com/en-us/p/bags/shoulder-bag/CH26AS802S77206.html) | Specifications of the supplied reissue photograph: suede calfskin, Zamak padlock, single zip, and Italian production details |
| [Chloé Attitudes: official exhibition release](https://ualresearchonline.arts.ac.uk/id/eprint/5514/6/judith_clark_Chloe_exhibition_erelease_EN.pdf) | Phoebe Philo's Spring/Summer 2005 Paddington design |
| [The Jewish Museum: Chloé Archive exhibition texts](https://s3.amazonaws.com/tjmassets/Chloe_Exhibition_Texts_Final_for_PR.pdf) | Historical archive examples described as washed calf leather with brass fittings |

The photographed reissue is not presented as an original 2005 bag. Unsupported assertions about hand stitching, a specific rivet count, and universal construction methods were removed. The resale percentages and **€700–€1,000** bar remain explicitly authored sample assumptions. They do not establish current market retention, a real sale price, or the authenticity/condition of an uploaded item.

## Original garment illustrations

Four 600 × 600 SVG studies live in `public/assets/first-sight/studies/`: `leather-bomber.svg`, `denim-jacket.svg`, `tailored-blazer.svg`, and `workwear-jacket.svg`. They are original code-authored illustrations of generic silhouettes, not photographs, recovered designer assets, or authenticated vintage items. Their eras, materials, construction notes, and resale ranges are editorial sample assumptions in `recognition.ts`.

The affordable bag concept at `public/assets/first-sight/chloe/soft-satchel.svg` is also original source artwork. These SVGs remain tracked. Reusing a drawing across sample offers does not imply separate photographed stock or verified conditions. The Chloé photographs remain in the ignored directories described above.

## Celebrity reference library

This existing seed library contains 40 distinct reference photographs of 23 celebrities, selected for visible clothing and styling. It includes 22 Korea/K-pop cards, 11 Global cards, 3 Japan cards, and 4 China cards. “Korea” is the feed’s Korean-entertainment grouping; it includes K-pop artists of other nationalities. `TrendHero` selects six looks per collection, and `recognition.ts` selects four context references for each generic garment study. These earlier Commons assets retain their existing tracked paths under `public/assets/first-sight/looks/`.

The images are Wikimedia Commons thumbnails downloaded on 3 November 2026. Each source page identifies the subject and provides its attribution and reuse terms. The files retain the supplied thumbnail image data; no new crop, retouching or AI generation has been applied. Original sources may already be crops, video stills or edited photographs. Local file dimensions are recorded in `src/features/first-sight/looks.ts`.

The UI labels these as celebrity style references. They are not presented as Instagram posts, endorsements, evidence of product ownership, or verified matches to the fictional purchase catalog. Titles, descriptions and style tags describe visible clothing; they do not assert a designer, collection season or garment release year. Some source photographs date from earlier years; the feed is curated inspiration rather than a live or latest-fashion feed.

Attribution and the linked license name are available on each look’s detail panel, together with its original source. The license links below apply to the individual image files, not to the application code. Share-alike images retain their respective source licenses.

| Local file | Subject | Credit | License | Source |
| --- | --- | --- | --- | --- |
| jennie-kim-8.jpg | Jennie | K-POPit 티비텐 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:20260526_Jennie_Kim_07.jpg) |
| kim-kardashian-2.jpg | Kim Kardashian | Love Lira Fashion | [Public domain mark](https://creativecommons.org/publicdomain/mark/1.0/) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Kardashian_Beverly_Hils_2015.jpg) |
| tom-holland-5.jpg | Tom Holland | Bollywood Hungama | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Tom_Holland_attending_the_Nita_Mukesh_Ambani_Cultural_Centre_Gala_on_Day_2.jpg) |
| han-so-hee-3.jpg | Han So-hee | 티비텐 (TV10) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:HAN_SO_HEE_(%ED%95%9C%EC%86%8C%ED%9D%AC)_-_2025.07.11_-_P1.jpg) |
| lisa-blackpink-7.jpg | Lisa | Outhere505 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Lalisa_Manobal_at_the_Busan_International_Film_Festival_2025_03.jpg) |
| zendaya-3.jpg | Zendaya | PhilipRomano | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Zendaya-byPhilipRomano8.jpg) |
| g-dragon-7.jpg | G-Dragon | Hshome | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:G-Dragon_2011_2.jpg) |
| jisoo-2.png | Jisoo | PUBG MOBILE:絕地求生M | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Ji-Soo_in_2020_PUBG_(2).png) |
| nana-komatsu-2.jpg | Nana Komatsu | Kacy Bao | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Nana_Komatsu_at_2025_Cannes_Red_Carpet_4.jpg) |
| v-bts-8.png | V | Divine Treasure | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:V_performing_%22Stigma%22_during_the_Wings_Tour_in_Newark,_23_or_24_March_2017_02.png) |
| rose-blackpink-4.png | Rosé | PUBG Mobile / Blue Hole Studio (as per their YouTube channel's "About" section.) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Ros%C3%A9_BLACKPINK_PUBG_Mobile_Sept_2020_ad.png) |
| iu-singer-6.jpg | IU | Michael Comella | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:IU_Korean_Singer_at_G_By_Guess_Fansigning_2012-04-29_002.jpg) |
| harry-styles-6.jpg | Harry Styles | Wilnel José Verdú Guerrero | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Harry_Styles_(2026).jpg) |
| suzu-hirose-4.jpg | Suzu Hirose | Kooyuh | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Paris_Fashion_Week.jpg) |
| cha-eun-woo-1.jpg | Cha Eun-woo | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:240301_Cha_Eun-woo.jpg) |
| park-seo-joon-6.png | Park Seo-joon | TV10 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Park_Seo-joon_in_March_2026.png) |
| tom-holland-4.jpg | Tom Holland | ChristopherJClarke | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Tom_Holland_during_pro-am_Wentworth_golf_club_2023-2.jpg) |
| kim-kardashian-7.jpg | Kim Kardashian | Eva Rinaldi | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Kardashian_(6308129062).jpg) |
| kentaro-sakaguchi-1.jpg | Kentaro Sakaguchi | Ten Asia | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kentaro_Sakaguchi_in_2024.jpg) |
| zendaya-8.jpg | Zendaya | Neon Tommy | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Zendaya_2013.jpg) |
| harry-styles-2.png | Harry Styles | itsloutual | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:180612_Harry_Styles_Live_On_Tour_in_Nashville.png) |
| dua-lipa-1.jpg | Dua Lipa | Harald Krichel | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:British_singer_and_songwriter_Dua_Lipa_at_the_SWR3_New_Pop_Festival_2016.jpg) |
| dua-lipa-8.jpg | Dua Lipa | Harald Krichel | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Dua_Lipa-69803.jpg) |
| xiao-zhan-1.jpg | Xiao Zhan | Pobediti丨肖战(Weibo link) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Original file](https://commons.wikimedia.org/wiki/File:Xiao_Zhan_at_the_Weibo_Night_Ceremony_January_11_2020.jpg) |
| timothee-chalamet-6.jpg | Timothée Chalamet | Raph_PH | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:Timothee_Chalamet_and_Saoirse_Ronan_-_2024_(38_of_65)_-_54213780934.jpg) |
| jennie-kim-6.jpg | Jennie | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Jennie_(%EA%B9%80%EC%A0%9C%EB%8B%88)_05.jpg) |
| rose-blackpink-6.jpg | Rosé | Newsenstar1 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:20190106_(NEWSEN)_%EB%B8%94%EB%9E%99%ED%95%91%ED%81%AC(BLACKPINK),_%EC%88%98%EC%A4%8D%EC%9D%80_%EB%A7%8E%EC%9D%80_%EC%86%8C%EB%85%80%EC%A7%80%EB%A7%8C_%EB%8F%8B%EB%B3%B4%EC%9D%B4%EB%8A%94_%EC%95%84%EB%A6%84%EB%8B%A4%EC%9A%B4_%EB%AF%B8%EB%AA%A8_(Golden_Disc_Awards_2019)_(4).jpg) |
| lisa-blackpink-1.png | Lisa | K-POPIT 케이팝잇 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Blackpink_Lisa_GMP_240622.png) |
| wang-yibo-2.jpg | Wang Yibo | 晴心向云深 | [CC BY 2.5](https://creativecommons.org/licenses/by/2.5) | [Original file](https://commons.wikimedia.org/wiki/File:20200111%E7%8E%8B%E4%B8%80%E5%8D%9A.jpg) |
| lisa-blackpink-2.png | Lisa | E\|ㅂ\|텐 (TV10) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Blackpink_Lisa_at_Bvulgari_Avrora_Awards_2022.png) |
| jisoo-6.png | Jisoo | Marie Claire Korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Kim_Ji-Soo_in_2020_Dior_(15).png) |
| g-dragon-2.jpg | G-Dragon | aliehs | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:G-Dragon_live_2025.jpg) |
| g-dragon-4.jpg | G-Dragon | nicole voon | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Original file](https://commons.wikimedia.org/wiki/File:G-Dragon_2012.jpg) |
| dilraba-dilmurat-5.jpg | Dilraba Dilmurat | PlayIN | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Dilraba_Dilmurat_%E8%BF%AA%E9%BA%97%E7%86%B1%E5%B7%B4.jpg) |
| v-bts-7.jpg | V | 티비텐 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:BTS%27s_V_20251004_04.jpg) |
| iu-singer-1.jpg | IU | Marie Claire Korea on YouTube | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:IU_singer_2.jpg) |
| iu-singer-3.jpg | IU | acrofan.com | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:IU_(Korean_singer)_from_acrofan.jpg) |
| cha-eun-woo-3.jpg | Cha Eun-woo | K-POPIT 케이팝잇 TV10 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Cha_Eun-woo.jpg) |
| liu-yifei-4.jpg | Liu Yifei | 刘亦菲吧官方 | [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5) | [Original file](https://commons.wikimedia.org/wiki/File:Liu_Yifei_attended_the_brand_event.jpg) |
| park-seo-joon-1.jpg | Park Seo-joon | Marie Claire korea | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Original file](https://commons.wikimedia.org/wiki/File:Park_Seo-joon_for_Marie_Claire_Korea,_2023_(1).jpg) |
