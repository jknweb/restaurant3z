/* Restaurant 3Z — interactions de la maquette (JavaScript natif, sans dépendance).
   Chaque module est indépendant et ne s'exécute que si ses éléments existent. */
(function () {
  'use strict';

  var reduitMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Réglages du restaurant : à confirmer avec le client, puis à rendre
     administrables (options du thème WordPress). */
  var HORAIRES = {
    ouverture: '12:00',
    derniereReservation: '22:30',
    pasMinutes: 30,
    couvertsMax: 12,
    joursAvance: 90
  };

  /* Envoi des réservations par WhatsApp.
     Numéro du restaurant au format international, chiffres seulement
     (exemple : '243812345678'). À confirmer avec le client. Tant qu'il est vide,
     WhatsApp s'ouvre avec le message prêt et le visiteur choisit le destinataire. */
  var RESERVATION = {
    whatsapp: '243844122084'
  };

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    var bouton = document.querySelector('.bascule-menu');
    var nav = document.getElementById('navigation');
    if (!bouton || !nav) return;

    function fermer(rendreFocus) {
      bouton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('est-ouverte');
      document.body.classList.remove('menu-ouvert');
      if (rendreFocus) bouton.focus();
    }

    bouton.addEventListener('click', function () {
      var ouvert = bouton.getAttribute('aria-expanded') === 'true';
      if (ouvert) { fermer(false); return; }
      bouton.setAttribute('aria-expanded', 'true');
      nav.classList.add('est-ouverte');
      document.body.classList.add('menu-ouvert');
      var premier = nav.querySelector('a');
      if (premier) premier.focus();
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) fermer(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('est-ouverte')) fermer(true);
    });

    window.matchMedia('(min-width: 56.01rem)').addEventListener('change', function (m) {
      if (m.matches) fermer(false);
    });
  }

  /* ---------- Horaires du jour dans l'en-tête ---------- */
  function initHorairesJour() {
    var cible = document.querySelector('[data-horaires-jour]');
    if (!cible) return;
    var jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    var j = new Date().getDay();
    if (j === 0) {
      cible.innerHTML = 'Aujourd’hui dimanche, <strong>dès 12 h</strong>';
    } else {
      cible.innerHTML = 'Aujourd’hui ' + jours[j].toLowerCase() + ', <strong>12 h à 23 h 30</strong>';
    }
  }

  /* ---------- Entrée de la page et apparitions au défilement ---------- */
  function initMouvement() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { document.body.classList.add('est-pret'); });
    });

    var elements = document.querySelectorAll('.apparait');
    if (!elements.length) return;
    if (reduitMouvement || !('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('est-visible'); });
      return;
    }
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add('est-visible');
          observateur.unobserve(entree.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    elements.forEach(function (el) { observateur.observe(el); });
  }

  /* ---------- Lien actif selon la section visible ---------- */
  function initLienActif(selecteurLiens) {
    var liens = Array.prototype.slice.call(document.querySelectorAll(selecteurLiens));
    if (!liens.length || !('IntersectionObserver' in window)) return;
    var parId = {};
    liens.forEach(function (lien) {
      var id = (lien.getAttribute('href') || '').split('#')[1];
      var section = id && document.getElementById(id);
      if (section) parId[id] = { lien: lien, section: section };
    });
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) return;
        liens.forEach(function (l) { l.classList.remove('est-active'); });
        parId[entree.target.id].lien.classList.add('est-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(parId).forEach(function (id) { observateur.observe(parId[id].section); });
  }

  /* ---------- Galerie et visionneuse ---------- */
  function initGalerie() {
    var galerie = document.querySelector('[data-galerie]');
    var dialogue = document.getElementById('visionneuse');
    if (!galerie || !dialogue || typeof dialogue.showModal !== 'function') return;

    var boutons = Array.prototype.slice.call(galerie.querySelectorAll('.mosaique__bouton'));
    var image = dialogue.querySelector('[data-visionneuse-image]');
    var legende = dialogue.querySelector('[data-visionneuse-legende]');
    var index = 0;
    var declencheur = null;

    function afficher(i) {
      index = (i + boutons.length) % boutons.length;
      var b = boutons[index];
      var vignette = b.querySelector('img');
      image.src = b.getAttribute('data-grande');
      image.alt = vignette ? vignette.alt : '';
      legende.textContent = b.getAttribute('data-legende') + ' (' + (index + 1) + ' sur ' + boutons.length + ')';
    }

    boutons.forEach(function (b, i) {
      b.setAttribute('aria-label', 'Agrandir : ' + b.getAttribute('data-legende'));
      b.addEventListener('click', function () {
        declencheur = b;
        afficher(i);
        dialogue.showModal();
      });
    });

    dialogue.addEventListener('click', function (e) {
      var action = e.target.getAttribute('data-visionneuse');
      if (action === 'precedente') afficher(index - 1);
      else if (action === 'suivante') afficher(index + 1);
      else if (action === 'fermer' || e.target === dialogue) dialogue.close();
    });

    dialogue.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') afficher(index - 1);
      if (e.key === 'ArrowRight') afficher(index + 1);
    });

    dialogue.addEventListener('close', function () {
      if (declencheur) declencheur.focus();
    });
  }

  /* ---------- Formulaire de réservation (démonstration) ---------- */
  function minutes(hhmm) {
    var p = hhmm.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }
  function hhmm(total) {
    var h = Math.floor(total / 60);
    var m = total % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function libelleHeure(valeur) {
    var p = valeur.split(':');
    return parseInt(p[0], 10) + ' h' + (p[1] === '00' ? '' : ' ' + p[1]);
  }
  function dateIso(d) {
    var m = d.getMonth() + 1;
    var j = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (j < 10 ? '0' : '') + j;
  }

  function initReservation() {
    var form = document.getElementById('formulaire-reservation');
    var confirmation = document.getElementById('confirmation-reservation');
    if (!form || !confirmation) return;

    var champDate = form.elements.date;
    var champHeure = form.elements.heure;
    var champCouverts = form.elements.couverts;

    // Bornes de dates
    var aujourdhui = new Date();
    var limite = new Date();
    limite.setDate(limite.getDate() + HORAIRES.joursAvance);
    champDate.min = dateIso(aujourdhui);
    champDate.max = dateIso(limite);

    // Créneaux horaires
    for (var t = minutes(HORAIRES.ouverture); t <= minutes(HORAIRES.derniereReservation); t += HORAIRES.pasMinutes) {
      var opt = document.createElement('option');
      opt.value = hhmm(t);
      opt.textContent = libelleHeure(hhmm(t));
      champHeure.appendChild(opt);
    }

    // Nombre de couverts
    for (var n = 1; n <= HORAIRES.couvertsMax; n++) {
      var o = document.createElement('option');
      o.value = String(n);
      o.textContent = n + (n === 1 ? ' personne' : ' personnes');
      champCouverts.appendChild(o);
    }
    var groupe = document.createElement('option');
    groupe.value = 'groupe';
    groupe.textContent = 'Plus de ' + HORAIRES.couvertsMax + ' (groupe)';
    champCouverts.appendChild(groupe);

    var regles = {
      date: function (v) {
        if (!v) return 'Choisissez une date.';
        if (v < champDate.min) return 'Cette date est passée.';
        if (v > champDate.max) return 'Les réservations sont ouvertes jusqu’à ' + HORAIRES.joursAvance + ' jours à l’avance.';
        if (v === dateIso(new Date()) && champHeure.value) {
          var maintenant = new Date();
          if (minutes(champHeure.value) <= maintenant.getHours() * 60 + maintenant.getMinutes() + 30) {
            return 'Pour aujourd’hui, choisissez un créneau au moins 30 minutes plus tard.';
          }
        }
        return '';
      },
      heure: function (v) { return v ? '' : 'Choisissez une heure.'; },
      couverts: function (v) { return v ? '' : 'Indiquez le nombre de personnes.'; },
      nom: function (v) { return v.trim().length >= 2 ? '' : 'Indiquez votre nom.'; },
      telephone: function (v) {
        var chiffres = v.replace(/[^\d]/g, '');
        if (!v.trim()) return 'Indiquez un numéro de téléphone.';
        if (!/^[+\d][\d\s.\-()]*$/.test(v.trim()) || chiffres.length < 9 || chiffres.length > 15) {
          return 'Ce numéro ne semble pas valide. Exemple : +243 81 234 5678.';
        }
        return '';
      },
      courriel: function (v) {
        if (!v.trim()) return '';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Cette adresse courriel ne semble pas valide.';
      }
    };

    function verifier(nom) {
      var champ = form.elements[nom];
      var message = regles[nom](champ.value);
      var conteneur = champ.closest('.champ');
      var erreur = document.getElementById('err-' + (nom === 'telephone' ? 'tel' : nom));
      conteneur.classList.toggle('est-invalide', !!message);
      champ.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (erreur) erreur.textContent = message;
      return !message;
    }

    Object.keys(regles).forEach(function (nom) {
      var champ = form.elements[nom];
      champ.addEventListener('blur', function () { if (champ.value) verifier(nom); });
      champ.addEventListener('change', function () {
        if (champ.closest('.champ').classList.contains('est-invalide')) verifier(nom);
      });
    });
    champHeure.addEventListener('change', function () { if (champDate.value) verifier('date'); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var premierInvalide = null;
      Object.keys(regles).forEach(function (nom) {
        if (!verifier(nom) && !premierInvalide) premierInvalide = form.elements[nom];
      });
      if (premierInvalide) { premierInvalide.focus(); return; }

      var date = new Date(champDate.value + 'T12:00:00');
      var dateLisible = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      var lignes = [
        ['Date', dateLisible],
        ['Heure', libelleHeure(champHeure.value)],
        ['Couverts', champCouverts.options[champCouverts.selectedIndex].textContent],
        ['Nom', form.elements.nom.value.trim()],
        ['Téléphone', form.elements.telephone.value.trim()]
      ];
      if (form.elements.courriel.value.trim()) lignes.push(['Courriel', form.elements.courriel.value.trim()]);
      if (form.elements.demande.value.trim()) lignes.push(['Demande', form.elements.demande.value.trim()]);

      var recap = confirmation.querySelector('[data-recapitulatif]');
      recap.innerHTML = '';
      lignes.forEach(function (l) {
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = l[0];
        dd.textContent = l[1];
        recap.appendChild(dt);
        recap.appendChild(dd);
      });

      // Message WhatsApp pré-rempli
      var message = 'Bonjour, je souhaite réserver une table au Restaurant 3Z.\n\n' +
        lignes.map(function (l) { return l[0] + ' : ' + l[1]; }).join('\n') +
        '\n\nMerci de me confirmer la réservation.';
      var numero = RESERVATION.whatsapp.replace(/[^\d]/g, '');
      var url = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(message);
      confirmation.querySelector('[data-lien-whatsapp]').href = url;
      window.open(url, '_blank', 'noopener');

      form.hidden = true;
      confirmation.hidden = false;
      confirmation.focus();
    });

    confirmation.querySelector('[data-nouvelle-demande]').addEventListener('click', function () {
      form.reset();
      form.querySelectorAll('.est-invalide').forEach(function (c) { c.classList.remove('est-invalide'); });
      form.querySelectorAll('.champ__erreur').forEach(function (p) { p.textContent = ''; });
      confirmation.hidden = true;
      form.hidden = false;
      champDate.focus();
    });
  }

  /* ---------- Profondeur de l'ouverture au mouvement de la souris ---------- */
  function initProfondeur() {
    var section = document.querySelector('[data-ouverture]');
    if (!section || reduitMouvement || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var attente = false;
    section.addEventListener('pointermove', function (e) {
      if (attente) return;
      attente = true;
      requestAnimationFrame(function () {
        var r = section.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        section.style.setProperty('--px', x.toFixed(3));
        section.style.setProperty('--py', y.toFixed(3));
        attente = false;
      });
    });
    section.addEventListener('pointerleave', function () {
      section.style.setProperty('--px', 0);
      section.style.setProperty('--py', 0);
    });
  }

  /* ---------- Année du pied de page ---------- */
  function initAnnee() {
    document.querySelectorAll('[data-annee]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  initMenu();
  initHorairesJour();
  initMouvement();
  initProfondeur();
  initLienActif('.navigation__lien');
  initLienActif('.sommaire-carte a');
  initGalerie();
  initReservation();
  initAnnee();
})();
