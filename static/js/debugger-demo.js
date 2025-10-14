// ===================================
// DÉMO DEBUGGER - MODE STEP BY STEP
// ===================================

let currentExecutionStep = 0;
let bloomParams = { n: 0, p: 0, m: 0, k: 0 };
let addedWords = [];

// Variables pour le contrôle du debugger
let debugMode = 'stopped'; // 'stopped', 'playing', 'paused', 'stepping'
let debugSpeed = 1; // Multiplicateur de vitesse
let debugSteps = []; // Queue des étapes à exécuter
let currentStepIndex = 0;
let debugPauseResolve = null;

document.addEventListener('DOMContentLoaded', function() {
    initDebuggerDemo();
});

function initDebuggerDemo() {
    // Étape 1 : Initialisation
    const btnStep1 = document.getElementById('btn-step1');
    if (btnStep1) {
        btnStep1.addEventListener('click', async () => {
            await executeDebugStep1();
        });
    }
    
    // Étape 2 : Ajout
    const btnStep2 = document.getElementById('btn-step2');
    if (btnStep2) {
        btnStep2.addEventListener('click', async () => {
            await executeDebugStep2();
        });
    }
    
    // Étape 3 : Test
    const btnStep3 = document.getElementById('btn-step3');
    if (btnStep3) {
        btnStep3.addEventListener('click', async () => {
            await executeDebugStep3();
        });
    }
    
    // Bouton pour afficher les mots ajoutés
    const btnShowWords = document.getElementById('btn-show-words');
    if (btnShowWords) {
        btnShowWords.addEventListener('click', toggleWordsList);
    }
    
    // Contrôles du debugger
    initDebugControls();
}

function initDebugControls() {
    const btnPlay = document.getElementById('btn-debug-play');
    const btnPause = document.getElementById('btn-debug-pause');
    const btnStep = document.getElementById('btn-debug-step');
    const btnReset = document.getElementById('btn-debug-reset');
    const speedSelect = document.getElementById('debug-speed-select');
    
    if (btnPlay) {
        btnPlay.addEventListener('click', () => {
            debugMode = 'playing';
            updateDebugButtons();
            if (debugPauseResolve) debugPauseResolve();
        });
    }
    
    if (btnPause) {
        btnPause.addEventListener('click', () => {
            debugMode = 'paused';
            updateDebugButtons();
        });
    }
    
    if (btnStep) {
        btnStep.addEventListener('click', () => {
            if (debugMode === 'paused') {
                debugMode = 'stepping';
                if (debugPauseResolve) debugPauseResolve();
            }
        });
    }
    
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            resetDebugger();
        });
    }
    
    if (speedSelect) {
        speedSelect.addEventListener('change', (e) => {
            debugSpeed = parseFloat(e.target.value);
        });
        debugSpeed = parseFloat(speedSelect.value);
    }
}

function updateDebugButtons() {
    const btnPlay = document.getElementById('btn-debug-play');
    const btnPause = document.getElementById('btn-debug-pause');
    const btnStep = document.getElementById('btn-debug-step');
    
    if (debugMode === 'playing') {
        if (btnPlay) btnPlay.disabled = true;
        if (btnPause) btnPause.disabled = false;
        if (btnStep) btnStep.disabled = true;
    } else if (debugMode === 'paused' || debugMode === 'stepping') {
        if (btnPlay) btnPlay.disabled = false;
        if (btnPause) btnPause.disabled = true;
        if (btnStep) btnStep.disabled = false;
    } else {
        if (btnPlay) btnPlay.disabled = false;
        if (btnPause) btnPause.disabled = true;
        if (btnStep) btnStep.disabled = true;
    }
}

function resetDebugger() {
    debugMode = 'stopped';
    debugSteps = [];
    currentStepIndex = 0;
    debugPauseResolve = null;
    clearAllHighlights();
    updateDebugButtons();
}

