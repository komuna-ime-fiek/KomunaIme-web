# Komuna Ime

Platformë 3-në-1 për marrëdhënien e qytetarit me komunën, e ndërtuar vetëm me HTML, CSS dhe JavaScript (pa server):

| Moduli | Momenti | Çka zgjidh |
| --- | --- | --- |
| **Termini** | Para shërbimit | Radhët e gjata dhe dokumentet që mungojnë |
| **Ku është lënda ime?** | Pas dorëzimit | Kërkesat që humbin pa gjurmë |
| **Zëri i Lagjes** | Vendimmarrja | Buxheti i pakuptueshëm dhe pjesëmarrja e ulët |

Projekt grupor për lëndën **Programimi në Ueb nga ana e Klientit**, FIEK, Universiteti i Prishtinës (2026/27).
Mësimdhënëse: Prof. Ass. Dr. Dhuratë Hyseni dhe Ass. MSc. Ariana Kadriu.

## Ekipi

| Anëtari | Emri | Përgjegjësia | Faqet dhe skedarët kryesorë |
| --- | --- | --- | --- |
| 1 | _[Emri Mbiemri]_ | Termini dhe dizajni | `index`, `termini`, `radha`, `css/style.css`, `img/`, `js/ui.js`, `js/termini.js`, `data/sherbimet.json` |
| 2 (Lead) | _[Emri Mbiemri]_ | Lënda dhe bërthama | `lenda`, `hyrja`, panelet, `js/storage.js`, `js/forma.js`, `js/llogaria.js`, `js/lenda.js`, `data/perdoruesit.json` |
| 3 | _[Emri Mbiemri]_ | Zëri: buxheti dhe propozimet | `buxheti`, `harta`, `propozo`, `realizimi`, `js/zeri.js`, `js/harta.js`, `data/buxheti.json`, `data/lagjet.json` |
| 4 | _[Emri Mbiemri]_ | Zëri: votimi dhe algoritmet | `voto`, `rezultatet`, `js/voto.js`, `js/algoritmet.js`, `data/propozimet.json` |

## Si hapet projekti

Skedarët JSON lexohen me `fetch`, prandaj projekti **nuk** hapet me dy klikime mbi `index.html` (faqja tregon një mesazh nëse e bën këtë).

1. **VS Code + Live Server:** instalo shtesën *Live Server*, kliko me të djathtën mbi `index.html` → *Open with Live Server*.
2. **Pa VS Code:** në dosjen e projektit ekzekuto `python -m http.server 5500` dhe hap `http://localhost:5500`.
3. **Në telefon:** përdor GitHub Pages (shih `docs/faza-1.md`). Faqja hapet me `https://`, prandaj punon gjithçka.

### Llogaritë demo

| Roli | Email | Fjalëkalimi | Ku shkon pas hyrjes |
| --- | --- | --- | --- |
| Qytetar | `qytetar@komunaime.test` | `Qytetar2026` | Ballina |
| Zyrtar (Urbanizmi) | `zyrtar@komunaime.test` | `Zyrtar2026` | Paneli i zyrtarit |
| Drejtues | `drejtues@komunaime.test` | `Drejtues2026` | Paneli i drejtuesve |

Në `hyrja.html` ka butona që e plotësojnë formën me këto llogari. Në `paneli-drejtuesve.html` butoni **Rivendos të dhënat demo** fshin gjithçka nga browser-i dhe i rikthen të dhënat fillestare.

## Struktura

