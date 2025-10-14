# 🌸 Filtre de Bloom - Présentation Interactive

Une présentation interactive sans scroll (type PowerPoint dynamique) démontrant le fonctionnement d'un filtre de Bloom avec Flask et JavaScript.

## 🚀 Installation

### Prérequis
- Python 3.8+
- pip

### Étapes

1. **Installer les dépendances Python :**
   ```bash
   pip install -r requirements.txt
   ```

2. **Vérifier la structure des fichiers :**
   ```
   Bloom2/
   ├── app.py
   ├── bloom.py
   ├── words_10000.json
   ├── requirements.txt
   ├── templates/
   │   └── index.html
   └── static/
       ├── css/
       │   └── styles.css
       └── js/
           ├── slides.js
           └── demo.js
   ```

3. **Lancer l'application :**
   ```bash
   python app.py
   ```

4. **Ouvrir dans le navigateur :**
   ```
   http://localhost:5000
   ```

## 🎮 Navigation

- **Flèches ← →** : Naviguer entre les slides
- **Boutons en bas** : Navigation visuelle
- **Slide 3** : Sliders interactifs pour calculer les paramètres
- **Slide 5** : Démo interactive complète

## 📊 Les 6 Slides

### Slide 1 : Introduction
- Objectif du filtre de Bloom
- Avantages et inconvénients
- Applications réelles
- Schéma de principe

### Slide 2 : Fonctionnement
- Processus d'ajout d'éléments
- Processus de recherche
- Visualisation du BitSet
- Code Python

### Slide 3 : Formules et Probabilités
- Formules mathématiques (m, k, P(fp))
- **Calculateur interactif** avec sliders
- Calcul en temps réel des paramètres

### Slide 4 : Analyse Mémoire
- Comparaison HashSet vs BloomFilter
- Tableau comparatif
- Graphique de gain mémoire
- Exemple concret (1 milliard d'URLs)

### Slide 5 : Démonstration Interactive 🎯
Interface complète avec 3 étapes :

1. **Initialiser le filtre**
   - Définir capacité (n)
   - Définir taux d'erreur (p)
   - Voir les paramètres calculés (m, k)

2. **Ajouter des mots**
   - Charger n mots depuis words_10000.json
   - Comparer temps Bloom vs Set
   - Visualiser le BitSet

3. **Tester un mot**
   - Entrer un mot
   - Voir le résultat (présent/absent)
   - Détecter les faux positifs
   - Comparer les temps de recherche
   - Visualiser les indices de hash

### Slide 6 : Conclusion
- Résumé des points clés
- Quand utiliser un filtre de Bloom
- Quand l'éviter
- Variantes avancées

## 🎨 Caractéristiques Visuelles

- ✅ **Pas de scroll** - Chaque slide occupe 100vw × 100vh
- ✅ **Transitions fluides** - Animations CSS
- ✅ **Fonds colorés** - Gradient différent par slide
- ✅ **Responsive** - Adaptation mobile/tablette
- ✅ **Glassmorphism** - Effets de flou modernes
- ✅ **Animations** - FadeIn, Pulse, etc.

## 🔧 API Flask

| Route | Méthode | Description |
|-------|---------|-------------|
| `/` | GET | Page principale |
| `/api/init` | POST | Initialise un BloomFilter(n, p) |
| `/api/add_words` | POST | Ajoute n mots au filtre |
| `/api/test_word` | POST | Teste un mot (comparaison Bloom vs Set) |
| `/api/bitset_state` | GET | Retourne l'état du BitSet |
| `/api/stats` | GET | Statistiques mémoire |

## 📝 Exemple d'utilisation de l'API

### Initialiser un filtre
```javascript
fetch('/api/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ n: 1000, p: 0.01 })
})
```

### Ajouter des mots
```javascript
fetch('/api/add_words', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ n: 100 })
})
```

### Tester un mot
```javascript
fetch('/api/test_word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: 'python' })
})
```

## 🧪 Fonctionnalités Interactives

### Slide 3 : Calculateur
- Ajuster **n** (capacité) : 100 à 10 000
- Ajuster **p** (taux d'erreur) : 0.001 à 0.1
- Voir en temps réel :
  - Taille du BitSet (m)
  - Nombre de fonctions de hash (k)
  - Mémoire requise
  - Efficacité (bits/élément)

### Slide 5 : Démo complète
- **Visualisation du BitSet** : Grille de bits (0/1)
- **Détection de faux positifs** : Alerte visuelle
- **Comparaison de performances** : Bloom vs Set classique
- **Affichage du code Python** : Code réellement exécuté
- **Statistiques en temps réel** : Taux de remplissage, etc.

## 🎯 Cas d'usage pédagogique

Cette présentation est idéale pour :
- 📚 Cours d'algorithmique
- 🎓 Séminaires techniques
- 💼 Présentations d'architecture
- 🔬 Ateliers pratiques
- 📊 Démonstrations en direct

## 🛠️ Personnalisation

### Modifier les couleurs des slides
Dans `static/css/styles.css`, section "Couleurs par slide" :
```css
#slide1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
```

### Ajouter des mots personnalisés
Modifier `words_10000.json` :
```json
{
  "metadata": { "count": 1000 },
  "words": ["mot1", "mot2", ...]
}
```

### Ajuster les animations
Dans `static/js/slides.js`, fonction `animateSlideElements()`

## 📦 Technologies utilisées

- **Backend** : Flask (Python)
- **Frontend** : HTML5, CSS3 (Glassmorphism), JavaScript (ES6+)
- **Structure de données** : BitSet, BloomFilter (implémentation pure Python)
- **Mathématiques** : Affichage KaTeX pour les formules

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
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
