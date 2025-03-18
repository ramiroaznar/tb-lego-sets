// Configuration
const API_BASE_URL = 'https://api.europe-west2.gcp.tinybird.co/v0/pipes';
const TINYBIRD_TOKEN = process.env.TINYBIRD_TOKEN;

// Global state
let currentPage = 1;
const PAGE_SIZE = 10;
let allSets = [];
let filteredSets = [];
let themes = [];
let subthemes = [];

// Charts
let setsByYearChart;
let partsByYearChart;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the dashboard
    initializeDashboard();
    
    // Event listeners
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('prev-page').addEventListener('click', () => navigatePage(-1));
    document.getElementById('next-page').addEventListener('click', () => navigatePage(1));
    document.getElementById('search-sets').addEventListener('input', debounce(filterSetsBySearch, 300));
    document.getElementById('sort-by').addEventListener('change', sortSets);
    
});

// Initialize the dashboard
async function initializeDashboard() {
    try {
        console.log("Initializing dashboard...");
        
        // Load themes first
        await loadThemes();
        
        // Set default filter values
        document.getElementById('year-start').value = '1987';
        document.getElementById('year-end').value = '1997';
        
        // Initialize charts 
        initializeCharts();
        
        // Load initial data with default filters
        await loadSets({
            theme: 'Castle',
            subtheme: 'Forestmen',
            year_start: 1987,
            year_end: 1997
        });
        
        console.log("Dashboard initialized successfully");
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Failed to initialize dashboard. Please check the console for details.');
    }
}

// Load sets from the API
async function loadSets(filters = {}) {
    try {
        // Construct query parameters
        const params = new URLSearchParams();
        params.append('token', TINYBIRD_TOKEN);
        
        // Add filters if provided
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        
        // Fetch data from the list_sets endpoint
        const response = await fetch(`${API_BASE_URL}/list_sets.json?${params.toString()}`);
        const data = await response.json();
        
        // Store the data - check if data.data exists, otherwise use empty array
        allSets = data.data || [];
        filteredSets = [...allSets];
        
        // Update UI
        updateUI();
        
        // Load theme stats
        await loadThemeStats(filters);
        
        return data;
    } catch (error) {
        console.error('Error loading sets:', error);
        // Initialize with empty arrays on error
        allSets = [];
        filteredSets = [];
        updateUI();
        throw error;
    }
}

// Load theme stats from the API
async function loadThemeStats(filters = {}) {
    try {
        // Construct query parameters
        const params = new URLSearchParams();
        params.append('token', TINYBIRD_TOKEN);
        
        // Add filters if provided
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        
        // Fetch data from the get_sets_by_theme_year endpoint
        const response = await fetch(`${API_BASE_URL}/get_sets_by_theme_year.json?${params.toString()}`);
        const data = await response.json();
        
        // Update charts with the data
        updateCharts(data.data || []);
        
        // Update stats cards with the data
        updateStatsCards(data.data || []);
        
        return data;
    } catch (error) {
        console.error('Error loading theme stats:', error);
        throw error;
    }
}

// Apply filters
async function applyFilters() {
    const theme = document.getElementById('theme-select').value;
    const subtheme = document.getElementById('subtheme-select').value;
    const yearStart = document.getElementById('year-start').value;
    const yearEnd = document.getElementById('year-end').value;
    
    // Reset pagination
    currentPage = 1;
    
    // Construct filters object
    const filters = {
        theme: theme,
        subtheme: subtheme,
        year_start: yearStart,
        year_end: yearEnd
    };
    
    // Load sets with filters
    await loadSets(filters);
}

// Filter sets by search term
function filterSetsBySearch() {
    const searchTerm = document.getElementById('search-sets').value.toLowerCase().trim();
    
    if (!searchTerm) {
        // If search is empty, reset to all sets
        filteredSets = [...allSets];
    } else {
        // Filter sets by search term
        filteredSets = allSets.filter(set => {
            return (
                (set.set_name && set.set_name.toLowerCase().includes(searchTerm)) ||
                (set.set_num && set.set_num.toLowerCase().includes(searchTerm)) ||
                (set.parent_theme_name && set.parent_theme_name.toLowerCase().includes(searchTerm)) ||
                (set.theme_name && set.theme_name.toLowerCase().includes(searchTerm))
            );
        });
    }
    
    // Reset pagination
    currentPage = 1;
    
    // Update UI
    updateUI();
}