```
komuna-ime/
├── index.html               Ballina (kërkesat e projektit grupor: h1, hr, ol/ul, 3 img, 3+ lidhje, pre/code, tabela)
├── termini.html, radha.html                          Moduli Termini
├── lenda.html                                        Moduli Ku është lënda ime?
├── buxheti.html, harta.html, propozo.html,
│   voto.html, rezultatet.html, realizimi.html        Moduli Zëri i Lagjes
├── paneli-zyrtarit.html, paneli-drejtuesve.html      Panelet (të mbrojtura sipas rolit)
├── hyrja.html                                        Hyrja, regjistrimi dhe "Llogaria ime"
├── css/style.css            Stili i përbashkët, mobile-first, i ndarë në seksione sipas anëtarëve
├── js/
│   ├── storage.js           Bërthama: localStorage, JSON, llogaritë, hash, njoftimet, makina e gjendjeve
│   ├── forma.js             Validimi i formave (gabimi nën fushë, aria-describedby)
│   ├── ui.js                jQuery: menyja hamburger, toast-et, zona e llogarisë, mbrojtja e faqeve, pyetjet
│   ├── llogaria.js          Faqja hyrja.html
│   ├── termini.js           Termini dhe radha
│   ├── lenda.js             Gjurmimi i lëndës (Faza 2)
│   ├── zeri.js              Buxheti, propozimet, realizimi
│   ├── harta.js             Harta SVG e lagjeve (komponent i ripërdorshëm)
│   ├── voto.js              Faqja Voto
│   ├── algoritmet.js        Votimi, greedy, Equal Shares, TF-IDF (Faza 2–3)
│   └── vendor/jquery-3.7.1.min.js   Rezervë kur CDN-ja nuk arrihet (p.sh. pa internet në prezantim)
├── data/
│   ├── sherbimet.json       Shërbimet, dokumentet e nevojshme, afatet ligjore, orari i sporteleve
│   ├── lagjet.json          18 lagje: forma SVG, popullsia (vlerësim), buxheti i votimit
│   ├── buxheti.json         Buxheti 2026 i Prishtinës: kategoritë, burimet, drejtoritë, 45 projekte kapitale
│   ├── propozimet.json      90 propozime shembull (5 për lagje) për votimin
│   └── perdoruesit.json     Tri llogaritë demo (vetëm hash-i i fjalëkalimit)
├── img/                     Logo dhe ilustrimet SVG
├── docs/                    Plani i punës dhe udhëzuesi i fazës 1
├── scripts/krijo-issues.sh  Krijon etiketat dhe issues në GitHub me `gh`
└── .github/                 Shabllonet e pull-request-it dhe të issue-ve
```

## Të dhënat

Pa server nuk ka databazë. Skedarët JSON mbajnë të dhënat fillestare (vetëm lexim), ndërsa localStorage mban gjithçka që krijojnë përdoruesit. Çdo lexim dhe shkrim kalon nga `storage.js`.

| Ku ruhet | Çelësi | Fushat kryesore |
| --- | --- | --- |
| JSON | `sherbimet` | id, emri, drejtoria, dokumentet_e_nevojshme, kohezgjatja_mesatare, krijon_lende, afati_ligjor_dite |
| JSON | `lagjet` | id, emri, forma (path SVG), qendra, popullsia, buxheti_i_ndare |
| JSON | `buxheti` | kategorite_ekonomike, burimet_e_financimit, investimet_sipas_drejtorive, projektet_kapitale |
| localStorage | `ki_perdoruesit` | id, emri, email, roli, lagje_id, kripa, hash_fjalekalimi |
| localStorage | `ki_njoftimet` | id, user_id, teksti, lexuar |
| localStorage | `ki_terminet` | id, user_id, sherbim_id, data_ora, statusi |
| localStorage | `ki_lendet` | id, kodi_gjurmimit, user_id, lloji, drejtoria, statusi, afati |
| localStorage | `ki_historia_e_statuseve` | id, objekti {lloji, id}, statusi_i_vjeter, statusi_i_ri, koha, zyrtar_id, shenimi |
| localStorage | `ki_propozimet` | id, lagje_id, titulli, pershkrimi, pika_ne_harte, kategoria, kostoja, statusi |
| localStorage | `ki_identitetet_votimit` | hash_identiteti, lagje_id, ka_votuar |
| localStorage | `ki_votat` | id, lagje_id, projektet, hash_defteses (pa lidhje me identitetin) |

