/**
 * storage.js — Bërthama e përbashkët e Komuna Ime
 * Përgjegjës: Anëtari 2 (Lead) · JavaScript vanilla
 *
 * Çdo lexim dhe shkrim i të dhënave kalon nga ky skedar:
 *   - skedarët JSON në /data   → vetëm lexim (fetch), me cache
 *   - localStorage             → gjithçka që krijojnë përdoruesit
 *
 * Përdorimi në çdo faqe:
 *   KI.gati().then(() => {
 *     const propozimet = KI.koleksion('propozimet').gjithe();
 *   });
 *
 * Seksionet:
 *   1. localStorage           6. Njoftimet
 *   2. Skedarët JSON          7. Makina e gjendjeve
 *   3. Koleksionet            8. Kodi i gjurmimit
 *   4. Siguria (hash)         9. Formatimi dhe validimi
 *   5. Llogaritë             10. Nisja (seed), sinkronizimi dhe rivendosja
 */
(function (global) {
  'use strict';

  const PREFIKSI = 'ki_';
  const VERSIONI_I_TE_DHENAVE = 1;
  const ITERACIONET_PBKDF2 = 100000;
  const KOHA_E_SESIONIT_MS = 8 * 60 * 60 * 1000; // 8 orë

  const KOLEKSIONET = [
    'perdoruesit',
    'njoftimet',
    'terminet',
    'lendet',
    'historia_e_statuseve',
    'propozimet',
    'identitetet_votimit',
    'votat'
  ];

  /* ==========================================================
     1. localStorage
     ========================================================== */

  function localStorageIDisponueshem() {
    try {
      const prova = PREFIKSI + '__prova__';
      localStorage.setItem(prova, '1');
      localStorage.removeItem(prova);
      return true;
    } catch (gabim) {
      return false;
    }
  }

  function lexo(celesi, vleraParazgjedhur = null) {
    try {
      const teksti = localStorage.getItem(PREFIKSI + celesi);
      return teksti === null ? vleraParazgjedhur : JSON.parse(teksti);
    } catch (gabim) {
      console.warn(`[KI] Nuk u lexua "${celesi}" nga localStorage:`, gabim);
      return vleraParazgjedhur;
    }
  }

  function shkruaj(celesi, vlera) {
    try {
      localStorage.setItem(PREFIKSI + celesi, JSON.stringify(vlera));
      return true;
    } catch (gabim) {
      console.error(`[KI] Nuk u ruajt "${celesi}" (localStorage mund të jetë plot):`, gabim);
      return false;
    }
  }

  function fshi(celesi) {
    try {
      localStorage.removeItem(PREFIKSI + celesi);
    } catch (gabim) {
      /* localStorage i padisponueshëm: s'ka çka të fshihet */
    }
  }

  /* ==========================================================
     2. Skedarët JSON (vetëm lexim)
     ========================================================== */

  const cacheJSON = {};

  /**
   * Ngarkon data/<emri>.json një herë dhe e mban në memorie.
   * @param {string} emri p.sh. 'lagjet', 'buxheti', 'sherbimet'
   */
  function ngarkoJSON(emri) {
    if (!cacheJSON[emri]) {
      cacheJSON[emri] = fetch(`data/${emri}.json`)
        .then((pergjigja) => {
          if (!pergjigja.ok) {
            throw new Error(`data/${emri}.json nuk u gjet (HTTP ${pergjigja.status}).`);
          }
          return pergjigja.json();
        })
        .catch((gabim) => {
          delete cacheJSON[emri]; // lejo provë tjetër
          throw gabim;
        });
    }
    return cacheJSON[emri];
  }

  /* ==========================================================
     3. Koleksionet (lista objektesh në localStorage)
     ========================================================== */

  function idERe(koleksioni) {
    const rastesishem = new Uint32Array(2);
    crypto.getRandomValues(rastesishem);
    const pjesa = Array.from(rastesishem, (n) => n.toString(36)).join('');
    return `${koleksioni.slice(0, 3)}-${Date.now().toString(36)}-${pjesa.slice(0, 8)}`;
  }

  /**
   * Kthen funksionet CRUD për një koleksion.
   *   KI.koleksion('lendet').shto({ ... })
   */
  function koleksion(emri) {
    if (!KOLEKSIONET.includes(emri)) {
      throw new Error(`Koleksion i panjohur: "${emri}". Të lejuarat: ${KOLEKSIONET.join(', ')}`);
    }

    const merr = () => lexo(emri, []);
    const ruaj = (lista) => {
      shkruaj(emri, lista);
      njoftoNdryshimin(emri);
      return lista;
    };

    return {
      gjithe: () => merr(),
      numri: () => merr().length,
      gjej: (id) => merr().find((objekti) => objekti.id === id) || null,
      filtro: (kushti) => merr().filter(kushti),

      shto(objekti) {
        const iRi = { id: idERe(emri), krijuar: new Date().toISOString(), ...objekti };
        ruaj([...merr(), iRi]);
        return iRi;
      },

      perditeso(id, ndryshimet) {
        let iPerditesuar = null;
        const lista = merr().map((objekti) => {
          if (objekti.id !== id) return objekti;
          iPerditesuar = { ...objekti, ...ndryshimet, id };
          return iPerditesuar;
        });
        if (!iPerditesuar) throw new Error(`Objekti "${id}" nuk u gjet në "${emri}".`);
        ruaj(lista);
        return iPerditesuar;
      },

      fshi(id) {
        const lista = merr();
        const mbetja = lista.filter((objekti) => objekti.id !== id);
        ruaj(mbetja);
        return mbetja.length !== lista.length;
      },

      zevendeso: (lista) => ruaj(Array.isArray(lista) ? lista : [])
    };
  }

  /* ==========================================================
     4. Siguria: SHA-256 dhe PBKDF2 me Web Crypto
     Web Crypto (crypto.subtle) punon vetëm në "secure context":
     https://, localhost ose 127.0.0.1. Kur projekti hapet nga telefoni
     me IP lokale (http://192.168.x.x), përdoret implementimi rezervë
     më poshtë, i cili jep saktësisht të njëjtin rezultat.
     ========================================================== */

  const koduesi = new TextEncoder();
  const kaWebCrypto = !!(global.crypto && global.crypto.subtle);

  const neHex = (bajtet) => Array.from(bajtet, (b) => b.toString(16).padStart(2, '0')).join('');

  function ngaHex(hex) {
    const bajtet = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bajtet.length; i++) bajtet[i] = parseInt(hex.substr(i * 2, 2), 16);
    return bajtet;
  }

  function bashko(a, b) {
    const rezultati = new Uint8Array(a.length + b.length);
    rezultati.set(a);
    rezultati.set(b, a.length);
    return rezultati;
  }

  // SHA-256 rezervë (FIPS 180-4), për kontekste pa crypto.subtle
  const sha256Rezerve = (function () {
    const K = new Uint32Array([
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]);
    const W = new Uint32Array(64);
    const rr = (x, n) => (x >>> n) | (x << (32 - n));

    return function (mesazhi) {
      const gjatesia = mesazhi.length;
      const gjatesiaEMbushur = ((gjatesia + 9 + 63) >> 6) << 6;
      const m = new Uint8Array(gjatesiaEMbushur);
      m.set(mesazhi);
      m[gjatesia] = 0x80;
      const dv = new DataView(m.buffer);
      const bitet = gjatesia * 8;
      dv.setUint32(gjatesiaEMbushur - 8, Math.floor(bitet / 0x100000000));
      dv.setUint32(gjatesiaEMbushur - 4, bitet >>> 0);

      const H = new Uint32Array([
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
      ]);

      for (let blloku = 0; blloku < gjatesiaEMbushur; blloku += 64) {
        for (let i = 0; i < 16; i++) W[i] = dv.getUint32(blloku + i * 4);
        for (let i = 16; i < 64; i++) {
          const s0 = rr(W[i - 15], 7) ^ rr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
          const s1 = rr(W[i - 2], 17) ^ rr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
          W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
        }
        let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
        for (let i = 0; i < 64; i++) {
          const t1 = (h + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
          const t2 = ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
          h = g; g = f; f = e; e = (d + t1) | 0;
          d = c; c = b; b = a; a = (t1 + t2) | 0;
        }
        H[0] += a; H[1] += b; H[2] += c; H[3] += d;
        H[4] += e; H[5] += f; H[6] += g; H[7] += h;
      }

      const dalja = new Uint8Array(32);
      const dvDalja = new DataView(dalja.buffer);
      for (let i = 0; i < 8; i++) dvDalja.setUint32(i * 4, H[i]);
      return dalja;
    };
  })();

  function hmacRezerve(celesi, mesazhi) {
    const k = new Uint8Array(64);
    k.set(celesi.length > 64 ? sha256Rezerve(celesi) : celesi);
    const ipad = k.map((b) => b ^ 0x36);
    const opad = k.map((b) => b ^ 0x5c);
    return sha256Rezerve(bashko(opad, sha256Rezerve(bashko(ipad, mesazhi))));
  }

  function pbkdf2Rezerve(fjalekalimi, kripa, iteracionet) {
    let u = hmacRezerve(fjalekalimi, bashko(kripa, new Uint8Array([0, 0, 0, 1])));
    const t = u.slice();
    for (let i = 1; i < iteracionet; i++) {
      u = hmacRezerve(fjalekalimi, u);
      for (let j = 0; j < 32; j++) t[j] ^= u[j];
    }
    return t;
  }

  /** SHA-256 i një teksti → hex (64 karaktere). */
  async function sha256(teksti) {
    const bajtet = koduesi.encode(String(teksti));
    if (kaWebCrypto) {
      return neHex(new Uint8Array(await crypto.subtle.digest('SHA-256', bajtet)));
    }
    return neHex(sha256Rezerve(bajtet));
  }

  /** PBKDF2-SHA256 për fjalëkalimet: fjalëkalimi nuk ruhet kurrë, vetëm hash-i. */
  async function hashFjalekalimi(fjalekalimi, kripaHex) {
    const bajtet = koduesi.encode(String(fjalekalimi));
    const kripa = ngaHex(kripaHex);
    if (kaWebCrypto) {
      const celesi = await crypto.subtle.importKey('raw', bajtet, 'PBKDF2', false, ['deriveBits']);
      const bitet = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', salt: kripa, iterations: ITERACIONET_PBKDF2 },
        celesi,
        256
      );
      return neHex(new Uint8Array(bitet));
    }
    return neHex(pbkdf2Rezerve(bajtet, kripa, ITERACIONET_PBKDF2));
  }

  /** Kripë e rastësishme (16 bajte → 32 karaktere hex). */
  function kripe() {
    return neHex(crypto.getRandomValues(new Uint8Array(16)));
  }

  /** Kod verifikimi me 6 shifra për votimin, p.sh. "048213". */
  function kodVerifikimi() {
    const numri = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
    return String(numri).padStart(6, '0');
  }

  /* ==========================================================
     5. Llogaritë: regjistrimi, hyrja, sesioni, rolet
     Rolet: 'qytetar' | 'zyrtar' | 'drejtues'
     ========================================================== */

  const ROLET = {
    qytetar: 'Qytetar',
    zyrtar: 'Zyrtar i komunës',
    drejtues: 'Drejtues'
  };

  const pjesaPublike = (perdoruesi) => {
    const { kripa, hash_fjalekalimi, ...pjesa } = perdoruesi;
    return pjesa;
  };

  const normalizoEmail = (email) => String(email || '').trim().toLowerCase();

  function filloSesionin(perdoruesi) {
    shkruaj('sesioni', { user_id: perdoruesi.id, skadon: Date.now() + KOHA_E_SESIONIT_MS });
    njoftoNdryshimin('sesioni');
  }

  async function regjistrohu({ emri, email, fjalekalimi, lagje_id = null }) {
    const emriIPastruar = String(emri || '').trim().replace(/\s+/g, ' ');
    const emailIPastruar = normalizoEmail(email);

    const gabimi =
      validimi.emri(emriIPastruar) ||
      validimi.email(emailIPastruar) ||
      validimi.fjalekalimi(fjalekalimi);
    if (gabimi) throw new Error(gabimi);

    const perdoruesit = koleksion('perdoruesit');
    if (perdoruesit.gjithe().some((p) => p.email === emailIPastruar)) {
      throw new Error('Ky email është i regjistruar tashmë. Provo të hysh.');
    }

    const kripa = kripe();
    const iRi = perdoruesit.shto({
      emri: emriIPastruar,
      email: emailIPastruar,
      roli: 'qytetar',
      lagje_id,
      kripa,
      hash_fjalekalimi: await hashFjalekalimi(fjalekalimi, kripa)
    });

    filloSesionin(iRi);
    njofto(iRi.id, `Mirë se erdhe, ${iRi.emri}! Llogaria jote u krijua.`);
    return pjesaPublike(iRi);
  }

  async function hyr(email, fjalekalimi) {
    const MESAZHI = 'Email-i ose fjalëkalimi është i gabuar.'; // i njëjtë për të dyja rastet
    const perdoruesi = koleksion('perdoruesit').gjithe().find((p) => p.email === normalizoEmail(email));
    if (!perdoruesi) throw new Error(MESAZHI);

    const hash = await hashFjalekalimi(fjalekalimi, perdoruesi.kripa);
    if (hash !== perdoruesi.hash_fjalekalimi) throw new Error(MESAZHI);

    filloSesionin(perdoruesi);
    return pjesaPublike(perdoruesi);
  }

  function dil() {
    fshi('sesioni');
    njoftoNdryshimin('sesioni');
  }

  /** Përdoruesi i kyçur (pa hash/kripë), ose null. */
  function aktual() {
    const sesioni = lexo('sesioni');
    if (!sesioni) return null;
    if (Date.now() > sesioni.skadon) {
      dil();
      return null;
    }
    const perdoruesi = koleksion('perdoruesit').gjej(sesioni.user_id);
    return perdoruesi ? pjesaPublike(perdoruesi) : null;
  }

  function kaRol(...rolet) {
    const perdoruesi = aktual();
    return !!perdoruesi && rolet.includes(perdoruesi.roli);
  }

  /* ==========================================================
     6. Njoftimet
     ========================================================== */

  function njofto(user_id, teksti, lidhja = null) {
    if (!user_id) return null;
    return koleksion('njoftimet').shto({ user_id, teksti, lidhja, lexuar: false });
  }

  function njoftimetEMia() {
    const perdoruesi = aktual();
    if (!perdoruesi) return [];
    return koleksion('njoftimet')
      .filtro((n) => n.user_id === perdoruesi.id)
      .sort((a, b) => b.krijuar.localeCompare(a.krijuar));
  }

  function tePalexuara() {
    return njoftimetEMia().filter((n) => !n.lexuar);
  }

  function shenoTeLexuara() {
    const perdoruesi = aktual();
    if (!perdoruesi) return;
    const kol = koleksion('njoftimet');
    kol.zevendeso(kol.gjithe().map((n) => (n.user_id === perdoruesi.id ? { ...n, lexuar: true } : n)));
  }

  /* ==========================================================
     7. Makina e gjendjeve
     Lëndët, terminet dhe projektet kalojnë vetëm nëpër hapat e lejuar,
     dhe çdo kalim ruhet në "historia_e_statuseve".
     ========================================================== */

  const MAKINAT = {
    lende: {
      koleksioni: 'lendet',
      emertimi: 'Lënda',
      fillestar: 'dorezuar',
      etiketat: {
        dorezuar: 'Dorëzuar',
        ne_shqyrtim: 'Në shqyrtim',
        kerkohen_plotesime: 'Kërkohen plotësime',
        vendim: 'Vendim',
        mbyllur: 'Mbyllur'
      },
      kalimet: {
        dorezuar: ['ne_shqyrtim'],
        ne_shqyrtim: ['kerkohen_plotesime', 'vendim'],
        kerkohen_plotesime: ['ne_shqyrtim'],
        vendim: ['mbyllur'],
        mbyllur: []
      }
    },
    termin: {
      koleksioni: 'terminet',
      emertimi: 'Termini',
      fillestar: 'rezervuar',
      etiketat: {
        rezervuar: 'Rezervuar',
        mberritur: 'Në radhë',
        ne_sherbim: 'Në shërbim',
        perfunduar: 'Përfunduar',
        anuluar: 'Anuluar',
        nuk_u_paraqit: 'Nuk u paraqit'
      },
      kalimet: {
        rezervuar: ['mberritur', 'anuluar', 'nuk_u_paraqit'],
        mberritur: ['ne_sherbim', 'nuk_u_paraqit'],
        ne_sherbim: ['perfunduar'],
        perfunduar: [],
        anuluar: [],
        nuk_u_paraqit: []
      }
    },
    projekt: {
      koleksioni: 'propozimet',
      emertimi: 'Propozimi',
      fillestar: 'propozuar',
      etiketat: {
        propozuar: 'Propozuar',
        ne_vleresim: 'Në vlerësim',
        i_pranuar: 'Në votim',
        refuzuar: 'Refuzuar',
        fitues: 'Fitues',
        jo_fitues: 'Pa vota të mjaftueshme',
        ne_realizim: 'Në realizim',
        perfunduar: 'Përfunduar'
      },
      kalimet: {
        propozuar: ['ne_vleresim', 'refuzuar'],
        ne_vleresim: ['i_pranuar', 'refuzuar'],
        i_pranuar: ['fitues', 'jo_fitues'],
        fitues: ['ne_realizim'],
        jo_fitues: [],
        refuzuar: [],
        ne_realizim: ['perfunduar'],
        perfunduar: []
      }
    }
  };

  function makinaPer(lloji) {
    const makina = MAKINAT[lloji];
    if (!makina) throw new Error(`Lloj i panjohur për makinën e gjendjeve: "${lloji}".`);
    return makina;
  }

  const etiketa = (lloji, statusi) => makinaPer(lloji).etiketat[statusi] || statusi;

  function mundTeKaloje(lloji, nga, ne) {
    return (makinaPer(lloji).kalimet[nga] || []).includes(ne);
  }

  function hapatEArdhshem(lloji, statusi) {
    return [...(makinaPer(lloji).kalimet[statusi] || [])];
  }

  function shenoNeHistori(lloji, id, statusi_i_vjeter, statusi_i_ri, zyrtar_id, shenimi) {
    return koleksion('historia_e_statuseve').shto({
      objekti: { lloji, id },
      statusi_i_vjeter,
      statusi_i_ri,
      koha: new Date().toISOString(),
      zyrtar_id,
      shenimi
    });
  }

  /** Krijon objektin me statusin fillestar dhe shënon hapin e parë në histori. */
  function krijo(lloji, objekti, { shenimi = '' } = {}) {
    const makina = makinaPer(lloji);
    const iRi = koleksion(makina.koleksioni).shto({ ...objekti, statusi: makina.fillestar });
    const aktori = aktual();
    shenoNeHistori(lloji, iRi.id, null, makina.fillestar, aktori ? aktori.id : null, shenimi);
    return iRi;
  }

  /** Kalon objektin në statusin e ri, nëse kalimi lejohet. Hedh Error përndryshe. */
  function ndryshoStatusin(lloji, id, statusiIRi, { shenimi = '', zyrtar_id = null } = {}) {
    const makina = makinaPer(lloji);
    const kol = koleksion(makina.koleksioni);
    const objekti = kol.gjej(id);
    if (!objekti) throw new Error(`${makina.emertimi} nuk u gjet.`);

    if (!mundTeKaloje(lloji, objekti.statusi, statusiIRi)) {
      throw new Error(
        `Kalimi nga "${etiketa(lloji, objekti.statusi)}" në "${etiketa(lloji, statusiIRi)}" nuk lejohet.`
      );
    }

    const aktori = zyrtar_id || (aktual() ? aktual().id : null);
    const iPerditesuar = kol.perditeso(id, { statusi: statusiIRi, perditesuar: new Date().toISOString() });
    shenoNeHistori(lloji, id, objekti.statusi, statusiIRi, aktori, shenimi);

    if (objekti.user_id && objekti.user_id !== aktori) {
      const emri = objekti.kodi_gjurmimit || objekti.titulli || '';
      njofto(
        objekti.user_id,
        `${makina.emertimi} ${emri}: statusi tani është "${etiketa(lloji, statusiIRi)}".`.replace(/\s+/g, ' ')
      );
    }
    return iPerditesuar;
  }

  function historia(lloji, id) {
    return koleksion('historia_e_statuseve')
      .filtro((h) => h.objekti.lloji === lloji && h.objekti.id === id)
      .sort((a, b) => a.koha.localeCompare(b.koha));
  }

  /* ==========================================================
     8. Kodi i gjurmimit: KI-2026-000123
     ========================================================== */

  const RE_KODI = /^KI-\d{4}-\d{6}$/;

  function gjeneroKodin(viti = new Date().getFullYear()) {
    const numeruesit = lexo('numeruesit', {});
    const celesi = `lende_${viti}`;
    const numri = (numeruesit[celesi] || 0) + 1;
    numeruesit[celesi] = numri;
    shkruaj('numeruesit', numeruesit);
    return `KI-${viti}-${String(numri).padStart(6, '0')}`;
  }

  const kodiIVlefshem = (kodi) => RE_KODI.test(String(kodi || '').trim().toUpperCase());

  /* ==========================================================
     9. Formatimi dhe validimi
     ========================================================== */

  const formatuesit = {};
  function formatuesi(decimale) {
    if (!formatuesit[decimale]) {
      formatuesit[decimale] = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimale,
        maximumFractionDigits: decimale
      });
    }
    return formatuesit[decimale];
  }

  const dyShifra = (n) => String(n).padStart(2, '0');
  const neDate = (vlera) => (vlera instanceof Date ? vlera : new Date(vlera));
  const filliminEDites = (vlera) => {
    const d = neDate(vlera);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const format = {
    /** 12500 → "12.500 €" */
    euro: (shuma, decimale = 0) => `${formatuesi(decimale).format(Number(shuma) || 0)} €`,

    /** 12500 → "12.500" */
    numer: (numri, decimale = 0) => formatuesi(decimale).format(Number(numri) || 0),

    /** 0.4017 → "40,2%" */
    perqindje: (pjesa, decimale = 1) => `${formatuesi(decimale).format((Number(pjesa) || 0) * 100)}%`,

    /** Date → "dd.mm.yyyy" */
    data(vlera) {
      const d = neDate(vlera);
      return `${dyShifra(d.getDate())}.${dyShifra(d.getMonth() + 1)}.${d.getFullYear()}`;
    },

    /** Date → "dd.mm.yyyy HH:MM" */
    dataOra(vlera) {
      const d = neDate(vlera);
      return `${format.data(d)} ${dyShifra(d.getHours())}:${dyShifra(d.getMinutes())}`;
    },

    /** Ditët kalendarike nga a te b (negative nëse b është para a). */
    diteMes: (a, b) => Math.round((filliminEDites(b) - filliminEDites(a)) / 86400000),

    /** Shton n ditë pune (pa të shtunë dhe të diel). */
    shtoDitePune(vlera, n) {
      const d = filliminEDites(vlera);
      let mbeten = n;
      while (mbeten > 0) {
        d.setDate(d.getDate() + 1);
        const dita = d.getDay();
        if (dita !== 0 && dita !== 6) mbeten--;
      }
      return d;
    },

    eshteFundjave: (vlera) => [0, 6].includes(neDate(vlera).getDay()),

    /** "Kërkesë  për Çerdhe" → "kerkese per cerdhe" (për kërkim pa dallim ë/e, ç/c) */
    normalizo: (teksti) =>
      String(teksti || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
  };

  const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const RE_TELEFONI = /^(\+383|0)\s?4[3-9]\s?\d{3}\s?\d{3}$/;

  /** Çdo rregull kthen '' kur vlera është në rregull, ose mesazhin e gabimit. */
  const validimi = {
    RE_EMAIL,
    RE_TELEFONI,
    RE_KODI,
    emri: (vlera) =>
      String(vlera || '').trim().length >= 3 ? '' : 'Emri duhet të ketë së paku 3 shkronja.',
    email: (vlera) =>
      RE_EMAIL.test(String(vlera || '').trim()) ? '' : 'Shkruaj një email valid, p.sh. emri@shembull.com.',
    telefoni: (vlera) =>
      RE_TELEFONI.test(String(vlera || '').trim()) ? '' : 'Shkruaj numrin si +383 4x xxx xxx.',
    fjalekalimi: (vlera) =>
      /^(?=.*\d).{8,}$/.test(String(vlera || ''))
        ? ''
        : 'Fjalëkalimi duhet të ketë së paku 8 karaktere dhe një numër.',
    kodi: (vlera) => (kodiIVlefshem(vlera) ? '' : 'Kodi duhet të jetë si KI-2026-000123.')
  };

  /* ==========================================================
     10. Nisja (seed), sinkronizimi mes tab-eve dhe rivendosja
     ========================================================== */

  function njoftoNdryshimin(celesi, ngaTabTjeter = false) {
    global.dispatchEvent(new CustomEvent('ki:ndryshim', { detail: { celesi, ngaTabTjeter } }));
  }

  // Kur një tab tjetër ndryshon localStorage (p.sh. ekrani i radhës), njofto këtë faqe.
  global.addEventListener('storage', (ngjarja) => {
    if (ngjarja.key && ngjarja.key.startsWith(PREFIKSI)) {
      njoftoNdryshimin(ngjarja.key.slice(PREFIKSI.length), true);
    }
  });

  async function mbushTeDhenatFillestare() {
    if (!localStorageIDisponueshem()) {
      throw new Error('Browser-i nuk lejon localStorage (p.sh. modaliteti privat i bllokuar).');
    }
    if (lexo('versioni') !== VERSIONI_I_TE_DHENAVE) {
      // Këtu shtohen migrimet kur ndryshon struktura e të dhënave.
      shkruaj('versioni', VERSIONI_I_TE_DHENAVE);
    }

    const fillestaret = [
      { koleksioni: 'perdoruesit', skedari: 'perdoruesit', fusha: 'perdoruesit' },
      { koleksioni: 'propozimet', skedari: 'propozimet', fusha: 'propozimet' }
    ];

    for (const { koleksioni, skedari, fusha } of fillestaret) {
      if (koleksion(koleksioni).numri() === 0) {
        const te_dhenat = await ngarkoJSON(skedari);
        koleksion(koleksioni).zevendeso(te_dhenat[fusha]);
      }
    }
  }

  let premtimiGati = null;

  /** Garanton që të dhënat fillestare janë në localStorage. Thirret në fillim të çdo faqeje. */
  function gati() {
    if (!premtimiGati) {
      premtimiGati = mbushTeDhenatFillestare().catch((gabim) => {
        premtimiGati = null;
        throw gabim;
      });
    }
    return premtimiGati;
  }

  /** Fshin të gjitha të dhënat e Komuna Ime nga ky browser (për demo). */
  function rivendos() {
    try {
      Object.keys(localStorage)
        .filter((celesi) => celesi.startsWith(PREFIKSI))
        .forEach((celesi) => localStorage.removeItem(celesi));
    } catch (gabim) {
      /* s'ka localStorage */
    }
    premtimiGati = null;
    njoftoNdryshimin('*');
    return gati();
  }

  /* ==========================================================
     API publike: window.KI
     ========================================================== */

  global.KI = {
    versioni: VERSIONI_I_TE_DHENAVE,
    gati,
    rivendos,
    ngarkoJSON,
    lexo,
    shkruaj,
    fshi,
    KOLEKSIONET,
    koleksion,
    llogaria: { ROLET, regjistrohu, hyr, dil, aktual, kaRol },
    njoftimet: { njofto, teMiat: njoftimetEMia, tePalexuara, shenoTeLexuara },
    makina: { MAKINAT, etiketa, mundTeKaloje, hapatEArdhshem, krijo, ndryshoStatusin, historia },
    kodi: { gjenero: gjeneroKodin, iVlefshem: kodiIVlefshem, RE_KODI },
    siguria: { sha256, hashFjalekalimi, kripe, kodVerifikimi, kaWebCrypto },
    format,
    validimi
  };
})(window);
