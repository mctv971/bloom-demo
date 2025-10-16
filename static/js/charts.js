// ===================================
// GRAPHIQUES CHART.JS POUR SLIDE 4
// ===================================

// Attendre que la page et Chart.js soient chargés
document.addEventListener('DOMContentLoaded', function() {
    // Attendre un peu pour s'assurer que Chart.js est disponible
    setTimeout(initCharts, 500);
});

function initCharts() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js non chargé');
        return;
    }

    // Configuration commune pour tous les graphiques
    Chart.defaults.color = '#ffffff';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
    
    initMemoryErrorChart();
    initSpeedComparisonChart();
}

// ===================================
// GRAPHIQUE 1 : Impact taux d'erreur sur mémoire
// ===================================
function initMemoryErrorChart() {
    const ctx = document.getElementById('memoryErrorChart');
    if (!ctx) return;

    // Données : bits par élément vs taux d'erreur
    const errorRates = [0.001, 0.005, 0.01, 0.02, 0.05, 0.1];
    const bitsPerElement = errorRates.map(p => {
        // Formule : m/n = -ln(p) / (ln(2))^2
        return parseFloat((-Math.log(p) / (Math.log(2) ** 2)).toFixed(2));
    });

    // Inverser l'ordre pour avoir du plus petit au plus grand
    const reversedBits = [...bitsPerElement].reverse();
    const reversedErrors = [...errorRates].reverse();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: reversedBits.map(b => b.toFixed(1)),
            datasets: [{
                label: 'Taux d\'erreur',
                data: reversedErrors.map(p => (p * 100).toFixed(3)),
                borderColor: '#ffd700',
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#ffd700',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            return 'Taux d\'erreur: ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Bits par élément',
                        font: { size: 12, weight: 'bold' },
                        color: '#ffd700'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Taux d\'erreur (p) en %',
                        font: { size: 12, weight: 'bold' },
                        color: '#ffd700'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// ===================================
// GRAPHIQUE 2 : Comparaison vitesse HashSet vs BloomFilter
// ===================================
function initSpeedComparisonChart() {
    const ctx = document.getElementById('speedComparisonChart');
    if (!ctx) return;

    // Données : nombre d'éléments vs temps de recherche (ms)
    const sizes = ['10K', '100K', '1M', '10M'];
    const hashsetTimes = [0.12, 0.35, 0.80, 1.50]; // HashSet : O(1) mais avec collisions
    const bloomTimes = [0.02, 0.025, 0.028, 0.030]; // BloomFilter : O(k) constant

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sizes,
            datasets: [
                {
                    label: 'HashSet',
                    data: hashsetTimes,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#ff6b6b',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                },
                {
                    label: 'BloomFilter',
                    data: bloomTimes,
                    borderColor: '#4ecdc4',
                    backgroundColor: 'rgba(78, 205, 196, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#4ecdc4',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: { size: 11 },
                        padding: 10,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' ms';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Nombre d\'éléments',
                        font: { size: 12, weight: 'bold' },
                        color: '#ffd700'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temps de recherche (ms)',
                        font: { size: 12, weight: 'bold' },
                        color: '#ffd700'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}