// Sort sets
function sortSets() {
    const sortBy = document.getElementById('sort-by').value;
    
    switch (sortBy) {
        case 'year_desc':
            filteredSets.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        case 'year_asc':
            filteredSets.sort((a, b) => (a.year || 0) - (b.year || 0));
            break;
        case 'parts_desc':
            filteredSets.sort((a, b) => (b.num_parts || 0) - (a.num_parts || 0));
            break;
        case 'parts_asc':
            filteredSets.sort((a, b) => (a.num_parts || 0) - (b.num_parts || 0));
            break;
    }
    
    // Reset pagination
    currentPage = 1;
    
    // Update UI
    renderTable();
}

// Navigate pagination
function navigatePage(direction) {
    const newPage = currentPage + direction;
    const maxPage = Math.ceil(filteredSets.length / PAGE_SIZE);
    
    if (newPage >= 1 && newPage <= maxPage) {
        currentPage = newPage;
        renderTable();
    }
}

// Initialize charts
function initializeCharts() {
    // Sets by Year Chart
    const setsByYearCtx = document.getElementById('sets-by-year-chart').getContext('2d');
    setsByYearChart = new Chart(setsByYearCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Number of Sets',
                data: [],
                backgroundColor: 'var(--lego-blue)',
                borderColor: 'var(--lego-blue)',
                borderWidth: 1
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
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 14
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value, context) => {
                        return context.chart.data.labels[context.dataIndex];
                    },
                    color: 'white',
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    type: 'category',
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 10
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });

    // Parts Distribution Chart
    const partsDistributionCtx = document.getElementById('parts-by-year-chart').getContext('2d');
    partsByYearChart = new Chart(partsDistributionCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Average Parts per Set',
                data: [],
                backgroundColor: 'rgba(0, 175, 77, 0.2)',
                borderColor: 'var(--lego-green)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
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
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 14
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value, context) => {
                        return context.chart.data.labels[context.dataIndex];
                    },
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    type: 'category',
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 10
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Update charts with new data
function updateCharts(data) {
    if (!data || data.length === 0) {
        // Clear charts if no data
        setsByYearChart.data.labels = [];
        setsByYearChart.data.datasets[0].data = [];
        partsByYearChart.data.labels = [];
        partsByYearChart.data.datasets[0].data = [];
        setsByYearChart.update();
        partsByYearChart.update();
        return;
    }
    
    // Sort data by year
    data.sort((a, b) => a.year - b.year);
    
    // Extract years, set counts, and average parts per set
    const years = data.map(item => item.year);
    const setCounts = data.map(item => item.sets_count);
    const avgParts = data.map(item => item.avg_parts_per_set);
    
    // Update Sets by Year Chart
    setsByYearChart.data.labels = years;
    setsByYearChart.data.datasets[0].data = setCounts;
    setsByYearChart.update();
    
    // Update Parts by Year Chart
    partsByYearChart.data.labels = years;
    partsByYearChart.data.datasets[0].data = avgParts;
    partsByYearChart.update();
    
    // Update stats cards
    updateStatsCards(data);
}

// Update stats cards with aggregated data
function updateStatsCards(data) {
    const totalSets = data.reduce((sum, item) => sum + item.sets_count, 0);
    const totalParts = data.reduce((sum, item) => sum + (item.parts_count || 0), 0);
    const avgPartsPerSet = totalSets > 0 ? Math.round(totalParts / totalSets) : 0;
    
    document.querySelector('#total-sets .stat-value').textContent = totalSets.toLocaleString();
    document.querySelector('#total-parts .stat-value').textContent = totalParts.toLocaleString();
    document.querySelector('#avg-parts .stat-value').textContent = avgPartsPerSet.toLocaleString();
}

// Update UI elements
function updateUI() {
    // Render table
    renderTable();
    
    // Update stats in case we don't have theme data yet
    const totalSets = filteredSets.length;
    const totalParts = filteredSets.reduce((sum, set) => sum + (set.num_parts || 0), 0);
    const avgPartsPerSet = totalSets > 0 ? Math.round(totalParts / totalSets) : 0;
    
    document.querySelector('#total-sets .stat-value').textContent = totalSets.toLocaleString();
    document.querySelector('#total-parts .stat-value').textContent = totalParts.toLocaleString();
    document.querySelector('#avg-parts .stat-value').textContent = avgPartsPerSet.toLocaleString();
}

