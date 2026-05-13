const API_URL = 'http://localhost:5000/api';
const socket = io();

let gameState = {
  player: null,
  dragons: [],
  team: [],
  caughtDragons: {},
  currentMap: null,
  dragonSpecies: [],
  token: localStorage.getItem('token')
};

let gameCanvas, ctx;
let playerX = 400, playerY = 300;
const tileSize = 40;
const mapWidth = 800;
const mapHeight = 600;
let otherPlayers = {};

// ============ AUTHENTICATION ============
async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  
  if (!username || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    
    localStorage.setItem('token', data.token);
    gameState.token = data.token;
    gameState.player = data.user;
    
    startGame();
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

async function register() {
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  
  if (!username || !email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    
    localStorage.setItem('token', data.token);
    gameState.token = data.token;
    gameState.player = data.user;
    
    startGame();
  } catch (error) {
    alert('Registration failed: ' + error.message);
  }
}

function toggleForm(e) {
  e.preventDefault();
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
  registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
}

// ============ GAME INITIALIZATION ============
async function startGame() {
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  
  gameCanvas = document.getElementById('game-canvas');
  ctx = gameCanvas.getContext('2d');
  
  gameCanvas.width = 800;
  gameCanvas.height = 600;
  
  await loadDragonSpecies();
  await loadPlayerData();
  initializeMap();
  setupEventListeners();
  gameLoop();
}

async function loadDragonSpecies() {
  try {
    const response = await fetch(`${API_URL}/dragons/species`, {
      headers: { 'Authorization': `Bearer ${gameState.token}` }
    });
    gameState.dragonSpecies = await response.json();
  } catch (error) {
    console.error('Failed to load dragon species:', error);
  }
}

async function loadPlayerData() {
  try {
    const response = await fetch(`${API_URL}/game/player/${gameState.player.id}`, {
      headers: { 'Authorization': `Bearer ${gameState.token}` }
    });
    const data = await response.json();
    gameState.player = data;
    gameState.team = data.team || [];
    gameState.caughtDragons = data.capturedDragons || [];
    updateUI();
  } catch (error) {
    console.error('Failed to load player data:', error);
  }
}

function initializeMap() {
  gameState.currentMap = {
    name: 'Starter Forest',
    terrain: generateTerrain(20, 15),
    dragons: generateDragons()
  };
}

function generateTerrain(width, height) {
  const terrain = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rand = Math.random();
      if (rand < 0.6) terrain.push({ x, y, type: 'grass' });
      else if (rand < 0.75) terrain.push({ x, y, type: 'water' });
      else if (rand < 0.9) terrain.push({ x, y, type: 'forest' });
      else terrain.push({ x, y, type: 'mountain' });
    }
  }
  return terrain;
}

function generateDragons() {
  const dragons = [];
  const spawnAreas = [
    { x: 100, y: 100, type: 'forest' },
    { x: 300, y: 200, type: 'forest' },
    { x: 500, y: 150, type: 'mountain' },
    { x: 600, y: 400, type: 'water' },
    { x: 200, y: 450, type: 'forest' },
    { x: 700, y: 300, type: 'mountain' },
    { x: 150, y: 300, type: 'sky' },
    { x: 650, y: 100, type: 'cave' }
  ];
  
  spawnAreas.forEach(area => {
    const randomSpecies = gameState.dragonSpecies[Math.floor(Math.random() * gameState.dragonSpecies.length)];
    if (randomSpecies) {
      dragons.push({
        id: Math.random(),
        speciesId: randomSpecies.id,
        x: area.x + Math.random() * 50,
        y: area.y + Math.random() * 50,
        health: randomSpecies.baseStats.hp,
        level: Math.floor(Math.random() * 5) + 1,
        species: randomSpecies
      });
    }
  });
  
  return dragons;
}

// ============ EVENT LISTENERS ============
function setupEventListeners() {
  document.addEventListener('keydown', handleKeyPress);
  gameCanvas.addEventListener('click', handleCanvasClick);
  socket.on('player-position', updateOtherPlayers);
}

function handleKeyPress(e) {
  const speed = 10;
  switch(e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      playerY = Math.max(0, playerY - speed);
      e.preventDefault();
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      playerY = Math.min(gameCanvas.height - 30, playerY + speed);
      e.preventDefault();
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      playerX = Math.max(0, playerX - speed);
      e.preventDefault();
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      playerX = Math.min(gameCanvas.width - 30, playerX + speed);
      e.preventDefault();
      break;
  }
  socket.emit('player-move', { x: playerX, y: playerY });
}

async function handleCanvasClick(e) {
  const rect = gameCanvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  // Check if clicked on a dragon
  for (let dragon of gameState.currentMap.dragons) {
    const dx = dragon.x - clickX;
    const dy = dragon.y - clickY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 30) {
      await encounterDragon(dragon);
      return;
    }
  }
}