// ===================================
// ÉTAPE 1: INITIALISATION
// ===================================
async function executeDebugStep1() {
    const n = parseInt(document.getElementById('step1-n').value);
    const p = parseFloat(document.getElementById('step1-p').value);
    
    // Activer le mode debug
    debugMode = 'playing';
    updateDebugButtons();
    
    // Mettre à jour la commande affichée
    const commandDiv = document.getElementById('command-step1');
    if (commandDiv) {
        commandDiv.innerHTML = `<code>>>> bloom = BloomFilter(${n}, ${p})</code>`;
    }
    
    // Highlight: Appel du constructeur
    await highlightLines([42], 800);
    
    // Highlight: Validation des paramètres
    await highlightLines([43, 44, 45, 46], 1200);
    
    // Highlight: Stockage des paramètres
    await highlightLines([48, 49], 800);
    
    // Highlight: Calcul de m et k
    await highlightLines([52, 53], 1500);
    
    // API Call
    try {
        const response = await fetch('/api/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ n, p })
        });
        
        const data = await response.json();
        bloomParams = { n, p, m: data.m, k: data.k };
        
        // Highlight: Création du BitSet
        await highlightLines([56], 800);
        await highlightLines([2, 3, 4, 5, 6], 1500);
        
        // Highlight: Initialisation du count
        await highlightLines([57], 600);
        
        // Afficher le résultat
        displayDebugResult1(data);
        
        // Activer l'étape 2
        activateDebugStep(2);
        
        // Marquer l'étape 1 comme complétée
        document.getElementById('exec-step1').classList.add('completed');
        
        // Arrêter le mode debug
        debugMode = 'stopped';
        updateDebugButtons();
        
    } catch (error) {
        console.error('Erreur:', error);
        const outputDiv = document.getElementById('output-step1');
        if (outputDiv) {
            outputDiv.innerHTML = `<div style="color: #ff6b6b;">❌ Erreur: ${error.message}</div>`;
        }
        debugMode = 'stopped';
        updateDebugButtons();
    }
}

function displayDebugResult1(data) {
    const outputDiv = document.getElementById('output-step1');
    if (outputDiv) {
        // Fetch bitset state
        fetch('/api/bitset_state')
            .then(res => res.json())
            .then(bitsetData => {
                const fillRate = ((bitsetData.ones_count / data.m) * 100).toFixed(2);
                const sampleBits = bitsetData.bitset.slice(0, 200);
                
                outputDiv.innerHTML = `
                    <div class="result-params">
                        <div class="param-item-result">
                            <span class="param-label">📏 Taille bitset (m):</span>
                            <span class="param-value">${data.m} bits</span>
                        </div>
                        <div class="param-item-result">
                            <span class="param-label">🔢 Fonctions hash (k):</span>
                            <span class="param-value">${data.k}</span>
                        </div>
                        <div class="param-item-result">
                            <span class="param-label">💾 Mémoire:</span>
                            <span class="param-value">${(data.m / 8 / 1024).toFixed(2)} KB</span>
                        </div>
                    </div>
                    <div style="margin-top: 15px; padding: 10px; background: rgba(67, 233, 123, 0.1); border-radius: 5px;">
                        <div style="font-size: 0.85rem; margin-bottom: 5px;">📊 Taux de remplissage: <strong>${fillRate}%</strong></div>
                        <div style="font-size: 0.75rem; opacity: 0.8;">Aperçu BitSet (premiers 200 bits):</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 2px; margin-top: 8px;">
                            ${sampleBits.map(bit => 
                                `<div class="bit-box ${bit ? 'active' : ''}"></div>`
                            ).join('')}
                        </div>
                    </div>
                    <div style="margin-top: 10px; text-align: center; color: #43e97b; font-weight: bold;">
                        ✅ BloomFilter initialisé avec succès !
                    </div>
                `;
            });
    }
}

