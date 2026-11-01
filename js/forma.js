/**
 * forma.js — Validimi i formave, i përbashkët për të gjitha faqet
 * Përgjegjës: Anëtari 2 · JavaScript vanilla
 *
 * Validimi bëhet gjatë shkrimit (input, blur) dhe para dërgimit (submit).
 * Gabimi shfaqet nën fushë dhe lidhet me aria-describedby.
 *
 * Përdorimi:
 *   KI.forma.lidh(document.getElementById('forma-hyrja'), {
 *     email: (vlera) => KI.validimi.email(vlera),
 *     fjalekalimi: (vlera) => (vlera ? '' : 'Shkruaj fjalëkalimin.')
 *   }, async (teDhenat, forma) => { ... });
 *
 * Fushat identifikohen me atributin name. Çdo rregull kthen '' (në rregull)
 * ose mesazhin e gabimit. Rregulli merr edhe formën, për krahasime mes fushave.
 */
(function () {
  'use strict';

  function elementiIGabimit(fusha) {
    const id = `${fusha.id || fusha.name}-gabim`;
    let elementi = document.getElementById(id);
    if (!elementi) {
      elementi = document.createElement('p');
      elementi.id = id;
      elementi.className = 'fusha__gabim';
      const mbajtesi = fusha.closest('.fusha') || fusha.parentElement;
      mbajtesi.appendChild(elementi);
    }
    return elementi;
  }

  function lidhPershkrimin(fusha, id, shto) {
    const idte = new Set((fusha.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
    if (shto) idte.add(id);
    else idte.delete(id);
    if (idte.size) fusha.setAttribute('aria-describedby', [...idte].join(' '));
    else fusha.removeAttribute('aria-describedby');
  }

  function shfaqGabimin(fusha, mesazhi) {
    const elementi = elementiIGabimit(fusha);
    elementi.textContent = mesazhi;
    fusha.setAttribute('aria-invalid', 'true');
    lidhPershkrimin(fusha, elementi.id, true);
  }

  function pastroGabimin(fusha) {
    const elementi = document.getElementById(`${fusha.id || fusha.name}-gabim`);
    if (elementi) {
      elementi.textContent = '';
      lidhPershkrimin(fusha, elementi.id, false);
    }
    fusha.removeAttribute('aria-invalid');
  }

  function vleraEFushes(forma, emri) {
    const fushat = forma.elements[emri];
    if (!fushat) return '';
    // Grup radio/checkbox
    if (fushat instanceof RadioNodeList) {
      const teZgjedhurat = [...fushat].filter((f) => f.checked).map((f) => f.value);
      return fushat[0] && fushat[0].type === 'checkbox' ? teZgjedhurat : teZgjedhurat[0] || '';
    }
    if (fushat.type === 'checkbox') return fushat.checked;
    if (fushat.type === 'file') return fushat.files;
    return fushat.value;
  }

  function fushaKryesore(forma, emri) {
    const fushat = forma.elements[emri];
    return fushat instanceof RadioNodeList ? fushat[0] : fushat;
  }

  /** Lidh validimin me një formë. Kthen funksionin që e validon të gjithë formën. */
  function lidh(forma, rregullat, kurEshteValide) {
    forma.setAttribute('novalidate', '');
    const ePrekur = new Set();

    function validoFushen(emri) {
      const fusha = fushaKryesore(forma, emri);
      if (!fusha) return true;
      const mesazhi = rregullat[emri](vleraEFushes(forma, emri), forma) || '';
      if (mesazhi) shfaqGabimin(fusha, mesazhi);
      else pastroGabimin(fusha);
      return !mesazhi;
    }

    Object.keys(rregullat).forEach((emri) => {
      const fushat = forma.elements[emri];
      if (!fushat) {
        console.warn(`[KI.forma] Fusha "${emri}" nuk ekziston në formën #${forma.id}.`);
        return;
      }
      const lista = fushat instanceof RadioNodeList ? [...fushat] : [fushat];
      lista.forEach((fusha) => {
        fusha.addEventListener('blur', () => {
          ePrekur.add(emri);
          fusha.classList.add('e-prekur');
          validoFushen(emri);
        });
        const ngjarja = ['checkbox', 'radio', 'file', 'select-one', 'date', 'time'].includes(fusha.type)
          ? 'change'
          : 'input';
        fusha.addEventListener(ngjarja, () => {
          if (ePrekur.has(emri) || ngjarja === 'change') validoFushen(emri);
        });
      });
    });

    function validoTeGjitha() {
      const teGabuarat = Object.keys(rregullat).filter((emri) => !validoFushen(emri));
      Object.keys(rregullat).forEach((emri) => ePrekur.add(emri));
      if (teGabuarat.length) {
        const ePara = fushaKryesore(forma, teGabuarat[0]);
        if (ePara) ePara.focus();
        forma.classList.remove('dridhje');
        void forma.offsetWidth; // rinis animacionin
        forma.classList.add('dridhje');
      }
      return teGabuarat.length === 0;
    }

    forma.addEventListener('submit', async (ngjarja) => {
      ngjarja.preventDefault();
      if (!validoTeGjitha()) return;
      const butoni = forma.querySelector('[type="submit"]');
      ngarkon(butoni, true);
      try {
        await kurEshteValide(new FormData(forma), forma);
      } finally {
        ngarkon(butoni, false);
      }
    });

    return validoTeGjitha;
  }

  /** Çaktivizon butonin dhe shfaq spinner-in gjatë një veprimi. */
  function ngarkon(butoni, poNgarkon) {
    if (!butoni) return;
    butoni.disabled = poNgarkon;
    butoni.classList.toggle('butoni--ngarkon', poNgarkon);
    butoni.setAttribute('aria-busy', String(poNgarkon));
  }

  window.KI.forma = { lidh, shfaqGabimin, pastroGabimin, ngarkon };
})();
