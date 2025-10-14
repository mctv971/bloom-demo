// ===================================
// DÉMO INTERACTIVE ÉTAPE PAR ÉTAPE
// ===================================

let currentStep = 0;
let bloomParams = { n: 0, p: 0, m: 0, k: 0 };
let bitsetState = [];
let addedWords = [];

document.addEventListener('DOMContentLoaded', function() {
    initStepByStepDemo();
});

function initStepByStepDemo() {
    // Étape 1 : Initialisation
    const btnStep1 = document.getElementById('btn-step1');
    if (btnStep1) {
        btnStep1.addEventListener('click', executeStep1);
    }
    
    // Étape 2 : Ajout de mots
    const btnStep2 = document.getElementById('btn-step2');
    if (btnStep2) {
        btnStep2.addEventListener('click', executeStep2);
    }
    
    // Étape 3 : Test
    const btnStep3 = document.getElementById('btn-step3');
    if (btnStep3) {
        btnStep3.addEventListener('click', executeStep3);
    }
}

// ===================================
// ÉTAPE 1 : INITIALISATION
// ===================================
async function executeStep1() {
    alert("executeStep1");
    const n = parseInt(document.getElementById('step1-n').value);
    const p = parseFloat(document.getElementById('step1-p').value);
    
    // Mettre à jour le code affiché
    updateCodeStep1(n, p);
    alert("after updateCodeStep1");
    
    // Appel API
    try {
        const response = await fetch('/api/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ n, p })
        });
        alert("after fetch");
        
        const data = await response.json();
        bloomParams = { n, p, m: data.m, k: data.k };
        bitsetState = new Array(data.m).fill(0);
        
        // Afficher le résultat
        displayResultStep1(data);
        alert("after displayResultStep1");
        
        // Activer l'étape 2
        activateStep(2);
        alert("after activateStep(2)");
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function updateCodeStep1(n, p) {
    const codeBlock = document.getElementById('code-step1');
    if (codeBlock) {
        codeBlock.innerHTML = `<code># Classe BitSet (tableau de bits)
class BitSet:
    def __init__(self, size: int):
        byte_size = (size + 7) // 8
        self.array = bytearray(byte_size)
        self.size = size
    
    def set(self, index: int):
        """Met un bit à 1"""
        byte_idx = index // 8
        bit_idx = index % 8
        self.array[byte_idx] |= (1 << bit_idx)

# Classe BloomFilter
class BloomFilter:
    def __init__(self, capacity: int, error_rate: float):
        self.capacity = capacity
        self.error_rate = error_rate
        
        # Calcul m et k optimaux
        self.m = ceil(-capacity * log(error_rate) / (log(2)**2))
        self.k = round(self.m / capacity * log(2))
        
        # Création du bitset
        self.bitset = BitSet(self.m)

# Initialisation
n = <span class="var">${n}</span>
p = <span class="var">${p}</span>

bloom = BloomFilter(<span class="var">n</span>, <span class="var">p</span>)
print(f"m={m}, k={k}, mémoire={m/8/1024:.2f} KB")</code>`;
    }
}

function displayResultStep1(data) {
    const resultBox = document.getElementById('output-step1');
    if (resultBox) {
        // Fetch bitset state for visualization
        fetch('/api/bitset_state')
            .then(res => res.json())
            .then(bitsetData => {
                const fillRate = ((bitsetData.ones_count / data.m) * 100).toFixed(2);
                const sampleBits = bitsetData.bitset.slice(0, 200); // First 200 bits
                
                resultBox.innerHTML = `
                    <div class="result-params">
                        <div class="param-item-result">
                            <span class="param-label">m (taille bitset):</span>
                            <span class="param-value">${data.m} bits</span>
                        </div>
                        <div class="param-item-result">
                            <span class="param-label">k (nb fonctions):</span>
                            <span class="param-value">${data.k}</span>
                        </div>
                        <div class="param-item-result">
                            <span class="param-label">Mémoire:</span>
                            <span class="param-value">${(data.m / 8 / 1024).toFixed(2)} KB</span>
                        </div>
                        <div style="margin-top: 15px; padding: 10px; background: rgba(67, 233, 123, 0.1); border-radius: 5px;">
                            <div style="font-size: 0.9rem; margin-bottom: 5px;">📊 Taux de remplissage: <strong>${fillRate}%</strong></div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Aperçu BitSet (200 premiers bits):</div>
                            <div class="bitset-mini" style="display: flex; flex-wrap: wrap; gap: 2px; margin-top: 5px;">
                                ${sampleBits.map(bit => 
                                    `<span style="width: 8px; height: 8px; background: ${bit ? '#43e97b' : '#333'}; border-radius: 1px;"></span>`
                                ).join('')}
                            </div>
                        </div>
                        <div style="margin-top: 10px; text-align: center; color: #43e97b;">
                            ✅ BloomFilter initialisé avec succès !
                        </div>
                    </div>
                `;
            });
    }
}

// ===================================
// ÉTAPE 2 : AJOUT DE MOTS
// ===================================
async function executeStep2() {
    const count = parseInt(document.getElementById('step2-count').value);
    
    if (count <= 0 || count > 1000) {
        alert('Veuillez entrer un nombre entre 1 et 1000');
        return;
    }
    
    // Mettre à jour le code affiché
    updateCodeStep2(count);
    
    // Appel API avec le nombre de mots
    try {
        const response = await fetch('/api/add_words', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ n: count })
        });
        
        const data = await response.json();
        
        if (data.success) {
            addedWords = data.words || [];
            
            // Mettre à jour le bitset avec animation
            await updateBitsetDisplay();
            
            // Activer l'étape 3
            activateStep(3);
        }
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function updateCodeStep2(count) {
    const codeBlock = document.getElementById('code-step2');
    if (codeBlock) {
        codeBlock.innerHTML = `<code># Double hashing pour k indices
def _hashes(self, item: str):
    data = item.encode("utf-8")
    h1 = int.from_bytes(sha256(data).digest(), 'big')
    h2 = int.from_bytes(md5(data).digest(), 'big')
    
    for i in range(self.k):
        yield (h1 + i * h2) % self.m

# Méthode add
def add(self, item):
    """Ajoute un élément"""
    for idx in self._hashes(item):
        self.bitset.set(idx)
    self.count += 1

# Ajout depuis words_10000.json
with open('words_10000.json') as f:
    words = json.load(f)['words']

for word in words[:<span class="var">${count}</span>]:
    bloom.add(word)
    
print(f"Ajouté {len(words[:${count}])} mots")</code>`;
    }
}