// ===================================
// ÉTAPE 2: AJOUT D'ÉLÉMENTS
// ===================================
async function executeDebugStep2() {
    const count = parseInt(document.getElementById('step2-count').value);
    
    // Activer le mode debug
    debugMode = 'playing';
    updateDebugButtons();
    
    // Mettre à jour la commande
    const commandDiv = document.getElementById('command-step2');
    if (commandDiv) {
        commandDiv.innerHTML = `<code>>>> for word in words[:${count}]: bloom.add(word)</code>`;
    }
    
    // Highlight: Appel de add
    await highlightLines([74], 800);
    
    // Highlight: Boucle sur _hashes
    await highlightLines([76], 1000);
    await highlightLines([59, 60, 61, 62, 68, 69, 71, 72], 1800);
    
    // Highlight: Appel de bitset.set
    await highlightLines([77], 800);
    await highlightLines([12, 13, 14, 15, 16, 17], 1500);
    
    // Highlight: Incrémentation du count
    await highlightLines([78], 600);
    
    // API Call
    try {
        const response = await fetch('/api/add_words', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ n: count })
        });
        
        const data = await response.json();
        
        if (data.success) {
            addedWords = data.words || [];
            
            // Mettre à jour le compteur de mots
            updateWordsListDisplay();
            
            // Afficher le résultat
            await displayDebugResult2(count);
            
            // Activer l'étape 3
            activateDebugStep(3);
            
            // Marquer l'étape 2 comme complétée
            document.getElementById('exec-step2').classList.add('completed');
            
            // Arrêter le mode debug
            debugMode = 'stopped';
            updateDebugButtons();
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        const outputDiv = document.getElementById('output-step2');
        if (outputDiv) {
            outputDiv.innerHTML = `<div style="color: #ff6b6b;">❌ Erreur: ${error.message}</div>`;
        }
        debugMode = 'stopped';
        updateDebugButtons();
    }
}