// Render the table with sets
function renderTable() {
    const tableBody = document.getElementById('sets-table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    // Calculate the start and end index for pagination
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, filteredSets.length);
    
    // Loop through the filtered sets and create table rows
    for (let i = startIndex; i < endIndex; i++) {
        const set = filteredSets[i];
        
        const row = document.createElement('tr');
        
        // Create a cell for the image
        const imageCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = set.img_url; // Assuming set.imageUrl contains the image URL
        img.alt = set.set_name; // Set alt text for accessibility
        img.style.width = '50px'; // Set a small width for the image
        img.style.height = 'auto'; // Maintain aspect ratio
        imageCell.appendChild(img);
        row.appendChild(imageCell);
        
        // Create a cell for the set name
        const nameCell = document.createElement('td');
        nameCell.textContent = set.set_name;
        row.appendChild(nameCell);
        
        // Create a cell for the year
        const yearCell = document.createElement('td');
        yearCell.textContent = set.year;
        row.appendChild(yearCell);
        
        // Create a cell for the theme
        const themeCell = document.createElement('td');
        themeCell.textContent = set.theme_name; // Assuming this property exists
        row.appendChild(themeCell);
        
        // Create a cell for the subtheme
        const subthemeCell = document.createElement('td');
        subthemeCell.textContent = set.subtheme_name; // Assuming this property exists
        row.appendChild(subthemeCell);
        
        // Create a cell for the number of parts
        const partsCell = document.createElement('td');
        partsCell.textContent = set.num_parts || 0; // Assuming this property exists
        row.appendChild(partsCell);
        
        // Add the row to the table body
        tableBody.appendChild(row);
    }
}

// Utility function to debounce function calls
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Load themes from the API
async function loadThemes() {
    try {
        console.log("Loading themes from API...");
        const response = await fetch(`${API_BASE_URL}/get_themes.json?token=${TINYBIRD_TOKEN}`);
        const data = await response.json();
        
        const themeSelect = document.getElementById('theme-select');
        themeSelect.innerHTML = '<option value="">All Themes</option>'; // Reset options
        
        if (data.data && Array.isArray(data.data)) {
            data.data.forEach(theme => {
                const option = document.createElement('option');
                option.value = theme.theme_name; // Adjust property name if needed
                option.textContent = theme.theme_name;
                themeSelect.appendChild(option);
            });
            
            console.log(`Loaded ${data.data.length} themes from API`);
            
            // Set default theme to Castle if it exists
            const defaultTheme = 'Castle';
            const themeExists = data.data.some(theme => theme.name === defaultTheme);
            
            if (themeExists) {
                themeSelect.value = defaultTheme;
                console.log(`Set default theme to ${defaultTheme}`);
                
                // Load subthemes for default theme
                await loadSubthemes(defaultTheme);
            } else {
                console.log(`Default theme ${defaultTheme} not found`);
            }
        }
        
        // Setup theme change event handler
        themeSelect.addEventListener('change', async function() {
            const selectedTheme = this.value;
            console.log(`Theme changed to: ${selectedTheme}`);
            await loadSubthemes(selectedTheme);
        });
        
    } catch (error) {
        console.error('Error loading themes:', error);
    }
}

// Load subthemes based on the selected theme
async function loadSubthemes(theme) {
    if (!theme) {
        console.log("No theme selected, skipping subtheme loading");
        const subthemeSelect = document.getElementById('subtheme-select');
        subthemeSelect.innerHTML = '<option value="">All Subthemes</option>';
        return;
    }
    
    try {
        console.log(`Loading subthemes for theme: ${theme}`);
        const response = await fetch(`${API_BASE_URL}/get_subthemes.json?token=${TINYBIRD_TOKEN}&theme=${theme}`);
        const data = await response.json();
        
        const subthemeSelect = document.getElementById('subtheme-select');
        subthemeSelect.innerHTML = '<option value="">All Subthemes</option>'; // Reset options
        
        if (data.data && Array.isArray(data.data)) {
            data.data.forEach(subtheme => {
                const option = document.createElement('option');
                option.value = subtheme.subtheme_name; // Adjust property name if needed
                option.textContent = subtheme.subtheme_name;
                subthemeSelect.appendChild(option);
            });
            
            console.log(`Loaded ${data.data.length} subthemes for theme ${theme}`);
            
            // Set default subtheme for Castle
            if (theme === 'Castle') {
                const defaultSubtheme = 'Forestmen';
                const subthemeExists = data.data.some(subtheme => subtheme.name === defaultSubtheme);
                
                if (subthemeExists) {
                    subthemeSelect.value = defaultSubtheme;
                    console.log(`Set default subtheme to ${defaultSubtheme}`);
                } else {
                    console.log(`Default subtheme ${defaultSubtheme} not found`);
                }
            }
        }
    } catch (error) {
        console.error(`Error loading subthemes for theme ${theme}:`, error);
    }
} 