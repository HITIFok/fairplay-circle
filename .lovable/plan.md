

# 🎰 LotoConnect 2.0 – MVP Jeu Fonctionnel

## Vue d'ensemble
Application web de loterie communautaire avec sessions en temps réel, style gaming vibrant (couleurs vives, animations, confettis). Les paiements sont simulés via un système de portefeuille virtuel.

---

## 🏠 Page 1 : Accueil / Lobby
- Logo LotoConnect avec animation d'entrée
- **Jackpot progressif** affiché en grand avec compteur animé en temps réel
- Bouton "JOUER – 1 000 Ar" proéminent et animé
- Solde du portefeuille visible en permanence
- Liste des sessions en cours / à venir avec nombre de joueurs connectés
- Derniers gagnants (ticker défilant)
- Bannière "Jouez pour le plaisir, pas pour gagner votre vie"

## 🎮 Page 2 : Session de Jeu
- **Salle d'attente** : compteur de joueurs (objectif 20), timer de 20 min, animation d'attente
- Si < 20 joueurs après 20 min → message d'annulation + remboursement automatique
- **Phase de tirage** : animation immersive avec effets sonores, confettis, suspense visuel
- **Résultats** : classement Top 1-50 avec gains, mise en avant du joueur, message motivant ("Tu étais à 2 places du Top 10 !")
- Gains minimums garantis de 1 200 Ar pour chaque gagnant

## 💰 Page 3 : Portefeuille
- Solde actuel avec historique des transactions
- Boutons "Recharger" et "Retirer" (simulés pour le MVP)
- Historique : mises, gains, bonus parrainage, cashback
- Seuil de retrait affiché (≥ 10 000 Ar)

## 👥 Page 4 : Parrainage
- Lien de parrainage unique à partager
- Liste des filleuls Niveau 1 (200 Ar) et Niveau 2 (50 Ar)
- Gains totaux de parrainage
- Limite de 10 filleuls validés/jour affichée

## ⭐ Page 5 : Progression & VIP
- Barre de progression vers le prochain statut (Bronze → Argent → Or)
- Statut actuel avec avantages débloqués
- Quêtes hebdomadaires ("Parraine 2 amis → +300 Ar")
- Compteur de tickets tombola
- Option d'achat de statut VIP

## 👤 Page 6 : Profil & Paramètres
- Informations du joueur
- Vérification d'âge (+18 ans)
- Statistiques personnelles (sessions jouées, gains totaux, rang moyen)
- Outils de jeu responsable : auto-exclusion (7j / 30j / permanent), alerte dépenses
- Historique des dépenses
- Langue : Français / Malagasy

## 🔐 Authentification
- Inscription avec vérification +18 ans
- Connexion par email/mot de passe
- Crédit de bienvenue simulé pour tester le jeu

## 🎨 Design & Ambiance
- Palette gaming vibrante : dégradés violet/doré/vert néon sur fond sombre
- Animations : confettis sur victoire, compteurs animés, transitions fluides
- Icônes ludiques, typographie bold
- Responsive mobile-first

## 🔧 Backend (Supabase)
- Tables : joueurs, sessions, participations, transactions, parrainages, statuts VIP
- Logique de tirage avec algorithme de redistribution (55% gains, 10% jackpot, 5% parrainage, 3% fidélité)
- Portefeuille virtuel avec crédits simulés
- Timer de session et gestion automatique (lancement à 20 joueurs ou annulation après 20 min)

