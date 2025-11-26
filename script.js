/* -----------------------
    CONFIG
-------------------------*/
// IMPORTANT: Replace with your actual CoinGecko API key
const API_KEY = "CG-q2s46bsTBEy1GyuX1bUNENTN"; 
const API_BASE_URL = "https://api.coingecko.com/api/v3/";

let currentData = [];
let priceChart = null;
let currentCurrency = "usd";

const pageContainer = document.getElementById("page-container");
const currencySelect = document.getElementById("currency-select");
const navLinks = document.querySelectorAll(".nav-link");

/* -----------------------
    PAGE TEMPLATES
-------------------------*/
const pages = {
    home: `
        <h1 class="main-title">LARGEST CRYPTO MARKETPLACE</h1>

        <div class="controls">
            <input type="text" id="search-input" placeholder="🔍 Search coins...">
           <button id="reload-btn">Reload <i class="fas fa-sync-alt"></i></button>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Coin</th>
                        <th>Price</th>
                        <th class="hide-mobile">24h</th>
                        <th class="hide-mobile">Market Cap</th>
                    </tr>
                </thead>
                <tbody id="crypto-list">
                    <tr><td colspan="5" class="loading-message">Loading...</td></tr>
                </tbody>
            </table>
        </div>

        <div id="chart-area">
            <h2 class="main-title">Price Chart</h2>
            <canvas id="price-chart"></canvas>
        </div>
    `,

    pricing: `
        <h2 class="main-title" style="font-size:3.5rem;">💰 Pricing Plans</h2>
        <div class="card-container">
            <div class="pricing-card">
                <h3 style="font-size:2rem; text-decoration:underline;">Free Tier</h3>
                <p class="price-tag" style="font-size:1.5rem;">$0/month</p>
                <ul>
                    <li>Real-time price data</li>
                    <li>Access to top 100 coins</li>
                    <li>Basic 7-day chart history</li>
                </ul>
                <button class="cta-button">Current Plan</button>
            </div>
            <div class="pricing-card premium">
                <h3 style="font-size:2rem; text-decoration:underline;">Crypto Plus</h3>
                <p class="price-tag" style="font-size:1.5rem;">$9.99/month</p>
                <ul>
                    <li>**All Free Tier features**</li>
                    <li>Access to all listed coins</li>
                    <li>Full 6-Month chart history</li>
                    <li>Ad-free experience</li>
                    <li>Priority support</li>
                </ul>
                <button class="cta-button">Upgrade Now</button>
            </div>
            <div class="pricing-card premium">
                <h3 style="font-size:2rem; text-decoration:underline;">Crypto Pro</h3>
                <p class="price-tag" style="font-size:1.5rem;">$19.99/month</p>
                <ul>
                    <li>**All Free Tier features**</li>
                    <li>Access to **all** listed coins</li>
                    <li>**Full** 1-year chart history</li>
                    <li>Ad-free experience</li>
                    <li>Priority support</li>
                    <li>Premium Course</li>
                    <li>Account Manager</li>
                </ul>
                <button class="cta-button">Upgrade Now</button>
            </div>
        </div>
        <p class="note" style="text-align: center; margin-top: 20px;">Plans are billed annually. Cancel anytime.</p>
    `,

    support: `
        <h2 class="main-title" style="font-size:3rem;">📞 Support Center</h2>
        
        <div class="support-contact">
            <h3 style="text-align:center; font-size:2.2rem; text-decoration:underline;">Contact Us</h3>
            <p><strong style="font-size: 1.3rem; text-decoration: underline; text-align: center;">Email:</strong> jatttmaam@gmail.com.</p>
            <p><strong style="font-size: 1.3rem; text-decoration: underline; text-align: center;">Phone:</strong> +91 97802-10548 [Mon-Fri, 9am - 5pm EST].</p>
            <p><strong style="font-size: 1.3rem; text-decoration: underline; text-align: center;">Live Chat:</strong> Available 24/7 on the bottom right of the screen.</p>
        </div>

        <ul class="faq-list">
            <h3 style="text-decoration: underline; text-align: center; font-size: 2.2em;">Frequently Asked Questions (FAQ)</h3>
            <li><strong style="font-size: 1.5rem; text-align: center; padding: 5px;">1. How often is the data updated?</strong><br> Answer = Data is updated every minute from the source API.</li>
            <li><strong style="font-size: 1.5rem; text-align: center; padding: 5px;">2. Which exchanges do you track?</strong><br> Answer = We aggregate data from major global exchanges.</li>
            <li><strong style="font-size: 1.5rem; text-align: center; padding: 5px;">3. How do I report a bug?</strong><br> Answer = Please email our support address with details.</li>
        </ul>
    `,

    about: `
        <div class="about-box">
            <h2 class="main-title" style="text-decoration: underline; font-size: 2.5em;">ℹ️ About CryptoTrack</h2>
            <p style="font-size: 1.2rem;">CryptoTrack is a leading platform dedicated to providing **accurate, real-time market data** for the world's most popular cryptocurrencies.</p>
            
            <h3 style="font-size: 1.7rem; text-decoration: underline;">Our Mission =)</h3><p style="font-size:1.2rem;">Our mission is to simplify the complex world of crypto by offering a clean, user-friendly interface for tracking prices, market capitalization, and 24-hour changes. We believe in empowering our users with transparent and timely information.</p>
            
            <h3 style="font-size: 1.7rem; text-decoration: underline;">Technology =)</h3>
            <p>This site is built using vanilla JavaScript and integrates with the CoinGecko API for reliable data feeds. Charting is powered by the popular Chart.js library.</p>
        </div>
    `
};

