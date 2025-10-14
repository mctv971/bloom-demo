# 🌸 Bloom Filter - Présentation Interactive

Une présentation interactive et éducative sur les **Filtres de Bloom**, structure de données probabiliste ultra-compacte.

## ✨ Fonctionnalités

- 🎮 **6 slides interactives** avec navigation fluide
- 📊 **Graphiques dynamiques** (Chart.js) pour visualiser les performances
- 🐛 **Mode debugger** avec contrôles Play/Pause/Step pour suivre l'exécution du code
- 🎨 **Visualisation en temps réel** du BitSet et des bits testés
- ⚡ **Comparaison de performances** : BloomFilter vs Set classique
- 🔍 **Détection des faux positifs** avec explications visuelles

## 🚀 Installation locale

```bash
# Cloner le repo
git clone https://github.com/VOTRE_USERNAME/bloom-demo.git
cd bloom-demo

# Installer les dépendances
pip install -r requirements.txt

# Lancer l'application
python app.py
```

Ouvrez http://localhost:5000 dans votre navigateur.

## 📚 Structure du projet

```
Bloom2/
├── app.py                 # Backend Flask
├── bloom.py               # Implémentation BitSet & BloomFilter
├── words_10000.json       # Dataset de 10,000 mots
├── templates/
│   └── index.html         # Présentation complète
├── static/
│   ├── css/
│   │   └── styles.css     # Styles personnalisés
│   └── js/
│       ├── slides.js      # Navigation des slides
│       ├── demo.js        # Démo interactive
│       ├── debugger-demo.js # Mode debugger
│       └── charts.js      # Graphiques Chart.js
└── requirements.txt       # Dépendances Python
```

## 🎯 Slides

## 📖 Concepts démontrés

- ✅ Initialisation avec calcul optimal de m et k
- ✅ Ajout d'éléments avec double hashing (SHA-256 + MD5)
- ✅ Test d'appartenance avec all()
- ✅ Visualisation du BitSet en temps réel
- ✅ Détection des faux positifs
- ✅ Comparaison de performances (temps et mémoire)

## 🔧 API Flask

| Route | Méthode | Description |
|-------|---------|-------------|
| `/` | GET | Page principale |
| `/api/init` | POST | Initialise un BloomFilter(n, p) |
| `/api/add_words` | POST | Ajoute n mots au filtre |
| `/api/test_word` | POST | Teste un mot (comparaison Bloom vs Set) |
| `/api/bitset_state` | GET | Retourne l'état du BitSet |
| `/api/stats` | GET | Statistiques mémoire |

## � Déploiement sur Render

Le projet est configuré pour un déploiement facile sur Render :

1. Créer un compte sur [Render](https://render.com)
2. Connecter votre dépôt GitHub
3. Créer un nouveau **Web Service**
4. Les fichiers `render.yaml` et `runtime.txt` configurent automatiquement :
   - Python 3.11.0
   - Installation des dépendances
   - Démarrage avec Gunicorn
   - Variables d'environnement

**Note** : Le tier gratuit a un temps de démarrage de 30-50s après 15min d'inactivité.

## 🎓 Auteur

Projet réalisé dans le cadre du M2 - S1

## 📄 Licence

MIT License - Libre d'utilisation pour fins éducatives

# Vérifier que Flask est installé
pip install Flask

# Vérifier que tous les fichiers sont présents
ls -la
```

### Les mots ne se chargent pas
- Vérifier que `words_10000.json` existe
- Vérifier la structure JSON (doit contenir `"words": [...]`)

### L'API ne répond pas
- Vérifier la console du navigateur (F12)
- Vérifier les logs Flask dans le terminal

## 📄 Licence

Projet éducatif - Libre d'utilisation pour l'enseignement

## 👨‍💻 Auteur

Présentation interactive pour démonstration du filtre de Bloom
