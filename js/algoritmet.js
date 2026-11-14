/**
 * algoritmet.js — Algoritmet e Zërit të Lagjes
 * Përgjegjës: Anëtari 4 · JavaScript vanilla
 *
 * Faza 2:
 *   [ ] Votimi me kod verifikimi: KI.siguria.kodVerifikimi() (simulim SMS-i me setTimeout)
 *   [ ] Ndarja e identitetit nga vota:
 *         identitetet_votimit → { hash_identiteti: await KI.siguria.sha256(numriPersonal + lagje_id), lagje_id, ka_votuar }
 *         votat               → { lagje_id, projektet, hash_defteses }   (pa lidhje me personin)
 *   [ ] Dëftesa: kodi që qytetari e gjen në listën publike të votave
 *   [ ] Rezultatet me metodën greedy: projektet sipas votave derisa mbaron buxheti
 * Faza 3:
 *   [ ] Method of Equal Shares dhe krahasimi me greedy
 *   [ ] Zbulimi i dublikatave: TF-IDF + ngjashmëria kosinus + distanca në hartë
 *
 * Funksionet këtu janë të pastra (pa DOM), që të testohen lehtë në Console.
 */
(function () {
  'use strict';
  window.KI.algoritmet = {};
})();