/* -----------------------
    LOAD PAGE
-------------------------*/
function loadPage(page) {
    pageContainer.innerHTML = pages[page];

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.dataset.page === page) link.classList.add("active");
    });

    // Re-initialize event listeners for HOME page controls after loading its content
    if (page === "home") initHomePage();
}

/* -----------------------
    HOME INITIALIZER
-------------------------*/
function initHomePage() {
    // Check if elements exist before assigning handlers
    const reloadBtn = document.getElementById("reload-btn");
    const searchInput = document.getElementById("search-input");
    
    if (reloadBtn) reloadBtn.onclick = fetchCryptoData;
    if (searchInput) searchInput.onkeyup = filterCoins;
    
    fetchCryptoData();
}

/* -----------------------
    FETCH COIN DATA
-------------------------*/
async function fetchCryptoData() {
    const list = document.getElementById("crypto-list");
    if (list) list.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

    // Ensure API Key is included
    const url = `${API_BASE_URL}coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&x_cg_api_key=${API_KEY}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`API returned status ${res.status}`);
        }
        currentData = await res.json();
        renderCoinTable(currentData);
    } catch (error) {
        console.error("Error fetching crypto data:", error);
        if (list) list.innerHTML = `<tr><td colspan="5" style="color: ${getComputedStyle(document.documentElement).getPropertyValue('--negative-color')};">Error loading data. Check console for details.</td></tr>`;
    }
}

/* -----------------------
    RENDER TABLE
-------------------------*/
function renderCoinTable(data) {
    const list = document.getElementById("crypto-list");
    if (!list) return;

    list.innerHTML = "";

    if (data.length === 0) {
        list.innerHTML = `<tr><td colspan="5" style="text-align: center;">No coins found matching your search.</td></tr>`;
        return;
    }

    data.forEach(coin => {
        const row = document.createElement("tr");
        row.onclick = () => fetchChart(coin.id, coin.name);

        const priceChangeColor = coin.price_change_percentage_24h > 0 
                                 ? getComputedStyle(document.documentElement).getPropertyValue('--positive-color') 
                                 : getComputedStyle(document.documentElement).getPropertyValue('--negative-color');

        row.innerHTML = `
            <td>${coin.market_cap_rank}</td>
            <td><img src="${coin.image}" width="22"> ${coin.name}</td>
            <td>${formatPrice(coin.current_price)}</td>
            <td class="hide-mobile" style="color:${priceChangeColor}">
                ${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : 'N/A'}%
            </td>
            <td class="hide-mobile">${formatPrice(coin.market_cap)}</td>
        `;
        list.appendChild(row);
    });
}

/* Format price based on currency */
function formatPrice(value) {
    const currencySymbols = { usd: "$", inr: "₹", eur: "€" };
    // Use Intl.NumberFormat for more accurate and locale-specific formatting
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: currentCurrency.toUpperCase(),
        minimumFractionDigits: 0, // No decimals for large values like Market Cap
        maximumFractionDigits: (value < 10) ? 4 : 2 // More decimals for small prices
    }).format(value);
}

/* -----------------------
    SEARCH FILTER
-------------------------*/
function filterCoins() {
    const q = document.getElementById("search-input").value.toLowerCase();
    const filtered = currentData.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
    renderCoinTable(filtered);
}

/* -----------------------
    FETCH CHART
-------------------------*/
async function fetchChart(id, name) {
    const chartArea = document.getElementById("chart-area");
    if (chartArea) chartArea.style.display = "block";

    const url = `${API_BASE_URL}coins/${id}/market_chart?vs_currency=${currentCurrency}&days=7&x_cg_api_key=${API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        // Create date labels and price data
        const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString('en-US'));
        const prices = data.prices.map(p => p[1]);

        drawChart(labels, prices, name);
    } catch (error) {
        console.error(`Error fetching chart data for ${id}:`, error);
        // Optionally display an error message in the chart area
        if (chartArea) chartArea.innerHTML = `<h2 class="main-title">Price Chart</h2><p style="text-align:center; color:red;">Could not load chart data.</p>`;
    }
}

/* -----------------------
    DRAW CHART
-------------------------*/
function drawChart(labels, prices, name) {
    const ctx = document.getElementById("price-chart");
    if (!ctx) return;

    if (priceChart) priceChart.destroy();

    priceChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: name,
                data: prices,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-neon'),
                backgroundColor: "rgba(0,255,200,0.2)",
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'white' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'white' }
                }
            },
            plugins: {
                legend: { labels: { color: 'white' } }
            }
        }
    });
}

/* -----------------------
    NAV LINK EVENT
-------------------------*/
navLinks.forEach(link => {
    link.onclick = () => loadPage(link.dataset.page);
});

/* -----------------------
    CURRENCY SELECTOR
-------------------------*/
currencySelect.onchange = (e) => {
    currentCurrency = e.target.value;
    // Only fetch new data if on the 'home' page
    if (document.getElementById('crypto-list')) {
        fetchCryptoData();
    }
};

/* -----------------------
    INITIAL LOAD
-------------------------*/
loadPage("home");