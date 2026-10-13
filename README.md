# Restaurant 3Z, maquette du site

Maquette statique (HTML, CSS, JavaScript natif) du site du Restaurant 3Z, 18, avenue Roi Baudouin, Gombe, Kinshasa. Elle sert à obtenir la validation visuelle du client avant le développement WordPress.

## Voir le site en local

Sans rien installer : ouvrir `index.html` dans un navigateur (double-clic).

Avec un petit serveur local (recommandé, comportement identique à la mise en ligne) :

```bash
cd restaurant3z
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Fichiers

```
index.html          Accueil : ouverture, la maison, extrait de la carte, galerie, infos pratiques, réservation, contact
carte.html          Carte complète par catégories
mentions.html       Mentions légales (provisoires)
css/style.css       Variables (palette, typo, espacements) puis composants et sections
js/script.js        Menu mobile, animation d'entrée, apparitions, visionneuse, validation de la réservation et envoi sur WhatsApp
assets/fonts/       Fraunces et Work Sans (woff2 locaux, licence SIL OFL)
assets/favicon.svg  Monogramme 3Z
images/             Dossier pour les photos du restaurant (salle, plats, façade)
```

## Direction artistique : « La table du soir à Gombe »

| Nom | Hex | Rôle |
|---|---|---|
| Ébène | `#17130F` | Sections du soir, texte sur fond clair |
| Ivoire pierre | `#EEE8DE` | Fond clair, texte sur fond sombre |
| Kola | `#5B1F24` | Réservation |
| Laiton | `#C4A46C` | Filets, détails, bouton principal, focus |
| Feuille de manioc | `#2E4A3B` | La carte |

Polices : Fraunces (titres), Work Sans (texte). Signature : le filet de laiton à trois « Z », tracé à l'ouverture de l'accueil. Un seul moment de mouvement (le filet se trace, la photo s'éclaircit), désactivé si le visiteur demande moins d'animations.

## Réservations et contact

Tous les boutons et liens « Réserver » et « Contact » ouvrent WhatsApp au +243 844 122 084 avec un message pré-rempli. Le formulaire de réservation envoie aussi sa demande détaillée sur ce numéro (réglage `RESERVATION.whatsapp` dans `js/script.js`).

## Informations à confirmer auprès du client

- Horaires complets : fermeture du dimanche, heure de dernière réservation.
- Type de cuisine et carte réelle avec prix. La carte actuelle est un **exemple** ; tous les prix affichent « Prix à confirmer ».
- Histoire de la maison, nom du chef, signification de « 3Z ».
- Logo et couleurs existants, s'il y en a (le monogramme 3Z est une proposition).
- Photos réelles de la salle, des plats et de la façade. Toutes les photos actuelles sont provisoires ([licence Unsplash](https://unsplash.com/license)) et chargées depuis le CDN d'Unsplash, qui les recadre et les compresse à la volée (WebP ou AVIF selon le navigateur, plusieurs tailles via `srcset`). Une connexion Internet est donc nécessaire pour les voir. Les vraies photos seront optimisées et hébergées avec le site.
- Réseaux sociaux.
- Événements, privatisation, traiteur : la section existe dans `index.html` avec l'attribut `hidden`.
- Accessibilité et parking (trouvés sur une fiche publique, à vérifier).
- Moyens de paiement, informations légales pour `mentions.html`.

Sources consultées : [booked.ai](https://booked.ai/restaurants/restaurant-3z) (adresse, horaires, gamme de prix, ambiance), [Yandex Maps](https://yandex.com/maps/org/128990790190/) (adresse).

## Préparation de la conversion WordPress (phase suivante)

Le code est organisé pour correspondre à un thème bloc (voir le skill du projet `wordpress-pro-design`) :

| Maquette | WordPress |
|---|---|
| Variables `:root` de `style.css` | Presets de `theme.json` (palette, fontFamilies avec `fontFace` local, fontSizes, spacingSizes) |
| `<header class="entete">` / `<footer class="pied">` | `parts/header.html`, `parts/footer.html` |
| Sections de l'accueil (`.ouverture`, `.maison`, `.carte`, `.galerie`, `.reservation`, `.contact`) | Un motif chacune dans `patterns/`, assemblés dans `templates/front-page.html` |
| Sections sombres (Ébène, Kola, Feuille de manioc) | Variations de section (`styles/sections/*.json`) |
| Ligne `.plat` (nom, points, prix, description) | Type de contenu « Plat » ou motif de carte modifiable dans l'éditeur |
| Galerie `.mosaique` | Bloc Galerie natif + style de bloc |
| Formulaire de réservation (envoi par WhatsApp pré-rempli) | Même script, numéro WhatsApp en réglage modifiable par le client |
| Réglages `HORAIRES` de `script.js` | Options du thème ou réglages du site, modifiables par le client |
| Section « Événements » masquée | Motif à insérer si le client propose des événements |
