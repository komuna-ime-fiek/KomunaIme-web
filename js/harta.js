/**
 * harta.js — Harta SVG e lagjeve
 * Përgjegjës: Anëtari 3 · JavaScript vanilla
 *
 * Komponenti i ripërdorshëm:
 *   const harta = KI.harta.vizato(svg, lagjet, { ngjyra, kurZgjidhet });
 *   harta.zgjidh('dardania');
 *
 * Çdo lagje është <path> me tabindex="0", role="button" dhe aria-label,
 * prandaj zgjidhet me klikim, me Enter ose me Space.
 */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  function krijo(etiketa, atributet = {}) {
    const elementi = document.createElementNS(NS, etiketa);
    Object.entries(atributet).forEach(([emri, vlera]) => elementi.setAttribute(emri, vlera));
    return elementi;
  }

  /**
   * @param {SVGSVGElement} svg
   * @param {{ meta: object, lagjet: object[] }} teDhenat  përmbajtja e data/lagjet.json
   * @param {{ ngjyra?: (lagja) => string, kurZgjidhet?: (lagja) => void, pershkrimi?: (lagja) => string }} opsionet
   */
  function vizato(svg, teDhenat, opsionet = {}) {
    const { ngjyra = null, kurZgjidhet = () => {}, pershkrimi = (l) => l.emri } = opsionet;
    const { lagjet, meta } = teDhenat;

    svg.setAttribute('viewBox', meta.viewBox);
    svg.replaceChildren();

    const kufiri = krijo('path', { d: meta.kufiri, class: 'harta__kufiri', 'aria-hidden': 'true' });
    const grupiLagjeve = krijo('g', { class: 'harta__lagjet' });
    const grupiEmrave = krijo('g', { class: 'harta__emrat', 'aria-hidden': 'true' });

    lagjet.forEach((lagja) => {
      const forma = krijo('path', {
        d: lagja.forma,
        class: 'lagja',
        tabindex: '0',
        role: 'button',
        'aria-pressed': 'false',
        'aria-label': pershkrimi(lagja),
        'data-id': lagja.id
      });
      if (ngjyra) forma.style.setProperty('--ngjyra-lagjes', ngjyra(lagja));
      const titulli = krijo('title');
      titulli.textContent = lagja.emri;
      forma.appendChild(titulli);
      grupiLagjeve.appendChild(forma);

      // Emrat e gjatë ndahen në dy rreshta (fusha "etiketa" te lagjet.json).
      const rreshtat = lagja.etiketa || [lagja.emri];
      const emri = krijo('text', { x: lagja.qendra.x, y: lagja.qendra.y, class: 'lagja__emri' });
      rreshtat.forEach((rreshti, i) => {
        const tspan = krijo('tspan', {
          x: lagja.qendra.x,
          dy: i === 0 ? `${-(rreshtat.length - 1) * 0.6}em` : '1.2em'
        });
        tspan.textContent = rreshti;
        emri.appendChild(tspan);
      });
      grupiEmrave.appendChild(emri);
    });

    // Konturi i lagjes së zgjedhur vizatohet mbi të gjitha, pa ndryshuar rendin e Tab-it.
    const perzgjedhja = krijo('path', { class: 'harta__perzgjedhja', 'aria-hidden': 'true', d: '' });

    svg.append(kufiri, grupiLagjeve, perzgjedhja, grupiEmrave);

    function zgjidh(id) {
      const lagja = lagjet.find((l) => l.id === id);
      if (!lagja) return null;
      grupiLagjeve.querySelectorAll('.lagja').forEach((forma) => {
        forma.setAttribute('aria-pressed', String(forma.dataset.id === id));
      });
      perzgjedhja.setAttribute('d', lagja.forma);
      kurZgjidhet(lagja);
      return lagja;
    }

    svg.addEventListener('click', (ngjarja) => {
      const forma = ngjarja.target.closest('.lagja');
      if (forma) zgjidh(forma.dataset.id);
    });

    svg.addEventListener('keydown', (ngjarja) => {
      if ((ngjarja.key === 'Enter' || ngjarja.key === ' ') && ngjarja.target.matches('.lagja')) {
        ngjarja.preventDefault();
        zgjidh(ngjarja.target.dataset.id);
        ngjarja.target.focus();
      }
    });

    return { zgjidh, lagjet };
  }

  window.KI.harta = { vizato };

  /* ==========================================================
     Faqja harta.html
     ========================================================== */

  const SHKALLA = [
    { deri: 1, ngjyra: 'var(--harta-0)', etiketa: 'Pa projekt të lidhur' },
    { deri: 500000, ngjyra: 'var(--harta-1)', etiketa: 'Deri në 500.000 €' },
    { deri: 1500000, ngjyra: 'var(--harta-2)', etiketa: '500.000 – 1,5 mln €' },
    { deri: Infinity, ngjyra: 'var(--harta-3)', etiketa: 'Mbi 1,5 mln €' }
  ];

  const ngjyraSipasShumes = (shuma) => SHKALLA.find((s) => shuma < s.deri).ngjyra;

  function vizatoLegjenden(elementi) {
    elementi.innerHTML = SHKALLA.map(
      (s) => `<li><span class="legjenda__ngjyra" style="background:${s.ngjyra}"></span>${s.etiketa}</li>`
    ).join('');
  }

  function vizatoInfon(lagja, projektet, propozimet) {
    const { format } = KI;
    const totali = projektet.reduce((shuma, p) => shuma + p.buxheti, 0);
    const info = document.getElementById('info-lagja');

    info.querySelector('[data-fusha="emri"]').textContent = lagja.emri;
    info.querySelector('[data-fusha="popullsia"]').textContent = format.numer(lagja.popullsia);
    info.querySelector('[data-fusha="buxheti"]').textContent = format.euro(lagja.buxheti_i_ndare);
    info.querySelector('[data-fusha="propozimet"]').textContent = propozimet.length;
    info.querySelector('[data-fusha="investimet"]').textContent = format.euro(totali);
    info.querySelector('[data-fusha="voto"]').href = `voto.html?lagja=${encodeURIComponent(lagja.id)}`;

    const lista = info.querySelector('[data-fusha="projektet"]');
    lista.innerHTML = projektet.length
      ? projektet
          .sort((a, b) => b.buxheti - a.buxheti)
          .map((p) => `<li><span>${p.emri}</span><strong>${format.euro(p.buxheti)}</strong></li>`)
          .join('')
      : '<li class="bosh">Asnjë projekt kapital i buxhetit 2026 nuk e përmend këtë lagje.</li>';

    info.hidden = false;
    document.getElementById('info-udhezimi').hidden = true;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const svg = document.getElementById('harta-svg');
    if (!svg || document.body.dataset.faqja !== 'harta') return;

    try {
      await KI.gati();
      const [teDhenat, buxheti] = await Promise.all([KI.ngarkoJSON('lagjet'), KI.ngarkoJSON('buxheti')]);
      const propozimet = KI.koleksion('propozimet').gjithe();

      const projektetSipasLagjes = (id) => buxheti.projektet_kapitale.filter((p) => p.lagje_id === id);
      const investimet = (id) => projektetSipasLagjes(id).reduce((s, p) => s + p.buxheti, 0);

      const harta = vizato(svg, teDhenat, {
        ngjyra: (lagja) => ngjyraSipasShumes(investimet(lagja.id)),
        pershkrimi: (lagja) =>
          `${lagja.emri}: investime kapitale 2026 ${KI.format.euro(investimet(lagja.id))}`,
        kurZgjidhet: (lagja) => {
          vizatoInfon(
            lagja,
            projektetSipasLagjes(lagja.id),
            propozimet.filter((p) => p.lagje_id === lagja.id)
          );
          history.replaceState(null, '', `?lagja=${lagja.id}`);
        }
      });

      vizatoLegjenden(document.getElementById('legjenda'));

      const eZgjedhura = new URLSearchParams(location.search).get('lagja');
      if (eZgjedhura) harta.zgjidh(eZgjedhura);
    } catch (gabim) {
      console.error('[KI] Harta nuk u vizatua:', gabim);
    }
  });
})();