async function displayDebugResult2(count) {
    const outputDiv = document.getElementById('output-step2');
    if (!outputDiv) return;
    
    try {
        const response = await fetch('/api/bitset_state');
        const bitsetData = await response.json();
        
        const fillRate = ((bitsetData.ones_count / bitsetData.total_size) * 100).toFixed(2);
        const sampleSize = Math.min(200, bitsetData.bitset.length);
        const sampleBits = bitsetData.bitset.slice(0, sampleSize);
        
        outputDiv.innerHTML = `
            <div style="padding: 10px; background: rgba(67, 233, 123, 0.1); border-radius: 5px;">
                <div style="font-size: 0.9rem; margin-bottom: 8px;">
                    ✅ Ajouté <strong>${count}</strong> mots avec succès
                </div>
                <div style="font-size: 0.85rem; margin-bottom: 5px;">
                    📊 Taux de remplissage: <strong>${fillRate}%</strong>
                </div>
                <div style="font-size: 0.8rem; opacity: 0.8;">
                    Bits à 1: ${bitsetData.ones_count} / ${bitsetData.total_size}
                </div>
                <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 10px;">Aperçu BitSet (premiers ${sampleSize} bits):</div>
                <div style="display: flex; flex-wrap: wrap; gap: 2px; margin-top: 8px;">
                    ${sampleBits.map(bit => 
                        `<div class="bit-box ${bit ? 'active' : ''}"></div>`
                    ).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        outputDiv.innerHTML = `<div style="color: #ff6b6b;">❌ Erreur lors de la récupération du bitset</div>`;
    }
}

// ===================================
// ÉTAPE 3: TEST D'APPARTENANCE
// ===================================
async function executeDebugStep3() {
    const word = document.getElementById('step3-word').value.trim();
    
    if (!word) {
        alert('Veuillez entrer un mot');
        return;
    }
    
    // Activer le mode debug
    debugMode = 'playing';
    updateDebugButtons();
    
    // Mettre à jour la commande
    const commandDiv = document.getElementById('command-step3');
    if (commandDiv) {
        commandDiv.innerHTML = `<code>>>> bloom.__contains__("${word}")</code>`;
    }
    
    // Highlight: Appel de __contains__
    await highlightLines([80], 800);
    
    // Highlight: Récupération des indices via _hashes
    await highlightLines([82], 800);
    await highlightLines([59, 60, 61, 62, 68, 69, 71, 72], 1500);
    
    // Highlight: Test de chaque bit via bitset.get
    await highlightLines([82], 800);
    await highlightLines([19, 20, 21, 22, 23, 24], 1500);
    
    // API Call
    try {
        const response = await fetch('/api/test_word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word })
        });
        
        const data = await response.json();
        
        // Afficher le résultat
        displayDebugResult3(word, data);
        
        // Marquer l'étape 3 comme complétée
        document.getElementById('exec-step3').classList.add('completed');
        
        // Arrêter le mode debug
        debugMode = 'stopped';
        updateDebugButtons();
        
    } catch (error) {
        console.error('Erreur:', error);
        const outputDiv = document.getElementById('output-step3');
        if (outputDiv) {
            outputDiv.innerHTML = `<div style="color: #ff6b6b;">❌ Erreur: ${error.message}</div>`;
        }
        debugMode = 'stopped';
        updateDebugButtons();
    }
}

function displayDebugResult3(word, data) {
    const outputDiv = document.getElementById('output-step3');
    if (!outputDiv) return;
    
    const wasAdded = addedWords.includes(word);
    let icon, text, explanation, cssClass;

    console.log("data from test_word:", data);
    
    if (data.result) {
        if (wasAdded) {
            icon = '✅';
            text = 'Probablement présent';
            cssClass = 'success';
            explanation = 'Tous les bits testés sont à 1. Ce mot a été ajouté.';
        } else {
            icon = '⚠️';
            text = 'FAUX POSITIF';
            cssClass = 'warning';
            explanation = 'Tous les bits testés sont à 1, mais le mot n\'a jamais été ajouté !';
        }
    } else {
        icon = '❌';
        text = 'Certainement absent';
        cssClass = 'absent';
        explanation = 'Au moins un bit testé est à 0. Le mot n\'a certainement pas été ajouté.';
    }

    const indices = data.indices || data.hash_indices || [];
    const state_bits = data.state_bits || [];
    let indices_dico = {};
    for (let i = 0; i < indices.length; i++) {
        indices_dico[indices[i]] = {
            state: state_bits[i] === true ? 1 : 0
        };
    }
    
    const bitElements = Object.keys(indices_dico).slice(0, 10).map(idx => {
        const bitValue = indices_dico[idx].state || 0;
        const color = bitValue === 1 ? '#43e97b' : '#ff6b6b';
        const bgColor = bitValue === 1 ? 'rgba(67, 233, 123, 0.2)' : 'rgba(255, 107, 107, 0.2)';
        const label = bitValue === 1 ? '1 ✓' : '0 ✗';
        
        return `
            <div style="display: inline-block; margin: 5px; padding: 6px 10px; background: ${bgColor}; border: 2px solid ${color}; border-radius: 5px; font-family: monospace; font-size: 0.8rem;">
                <div style="font-size: 0.65rem; opacity: 0.8;">Bit ${idx}</div>
                <div style="font-weight: bold; color: ${color};">${label}</div>
            </div>
        `;
    }).join('');
    
    // Comparaison des performances
    const timeBloom = data.time_bloom || 0;
    const timeSet = data.time_set || 0;
    const speedup = timeSet > 0 ? (timeSet / timeBloom).toFixed(1) : 'N/A';
    const setIcon = data.set_result ? '✅' : '❌';
    const bloomIcon = data.bloom_result ? '✅' : '❌';
    
    let speedupText;
    if (speedup === 'N/A') {
        speedupText = 'N/A';
    } else if (parseFloat(speedup) < 1) {
        speedupText = `${speedup}x plus lent 🐢`;
    } else {
        speedupText = `${speedup}x plus rapide ! ⚡`;
    }

    outputDiv.innerHTML = `
        <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <div style="font-size: 2rem; margin-bottom: 10px;">${icon}</div>
            <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 8px;">${text}</div>
            <div style="font-size: 0.85rem; opacity: 0.9;">Mot testé: <strong>"${word}"</strong></div>
        </div>
        
        <div style="margin-top: 15px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
            <div style="font-size: 0.9rem; font-weight: bold; margin-bottom: 10px;">
                🔍 Vérification des ${Math.min(indices.length, 10)} bits (k=${bloomParams.k})
            </div>
            <div style="text-align: center; margin: 15px 0;">
                ${bitElements}
            </div>
            <div style="font-size: 0.8rem; opacity: 0.9; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
                ${explanation}
            </div>
            <div style="font-size: 0.7rem; opacity: 0.6; margin-top: 8px; text-align: center;">
                🟢 = bit à 1 (activé) | 🔴 = bit à 0 (non activé)
            </div>
        </div>
        
        <!-- Comparaison BloomFilter vs Set classique -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3);">
            <div style="font-size: 0.95rem; font-weight: bold; margin-bottom: 12px; text-align: center; color: #38bdf8;">
                ⚡ Comparaison des performances
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <!-- BloomFilter -->
                <div style="padding: 10px; background: rgba(102, 126, 234, 0.15); border-radius: 6px; border-left: 3px solid #667eea;">
                    <div style="font-size: 0.75rem; opacity: 0.8; margin-bottom: 5px;">🎯 BloomFilter</div>
                    <div style="font-size: 0.85rem; font-weight: bold; color: #667eea;">
                        ${bloomIcon} ${data.bloom_result ? 'Présent' : 'Absent'}
                    </div>
                    <div style="font-size: 0.75rem; margin-top: 5px; font-family: monospace;">
                        ⏱️ ${timeBloom.toFixed(2)} μs
                    </div>
                </div>
                
                <!-- Set classique -->
                <div style="padding: 10px; background: rgba(249, 115, 22, 0.15); border-radius: 6px; border-left: 3px solid #f97316;">
                    <div style="font-size: 0.75rem; opacity: 0.8; margin-bottom: 5px;">📚 Set (boucle)</div>
                    <div style="font-size: 0.85rem; font-weight: bold; color: #f97316;">
                        ${setIcon} ${data.set_result ? 'Présent' : 'Absent'}
                    </div>
                    <div style="font-size: 0.75rem; margin-top: 5px; font-family: monospace;">
                        ⏱️ ${timeSet.toFixed(2)} μs
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; padding: 8px; background: rgba(67, 233, 123, 0.1); border-radius: 5px;">
                <div style="font-size: 0.8rem; opacity: 0.8;">Accélération :</div>
                <div style="font-size: 1.1rem; font-weight: bold; color: #43e97b;">
                    ${speedupText}
                </div>
            </div>
            
            ${data.is_false_positive ? `
                <div style="margin-top: 10px; padding: 8px; background: rgba(255, 200, 0, 0.2); border-radius: 5px; border-left: 3px solid #ffc800;">
                    <div style="font-size: 0.75rem; color: #ffc800; font-weight: bold;">
                        ⚠️ Note : C'est un FAUX POSITIF du BloomFilter !<br>
                        Le Set classique confirme que le mot n'est PAS présent.
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// ===================================
// HELPERS
// ===================================

/**
 * Highlight des lignes de code dans le panneau source
 */
async function highlightLines(lineNumbers, duration = 500) {
    const sourceCode = document.getElementById('full-source-code');
    if (!sourceCode) return;
    
    // Effacer les highlights précédents
    const previousHighlights = sourceCode.querySelectorAll('.line.highlight');
    previousHighlights.forEach(line => {
        line.classList.remove('highlight');
        line.classList.add('executed');
    });
    
    // Ajouter les nouveaux highlights
    lineNumbers.forEach(lineNum => {
        const line = sourceCode.querySelector(`.line[data-line="${lineNum}"]`);
        if (line) {
            line.classList.add('highlight');
            line.classList.remove('executed');
            
            // Scroll vers la ligne si nécessaire
            line.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
    
    // Calculer la durée ajustée selon la vitesse
    const adjustedDuration = duration / debugSpeed;
    
    // Attendre en mode play, ou attendre un step manuel en mode pause
    if (debugMode === 'playing') {
        await new Promise(resolve => setTimeout(resolve, adjustedDuration));
    } else if (debugMode === 'paused') {
        // Attendre que l'utilisateur clique sur Play ou Step
        updateDebugButtons();
        await new Promise(resolve => {
            debugPauseResolve = resolve;
        });
        
        // Si on est en mode stepping, repasser en pause après
        if (debugMode === 'stepping') {
            debugMode = 'paused';
            debugPauseResolve = null;
        }
    } else {
        // Mode normal (pas de debug actif)
        await new Promise(resolve => setTimeout(resolve, adjustedDuration));
    }
}

/**
 * Active une étape d'exécution
 */
function activateDebugStep(stepNumber) {
    const step = document.getElementById(`exec-step${stepNumber}`);
    if (step) {
        step.classList.remove('disabled');
        step.classList.add('active');
        
        // Désactiver les étapes précédentes (retirer active mais garder completed)
        for (let i = 1; i < stepNumber; i++) {
            const prevStep = document.getElementById(`exec-step${i}`);
            if (prevStep) {
                prevStep.classList.remove('active');
            }
        }
        
        // Scroll vers l'étape
        step.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Efface tous les highlights
 */
function clearAllHighlights() {
    const sourceCode = document.getElementById('full-source-code');
    if (sourceCode) {
        const lines = sourceCode.querySelectorAll('.line');
        lines.forEach(line => {
            line.classList.remove('highlight', 'active', 'executed');
        });
    }
}

/**
 * Toggle l'affichage de la liste des mots ajoutés
 */
function toggleWordsList() {
    const container = document.getElementById('words-list-container');
    const btn = document.getElementById('btn-show-words');
    
    if (!container || !btn) return;
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.textContent = '🔼 Masquer les mots';
        btn.style.background = 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)';
    } else {
        container.style.display = 'none';
        btn.textContent = '📋 Voir les mots ajoutés';
        btn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    }
}

/**
 * Met à jour l'affichage de la liste des mots
 */
function updateWordsListDisplay() {
    const wordsList = document.getElementById('words-list');
    const wordsCount = document.getElementById('words-count');
    
    if (!wordsList || !wordsCount) return;
    
    // Mettre à jour le compteur
    wordsCount.textContent = addedWords.length;
    
    // Générer les tags de mots (cliquables pour remplir l'input)
    wordsList.innerHTML = addedWords.slice(0, 100).map(word => 
        `<span class="word-tag" onclick="selectWord('${word}')">${word}</span>`
    ).join('');
    
    if (addedWords.length > 100) {
        wordsList.innerHTML += `<span style="font-size: 0.75rem; opacity: 0.6; padding: 4px 10px;">... et ${addedWords.length - 100} autres</span>`;
    }
}

/**
 * Sélectionne un mot et le met dans l'input de test
 */
function selectWord(word) {
    const input = document.getElementById('step3-word');
    if (input) {
        input.value = word;
        input.focus();
        
        // Animation rapide
        input.style.background = 'rgba(67, 233, 123, 0.2)';
        setTimeout(() => {
            input.style.background = 'rgba(0, 0, 0, 0.5)';
        }, 300);
    }
}
