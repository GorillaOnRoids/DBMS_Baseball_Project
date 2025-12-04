// Global variables to store data and chart instance
let velocityChartInstance = null;
let allParsedData = []; // Stores the full dataset

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load default data on startup
    loadDefaultCSV();

    // 2. Setup listener for file uploads
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    // 3. Setup listener for Pitcher Selection
    const pitcherSelect = document.getElementById('pitcherSelect');
    if (pitcherSelect) {
        pitcherSelect.addEventListener('change', updateGraphFromSelection);
    }
});

async function loadDefaultCSV() {
    try {
        const response = await fetch('Magil_test.csv');
        if (!response.ok) throw new Error(`Default CSV not found`);
        const csvText = await response.text();
        processData(csvText);
    } catch (error) {
        console.warn("Could not load default CSV:", error.message);
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        processData(e.target.result);
    };
    reader.onerror = () => alert("Error reading file");
    reader.readAsText(file);
}

// --- Main Data Processing ---
function processData(csvText) {
    try {
        // 1. Parse CSV
        allParsedData = parseCSV(csvText);

        // 2. Populate the Dropdown with Pitcher Names
        populatePitcherDropdown(allParsedData);

        // 3. Render Graph (defaulting to "All" or the first pitcher)
        updateGraphFromSelection();

    } catch (err) {
        console.error(err);
        alert("Error processing data: " + err.message);
    }
}

function populatePitcherDropdown(data) {
    const select = document.getElementById('pitcherSelect');
    if (!select) return;

    // Get unique pitcher names
    const pitchers = new Set();
    data.forEach(row => {
        if (row.pitcher) pitchers.add(row.pitcher);
    });

    // Clear existing options (keep "All Pitchers" if you want)
    select.innerHTML = '<option value="All">All Pitchers</option>';

    // Sort and add options
    Array.from(pitchers).sort().forEach(pitcher => {
        const option = document.createElement('option');
        option.value = pitcher;
        option.textContent = pitcher;
        select.appendChild(option);
    });
}

function updateGraphFromSelection() {
    const select = document.getElementById('pitcherSelect');
    const selectedPitcher = select.value;

    // Filter data based on selection
    let filteredData = allParsedData;
    if (selectedPitcher !== "All") {
        filteredData = allParsedData.filter(row => row.pitcher === selectedPitcher);
    }

    // Calculate stats and render
    const chartData = calculateAverageVelocity(filteredData);
    renderChart(chartData, selectedPitcher);
}

// --- CSV Parsing ---
function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = parseLine(lines[0]);
    
    // Find column indices
    const dateIdx = headers.indexOf('Date');
    const veloIdx = headers.indexOf('EffectiveVelo'); 
    const pitcherIdx = headers.indexOf('Pitcher');

    if (dateIdx === -1 || veloIdx === -1) {
        throw new Error('CSV must contain "Date" and "EffectiveVelo" columns.');
    }

    const parsedData = [];

    for (let i = 1; i < lines.length; i++) {
        const row = parseLine(lines[i]);
        
        // Ensure row has data for date and velocity
        if (row[dateIdx] && row[veloIdx]) {
            parsedData.push({
                date: row[dateIdx].trim(),
                velocity: parseFloat(row[veloIdx].trim()),
                pitcher: pitcherIdx !== -1 ? row[pitcherIdx].trim() : "Unknown"
            });
        }
    }
    return parsedData;
}

// Robust Line Parser (handles "Name, Firstname")
function parseLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { result.push(cleanCell(current)); current = ''; }
        else { current += char; }
    }
    result.push(cleanCell(current));
    return result;
}

function cleanCell(val) {
    val = val.trim();
    if (val.startsWith('"') && val.endsWith('"')) return val.substring(1, val.length - 1);
    return val;
}

// --- Chart Logic ---
function calculateAverageVelocity(data) {
    const dateGroups = {};

    data.forEach(row => {
        // Filter invalid numbers
        if (!isNaN(row.velocity) && row.velocity > 0 && row.velocity < 150 && row.date) {
            const d = new Date(row.date);
            if (!isNaN(d.getTime())) {
                const dateKey = d.toISOString().split('T')[0];
                if (!dateGroups[dateKey]) dateGroups[dateKey] = { sum: 0, count: 0 };
                dateGroups[dateKey].sum += row.velocity;
                dateGroups[dateKey].count++;
            }
        }
    });

    const sortedDates = Object.keys(dateGroups).sort((a, b) => new Date(a) - new Date(b));
    const averages = sortedDates.map(date => (dateGroups[date].sum / dateGroups[date].count).toFixed(1));

    return { labels: sortedDates, data: averages };
}

function renderChart(chartData, labelPrefix) {
    const ctx = document.getElementById('velocityChart').getContext('2d');
    if (velocityChartInstance) velocityChartInstance.destroy();

    const titleText = labelPrefix === "All" ? "All Pitchers" : labelPrefix;

    velocityChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: `Avg Effective Velocity (${titleText})`,
                data: chartData.data,
                borderColor: '#d22d49',
                backgroundColor: 'rgba(210, 45, 73, 0.2)',
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#ae4545',
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: `Velocity Progression: ${titleText}` }
            },
            scales: {
                y: {
                    title: { display: true, text: 'Velocity (MPH)' },
                    suggestedMin: 70,
                    suggestedMax: 100
                },
                x: { title: { display: true, text: 'Date' } }
            }
        }
    });
}