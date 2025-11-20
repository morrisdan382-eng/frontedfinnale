console.log("SCRIPT IS LOADING!");
require('dotenv').config(); // This line loads your .env file
const signupForm = document.getElementById("signupForm");
if (signupForm) {
signupForm.addEventListener("submit", (e) => {
e.preventDefault();
const username = document.getElementById("signupUsername").value.trim();
const password = document.getElementById("signupPassword").value.trim();
const role = document.getElementById("signupUserType").value;

if (!username || !password || !role) {
addAlert("Please fill in all fields.", "error");
return;
}

// Check if user already exists
if (localStorage.getItem(username)) {
addAlert("Username already exists. Please choose another.", "error");
return;
}

// Save credentials in localStorage
const user = { username, password, role };
localStorage.setItem(username, JSON.stringify(user));
addAlert("Account created successfully!", "success");

setTimeout(() => {
window.location.href = "login.html";
}, 1500);
});
}

// ====== LOGIN FUNCTIONALITY ======
const loginForm = document.getElementById("loginForm");
if (loginForm) {
loginForm.addEventListener("submit", (e) => {
e.preventDefault();
const username = document.getElementById("loginUsername").value.trim();
const password = document.getElementById("loginPassword").value.trim();
const role = document.getElementById("userType").value;

const storedUser = localStorage.getItem(username);
if (!storedUser) {
addAlert("User not found. Please sign up first.", "error");
return;
}

const user = JSON.parse(storedUser);
if (user.password === password && user.role === role) {
// Save session
sessionStorage.setItem("currentUser", username);
sessionStorage.setItem("currentRole", role);

addAlert("Login successful!", "success");

// Redirect with role
setTimeout(() => {
if (role === "Admin") {
window.location.href = "admin.html";
} else if (role === "Client") {
window.location.href = "client.html";
}
}, 1000);
} else {
addAlert("Invalid username, password, or role.", "error");
}
});
}

