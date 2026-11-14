/**
 * zeri.js — Zëri i Lagjes: buxheti, propozimet dhe realizimi
 * Përgjegjës: Anëtari 3 · JavaScript vanilla
 *
 * Faza 1 (gati): tabelat e buxhetit me shtylla dhe lista e projekteve kapitale,
 *                të lexuara nga data/buxheti.json.
 * Faza 2: Sankey dhe treemap me SVG, kalkulatori i tatimit (tab-et me jQuery),
 *         forma Propozo me validim dhe pikë në hartë.
 * Faza 3: zbulimi i dublikatave (TF-IDF) – thërret algoritmet.js.
 */
(function () {
  'use strict';

  const { format } = KI;

  function rreshtiMeShtylle(emri, shuma, totali) {
    const pjesa = totali ? shuma / totali : 0;
    return `
      <tr>
        <th scope="row">${emri}</th>
        <td class="numer">${format.euro(shuma)}</td>
        <td class="numer">${format.perqindje(pjesa)}</td>
        <td class="shtylla-qeliza" aria-hidden="true">
          <span class="shtylla" style="--pjesa:${(pjesa * 100).toFixed(2)}%"></span>
        </td>
      </tr>`;
  }

  function mbushTabelen(celesi, rreshtat, totali) {
    const tbody = document.querySelector(`[data-tabela="${celesi}"]`);
    if (!tbody) return;
    tbody.innerHTML = rreshtat.map((r) => rreshtiMeShtylle(r.emri, r.shuma, totali)).join('');
    const tfoot = tbody.parentElement.querySelector('tfoot [data-totali]');
    if (tfoot) tfoot.textContent = format.euro(rreshtat.reduce((s, r) => s + r.shuma, 0));
  }

  /* ---------- buxheti.html ---------- */

  function faqjaBuxheti(buxheti) {
    const totali = buxheti.meta.totali;

    document.querySelectorAll('[data-buxheti]').forEach((el) => {
      const vlerat = {
        totali: format.euro(totali),
        kapitale: format.perqindje(
          buxheti.kategorite_ekonomike.find((k) => k.id === 'kapitale').shuma / totali
        ),
        vetanake: format.euro(buxheti.burimet_e_financimit.find((b) => b.id === 'vetanake').shuma),
        viti: buxheti.meta.viti
      };
      el.textContent = vlerat[el.dataset.buxheti];
    });

    mbushTabelen('kategorite', buxheti.kategorite_ekonomike, totali);
    mbushTabelen('burimet', buxheti.burimet_e_financimit, totali);

    const sipasDrejtorive = buxheti.investimet_sipas_drejtorive
      .map((d) => ({ emri: d.emri, shuma: d.shuma }))
      .sort((a, b) => b.shuma - a.shuma);
    mbushTabelen(
      'drejtorite',
      sipasDrejtorive,
      sipasDrejtorive.reduce((s, d) => s + d.shuma, 0)
    );
  }

  /* ---------- realizimi.html ---------- */

  function faqjaRealizimi(buxheti, lagjet) {
    const tbody = document.querySelector('[data-tabela="projektet"]');
    if (!tbody) return;

    const emriLagjes = (id) => (lagjet.find((l) => l.id === id) || {}).emri || 'Gjithë qyteti';
    const emriDrejtorise = (id) => (buxheti.drejtorite.find((d) => d.id === id) || {}).emri || id;

    tbody.innerHTML = buxheti.projektet_kapitale
      .slice()
      .sort((a, b) => b.buxheti - a.buxheti)
      .map((p) => {
        const shpenzuar = p.shpenzuar_tm1 || 0;
        const progresi = p.buxheti ? shpenzuar / p.buxheti : 0;
        const statusi = shpenzuar > 0 ? ['ne-zbatim', 'Në zbatim'] : ['planifikuar', 'Planifikuar'];
        return `
        <tr>
          <th scope="row">${p.emri}</th>
          <td>${emriDrejtorise(p.drejtoria_id)}</td>
          <td>${emriLagjes(p.lagje_id)}</td>
          <td class="numer">${format.euro(p.buxheti)}</td>
          <td class="numer">${format.euro(shpenzuar)}</td>
          <td class="numer">${format.perqindje(progresi)}</td>
          <td><span class="statusi statusi--${statusi[0]}">${statusi[1]}</span></td>
        </tr>`;
      })
      .join('');

    const numri = document.querySelector('[data-numri-projekteve]');
    if (numri) numri.textContent = buxheti.projektet_kapitale.length;
  }

  /* ---------- Nisja ---------- */

  document.addEventListener('DOMContentLoaded', async () => {
    const faqja = document.body.dataset.faqja;
    if (!['buxheti', 'realizimi'].includes(faqja)) return;

    try {
      await KI.gati();
      const buxheti = await KI.ngarkoJSON('buxheti');
      if (faqja === 'buxheti') faqjaBuxheti(buxheti);
      if (faqja === 'realizimi') {
        const { lagjet } = await KI.ngarkoJSON('lagjet');
        faqjaRealizimi(buxheti, lagjet);
      }
    } catch (gabim) {
      console.error('[KI] Buxheti nuk u ngarkua:', gabim);
    }
  });
})();
