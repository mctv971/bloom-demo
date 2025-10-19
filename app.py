from flask import Flask, render_template, request, jsonify
import json
import time
from bloom import BloomFilter

app = Flask(__name__)

# Variables globales
bloom_filter = None
words_set = set()  # Pour la comparaison classique
all_words = []

# Charger les mots au démarrage
with open('words_10000.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    all_words = data.get('words', [])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/init', methods=['POST'])
def init_filter():
    """Initialise un nouveau BloomFilter avec les paramètres donnés"""
    global bloom_filter, words_set
    
    data = request.get_json()
    n = int(data.get('n', 1000))
    p = float(data.get('p', 0.01))
    
    try:
        bloom_filter = BloomFilter(n, p)
        words_set.clear()

        
        return jsonify({
            "success": True,
            "m": bloom_filter.m,
            "k": bloom_filter.k,
            "capacity": bloom_filter.capacity,
            "error_rate": bloom_filter.error_rate,
            "efficiency": round(bloom_filter.m / n, 2)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/add_words', methods=['POST'])
def add_words():
    """Ajoute des mots au filtre et au set"""
    global bloom_filter, words_set
    
    if bloom_filter is None:
        return jsonify({"success": False, "error": "Filtre non initialisé"}), 400
    
    data = request.get_json()
    
    # Accepter soit 'n' (nombre de mots depuis all_words) soit 'words' (liste de mots)
    if 'words' in data:
        words_to_add = data['words']
    else:
        n = int(data.get('n', 100))
        n = min(n, len(all_words))
        words_to_add = all_words[:n]
    
    # Ajouter les mots
    start_bloom = time.perf_counter()
    for word in words_to_add:
        bloom_filter.add(word)
    time_bloom = time.perf_counter() - start_bloom
    
    start_set = time.perf_counter()
    for word in words_to_add:
        words_set.add(word)
    time_set = time.perf_counter() - start_set
    
    return jsonify({
        "success": True,
        "words": words_to_add,  # Return the actual words added
        "words_added": len(words_to_add),
        "time_bloom": round(time_bloom * 1000, 4),  # en ms
        "time_set": round(time_set * 1000, 4),
        "bloom_count": len(bloom_filter)
    })

@app.route('/api/test_word', methods=['POST'])
def test_word():
    """Teste si un mot est présent (comparaison Bloom vs set classique)"""
    global bloom_filter, words_set
    
    if bloom_filter is None:
        return jsonify({"success": False, "error": "Filtre non initialisé"}), 400
    
    data = request.get_json()
    word = data.get('word', '').strip()
    
    if not word:
        return jsonify({"success": False, "error": "Mot vide"}), 400
    
    # Test avec BloomFilter
    start_bloom = time.perf_counter()
    bloom_result = bloom_filter.__contains__(word)
    time_bloom = time.perf_counter() - start_bloom
    
    # Test avec set classique
    start_set = time.perf_counter()
    set_result = False
    for elm in words_set:
        if elm == word:
            set_result = True
            break
    time_set = time.perf_counter() - start_set
    
    # Calculer les indices de hash pour visualisation
    hash_indices = list(bloom_filter._hashes(word))
    
    return jsonify({
        "success": True,
        "word": word,
        "result": bloom_result,
        "bloom_result": bloom_result,
        "set_result": set_result,
        "time_bloom": round(time_bloom * 1000000, 2),  # en microseconds
        "time_set": round(time_set * 1000000, 2),
        "indices": hash_indices[:10],  # Limiter à 10 pour l'affichage
        "hash_indices": hash_indices[:10],
        "state_bits": [bloom_filter.bitset.get(idx) for idx in bloom_filter._hashes(word)][:10],
        "is_false_positive": bloom_result and not set_result
    })

@app.route('/api/bitset_state', methods=['GET'])
def bitset_state():
    """Retourne un échantillon du BitSet pour visualisation"""
    global bloom_filter
    
    if bloom_filter is None:
        return jsonify({"success": False, "error": "Filtre non initialisé"}), 400
    
    # Retourner tous les bits (ou échantillon si trop grand)
    sample_size = min(500, bloom_filter.m)
    bits = []
    
    for i in range(sample_size):
        bits.append(1 if bloom_filter.bitset.get(i) else 0)
    
    # Compter les bits à 1
    ones_count = sum(bits)
    fill_ratio = round(ones_count / sample_size * 100, 2)
    
    return jsonify({
        "success": True,
        "bitset": bits,
        "bits": bits,
        "sample_size": sample_size,
        "total_size": bloom_filter.m,
        "ones_count": ones_count,
        "fill_rate": fill_ratio
    })

@app.route('/api/bloom_stats', methods=['GET'])
def bloom_stats():
    """Retourne les statistiques du BloomFilter"""
    global bloom_filter
    
    if bloom_filter is None:
        return jsonify({"success": False, "error": "Filtre non initialisé"}), 400
    
    stats = bloom_filter.stats()
    print("BloomFilter stats:", stats)
    return jsonify({"success": True, "stats": stats})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Retourne les statistiques du filtre"""
    global bloom_filter, words_set
    
    if bloom_filter is None:
        return jsonify({"success": False, "error": "Filtre non initialisé"}), 400
    
    # Calculer la taille mémoire
    bloom_memory = bloom_filter.m / 8  # en bytes
    set_memory = len(words_set) * 50  # estimation (50 bytes par mot)
    
    return jsonify({
        "success": True,
        "bloom_items": len(bloom_filter),
        "set_items": len(words_set),
        "bloom_memory_bytes": bloom_memory,
        "set_memory_bytes": set_memory,
        "memory_ratio": round(set_memory / bloom_memory, 2) if bloom_memory > 0 else 0
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