**Burimet:** buxheti nga [Raporti financiar buxhetor i Komunës së Prishtinës, janar–mars 2026](https://prishtina.rks-gov.net/wp-content/uploads/2026/04/1.Raporti-financiar-buxhetor-i-Komunes-se-Prishtines-janar-mars-2026-TM-1-L.pdf); dokumentet dhe afatet e shërbimeve të urbanizmit nga [Udhëzuesi për qytetarë](https://prishtinaonline.com/uploads/udhezues_per_qytetare.pdf); afati për qasje në dokumente publike nga [Instituti GAP](https://www.institutigap.org/documents/34178_QasjaDokumentePublike2.pdf). Afatet me `"afati_burimi": "demo"` janë shembuj. Harta është skematike dhe popullsia e lagjeve është vlerësim ilustrues.

## Bërthama `KI` (storage.js) shkurt

Çdo faqe ngarkon `storage.js` dhe `ui.js`. Kodi i faqes nis kështu:

```js
document.addEventListener('DOMContentLoaded', async () => {
  await KI.gati();                                   // garanton të dhënat fillestare
  const { lagjet } = await KI.ngarkoJSON('lagjet');  // JSON me cache
  const propozimet = KI.koleksion('propozimet').filtro((p) => p.lagje_id === 'dardania');
});
```

| Funksioni | Çka bën |
| --- | --- |
| `KI.koleksion(emri).gjithe() / gjej(id) / filtro(fn) / shto(obj) / perditeso(id, ndr) / fshi(id)` | CRUD mbi localStorage |
| `KI.llogaria.hyr(email, fj)`, `.regjistrohu({...})`, `.dil()`, `.aktual()`, `.kaRol('zyrtar')` | Llogaritë dhe rolet |
| `KI.makina.krijo('lende', obj)` | Krijon me statusin fillestar dhe e shënon në histori |
| `KI.makina.ndryshoStatusin('lende', id, 'ne_shqyrtim')` | Kalim i kontrolluar; njofton pronarin; hedh Error për kalim të palejuar |
| `KI.makina.hapatEArdhshem('lende', statusi)`, `KI.makina.historia('lende', id)` | Për butonat e panelit dhe vijën kohore |
| `KI.kodi.gjenero()` → `"KI-2026-000001"` | Kodi i gjurmimit (padStart) |
| `KI.njoftimet.njofto(user_id, teksti)`, `.tePalexuara()` | Njoftimet |
| `KI.siguria.sha256(tekst)`, `.kodVerifikimi()` | Hash-i i identitetit dhe kodi 6-shifror i votimit |
| `KI.format.euro(12500)` → `"12.500 €"`, `.data(d)` → `"dd.mm.yyyy"`, `.diteMes(a, b)`, `.shtoDitePune(d, n)`, `.normalizo(t)` | Datat dhe stringjet |
| `KI.validimi.email(v)`, `.telefoni(v)`, `.kodi(v)` | Rregullat: kthejnë `''` ose mesazhin e gabimit |
| `KI.forma.lidh(forma, rregullat, kurEshteValide)` | Validim gjatë shkrimit dhe para dërgimit |
| `KI.ui.toast(mesazhi, 'sukses')` | Mesazh i shkurtër (jQuery) |

Ngjarja `ki:ndryshim` dërgohet në `window` sa herë ndryshon një koleksion, edhe kur ndryshimi vjen nga një tab tjetër (për radhën live).

## Rregullat e ekipit

- Asnjë commit direkt në `main`: çdo detyrë punohet në branch (`feature/termini-rezervimi`, `fix/lenda-afati`) dhe hyn me pull-request.
- Çdo PR lidhet me issue-n (`Closes #12`), ka përshkrim dhe screenshot për ndryshimet vizuale. Lead-i bën review dhe merge; PR-të e Lead-it i shqyrton një anëtar tjetër.
- Një funksionalitet shkruhet ose i tëri me jQuery, ose i tëri me JavaScript vanilla, jo i përzier.
- Në `style.css` secili punon në seksionin e vet (shih komentin në krye të skedarit).
- Para çdo merge: lista e kontrollit në shabllonin e PR-së (pa gabime në Console, pa scroll horizontal në telefon, etj.).

## Testimi në browser-a

| Browser-i | Pajisja | Kush teston | Data | Rezultati |
| --- | --- | --- | --- | --- |
| Google Chrome | Laptop | Anëtarët 1 dhe 2 | | |
| Mozilla Firefox | Laptop | Anëtari 3 | | |
| Safari ose Chrome | Telefon | Anëtari 4 | | |

## Fazat

Plani i plotë me datat dhe portat e kontrollit është te [`docs/plani.md`](docs/plani.md). Çka u bë në fazën 1 dhe si futet në GitHub: [`docs/faza-1.md`](docs/faza-1.md).

## Kufizimet e prototipit

- Pa server, të dhënat mbeten vetëm në browser-in ku u krijuan; dy pajisje nuk i shohin të dhënat e njëra-tjetrës.
- Kushdo që hap DevTools mund t'i ndryshojë të dhënat në localStorage: siguria e votimit demonstron parimet, jo siguri reale.
- Fjalëkalimet dhe numri personal nuk ruhen kurrë të lexueshëm, vetëm si hash.
- Rezultati i votimit është këshillues; vendimin për buxhetin e merr Kuvendi Komunal.