async function encounterDragon(dragon) {
  const catchChance = dragon.species.catchRate / 255 * 100;
  const roll = Math.random() * 100;
  
  if (roll < catchChance) {
    // Catch successful
    try {
      const response = await fetch(`${API_URL}/dragons/catch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${gameState.token}`
        },
        body: JSON.stringify({ speciesId: dragon.speciesId })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Caught ${dragon.species.name}! 🎉`);
        gameState.caughtDragons[dragon.speciesId] = true;
        
        // Remove dragon from map
        gameState.currentMap.dragons = gameState.currentMap.dragons.filter(d => d.id !== dragon.id);
        
        // Gain experience
        gameState.player.experience += 50;
        gameState.player.money += 100;
        
        updateUI();
        socket.emit('dragon-catch', { dragon: dragon.species.name });
      }
    } catch (error) {
      console.error('Catch failed:', error);
    }
  } else {
    alert(`${dragon.species.name} got away!`);
  }
}

// ============ RENDERING ============
function gameLoop() {
  clearCanvas();
  drawMap();
  drawDragons();
  drawOtherPlayers();
  drawPlayer();
  requestAnimationFrame(gameLoop);
}

function clearCanvas() {
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
}

function drawMap() {
  gameState.currentMap.terrain.forEach(tile => {
    const x = tile.x * tileSize;
    const y = tile.y * tileSize;
    
    switch(tile.type) {
      case 'grass':
        ctx.fillStyle = '#2d5016';
        break;
      case 'water':
        ctx.fillStyle = '#1e90ff';
        break;
      case 'forest':
        ctx.fillStyle = '#1b4d1b';
        break;
      case 'mountain':
        ctx.fillStyle = '#696969';
        break;
    }
    
    ctx.fillRect(x, y, tileSize, tileSize);
    ctx.strokeStyle = '#444';
    ctx.strokeRect(x, y, tileSize, tileSize);
  });
}

function drawDragons() {
  gameState.currentMap.dragons.forEach(dragon => {
    const radius = 15;
    ctx.beginPath();
    ctx.arc(dragon.x, dragon.y, radius, 0, Math.PI * 2);
    
    switch(dragon.species.rarity) {
      case 'common':
        ctx.fillStyle = '#95e1d3';
        break;
      case 'uncommon':
        ctx.fillStyle = '#4ecdc4';
        break;
      case 'rare':
        ctx.fillStyle = '#9d4edd';
        break;
      case 'legendary':
        ctx.fillStyle = '#ffd700';
        break;
      case 'mythic':
        ctx.fillStyle = '#ff6b9d';
        break;
    }
    
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw dragon name
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(dragon.species.name, dragon.x, dragon.y + radius + 15);
  });
}

function drawPlayer() {
  // Draw player as blue square
  ctx.fillStyle = '#667eea';
  ctx.fillRect(playerX, playerY, 30, 30);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(playerX, playerY, 30, 30);
  
  // Draw player label
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('You', playerX + 15, playerY - 10);
}

function drawOtherPlayers() {
  Object.values(otherPlayers).forEach(player => {
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(player.x, player.y, 30, 30);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, 30, 30);
  });
}

// ============ UI UPDATES ============
function updateUI() {
  document.getElementById('player-level').textContent = gameState.player.level || 1;
  document.getElementById('player-exp').textContent = gameState.player.experience || 0;
  document.getElementById('player-money').textContent = gameState.player.money || 1000;
  document.getElementById('caught-count').textContent = Object.keys(gameState.caughtDragons).length || 0;
  
  updateTeamPanel();
}

function updateTeamPanel() {
  const teamList = document.getElementById('team-list');
  teamList.innerHTML = '';
  
  const team = gameState.team || [];
  document.querySelector('#team-panel h3').textContent = `Team (${team.length}/6)`;
  
  team.forEach((dragon, index) => {
    const div = document.createElement('div');
    div.className = 'team-dragon';
    div.innerHTML = `<p>${dragon.nickname || dragon.name || 'Dragon'}</p><p>Lvl ${dragon.level}</p>`;
    teamList.appendChild(div);
  });
}

function openPokedex() {
  const modal = document.getElementById('pokedex-modal');
  const pokedexList = document.getElementById('pokedex-list');
  pokedexList.innerHTML = '';
  
  gameState.dragonSpecies.forEach(species => {
    const div = document.createElement('div');
    div.className = `pokedex-entry ${species.rarity}`;
    if (gameState.caughtDragons[species.id]) div.classList.add('caught');
    
    div.innerHTML = `
      <p>#${species.id}</p>
      <p class="pokedex-entry-name">${species.name}</p>
      <p class="pokedex-entry-rarity">${species.rarity}</p>
    `;
    
    div.onclick = () => showDragonDetail(species);
    pokedexList.appendChild(div);
  });
  
  modal.style.display = 'flex';
}

function filterPokedex() {
  const filter = document.getElementById('pokedex-filter').value.toLowerCase();
  const entries = document.querySelectorAll('.pokedex-entry');
  
  entries.forEach(entry => {
    const name = entry.querySelector('.pokedex-entry-name').textContent.toLowerCase();
    entry.style.display = name.includes(filter) ? 'block' : 'none';
  });
}

function closePokedex() {
  document.getElementById('pokedex-modal').style.display = 'none';
}

function showDragonDetail(species) {
  let details = `
${species.name}
━━━━━━━━━━━━━━━━━
Rarity: ${species.rarity.toUpperCase()}
Type: ${species.type.join(', ')}
Abilities: ${species.abilities.join(', ')}

Base Stats:
  HP: ${species.baseStats.hp}
  ATK: ${species.baseStats.attack}
  DEF: ${species.baseStats.defense}
  SP.ATK: ${species.baseStats.spAtk}
  SP.DEF: ${species.baseStats.spDef}
  SPD: ${species.baseStats.speed}

Catch Rate: ${(species.catchRate / 255 * 100).toFixed(1)}%
Description: ${species.description}`;

  if (species.evolutions && species.evolutions.length > 0) {
    details += `\n\nEvolutions:`;
    species.evolutions.forEach((evo, idx) => {
      details += `\n  Form ${idx + 1}: Level ${evo.level}`;
    });
  }

  alert(details);
}

function updateOtherPlayers(data) {
  otherPlayers[data.id] = { x: data.x, y: data.y };
}

// Initialize on page load
window.addEventListener('load', () => {
  if (gameState.token && localStorage.getItem('token')) {
    startGame();
  }
});
