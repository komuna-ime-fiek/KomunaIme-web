/**
 * llogaria.js — Faqja hyrja.html: hyrja, regjistrimi dhe "Llogaria ime"
 * Përgjegjës: Anëtari 2 · JavaScript vanilla
 */
(function () {
  'use strict';

  const DEMO = {
    qytetar: { email: 'qytetar@komunaime.test', fjalekalimi: 'Qytetar2026' },
    zyrtar: { email: 'zyrtar@komunaime.test', fjalekalimi: 'Zyrtar2026' },
    drejtues: { email: 'drejtues@komunaime.test', fjalekalimi: 'Drejtues2026' }
  };

  const FAQJA_SIPAS_ROLIT = {
    qytetar: 'index.html',
    zyrtar: 'paneli-zyrtarit.html',
    drejtues: 'paneli-drejtuesve.html'
  };

  const parametrat = new URLSearchParams(location.search);

  /** Pranohet vetëm një emër skedari i thjeshtë (p.sh. voto.html), jo URL e jashtme. */
  function faqjaPasHyrjes(roli) {
    const kthehu = parametrat.get('kthehu');
    if (kthehu && /^[a-z0-9-]+\.html$/.test(kthehu)) return kthehu;
    return FAQJA_SIPAS_ROLIT[roli] || 'index.html';
  }

  /* ---------- Tab-et Hyr / Regjistrohu (modeli ARIA tabs) ---------- */

  function lidhTabet() {
    const tabet = [...document.querySelectorAll('[role="tab"]')];

    function aktivizo(tabi, meFokus = true) {
      tabet.forEach((t) => {
        const iZgjedhur = t === tabi;
        t.setAttribute('aria-selected', String(iZgjedhur));
        t.tabIndex = iZgjedhur ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !iZgjedhur;
      });
      if (meFokus) tabi.focus();
    }

    tabet.forEach((tabi, i) => {
      tabi.addEventListener('click', () => aktivizo(tabi));
      tabi.addEventListener('keydown', (ngjarja) => {
        const zhvendosja = { ArrowRight: 1, ArrowLeft: -1 }[ngjarja.key];
        if (zhvendosja) {
          ngjarja.preventDefault();
          aktivizo(tabet[(i + zhvendosja + tabet.length) % tabet.length]);
        }
      });
    });

    if (location.hash === '#regjistrohu') aktivizo(document.getElementById('tab-regjistrohu'), false);
  }

  /* ---------- Hyrja ---------- */

  function lidhHyrjen() {
    const forma = document.getElementById('forma-hyrja');

    KI.forma.lidh(
      forma,
      {
        email: (vlera) => KI.validimi.email(vlera),
        fjalekalimi: (vlera) => (vlera ? '' : 'Shkruaj fjalëkalimin.')
      },
      async (teDhenat) => {
        try {
          const perdoruesi = await KI.llogaria.hyr(teDhenat.get('email'), teDhenat.get('fjalekalimi'));
          KI.ui.toast(`Mirë se erdhe, ${perdoruesi.emri}!`, 'sukses');
          setTimeout(() => location.assign(faqjaPasHyrjes(perdoruesi.roli)), 700);
        } catch (gabim) {
          KI.forma.shfaqGabimin(forma.elements.fjalekalimi, gabim.message);
          KI.ui.toast(gabim.message, 'gabim');
        }
      }
    );

    // Butonat e llogarive demo plotësojnë formën (për prezantim)
    document.querySelectorAll('[data-demo]').forEach((butoni) => {
      butoni.addEventListener('click', () => {
        const llogaria = DEMO[butoni.dataset.demo];
        forma.elements.email.value = llogaria.email;
        forma.elements.fjalekalimi.value = llogaria.fjalekalimi;
        KI.forma.pastroGabimin(forma.elements.email);
        KI.forma.pastroGabimin(forma.elements.fjalekalimi);
        forma.querySelector('[type="submit"]').focus();
      });
    });
  }

  /* ---------- Regjistrimi ---------- */

  async function lidhRegjistrimin() {
    const forma = document.getElementById('forma-regjistrohu');
    const zgjedhja = forma.elements.lagje_id;

    try {
      const { lagjet } = await KI.ngarkoJSON('lagjet');
      lagjet
        .slice()
        .sort((a, b) => a.emri.localeCompare(b.emri, 'sq'))
        .forEach((lagja) => zgjedhja.add(new Option(lagja.emri, lagja.id)));
    } catch (gabim) {
      console.error('[KI] Lagjet nuk u ngarkuan:', gabim);
    }

    KI.forma.lidh(
      forma,
      {
        emri: (vlera) => KI.validimi.emri(vlera),
        email: (vlera) => KI.validimi.email(vlera),
        lagje_id: (vlera) => (vlera ? '' : 'Zgjidh lagjen ku jeton.'),
        fjalekalimi: (vlera) => KI.validimi.fjalekalimi(vlera),
        konfirmimi: (vlera, f) =>
          vlera && vlera === f.elements.fjalekalimi.value ? '' : 'Fjalëkalimet nuk përputhen.',
        kushtet: (vlera) => (vlera ? '' : 'Duhet të pranosh kushtet e përdorimit të prototipit.')
      },
      async (teDhenat) => {
        try {
          const perdoruesi = await KI.llogaria.regjistrohu({
            emri: teDhenat.get('emri'),
            email: teDhenat.get('email'),
            fjalekalimi: teDhenat.get('fjalekalimi'),
            lagje_id: teDhenat.get('lagje_id')
          });
          KI.ui.toast(`Llogaria u krijua. Mirë se erdhe, ${perdoruesi.emri}!`, 'sukses');
          setTimeout(() => location.assign(faqjaPasHyrjes(perdoruesi.roli)), 700);
        } catch (gabim) {
          const fusha = /email/i.test(gabim.message) ? forma.elements.email : forma.elements.emri;
          KI.forma.shfaqGabimin(fusha, gabim.message);
          KI.ui.toast(gabim.message, 'gabim');
        }
      }
    );
  }

  /* ---------- Llogaria ime (kur përdoruesi është i kyçur) ---------- */

  async function vizatoLlogarine() {
    const perdoruesi = KI.llogaria.aktual();
    const seksioniHyrja = document.getElementById('hyrja');
    const seksioniLlogaria = document.getElementById('llogaria-ime');

    seksioniHyrja.hidden = !!perdoruesi;
    seksioniLlogaria.hidden = !perdoruesi;
    document.getElementById('titulli-faqes').textContent = perdoruesi ? 'Llogaria ime' : 'Hyr në Komuna Ime';
    if (!perdoruesi) return;

    let emriILagjes = '—';
    try {
      const { lagjet } = await KI.ngarkoJSON('lagjet');
      const lagja = lagjet.find((l) => l.id === perdoruesi.lagje_id);
      if (lagja) emriILagjes = lagja.emri;
    } catch (gabim) {
      /* lagja mbetet "—" */
    }

    document.getElementById('llogaria-emri').textContent = perdoruesi.emri;
    document.getElementById('llogaria-email').textContent = perdoruesi.email;
    document.getElementById('llogaria-roli').textContent = KI.llogaria.ROLET[perdoruesi.roli];
    document.getElementById('llogaria-lagja').textContent = emriILagjes;
    document.getElementById('llogaria-anetaresuar').textContent = KI.format.data(perdoruesi.krijuar);

    const lidhjaEPanelit = document.getElementById('llogaria-paneli');
    lidhjaEPanelit.hidden = perdoruesi.roli === 'qytetar';
    lidhjaEPanelit.href = FAQJA_SIPAS_ROLIT[perdoruesi.roli];

    const lista = document.getElementById('lista-njoftimeve');
    const njoftimet = KI.njoftimet.teMiat();
    lista.innerHTML = '';
    if (!njoftimet.length) {
      lista.innerHTML = '<li class="bosh">Nuk ke njoftime ende.</li>';
    } else {
      njoftimet.forEach((n) => {
        const elementi = document.createElement('li');
        elementi.className = n.lexuar ? 'njoftimi' : 'njoftimi njoftimi--ri';
        const koha = document.createElement('time');
        koha.dateTime = n.krijuar;
        koha.textContent = KI.format.dataOra(n.krijuar);
        const teksti = document.createElement('p');
        teksti.textContent = n.teksti;
        elementi.append(teksti, koha);
        lista.appendChild(elementi);
      });
    }
    // Pasi i sheh, shënohen si të lexuara (distinktivi në header zhduket).
    if (njoftimet.some((n) => !n.lexuar)) setTimeout(() => KI.njoftimet.shenoTeLexuara(), 1500);
  }

  /* ---------- Nisja ---------- */

  document.addEventListener('DOMContentLoaded', async () => {
    if (parametrat.get('arsyeja') === 'rol') {
      document.getElementById('mesazhi-qasjes').hidden = false;
    }
    lidhTabet();
    lidhHyrjen();

    try {
      await KI.gati();
    } catch (gabim) {
      return; // ui.js e shfaq mesazhin e gabimit
    }
    await lidhRegjistrimin();
    vizatoLlogarine();

    window.addEventListener('ki:ndryshim', (ngjarja) => {
      if (ngjarja.detail.celesi === 'sesioni') vizatoLlogarine();
    });
  });
})();