async function updateBitsetDisplay() {
    try {
        const response = await fetch('/api/bitset_state');
        const data = await response.json();
        
        bitsetState = data.bitset;
        const sampleSize = Math.min(200, bitsetState.length); // Show up to 200 bits
        const sampleBits = bitsetState.slice(0, sampleSize);
        
        // Afficher le bitset visuel
        const bitsetVisual = document.getElementById('bitset-visual');
        if (bitsetVisual) {
            bitsetVisual.innerHTML = `
                <div style="display: flex; flex-wrap: wrap; gap: 2px; margin: 10px 0;">
                    ${sampleBits.map((bit, idx) => 
                        `<span style="width: 8px; height: 8px; background: ${bit ? '#43e97b' : '#333'}; border-radius: 1px;" title="Bit ${idx}: ${bit}"></span>`
                    ).join('')}
                </div>
                <div style="font-size: 0.75rem; opacity: 0.7; text-align: center;">
                    Aperçu: premiers ${sampleSize} bits sur ${bitsetState.length} total
                </div>
            `;
        }
        
        // Stats avec taux de remplissage
        const stats = document.getElementById('bitset-stats-step2');
        if (stats) {
            const bitsSet = data.ones_count || bitsetState.filter(b => b === 1).length;
            const fillRate = ((bitsSet / bitsetState.length) * 100).toFixed(2);
            stats.innerHTML = `
                <div style="padding: 10px; background: rgba(67, 233, 123, 0.1); border-radius: 5px; margin-top: 10px;">
                    <div style="font-size: 0.95rem; margin-bottom: 5px;">
                        <strong>📊 Taux de remplissage:</strong> ${fillRate}%
                    </div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">
                        <strong>Bits à 1:</strong> ${bitsSet} / ${bitsetState.length}
                    </div>
                    <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 5px;">
                        <strong>Mots ajoutés:</strong> ${addedWords.length}
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// ===================================
// ÉTAPE 3 : TEST D'APPARTENANCE
// ===================================
async function executeStep3() {
    const word = document.getElementById('step3-word').value.trim();
    
    if (!word) {
        alert('Veuillez entrer un mot');
        return;
    }
    
    // Mettre à jour le code affiché
    updateCodeStep3(word);
    
    // Appel API
    try {
        const response = await fetch('/api/test_word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word })
        });
        
        const data = await response.json();
        
        // Afficher le résultat
        displayResultStep3(word, data);
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function updateCodeStep3(word) {
    const codeBlock = document.getElementById('code-step3');
    if (codeBlock) {
        codeBlock.innerHTML = `<code># Méthode __contains__ (test d'appartenance)
def __contains__(self, item) -> bool:
    """Teste si un élément est (probablement) présent"""
    return all(
        self.bitset.get(idx) 
        for idx in self._hashes(item)
    )

# Test d'un mot
word = "<span class="var">${word}</span>"
result = word in bloom

if result:
    print(f"✅ '{word}' est probablement présent")
else:
    print(f"❌ '{word}' est certainement absent")</code>`;
    }
}

function displayResultStep3(word, data) {
    const resultTextBox = document.getElementById('test-result-text');
    const bitVerificationBox = document.getElementById('bit-verification');
    
    if (resultTextBox && bitVerificationBox) {
        const wasAdded = addedWords.includes(word);
        let icon, text, cssClass, explanation;
        
        if (data.result) {
            if (wasAdded) {
                icon = '✅';
                text = 'Probablement présent';
                cssClass = 'success';
                explanation = 'Tous les bits testés sont à 1 (vert). Ce mot a été ajouté.';
            } else {
                icon = '⚠️';
                text = 'FAUX POSITIF !';
                cssClass = 'warning';
                explanation = 'Tous les bits testés sont à 1 (vert), mais le mot n\'a jamais été ajouté. C\'est une collision de bits !';
            }
        } else {
            icon = '❌';
            text = 'Certainement absent';
            cssClass = 'absent';
            explanation = 'Au moins un bit testé est à 0 (rouge). Ce mot n\'a certainement pas été ajouté.';
        }
        
        // Résultat principal
        resultTextBox.innerHTML = `
            <div class="test-result-box ${cssClass}">
                <div style="font-size: 2rem;">${icon}</div>
                <div style="font-size: 1.2rem; font-weight: bold; margin: 10px 0;">${text}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Mot testé: <strong>"${word}"</strong></div>
            </div>
        `;
        
        // Visualisation des bits testés
        const indices = data.indices || data.result || [];
        if (indices.length > 0) {
            const bitElements = indices.map(idx => {
                const bitValue = bitsetState[idx] || 0;
                const color = bitValue === 1 ? '#43e97b' : '#ff6b6b';
                const bgColor = bitValue === 1 ? 'rgba(67, 233, 123, 0.2)' : 'rgba(255, 107, 107, 0.2)';
                const label = bitValue === 1 ? '1 ✓' : '0 ✗';
                
                return `
                    <div style="display: inline-block; margin: 5px; padding: 8px 12px; background: ${bgColor}; border: 2px solid ${color}; border-radius: 5px; font-family: monospace;">
                        <div style="font-size: 0.75rem; opacity: 0.8;">Bit ${idx}</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: ${color};">${label}</div>
                    </div>
                `;
            }).join('');
            
            bitVerificationBox.innerHTML = `
                <div style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    <div style="font-size: 0.95rem; font-weight: bold; margin-bottom: 10px;">
                        🔍 Vérification des ${indices.length} bits (k=${bloomParams.k})
                    </div>
                    <div style="text-align: center; margin: 15px 0;">
                        ${bitElements}
                    </div>
                    <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
                        ${explanation}
                    </div>
                    <div style="font-size: 0.75rem; opacity: 0.7; margin-top: 10px; text-align: center;">
                        🟢 Vert (1) = bit activé | 🔴 Rouge (0) = bit non activé
                    </div>
                </div>
            `;
        }
    }
}

// ===================================
// HELPERS
// ===================================
function activateStep(stepNumber) {
    const section = document.getElementById(`step${stepNumber}-section`);
    if (section) {
        section.style.opacity = '1';
        section.style.pointerEvents = 'all';
        section.classList.add('active');
        
        // Scroll vers cette section
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

let bloomInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    initDemoControls();
});

function initDemoControls() {
    // Bouton initialisation
    const btnInit = document.getElementById('btn-init');
    if (btnInit) {
        btnInit.addEventListener('click', initializeBloomFilter);
    }
    
    // Bouton ajout de mots
    const btnAdd = document.getElementById('btn-add');
    if (btnAdd) {
        btnAdd.addEventListener('click', addWords);
    }
    
    // Bouton test d'un mot
    const btnTest = document.getElementById('btn-test');
    if (btnTest) {
        btnTest.addEventListener('click', testWord);
    }
    
    // Permettre test avec Entrée
    const wordInput = document.getElementById('demo-word');
    if (wordInput) {
        wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                testWord();
            }
        });
    }
}

// ===================================
// INITIALISATION DU FILTRE
// ===================================

async function initializeBloomFilter() {
    const nInput = document.getElementById('demo-n');
    const pInput = document.getElementById('demo-p');
    const resultDiv = document.getElementById('init-result');
    
    const n = parseInt(nInput.value);
    const p = parseFloat(pInput.value);
    
    // Validation
    if (isNaN(n) || n <= 0) {
        showResult(resultDiv, '❌ Capacité invalide', 'error');
        return;
    }
    
    if (isNaN(p) || p <= 0 || p >= 1) {
        showResult(resultDiv, '❌ Taux d\'erreur invalide (doit être entre 0 et 1)', 'error');
        return;
    }
    
    showResult(resultDiv, '⏳ Initialisation...', 'loading');
    
    try {
        const response = await fetch('/api/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ n, p })
        });
        
        const data = await response.json();
        
        if (data.success) {
            bloomInitialized = true;
            showResult(resultDiv, 
                `✅ Filtre initialisé !<br>
                📊 Taille (m): ${data.m.toLocaleString()} bits<br>
                🔢 Fonctions (k): ${data.k}<br>
                💾 Efficacité: ${data.efficiency} bits/élément`, 
                'success'
            );
            
            // Réinitialiser l'affichage du bitset
            updateBitsetDisplay();
        } else {
            showResult(resultDiv, `❌ Erreur: ${data.error}`, 'error');
        }
    } catch (error) {
        showResult(resultDiv, `❌ Erreur de connexion: ${error.message}`, 'error');
    }
}

// ===================================
// AJOUT DE MOTS
// ===================================

async function addWords() {
    if (!bloomInitialized) {
        showResult(document.getElementById('add-result'), 
            '⚠️ Veuillez d\'abord initialiser le filtre', 'warning');
        return;
    }
    
    const countInput = document.getElementById('demo-words-count');
    const resultDiv = document.getElementById('add-result');
    
    const n = parseInt(countInput.value);
    
    if (isNaN(n) || n <= 0) {
        showResult(resultDiv, '❌ Nombre de mots invalide', 'error');
        return;
    }
    
    showResult(resultDiv, '⏳ Ajout en cours...', 'loading');
    
    try {
        const response = await fetch('/api/add_words', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ n })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResult(resultDiv, 
                `✅ ${data.words_added} mots ajoutés !<br>
                ⏱️ Temps Bloom: ${data.time_bloom} ms<br>
                ⏱️ Temps Set: ${data.time_set} ms<br>
                📈 Éléments dans le filtre: ${data.bloom_count}`, 
                'success'
            );
            
            // Mettre à jour la visualisation du bitset
            updateBitsetDisplay();
        } else {
            showResult(resultDiv, `❌ Erreur: ${data.error}`, 'error');
        }
    } catch (error) {
        showResult(resultDiv, `❌ Erreur: ${error.message}`, 'error');
    }
}

// ===================================
// TEST D'UN MOT
// ===================================

async function testWord() {
    if (!bloomInitialized) {
        showResult(document.getElementById('test-result'), 
            '⚠️ Veuillez d\'abord initialiser le filtre et ajouter des mots', 'warning');
        return;
    }
    
    const wordInput = document.getElementById('demo-word');
    const resultDiv = document.getElementById('test-result');
    
    const word = wordInput.value.trim();
    
    if (!word) {
        showResult(resultDiv, '❌ Veuillez entrer un mot', 'error');
        return;
    }
    
    showResult(resultDiv, '⏳ Test en cours...', 'loading');
    
    try {
        const response = await fetch('/api/test_word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ word })
        });
        
        const data = await response.json();
        
        if (data.success) {
            let resultHTML = `<strong>Mot testé:</strong> "${data.word}"<br>`;
            
            // Résultat Bloom
            const bloomIcon = data.bloom_result ? '✅' : '❌';
            resultHTML += `${bloomIcon} <strong>Bloom:</strong> ${data.bloom_result ? 'Présent' : 'Absent'}<br>`;
            
            // Résultat Set
            const setIcon = data.set_result ? '✅' : '❌';
            resultHTML += `${setIcon} <strong>Set:</strong> ${data.set_result ? 'Présent' : 'Absent'}<br>`;
            
            // Temps
            resultHTML += `⏱️ <strong>Temps Bloom:</strong> ${data.time_bloom} μs<br>`;
            resultHTML += `⏱️ <strong>Temps Set:</strong> ${data.time_set} μs<br>`;
            
            // Faux positif ?
            if (data.is_false_positive) {
                resultHTML += `<br>⚠️ <strong style="color: #ff6b6b;">FAUX POSITIF DÉTECTÉ !</strong>`;
            }
            
            // Hash indices
            if (data.hash_indices && data.hash_indices.length > 0) {
                resultHTML += `<br>🔢 <strong>Indices de hash:</strong> ${data.hash_indices.join(', ')}`;
            }
            
            showResult(resultDiv, resultHTML, data.is_false_positive ? 'warning' : 'success');
            
            // Mettre à jour le bitset avec highlight des indices
            updateBitsetDisplay(data.hash_indices);
        } else {
            showResult(resultDiv, `❌ Erreur: ${data.error}`, 'error');
        }
    } catch (error) {
        showResult(resultDiv, `❌ Erreur: ${error.message}`, 'error');
    }
}

// ===================================
// VISUALISATION DU BITSET
// ===================================

async function updateBitsetDisplay(highlightIndices = []) {
    const bitsetDiv = document.getElementById('bitset-display');
    const statsDiv = document.getElementById('bitset-stats');
    
    if (!bitsetDiv || !bloomInitialized) return;
    
    try {
        const response = await fetch('/api/bitset_state');
        const data = await response.json();
        
        if (data.success) {
            // Afficher le bitset
            bitsetDiv.innerHTML = '';
            
            data.bits.forEach((bit, index) => {
                const bitElement = document.createElement('span');
                bitElement.className = 'bit';
                bitElement.textContent = bit;
                
                if (bit === 1) {
                    bitElement.classList.add('active');
                }
                
                // Highlight si c'est un des indices recherchés
                if (highlightIndices.includes(index)) {
                    bitElement.classList.add('highlight');
                }
                
                bitsetDiv.appendChild(bitElement);
            });
            
            // Afficher les stats
            if (statsDiv) {
                statsDiv.innerHTML = `
                    📊 <strong>Statistiques:</strong><br>
                    Échantillon: ${data.sample_size.toLocaleString()} bits<br>
                    Taille totale: ${data.total_size.toLocaleString()} bits<br>
                    Bits à 1: ${data.ones_count.toLocaleString()} (${data.fill_ratio}%)
                `;
            }
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du bitset:', error);
    }
}

// ===================================
// FONCTION UTILITAIRE D'AFFICHAGE
// ===================================

function showResult(element, message, type = 'info') {
    if (!element) return;
    
    element.innerHTML = message;
    
    // Retirer les anciennes classes
    element.classList.remove('result-success', 'result-error', 'result-warning', 'result-loading');
    
    // Ajouter la nouvelle classe
    switch (type) {
        case 'success':
            element.style.background = 'rgba(67, 233, 123, 0.2)';
            element.style.borderLeft = '4px solid #43e97b';
            break;
        case 'error':
            element.style.background = 'rgba(255, 107, 107, 0.2)';
            element.style.borderLeft = '4px solid #ff6b6b';
            break;
        case 'warning':
            element.style.background = 'rgba(255, 215, 0, 0.2)';
            element.style.borderLeft = '4px solid #ffd700';
            break;
        case 'loading':
            element.style.background = 'rgba(79, 172, 254, 0.2)';
            element.style.borderLeft = '4px solid #4facfe';
            break;
        default:
            element.style.background = 'rgba(0, 0, 0, 0.3)';
            element.style.borderLeft = 'none';
    }
}

// ===================================
// AUTO-REFRESH DU BITSET
// ===================================

// Rafraîchir le bitset toutes les 5 secondes si initialisé
setInterval(() => {
    if (bloomInitialized && currentSlide === 5) {
        updateBitsetDisplay();
    }
}, 5000);
