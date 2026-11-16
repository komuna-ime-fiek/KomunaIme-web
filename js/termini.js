/**
 * termini.js — Moduli Termini: rezervimi dhe radha live
 * Përgjegjës: Anëtari 1 · JavaScript vanilla
 *
 * Faza 1 (gati): lista e shërbimeve nga data/sherbimet.json dhe dokumentet
 *                e nevojshme për shërbimin e zgjedhur.
 *
 * Faza 2 (duhet patjetër):
 *   [ ] Gjenero orët e lira për datën (orari dhe hapi te sherbimet.json → "orari");
 *       blloko të shtunën/të dielën (KI.format.eshteFundjave) dhe orët e zëna
 *   [ ] Validimi me KI.forma.lidh(): emri ≥ 3, email, telefon +383, ditë pune nga sot
 *   [ ] Ruaj terminin: KI.makina.krijo('termin', { user_id, sherbim_id, data_ora, emri, email, telefoni })
 *   [ ] radha.html: numri aktual dhe radha e ditës; rifreskim pa refresh me ngjarjen
 *       'ki:ndryshim' (vjen edhe nga tab-et e tjera) dhe setInterval për orën
 * Faza 2 (mirë të ketë): parashikimi i pritjes (mediana sipas shërbimit dhe orës).
 *
 * Lidhja me modulin Lënda: kur shërbimi ka "krijon_lende": true, përfundimi
 * i terminit krijon lëndë me KI.makina.krijo('lende', ...) dhe KI.kodi.gjenero().
 */
(function () {
  'use strict';

  function mbushSherbimet(zgjedhja, sherbimet) {
    // Shërbimet grupohen sipas drejtorisë me <optgroup>.
    const sipasDrejtorise = sherbimet.reduce((grupet, s) => {
      (grupet[s.drejtoria] = grupet[s.drejtoria] || []).push(s);
      return grupet;
    }, {});

    Object.entries(sipasDrejtorise).forEach(([drejtoria, lista]) => {
      const grupi = document.createElement('optgroup');
      grupi.label = drejtoria;
      lista.forEach((s) => grupi.appendChild(new Option(s.emri, s.id)));
      zgjedhja.appendChild(grupi);
    });
  }

  function shfaqDokumentet(sherbimi) {
    const lista = document.getElementById('termini-dokumentet');
    const detajet = document.getElementById('termini-detajet');
    lista.innerHTML = '';

    if (!sherbimi) {
      lista.innerHTML = '<li class="bosh">Zgjidh një shërbim për të parë listën.</li>';
      detajet.hidden = true;
      return;
    }

    sherbimi.dokumentet_e_nevojshme.forEach((dokumenti) => {
      const elementi = document.createElement('li');
      elementi.textContent = dokumenti;
      lista.appendChild(elementi);
    });

    document.getElementById('termini-kohezgjatja').textContent = `rreth ${sherbimi.kohezgjatja_mesatare} minuta`;
    document.getElementById('termini-afati').textContent = sherbimi.krijon_lende
      ? `${sherbimi.afati_ligjor_dite} ditë ${sherbimi.afati_lloji === 'pune' ? 'pune' : 'kalendarike'}`
      : 'Shërbehet në sportel';
    detajet.hidden = false;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const zgjedhja = document.getElementById('termini-sherbimi');
    if (!zgjedhja) return;

    try {
      await KI.gati();
      const { sherbimet } = await KI.ngarkoJSON('sherbimet');
      mbushSherbimet(zgjedhja, sherbimet);
      zgjedhja.addEventListener('change', () => {
        shfaqDokumentet(sherbimet.find((s) => s.id === zgjedhja.value));
      });
    } catch (gabim) {
      console.error('[KI] Shërbimet nuk u ngarkuan:', gabim);
    }
  });
})();