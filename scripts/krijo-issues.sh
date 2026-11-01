#!/usr/bin/env bash
# Krijon etiketat dhe issues të fazave 1 dhe 2 në GitHub.
# Kërkon GitHub CLI të kyçur:  gh auth login
# Përdorimi:                   ./scripts/krijo-issues.sh komuna-ime-fiek/KomunaIme-web
set -euo pipefail

REPO="${1:?Përdorimi: ./scripts/krijo-issues.sh komuna-ime-fiek/KomunaIme-web}"

etiketa() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force >/dev/null; echo "etiketa: $1"; }

etiketa html    "e34c26" "Struktura dhe faqet HTML"
etiketa css     "563d7c" "Stili dhe dizajni"
etiketa js      "f1e05a" "Logjika në JavaScript"
etiketa react   "61dafb" "Projekti React"
etiketa docs    "0e8a16" "Dokumentimi dhe organizimi"
etiketa data    "1d76db" "Skedarët JSON dhe të dhënat"
etiketa faza-1  "bfd4f2" "Faza 1: Themelet"
etiketa faza-2  "c5def5" "Faza 2: Modulet bazë"

issue() {
  local titulli="$1" etiketat="$2" trupi="$3"
  gh issue create --repo "$REPO" --title "$titulli" --label "$etiketat" --body "$trupi" >/dev/null
  echo "issue: $titulli"
}

# ---------------- Faza 1
issue "Krijo organizatën, repository-n dhe Kanban board-in" "docs,faza-1" \
"**Anëtari 2 (Lead)**
- [ ] Organizata falas dhe repository publik \`komuna-ime\`
- [ ] Mbrojtja e \`main\`: pull-request dhe 1 aprovim
- [ ] Board-i: To Do → In Progress → Review → Done, me auto-add
- [ ] GitHub Pages nga \`main\`"

issue "Shto tre mentorët me të drejta leximi" "docs,faza-1" \
"**Anëtari 2 (Lead)** — Dhurate Hyseni, Dalina Vranovci dhe Fjolla Gashi me rolin Read."

issue "Struktura bazë e faqeve HTML dhe navigimi" "html,faza-1" \
"**Anëtari 1** — 13 faqet me header, nav, main, footer; nën-navigimi i moduleve; title dhe meta description unike; index.html me kërkesat e projektit grupor (h1, hr, ol/ul, 3 img, 3 lidhje, pre/code, tabela)."

issue "style.css: ngjyrat, fontet dhe layout-i bazë" "css,faza-1" \
"**Anëtari 1** — Variablat e ngjyrave, Inter, mobile-first me breakpoint 768/1024, Grid dhe Flexbox, menyja hamburger, toast-et, prefers-reduced-motion."

issue "storage.js: leximi, shkrimi dhe llogaritë" "js,faza-1" \
"**Anëtari 2** — Koleksionet në localStorage, ngarkimi i JSON-ave, hyrja/regjistrimi me PBKDF2, rolet dhe mbrojtja e paneleve, njoftimet, makina e gjendjeve, kodi KI-2026-000123."

issue "buxheti.json nga buxheti publik i Prishtinës" "data,faza-1" \
"**Anëtari 3** — Kategoritë ekonomike, burimet e financimit, investimet sipas drejtorive dhe projektet kapitale 2026 nga raporti TM1; tabelat në buxheti.html."

issue "lagjet.json dhe harta SVG e lagjeve" "data,js,faza-1" \
"**Anëtari 3** — 18 lagje me formë SVG, zgjedhje me klikim dhe me Enter, aria-label, ngjyra sipas investimeve."

issue "Prototipi i faqes Voto" "js,faza-1" \
"**Anëtari 4** — Kartat e projekteve, filtri sipas kategorisë, shporta me reduce, shiriti i buxhetit, mesazhi \"E ke tejkaluar buxhetin për …\"."

# ---------------- Faza 2
issue "Termini: orët e lira dhe rezervimi" "js,faza-2" \
"**Anëtari 1** — Orët sipas \`orari\` te sherbimet.json, bllokimi i fundjavës dhe i orëve të zëna, validimi, KI.makina.krijo('termin', …)."

issue "Radha live dhe thirrja e numrit nga paneli" "js,faza-2" \
"**Anëtari 1** — radha.html përditësohet me ngjarjen ki:ndryshim (edhe nga tab-i tjetër) dhe setInterval; termini lirohet pas 10 minutash."

issue "Lënda: gjurmimi me kod, karta e statusit dhe afati" "js,faza-2" \
"**Anëtari 2** — Kërkimi me kod (regex), drejtoria, ditët e pritjes, numërimi mbrapsht i afatit, vija kohore nga KI.makina.historia."

issue "Paneli i zyrtarit: kalimet e statusit dhe njoftimet" "js,faza-2" \
"**Anëtari 2** — Butonat nga KI.makina.hapatEArdhshem, KI.makina.ndryshoStatusin, njoftimi i qytetarit."

issue "Buxheti: tab-et me jQuery, Sankey, treemap dhe kalkulatori" "js,css,faza-2" \
"**Anëtari 3** — Tab-et me jQuery; fillimisht grafik me shtylla, pastaj Sankey dhe treemap me SVG; kalkulatori i tatimit."

issue "Propozo: forma me validim dhe pika në hartë" "js,faza-2" \
"**Anëtari 3** — Titulli 10–80, përshkrimi ≥ 30, foto jpg/png ≤ 2 MB, pika në hartë me KI.harta; statusi fillestar 'propozuar'."

issue "Voto: kodi i verifikimit, hash-i i identitetit dhe dëftesa" "js,faza-2" \
"**Anëtari 4** — Kodi 6-shifror (simulim SMS), identitetet_votimit me SHA-256, votat pa lidhje me personin, dëftesa."

issue "Rezultatet me metodën greedy" "js,faza-2" \
"**Anëtari 4** — Renditja sipas votave derisa mbaron buxheti i lagjes; verifikimi i dëftesës."

echo "Gati. Hap board-in dhe caktoji issues secilit anëtar."