// ====== DASHBOARD CHECK ======
document.addEventListener("DOMContentLoaded", () => {
const currentPage = window.location.pathname;
const user = sessionStorage.getItem("currentUser");
const role = sessionStorage.getItem("currentRole");

if (currentPage.includes("admin.html") || currentPage.includes("client.html")) {
if (!user || !role) {
addAlert("Please login first.", "error");
setTimeout(() => {
window.location.href = "login.html";
}, 1500);
return;
}

const welcome = document.getElementById("welcomeMsg");
const roleDisplay = document.getElementById("roleDisplay");
if (welcome) welcome.textContent = `Welcome, ${user}!`;
if (roleDisplay) roleDisplay.textContent = `Role: ${role}`;

const adminSection = document.getElementById("adminSection");
if (role !== "Admin" && adminSection) {
adminSection.style.display = "none";
}

// Update last login time
const lastLoginEl = document.getElementById("lastLogin");
if (lastLoginEl) {
const now = new Date();
const formattedTime = now.toLocaleString('en-US', {
month: 'short',
day: 'numeric',
year: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
lastLoginEl.textContent = `Last login: ${formattedTime}`;
}
}
});

// ====== LOGOUT FUNCTION ======
function logout() {
addAlert("Logging out...", "info");
setTimeout(() => {
sessionStorage.clear();
window.location.href = "login.html";
}, 1000);
}

// ====== ENHANCED ALERT FUNCTION ======
function addAlert(message, type = "info") {
let alertsContainer = document.getElementById("alerts");

if (!alertsContainer) {
alertsContainer = document.createElement("div");
alertsContainer.id = "alerts";
alertsContainer.className = "alert-box";

const firstCard = document.querySelector(".card");
if (firstCard) {
firstCard.parentNode.insertBefore(alertsContainer, firstCard.nextSibling);
} else {
document.body.appendChild(alertsContainer);
}
}

const alertEl = document.createElement("div");
alertEl.className = `alert ${type}`;
alertEl.textContent = message;

alertsContainer.appendChild(alertEl);

while (alertsContainer.children.length > 5) {
alertsContainer.removeChild(alertsContainer.firstChild);
}

alertsContainer.scrollTop = alertsContainer.scrollHeight;
}

function showAlert(msg) {
addAlert(msg, "info");
}

// ===================================================================
// === NEW: BACKEND INTEGRATION STARTS HERE ===
// ===================================================================

// The hardcoded rooms array is now gone. We will fetch it from the backend.
let rooms = [];

// This function fetches room data from our backend API
async function fetchRoomsFromBackend() {
try {
const response = await fetch('http://localhost:3000/api/rooms');
if (!response.ok) {
throw new Error('Network response was not ok');
}
rooms = await response.json();
console.log('Successfully fetched rooms from backend:', rooms);
} catch (error) {
console.error('Error fetching rooms:', error);
addAlert('Failed to load room data from server.', 'error');
// If it fails, we can add some fallback data so the UI doesn't break
rooms = [
{ id: 1, name: "Connection Error", temp: 0, lightOn: false, brightness: 0, energyUsage: 0 },
];
}
}

// This function will be used later to send updates TO the backend
async function updateRoomOnBackend(roomId, updatedData) {
// NOTE: This is a placeholder. We will build the backend endpoint for this later.
console.log(`Pretending to send update for room ${roomId} with data:`, updatedData);
// Example of what the code will look like:
// await fetch(`http://localhost:3000/api/rooms/${roomId}`, {
// method: 'PUT',
// headers: { 'Content-Type': 'application/json' },
// body: JSON.stringify(updatedData)
// });
}


// ===================================================================
// === END OF NEW BACKEND INTEGRATION ===
// ===================================================================


// ====== SIMULATION LOGIC ======
let simInterval = null;
let simSeconds = 0;
let isSimulationRunning = false;

function startSimulation() {
if (isSimulationRunning) return;

isSimulationRunning = true;
simSeconds = 0;

const simTime = document.getElementById("simTime");
const startBtn = document.getElementById("startSim");
const stopBtn = document.getElementById("stopSim");

if (simTime) simTime.textContent = "Sim time: 0s";
if (startBtn) startBtn.disabled = true;
if (stopBtn) stopBtn.disabled = false;

const spinner = startBtn?.querySelector(".spinner");
if (spinner) spinner.style.display = "inline-block";

if (simInterval) clearInterval(simInterval);

simInterval = setInterval(() => {
simSeconds += 3;
if (simTime) simTime.textContent = `Sim time: ${simSeconds}s`;
stepSim();
}, 3000);

addAlert("Simulation started", "success");
}

function stopSimulation() {
if (!isSimulationRunning) return;

isSimulationRunning = false;
clearInterval(simInterval);
simInterval = null;

const startBtn = document.getElementById("startSim");
const stopBtn = document.getElementById("stopSim");

if (startBtn) startBtn.disabled = false;
if (stopBtn) stopBtn.disabled = true;

const spinner = startBtn?.querySelector(".spinner");
if (spinner) spinner.style.display = "none";

addAlert("Simulation stopped", "info");
}

function resetSimulation() {
stopSimulation();
simSeconds = 0;

const simTime = document.getElementById("simTime");
if (simTime) simTime.textContent = "Sim time: 0s";

// Instead of resetting a local array, we will re-fetch from the backend
fetchRoomsFromBackend().then(() => {
if (typeof renderRoomCards === "function") {
renderRoomCards();
} else {
renderRooms();
}
updateStats();
});

addAlert("Simulation reset", "info");
}


// ====== CLIENT ROOM DATA ======
const clientRoomData = {
temp: 24,
targetTemp: 22,
lightOn: true,
brightness: 75,
acOn: false,
heaterOn: false,
autoMode: true,
energyUsage: 0.5
};
// ===================================================================
// === NEW: BACKEND INTEGRATION STARTS HERE ===
// ===================================================================

// This will hold our room data from the backend
let rooms = [];

// This function fetches room data from our backend API
async function fetchRoomsFromBackend() {
  try {
    const response = await fetch('http://localhost:3000/api/rooms');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    rooms = await response.json();
    console.log('Successfully fetched rooms from backend:', rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    addAlert('Failed to load room data from server.', 'error');
    // If it fails, we can add some fallback data so the UI doesn't break
    rooms = [
      { id: 1, name: "Connection Error", temperature: 0, lightStatus: "off", brightness: 0, energyUsage: 0 },
    ];
  }
}

// This function will be used later to send updates TO the backend
async function updateRoomOnBackend(roomId, updatedData) {
  // NOTE: This is a placeholder. We will build the backend endpoint for this later.
  console.log(`Pretending to send update for room ${roomId} with data:`, updatedData);
  // Example of what the code will look like:
  // await fetch(`http://localhost:3000/api/rooms/${roomId}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(updatedData)
  // });
}


// ===================================================================
// === END OF NEW BACKEND INTEGRATION ===
// ===================================================================

// ====== BRIGHTNESS CONTROL FUNCTIONS ======
function adjustBrightness(roomId, delta) {
const room = rooms.find(r => r.id === roomId);
if (room) {
room.brightness = Math.max(0, Math.min(100, room.brightness + delta));
room.lightStatus = room.brightness > 0 ? "on" : "off"; // Updated for backend data
if (typeof renderRoomCards === "function") {
renderRoomCards();
} else {
renderRooms();
}
updateStats();
addAlert(`${room.name} brightness adjusted to ${room.brightness}%`, "info");
// TODO: Send update to backend here
// updateRoomOnBackend(roomId, { brightness: room.brightness, lightStatus: room.lightStatus });
}
}

function setBrightness(roomId, brightness) {
const room = rooms.find(r => r.id === roomId);
if (room) {
room.brightness = brightness;
room.lightStatus = brightness > 0 ? "on" : "off"; // Updated for backend data
if (typeof renderRoomCards === "function") {
renderRoomCards();
} else {
renderRooms();
}
updateStats();
addAlert(`${room.name} brightness set to ${brightness}%`, "info");
// TODO: Send update to backend here
// updateRoomOnBackend(roomId, { brightness: room.brightness, lightStatus: room.lightStatus });
}
}

// Client brightness functions
function adjustClientBrightness(delta) {
clientRoomData.brightness = Math.max(0, Math.min(100, clientRoomData.brightness + delta));
clientRoomData.lightOn = clientRoomData.brightness > 0;
updateClientBrightnessBar();
updateClientStats();
addAlert(`Brightness adjusted to ${clientRoomData.brightness}%`, "info");
}

function setClientBrightness(brightness) {
clientRoomData.brightness = brightness;
clientRoomData.lightOn = brightness > 0;
updateClientBrightnessBar();
updateClientStats();
addAlert(`Brightness set to ${brightness}%`, "info");
}

// ====== TEMPERATURE CONTROL FUNCTIONS ======
function setTargetTemp(roomId, targetTemp) {
const room = rooms.find(r => r.id === roomId);
if (room) {
room.targetTemperature = parseInt(targetTemp); // Updated for backend data
addAlert(`${room.name} target temperature set to ${room.targetTemperature}°C`, "info");
if (room.autoMode) {
checkAutoMode(room);
}
// TODO: Send update to backend here
// updateRoomOnBackend(roomId, { targetTemperature: room.targetTemperature });
}
}

function toggleAC(roomId) {
const room = rooms.find(r => r.id === roomId);
if (room) {
room.acOn = !room.acOn;
if (room.acOn) {
room.heaterOn = false;
room.autoMode = false;
}
if (typeof renderRoomCards === "function") {
renderRoomCards();
} else {
renderRooms();
}
updateStats();
addAlert(`AC in ${room.name} turned ${room.acOn ? 'ON' : 'OFF'}`, "info");
}
}

function toggleHeater(roomId) {
const room = rooms.find(r => r.id === roomId);
if (room) {
room.heaterOn = !room.heaterOn;
if (room.heaterOn) {
room.acOn = false;
room.autoMode = false;
}
if (typeof renderRoomCards === "function") {
renderRoomCards();
} else {
renderRooms();
}
updateStats();
addAlert(`Heater in ${room.name} turned ${room.heaterOn ? 'ON' : 'OFF'}`, "info");
}
}

function toggleAuto(roomId) {
const room = rooms.find(r => r.id === roomId);
if (room) {
room.autoMode = !room.autoMode;
if (room.autoMode) {
checkAutoMode(room);
}
if (typeof renderRoomCards === "function") {
renderRoomCards();
} else {
renderRooms();
}
addAlert(`Auto mode in ${room.name} turned ${room.autoMode ? 'ON' : 'OFF'}`, "info");
}
}

function checkAutoMode(room) {
if (!room.autoMode) return;

if (room.temperature > room.targetTemperature + 2) { // Updated for backend data
room.acOn = true;
room.heaterOn = false;
} else if (room.temperature < room.targetTemperature - 2) { // Updated for backend data
room.heaterOn = true;
room.acOn = false;
} else {
room.acOn = false;
room.heaterOn = false;
}
}

// Client temperature functions
function setClientTargetTemp(targetTemp) {
clientRoomData.targetTemp = parseInt(targetTemp);
addAlert(`Target temperature set to ${clientRoomData.targetTemp}°C`, "info");
if (clientRoomData.autoMode) {
checkClientAutoMode();
}
}

function toggleClientAC() {
clientRoomData.acOn = !clientRoomData.acOn;
if (clientRoomData.acOn) {
clientRoomData.heaterOn = false;
clientRoomData.autoMode = false;
}
updateClientTempControls();
updateClientStats();
addAlert(`AC turned ${clientRoomData.acOn ? 'ON' : 'OFF'}`, "info");
}

function toggleClientHeater() {
clientRoomData.heaterOn = !clientRoomData.heaterOn;
if (clientRoomData.heaterOn) {
clientRoomData.acOn = false;
clientRoomData.autoMode = false;
}
updateClientTempControls();
updateClientStats();
addAlert(`Heater turned ${clientRoomData.heaterOn ? 'ON' : 'OFF'}`, "info");
}

function toggleClientAuto() {
clientRoomData.autoMode = !clientRoomData.autoMode;
if (clientRoomData.autoMode) {
checkClientAutoMode();
}
updateClientTempControls();
addAlert(`Auto mode turned ${clientRoomData.autoMode ? 'ON' : 'OFF'}`, "info");
}

function checkClientAutoMode() {
if (!clientRoomData.autoMode) return;

if (clientRoomData.temp > clientRoomData.targetTemp + 2) {
clientRoomData.acOn = true;
clientRoomData.heaterOn = false;
} else if (clientRoomData.temp < clientRoomData.targetTemp - 2) {
clientRoomData.heaterOn = true;
clientRoomData.acOn = false;
} else {
clientRoomData.acOn = false;
clientRoomData.heaterOn = false;
}

updateClientTempControls();
}

// ====== RENDER FUNCTIONS ======
function renderRooms() {
const table = document.getElementById("roomTable");
const avgTempEl = document.getElementById("avgTemp");
const lightsOnEl = document.getElementById("lightsOn");

if (!table) return;
table.innerHTML = "";

rooms.forEach((r) => { // Use the fetched data
const tr = document.createElement("tr");
// Use properties from the backend data
tr.innerHTML = `
<td>${r.name}</td>
<td>
${r.temperature.toFixed(1)} °C
<div class="temp-bar">
<div class="temp-fill" style="width:${(r.temperature - 18) * 6}%;"></div>
</div>
</td>
<td>
<span class="light-badge ${r.lightStatus === 'on' ? "light-on" : "light-off"}">
<img src="assets/${r.lightStatus === 'on' ? "bulb_on.png" : "bulb_off.png"}" width="22" height="22">
${r.lightStatus === 'on' ? "ON" : "OFF"}
</span>
</td>
<td><button class="btn" onclick="toggleLight(${r.id})">Toggle</button></td>
`;
table.appendChild(tr);
});

const avg = rooms.reduce((s, r) => s + r.temperature, 0) / rooms.length; // Use temperature
if (avgTempEl) avgTempEl.textContent = avg.toFixed(1) + "°C";
if (lightsOnEl) lightsOnEl.textContent = rooms.filter(r => r.lightStatus === 'on').length + " ON"; // Use lightStatus
}

function toggleLight(roomId) { // This now expects an ID
const room = rooms.find(r => r.id === roomId);
if (room) {
room.lightStatus = room.lightStatus === 'on' ? 'off' : 'on'; // Toggle the status
room.brightness = room.lightStatus === 'on' ? 50 : 0; // Set brightness
addAlert(`${room.name} light ${room.lightStatus === 'on' ? 'ON' : 'OFF'}`, "info");

if (typeof renderRoomCards === "function") {
renderRoomCards();
} else {
renderRooms();
}
updateStats();
// TODO: Send update to backend here
// updateRoomOnBackend(roomId, { lightStatus: room.lightStatus, brightness: room.brightness });
}
}

function stepSim() {
// This logic will eventually be moved to the backend.
// For now, it continues to work on the data we fetched.
rooms.forEach((r) => {
const tempChange = (Math.random() - 0.5) * 0.5;
r.temperature = Math.round((r.temperature + tempChange) * 10) / 10;

if (r.acOn) {
r.temperature = Math.max(16, r.temperature - 0.3);
}
if (r.heaterOn) {
r.temperature = Math.min(30, r.temperature + 0.3);
}

if (r.autoMode) {
checkAutoMode(r);
}

let energy = 0;
if (r.lightStatus === 'on') { // Use lightStatus
energy += 0.1 + (r.brightness / 100) * 0.4;
}
if (r.acOn) {
energy += 0.8;
}
if (r.heaterOn) {
energy += 0.6;
}
r.energyUsage = Math.round(energy * 10) / 10;

if (r.temperature > 28) {
addAlert(`High temperature in ${r.name}: ${r.temperature.toFixed(1)}°C`, "warning");
}
if (r.temperature < 18) {
addAlert(`Low temperature in ${r.name}: ${r.temperature.toFixed(1)}°C`, "warning");
}
});

const tempChange = (Math.random() - 0.5) * 0.5;
clientRoomData.temp = Math.round((clientRoomData.temp + tempChange) * 10) / 10;

if (clientRoomData.acOn) {
clientRoomData.temp = Math.max(16, clientRoomData.temp - 0.3);
}
if (clientRoomData.heaterOn) {
clientRoomData.temp = Math.min(30, clientRoomData.temp + 0.3);
}

if (clientRoomData.autoMode) {
checkClientAutoMode();
}

let energy = 0;
if (clientRoomData.lightOn) {
energy += 0.1 + (clientRoomData.brightness / 100) * 0.4;
}
if (clientRoomData.acOn) {
energy += 0.8;
}
if (clientRoomData.heaterOn) {
energy += 0.6;
}
clientRoomData.energyUsage = Math.round(energy * 10) / 10;

if (clientRoomData.temp > 28) {
addAlert(`High temperature in your room: ${clientRoomData.temp.toFixed(1)}°C`, "warning");
}
if (clientRoomData.temp < 18) {
addAlert(`Low temperature in your room: ${clientRoomData.temp.toFixed(1)}°C`, "warning");
}

if (typeof renderRoomCards === "function") {
renderRoomCards();
} else {
renderRooms();
}

if (typeof updateClientTempControls === "function") {
updateClientTempControls();
}

updateStats();
if (typeof updateClientStats === "function") {
updateClientStats();
}
}

function updateStats() {
const avgTempEl = document.getElementById("avgTemp");
const lightsOnEl = document.getElementById("lightsOn");
const energyUsageEl = document.getElementById("energyUsage");

const avgTemp = Math.round(rooms.reduce((sum, room) => sum + room.temperature, 0) / rooms.length); // Use temperature
if (avgTempEl) avgTempEl.textContent = `${avgTemp}°C`;

const lightsOn = rooms.filter(room => room.lightStatus === 'on').length; // Use lightStatus
if (lightsOnEl) lightsOnEl.textContent = lightsOn;

const totalEnergy = rooms.reduce((sum, room) => sum + room.energyUsage, 0).toFixed(1);
if (energyUsageEl) energyUsageEl.textContent = `${totalEnergy} kWh`;

const totalLightsEl = document.getElementById("totalLights");
const activeACEl = document.getElementById("activeAC");
const activeHeatersEl = document.getElementById("activeHeaters");
const avgBrightnessEl = document.getElementById("avgBrightness");

if (totalLightsEl) totalLightsEl.textContent = rooms.filter(r => r.lightStatus === 'on').length; // Use lightStatus
if (activeACEl) activeACEl.textContent = rooms.filter(r => r.acOn).length;
if (activeHeatersEl) activeHeatersEl.textContent = rooms.filter(r => r.heaterOn).length;

if (avgBrightnessEl) {
const avgBrightness = Math.round(
rooms.reduce((sum, room) => sum + room.brightness, 0) / rooms.length
);
avgBrightnessEl.textContent = `${avgBrightness}%`;
}
}

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. AUTHENTICATION & DASHBOARD SETUP ---
  const user = sessionStorage.getItem("currentUser");
  const role = sessionStorage.getItem("currentRole");

  if (window.location.pathname.includes("admin.html") || window.location.pathname.includes("client.html")) {
    if (!user || !role) {
      addAlert("Please login first.", "error");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
      return; // Stop here if not logged in
    }

    // If logged in, update welcome message and role
    const welcome = document.getElementById("welcomeMsg");
    const roleDisplay = document.getElementById("roleDisplay");
    if (welcome) welcome.textContent = `Welcome, ${user}!`;
    if (roleDisplay) roleDisplay.textContent = `Role: ${role}`;

    const lastLoginEl = document.getElementById("lastLogin");
    if (lastLoginEl) {
      const now = new Date();
      const formattedTime = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      lastLoginEl.textContent = `Last login: ${formattedTime}`;
    }
  }

  // --- 2. FETCH DATA AND INITIALIZE UI ---
  // This is the key function that connects to your backend!
  fetchRoomsFromBackend().then(() => {
    // After data is fetched, render the room cards and update stats
    renderRoomCards();
    updateStats();
  });

  // --- 3. ATTACH ALL OTHER EVENT LISTENERS ---
  const startBtn = document.getElementById("startSim");
  const stopBtn = document.getElementById("stopSim");
  const resetBtn = document.getElementById("resetSim");
  const logoutBtn = document.getElementById("logoutBtn");
  
  if (startBtn) startBtn.addEventListener("click", startSimulation);
  if (stopBtn) stopBtn.addEventListener("click", stopSimulation);
  if (resetBtn) resetBtn.addEventListener("click", resetSimulation);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});