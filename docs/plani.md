# Plani i punës

Dokumentimi fillestar (14 tetor) e kishte planin në 12 javë. Tani ka mbetur kohë deri në **Demo Day, 26–30 dhjetor 2026**, prandaj fazat janë ngjeshur. Kujdes: **Kollokfiumi II është më 24 dhjetor**, prandaj kodi ngrihet më **20 dhjetor** dhe java e fundit mbetet për prezantim dhe mësim.

| Faza | Datat | Çka përfshin | Porta e kontrollit |
| --- | --- | --- | --- |
| 1. Themelet | 2–8 nëntor | Struktura e 13 faqeve, navigimi, `style.css`, `storage.js` me llogaritë, JSON-at, harta SVG, prototipi i Voto | **Porta 1 (8 nëntor):** struktura dhe të dhënat |
| 2. Modulet bazë | 9–29 nëntor | Termini (orët e lira, rezervimi, radha), Lënda (gjurmimi, afati, paneli), Buxheti (tab-et me jQuery, Sankey, kalkulatori), Propozo, Voto me kod verifikimi dhe dëftesë, Rezultatet me greedy | **Porta 2 (29 nëntor):** çdo modul punon më vete |
| 3. Funksionet e avancuara | 30 nëntor – 13 dhjetor | Parashikimi i pritjes, zbulimi i dublikatave (TF-IDF), Method of Equal Shares | — |
| 4. Integrimi | 7–18 dhjetor | Termini → Lënda, Indeksi i performancës në panelin e drejtuesve, njoftimet mes moduleve | **Porta 3 (18 dhjetor):** platforma e plotë |
| 5. Projekti React | 7–20 dhjetor | Faqja Voto në `react-voto/` (React me Vite + UI library) | — |
| 6. Testimi | 14–20 dhjetor | Chrome, Firefox, telefon; lista e kontrollit e cilësisë | **Ngrirja e kodit: 20 dhjetor** |
| 7. Prezantimi | 21–25 dhjetor | Raporti, prova e demo-s (15 minuta, të katër anëtarët) | **Demo Day: 26–30 dhjetor** |

Ligjëratat që lidhen me fazat (sipas planit mësimor): Bootstrap 5 në javën 8, JavaScript/jQuery në javën 11, React në javët 13–14.

## Kriteret e portave

**Porta 1: struktura dhe të dhënat**
- [ ] Të 13 faqet hapen me Live Server pa gabime në Console, në desktop dhe në telefon
- [ ] Navigimi është i njëjtë kudo dhe faqja aktive dallohet
- [ ] JSON-at ngarkohen dhe tabelat e buxhetit, harta dhe Voto i shfaqin
- [ ] Hyrja, regjistrimi dhe dalja punojnë; panelet hapen vetëm për rolin e duhur
- [ ] Kodi është në GitHub me 5 pull-requests të aprovuara (shih `docs/faza-1.md`)

**Porta 2: çdo modul punon më vete**
- [ ] Rezervohet një termin dhe shfaqet në radhë dhe në panelin e zyrtarit
- [ ] Një lëndë gjurmohet me kod; zyrtari e kalon statusin dhe qytetari merr njoftim
- [ ] Propozimi i ri kalon nga vlerësimi te votimi; votohet me kod dhe merret dëftesa
- [ ] Rezultatet greedy llogariten nga votat

**Porta 3: platforma e plotë**
- [ ] Përfundimi i një termini me `krijon_lende: true` krijon lëndë me kod
- [ ] Indeksi i performancës tregon katër treguesit nga të dhënat reale të demo-s
- [ ] Lista e kontrollit e cilësisë (README) kalon për çdo faqe

## Pyetje për mësimdhënëset

1. **Bootstrap 5 apo Material UI?** Plani mësimor përmend "Integrimi i Bootstrap 5 & React.JS" te Projekti Praktik, ndërsa dokumentimi ynë e ka React me Material UI. Propozim: projekti React përdor **React-Bootstrap (Bootstrap 5)** në vend të MUI, që të mbulohen të dyja kërkesat. Duhet konfirmuar a mjafton kjo, apo Bootstrap kërkohet edhe në faqet kryesore.
2. **Lead-i:** dokumentimi propozon anëtarin 2; grupi duhet ta konfirmojë.
3. **React në repository të veçantë?** Tani planifikohet në dosjen `react-voto/` të të njëjtit repository.
