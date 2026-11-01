# Faza 1: Themelet

Ky udhëzues tregon çka u bë në fazën 1 dhe si futet kodi në GitHub, ku secili anëtar e fut pjesën e vet me pull-request.

## Çka është gati

| Detyra | Anëtari | Skedarët | Gjendja |
| --- | --- | --- | --- |
| Struktura e faqeve dhe navigimi | 1 | `index`, `termini`, `radha`, `img/` | Faqe semantike, navigim kryesor + nën-navigim sipas modulit, skip link, `title` dhe `meta description` unike |
| `style.css`: ngjyrat, fontet, layout-i | 1 | `css/style.css`, `js/ui.js` | Mobile-first, variablat e dokumentimit, Grid/Flexbox, menyja hamburger me jQuery, toast-et, pyetjet |
| `sherbimet.json` | 1 | `data/sherbimet.json`, `js/termini.js` | 16 shërbime me dokumentet dhe afatet; lista në `termini.html` |
| `storage.js` dhe llogaritë | 2 | `js/storage.js`, `js/forma.js`, `js/llogaria.js`, `hyrja.html`, `data/perdoruesit.json` | Koleksionet, llogaritë me PBKDF2, rolet, njoftimet, makina e gjendjeve, kodi i gjurmimit, validimi |
| Faqet e Lëndës dhe panelet | 2 | `lenda`, `paneli-zyrtarit`, `paneli-drejtuesve`, `js/lenda.js` | Skeleti; panelet hapen vetëm për rolin e duhur |
| `buxheti.json` dhe faqet e buxhetit | 3 | `buxheti`, `realizimi`, `propozo`, `data/buxheti.json`, `js/zeri.js` | Buxheti 2026 i Prishtinës; tabelat dhe lista e projekteve kapitale |
| `lagjet.json` dhe harta SVG | 3 | `harta`, `data/lagjet.json`, `js/harta.js` | 18 lagje, zgjedhje me klikim dhe me tastierë, ngjyra sipas investimeve |
| Prototipi i faqes Voto | 4 | `voto`, `rezultatet`, `js/voto.js`, `js/algoritmet.js`, `data/propozimet.json` | Kartat, filtri, shporta me `reduce`, shiriti i buxhetit, mesazhi kur tejkalohet |

Testuar në Chromium (desktop 1280px dhe telefon 390px): 13 faqet pa gabime në Console dhe pa scroll horizontal; hyrja punon edhe me Web Crypto, edhe me rezervën pa `crypto.subtle`; HTML-ja kalon `html-validate`.

## Hapi 1: Lead-i (anëtari 2) përgatit repository-n

1. **Organizata:** `komuna-ime-fiek` (plani Free). Fto tre anëtarët me rolin *Member* te *People → Invite member*.
2. **Repository:** [`komuna-ime-fiek/KomunaIme-web`](https://github.com/komuna-ime-fiek/KomunaIme-web), **Public**. Në planin Free, mbrojtja e `main` punon vetëm në repository publike.
3. **Commit-i i parë, direkt në `main`:** skedarët e organizimit (`README.md`, `.gitignore`, `.editorconfig`, `.github/`, `docs/`, `scripts/`):
   ```bash
   git clone https://github.com/komuna-ime-fiek/KomunaIme-web.git
   cd KomunaIme-web
   # kopjo këtu skedarët e organizimit
   git add README.md .gitignore .editorconfig .github docs scripts
   git commit -m "Organizimi i projektit: README, plani, shabllonet e GitHub"
   git push origin main
   ```
4. **Mbrojtja e `main`** (vetëm pas commit-it të parë): *Settings → Branches → Add branch protection rule* → `main` → ☑ *Require a pull request before merging* → ☑ *Require approvals: 1*.
5. **Mentorët:** *Settings → Collaborators and teams → Add people* → Dhurate Hyseni, Dalina Vranovci, Fjolla Gashi me rolin **Read**.
6. **Kanban:** te organizata, *Projects → New project → Board*, me kolonat **To Do → In Progress → Review → Done**. Te *Workflows*, aktivizo *Auto-add to project*.
7. **Issues:** me [GitHub CLI](https://cli.github.com) (`gh auth login`):
   ```bash
   ./scripts/krijo-issues.sh komuna-ime-fiek/KomunaIme-web
   ```
   Në një repository të ri, issues marrin numrat #1–#16 me këtë renditje: #1 organizata, #2 mentorët, #3 struktura HTML, #4 style.css, #5 storage.js, #6 buxheti.json, #7 lagjet.json dhe harta, #8 prototipi i Voto, pastaj issues e fazës 2.
8. **GitHub Pages:** *Settings → Pages → Deploy from a branch → `main` / root*. Faqja del te `https://komuna-ime-fiek.github.io/KomunaIme-web/`.

## Hapi 2: çdo anëtar e fut pjesën e vet

| Anëtari | Branch-i | Pull-request mbyll | Reviewer |
| --- | --- | --- | --- |
| 2 (Lead) | `feature/berthama-llogarite` | #5 | Anëtari 1 |
| 1 | `feature/faqet-stili-termini` | #3, #4 | Lead-i |
| 3 | `feature/buxheti-harta` | #6, #7 | Lead-i |
| 4 | `feature/voto-prototipi` | #8 | Lead-i |

Skedarët e anëtarëve nuk mbivendosen, prandaj nuk ka konflikte në Git dhe renditja e merge-ve nuk ka rëndësi. Faqja punon plotësisht pasi të bëhen merge të katër PR-të. Udhëzimi i hollësishëm për secilin është në skedarin `UDHEZIMI.md` që e merr me pjesën e vet.

## Hapi 3: çka bën secili vetë para PR-së

- **Lexo skedarët e tu** nga fillimi në fund: në prezantim secili e shpjegon pjesën e vet.
- **Provoje në browser** me Live Server, me tastierë (Tab, Enter, Esc) dhe në telefon.
- **Anëtari 3:** kontrollo pozitat e lagjeve në hartë; harta është skematike dhe mund të përmirësohet.
- **Anëtari 1:** shërbimet me `"afati_burimi": "demo"` te `sherbimet.json` kanë afate shembull; verifikoji ose lëri të shënuara si demo.

## Porta 1 (8 nëntor)

Grupi kontrollon së bashku listën te `docs/plani.md` → *Porta 1* para se të fillojë faza 2.
