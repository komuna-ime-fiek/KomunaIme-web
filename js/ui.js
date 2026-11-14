/**
 * ui.js — Pjesët e përbashkëta të ndërfaqes në çdo faqe
 * Përgjegjës: Anëtari 1 · jQuery 3
 *
 *   1. Toast-et (mesazhet e suksesit dhe të gabimit)   → KI.ui.toast()
 *   2. Menyja hamburger në telefon (slideToggle)
 *   3. Zona e llogarisë në header dhe lidhjet sipas rolit
 *   4. Mbrojtja e faqeve sipas rolit (<body data-mbrojtur="zyrtar drejtues">)
 *   5. Pyetjet e shpeshta (accordion)
 *   6. Butoni "Rivendos të dhënat demo"
 *   7. Mesazhi kur të dhënat nuk ngarkohen (p.sh. pa Live Server)
 */
(function ($) {
  'use strict';

  if (!$) {
    console.error('[KI] jQuery nuk u ngarkua. Kontrollo lidhjen me internetin ose js/vendor/.');
    return;
  }

  /* ---------- 1. Toast-et ---------- */

  function kontejneriIToasteve() {
    let $kontejneri = $('#toasts');
    if (!$kontejneri.length) {
      $kontejneri = $('<div id="toasts" class="toasts" role="status" aria-live="polite"></div>').appendTo('body');
    }
    return $kontejneri;
  }

  /**
   * @param {string} mesazhi
   * @param {'info'|'sukses'|'gabim'|'paralajmerim'} lloji
   */
  function toast(mesazhi, lloji = 'info') {
    const $toast = $('<div class="toast"></div>').addClass(`toast--${lloji}`).text(mesazhi);
    $toast
      .appendTo(kontejneriIToasteve())
      .hide()
      .fadeIn(200)
      .delay(3000)
      .fadeOut(400, () => $toast.remove());
  }

  window.KI.ui = { toast };

  /* ---------- 2. Menyja hamburger ---------- */

  function lidhMenyne() {
    const $butoni = $('.menu-butoni');
    const $menuja = $('#menuja');
    const $koka = $('.koka');

    function vendos(eHapur) {
      $butoni.attr('aria-expanded', String(eHapur));
      $butoni.find('.sr-only').text(eHapur ? 'Mbyll menynë' : 'Hap menynë');
      $koka.toggleClass('koka--hapur', eHapur);
    }

    $butoni.on('click', function () {
      const eHapur = $butoni.attr('aria-expanded') === 'true';
      vendos(!eHapur);
      $menuja.stop(true, true).slideToggle(200);
    });

    $(document).on('keydown', (ngjarja) => {
      if (ngjarja.key === 'Escape' && $butoni.attr('aria-expanded') === 'true') {
        vendos(false);
        $menuja.stop(true, true).slideUp(200);
        $butoni.trigger('focus');
      }
    });

    // Kur ekrani zgjerohet në tablet/desktop, hiq stilin që la slideToggle.
    const desktopi = window.matchMedia('(min-width: 768px)');
    desktopi.addEventListener('change', (ngjarja) => {
      if (ngjarja.matches) {
        $menuja.removeAttr('style');
        vendos(false);
      }
    });
  }

  /* ---------- 3. Zona e llogarisë ---------- */

  function vizatoLlogarine() {
    const perdoruesi = KI.llogaria.aktual();
    const $zona = $('#llogaria').empty();

    if (!perdoruesi) {
      $zona.append('<a class="butoni butoni--dyte butoni--vogel" href="hyrja.html">Hyr</a>');
    } else {
      const paLexuara = KI.njoftimet.tePalexuara().length;
      const $lidhja = $('<a class="llogaria__lidhja" href="hyrja.html"></a>')
        .append($('<span class="llogaria__emri"></span>').text(perdoruesi.emri))
        .attr('title', `${KI.llogaria.ROLET[perdoruesi.roli]} · Llogaria ime`);

      if (paLexuara > 0) {
        $lidhja.append(
          $('<span class="distinktivi"></span>')
            .text(paLexuara)
            .attr('aria-label', `${paLexuara} njoftime të palexuara`)
        );
      }
      $zona.append($lidhja, '<button type="button" class="butoni butoni--teksti butoni--vogel" data-dil>Dil</button>');
    }

    // Lidhjet që shfaqen vetëm për rolet e caktuara: <li data-shfaq-per="zyrtar drejtues">
    $('[data-shfaq-per]').each(function () {
      const rolet = String($(this).data('shfaqPer')).split(' ');
      $(this).prop('hidden', !(perdoruesi && rolet.includes(perdoruesi.roli)));
    });
  }

  /* ---------- 4. Mbrojtja e faqeve sipas rolit ---------- */

  function kontrolloQasjen() {
    const kerkesa = $('body').data('mbrojtur');
    if (!kerkesa) return true;

    const rolet = String(kerkesa).split(' ');
    if (KI.llogaria.kaRol(...rolet)) {
      $('body').addClass('e-lejuar');
      return true;
    }
    const faqja = location.pathname.split('/').pop() || 'index.html';
    location.replace(`hyrja.html?kthehu=${encodeURIComponent(faqja)}&arsyeja=rol`);
    return false;
  }

  /* ---------- 5. Pyetjet e shpeshta ---------- */

  function lidhPyetjet() {
    $('.pyetja__butoni').on('click', function () {
      const $butoni = $(this);
      const eHapur = $butoni.attr('aria-expanded') === 'true';
      $butoni.attr('aria-expanded', String(!eHapur));
      $(`#${$butoni.attr('aria-controls')}`).stop(true, true).slideToggle(200);
    });
  }

  /* ---------- 6. Rivendosja e të dhënave demo ---------- */

  function lidhRivendosjen() {
    $(document).on('click', '[data-rivendos]', function () {
      const $butoni = $(this);
      if (!$butoni.hasClass('konfirmo')) {
        $butoni.addClass('konfirmo').data('teksti', $butoni.text()).text('Kliko sërish për ta konfirmuar');
        setTimeout(() => $butoni.removeClass('konfirmo').text($butoni.data('teksti')), 4000);
        return;
      }
      KI.rivendos().then(() => {
        toast('Të dhënat demo u rivendosën.', 'sukses');
        setTimeout(() => location.reload(), 800);
      });
    });
  }

  /* ---------- 7. Gabimi i ngarkimit ---------- */

  function shfaqGabiminENgarkimit(gabim) {
    console.error('[KI] Të dhënat nuk u ngarkuan:', gabim);
    const ngaSkedari = location.protocol === 'file:';
    const mesazhi = ngaSkedari
      ? 'Faqja u hap direkt nga skedari, prandaj të dhënat nuk ngarkohen. Hape projektin me Live Server në VS Code.'
      : `Të dhënat nuk u ngarkuan: ${gabim.message}`;
    $('<div class="njoftim-sistemi" role="alert"></div>').text(mesazhi).insertAfter('.koka');
  }

  /* ---------- Nisja ---------- */

  $(function () {
    lidhMenyne();
    lidhPyetjet();
    lidhRivendosjen();
    $('[data-viti]').text(new Date().getFullYear());

    $(document).on('click', '[data-dil]', () => {
      KI.llogaria.dil();
      toast('Dole nga llogaria.', 'sukses');
      vizatoLlogarine();
      kontrolloQasjen();
    });

    window.addEventListener('ki:ndryshim', (ngjarja) => {
      const celesi = ngjarja.detail.celesi;
      if (['sesioni', 'njoftimet', 'perdoruesit', '*'].includes(celesi)) vizatoLlogarine();
      if (celesi === 'sesioni' && ngjarja.detail.ngaTabTjeter) kontrolloQasjen();
    });

    KI.gati()
      .then(() => {
        if (kontrolloQasjen()) vizatoLlogarine();
      })
      .catch(shfaqGabiminENgarkimit);
  });
})(window.jQuery);
