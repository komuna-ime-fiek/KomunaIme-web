/**
 * voto.js — Prototipi i faqes Voto (votimi me buxhet virtual)
 * Përgjegjës: Anëtari 4 · JavaScript vanilla
 *
 * Faza 1 (ky prototip): zgjedhja e lagjes, kartat e projekteve, filtri sipas
 * kategorisë, shporta me totalin (reduce) dhe shiriti i buxhetit.
 * Faza 2: kodi i verifikimit, hash-i i identitetit dhe dëftesa e votës.
 */
(function () {
  'use strict';

  const gjendja = {
    lagjet: [],
    kategorite: {},
    projektet: [],
    lagja: null,
    kategoria: '',
    zgjedhura: [] // id-të e projekteve në shportë
  };

  const $ = (id) => document.getElementById(id);

  /** Mbron tekstin që futet me innerHTML (propozimet i shkruajnë qytetarët). */
  const esc = (teksti) =>
    String(teksti).replace(/[&<>"']/g, (k) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[k]);

  const projektetELagjes = () =>
    gjendja.projektet.filter((p) => p.lagje_id === gjendja.lagja.id && p.statusi === 'i_pranuar');

  const projektetNeShporte = () => gjendja.projektet.filter((p) => gjendja.zgjedhura.includes(p.id));

  const totaliIShportes = () => projektetNeShporte().reduce((shuma, p) => shuma + p.kostoja, 0);

  /* ---------- Vizatimi ---------- */

  function vizatoKartat() {
    const lista = $('lista-projekteve');
    const teDukshmit = projektetELagjes()
      .filter((p) => !gjendja.kategoria || p.kategoria === gjendja.kategoria)
      .sort((a, b) => a.kostoja - b.kostoja);

    $('voto-numri-projekteve').textContent = teDukshmit.length;

    if (!teDukshmit.length) {
      lista.innerHTML = '<p class="bosh">Nuk ka projekte në këtë kategori për këtë lagje.</p>';
      return;
    }

    lista.innerHTML = teDukshmit
      .map((p) => {
        const iZgjedhur = gjendja.zgjedhura.includes(p.id);
        const kategoria = gjendja.kategorite[p.kategoria] || p.kategoria;
        return `
        <article class="karta karta-projekti${iZgjedhur ? ' e-zgjedhur' : ''}" data-id="${esc(p.id)}">
          <div class="karta-projekti__koka">
            <span class="etiketa etiketa--${esc(p.kategoria)}">${esc(kategoria)}</span>
            <span class="karta-projekti__kostoja">${KI.format.euro(p.kostoja)}</span>
          </div>
          <h3 id="titulli-${esc(p.id)}">${esc(p.titulli)}</h3>
          <p>${esc(p.pershkrimi)}</p>
          <div class="karta-projekti__zgjedhja">
            <input type="checkbox" id="zgjedh-${esc(p.id)}" value="${esc(p.id)}"
                   aria-describedby="titulli-${esc(p.id)}"${iZgjedhur ? ' checked' : ''}>
            <label for="zgjedh-${esc(p.id)}">${iZgjedhur ? 'Në shportë' : 'Shto në shportë'}</label>
          </div>
        </article>`;
      })
      .join('');
  }

  function vizatoShporten() {
    const buxheti = gjendja.lagja.buxheti_i_ndare;
    const neShporte = projektetNeShporte();
    const totali = totaliIShportes();
    const mbetja = buxheti - totali;
    const tejkalim = totali > buxheti;

    // Shiriti i buxhetit
    const perqindja = buxheti ? Math.min(100, (totali / buxheti) * 100) : 0;
    const shiriti = $('shiriti-buxhetit');
    shiriti.querySelector('.shiriti-buxhetit__mbushja').style.width = `${perqindja}%`;
    shiriti.classList.toggle('shiriti-buxhetit--tejkaluar', tejkalim);
    shiriti.setAttribute('aria-valuenow', String(Math.round(totali)));
    shiriti.setAttribute('aria-valuemax', String(buxheti));
    shiriti.setAttribute('aria-valuetext', `${KI.format.euro(totali)} nga ${KI.format.euro(buxheti)}`);

    $('voto-buxheti').textContent = KI.format.euro(buxheti);
    $('voto-shpenzuar').textContent = KI.format.euro(totali);
    $('voto-mbetur').textContent = KI.format.euro(Math.max(0, mbetja));

    // Lista e shportës
    const lista = $('shporta-lista');
    lista.innerHTML = neShporte.length
      ? neShporte
          .map(
            (p) => `
          <li>
            <span class="shporta__emri">${esc(p.titulli)}</span>
            <span class="shporta__kostoja">${KI.format.euro(p.kostoja)}</span>
            <button type="button" class="butoni-hiq" data-hiq="${esc(p.id)}"
                    aria-label="Hiq ${esc(p.titulli)} nga shporta">×</button>
          </li>`
          )
          .join('')
      : '<li class="bosh">Shporta është bosh. Zgjidh projektet që do t\'i financoje.</li>';

    $('shporta-totali').textContent = KI.format.euro(totali);
    $('shporta-totali-shkurt').textContent = `${KI.format.euro(totali)} / ${KI.format.euro(buxheti)}`;
    $('shporta-numri').textContent = neShporte.length;

    // Mesazhi dhe butoni i votimit
    const mesazhi = $('shporta-mesazhi');
    if (tejkalim) {
      mesazhi.textContent = `E ke tejkaluar buxhetin për ${KI.format.euro(totali - buxheti)}.`;
      mesazhi.className = 'shporta__mesazhi shporta__mesazhi--gabim';
    } else if (!neShporte.length) {
      mesazhi.textContent = '';
      mesazhi.className = 'shporta__mesazhi';
    } else {
      mesazhi.textContent = `Të mbeten ${KI.format.euro(mbetja)} për projekte të tjera.`;
      mesazhi.className = 'shporta__mesazhi shporta__mesazhi--sukses';
    }
    $('butoni-voto').disabled = tejkalim || !neShporte.length;
  }

  function vizato() {
    vizatoKartat();
    vizatoShporten();
  }

  /* ---------- Veprimet ---------- */

  function nderroZgjedhjen(id) {
    const ishteBrenda = gjendja.zgjedhura.includes(id);
    gjendja.zgjedhura = ishteBrenda ? gjendja.zgjedhura.filter((x) => x !== id) : [...gjendja.zgjedhura, id];
    vizato();

    if (!ishteBrenda && totaliIShportes() > gjendja.lagja.buxheti_i_ndare) {
      const shiriti = $('shiriti-buxhetit');
      shiriti.classList.remove('dridhje');
      void shiriti.offsetWidth;
      shiriti.classList.add('dridhje');
    }
    const kutia = $(`zgjedh-${id}`);
    if (kutia) kutia.focus();
  }

  function zgjidhLagjen(id) {
    const lagja = gjendja.lagjet.find((l) => l.id === id) || gjendja.lagjet[0];
    if (gjendja.zgjedhura.length && gjendja.lagja && lagja.id !== gjendja.lagja.id) {
      KI.ui.toast('Shporta u zbraz, sepse çdo lagje ka buxhetin e vet.', 'info');
    }
    gjendja.lagja = lagja;
    gjendja.zgjedhura = [];
    $('voto-lagja').value = lagja.id;
    document.querySelectorAll('[data-emri-lagjes]').forEach((el) => (el.textContent = lagja.emri));
    history.replaceState(null, '', `?lagja=${lagja.id}`);
    vizato();
  }

  function lidhNgjarjet() {
    $('voto-lagja').addEventListener('change', (e) => zgjidhLagjen(e.target.value));

    $('voto-kategoria').addEventListener('change', (e) => {
      gjendja.kategoria = e.target.value;
      vizatoKartat();
    });

    // Klikimi kudo në kartë e ndërron zgjedhjen; checkbox-i punon edhe me tastierë.
    $('lista-projekteve').addEventListener('change', (e) => {
      if (e.target.matches('input[type="checkbox"]')) nderroZgjedhjen(e.target.value);
    });
    $('lista-projekteve').addEventListener('click', (e) => {
      const karta = e.target.closest('.karta-projekti');
      if (karta && !e.target.closest('input, label')) nderroZgjedhjen(karta.dataset.id);
    });

    $('shporta-lista').addEventListener('click', (e) => {
      const butoni = e.target.closest('[data-hiq]');
      if (butoni) nderroZgjedhjen(butoni.dataset.hiq);
    });

    $('butoni-shporta').addEventListener('click', () => {
      const shporta = $('shporta');
      const eHapur = shporta.classList.toggle('shporta--hapur');
      $('butoni-shporta').setAttribute('aria-expanded', String(eHapur));
    });

    $('forma-votimi').addEventListener('submit', (e) => {
      e.preventDefault();
      if ($('butoni-voto').disabled) return;
      KI.ui.toast(
        `Prototip: zgjodhe ${gjendja.zgjedhura.length} projekte për ${KI.format.euro(totaliIShportes())}. ` +
          'Kodi i verifikimit dhe dëftesa shtohen në Fazën 2.',
        'info'
      );
    });
  }

  /* ---------- Nisja ---------- */

  document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.faqja !== 'voto') return;

    try {
      await KI.gati();
      const [{ lagjet }, dataPropozimet] = await Promise.all([
        KI.ngarkoJSON('lagjet'),
        KI.ngarkoJSON('propozimet')
      ]);

      gjendja.lagjet = lagjet.slice().sort((a, b) => a.emri.localeCompare(b.emri, 'sq'));
      gjendja.kategorite = dataPropozimet.meta.kategorite;
      gjendja.projektet = KI.koleksion('propozimet').gjithe();

      const zgjedhjaLagjes = $('voto-lagja');
      gjendja.lagjet.forEach((l) => zgjedhjaLagjes.add(new Option(l.emri, l.id)));

      const zgjedhjaKategorise = $('voto-kategoria');
      Object.entries(gjendja.kategorite).forEach(([id, emri]) => zgjedhjaKategorise.add(new Option(emri, id)));

      lidhNgjarjet();

      const perdoruesi = KI.llogaria.aktual();
      const ngaUrl = new URLSearchParams(location.search).get('lagja');
      zgjidhLagjen(ngaUrl || (perdoruesi && perdoruesi.lagje_id) || gjendja.lagjet[0].id);
    } catch (gabim) {
      console.error('[KI] Faqja Voto nuk u ngarkua:', gabim);
    }
  });
})();
