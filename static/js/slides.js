// ===================================
// NAVIGATION ENTRE SLIDES
// ===================================

let currentSlide = 1;
const totalSlides = 6;

function showSlide(n) {
    // Limiter entre 1 et totalSlides
    if (n > totalSlides) n = totalSlides;
    if (n < 1) n = 1;
    
    currentSlide = n;
    
    // Cacher toutes les slides
    document.querySelectorAll('.slide').forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Afficher la slide actuelle
    const activeSlide = document.getElementById(`slide${n}`);
    if (activeSlide) {
        activeSlide.classList.add('active');
    }
    
    // Mettre à jour le compteur
    const counter = document.getElementById('slide-counter');
    if (counter) {
        counter.textContent = `${currentSlide} / ${totalSlides}`;
    }
    
    // Gérer l'état des boutons
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    
    if (prevBtn) {
        prevBtn.disabled = (currentSlide === 1);
    }
    if (nextBtn) {
        nextBtn.disabled = (currentSlide === totalSlides);
    }
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

// ===================================
// EVENT LISTENERS
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Boutons de navigation
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    // Navigation au clavier (flèches gauche/droite)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });
    
    // Initialiser la première slide
    showSlide(1);
    
    // Initialiser le calculateur interactif (Slide 3)
    initCalculator();
});

// ===================================
// CALCULATEUR INTERACTIF (SLIDE 3)
// ===================================

function initCalculator() {
    const nSlider = document.getElementById('n-slider');
    const pSlider = document.getElementById('p-slider');
    const nValue = document.getElementById('n-value');
    const pValue = document.getElementById('p-value');
    
    if (!nSlider || !pSlider) return;
    
    // Fonction de calcul
    function calculate() {
        const n = parseInt(nSlider.value);
        const p = parseFloat(pSlider.value);
        
        // Mettre à jour l'affichage des valeurs
        nValue.textContent = n;
        pValue.textContent = p.toFixed(3);
        
        // Calculer m (taille du bitset)
        const m = Math.ceil(-n * Math.log(p) / (Math.log(2) ** 2));
        
        // Calculer k (nombre de fonctions de hachage)
        const k = Math.max(1, Math.round(m / n * Math.log(2)));
        
        // Calculer la mémoire en KB
        const memoryKB = (m / 8 / 1024).toFixed(2);
        
        // Calculer la probabilité réelle de faux positif
        const fpProb = Math.pow(1 - Math.exp(-k * n / m), k);
        const fpPercent = (fpProb * 100).toFixed(4);
        
        // Afficher les résultats
        document.getElementById('result-m').textContent = m.toLocaleString();
        document.getElementById('result-k').textContent = k;
        document.getElementById('result-memory').textContent = memoryKB;
        document.getElementById('result-fp').textContent = fpPercent;
        
        // Générer l'interprétation
        const interpretationText = document.getElementById('interpretation-text');
        if (interpretationText) {
            let interpretation = '';
            if (fpProb < 0.001) {
                interpretation = `Excellent ! Avec ${fpPercent}% de faux positifs, le filtre est très fiable. Idéal pour des applications critiques.`;
            } else if (fpProb < 0.01) {
                interpretation = `Très bon ! ${fpPercent}% de faux positifs. Bon compromis entre mémoire et précision.`;
            } else if (fpProb < 0.05) {
                interpretation = `Acceptable. ${fpPercent}% de faux positifs. Convient pour la plupart des cas d'usage.`;
            } else {
                interpretation = `⚠️ Attention ! ${fpPercent}% de faux positifs est élevé. Augmentez n ou réduisez p pour améliorer la précision.`;
            }
            interpretationText.textContent = interpretation;
        }
    }
    
    // Écouter les changements
    nSlider.addEventListener('input', calculate);
    pSlider.addEventListener('input', calculate);
    
    // Calcul initial
    calculate();
}

// ===================================
// ANIMATIONS SUPPLÉMENTAIRES
// ===================================

// Animation des éléments au changement de slide
function animateSlideElements() {
    const activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return;
    
    const elements = activeSlide.querySelectorAll('.info-box, .formula-box, .conclusion-box');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.5s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Animer à chaque changement de slide
const originalShowSlide = showSlide;
showSlide = function(n) {
    originalShowSlide(n);
    setTimeout(animateSlideElements, 100);
};
