// script.js - robust version

// 1. Define the Load Stats function
async function loadStats() {
  const player = document.getElementById('player').value;
  const gameDate = document.getElementById('gameDate').value;

  if (!player || !gameDate) {
      alert("Please select a player and a game date.");
      return;
  }

  try {
    const res = await fetch(`/api/stats?player=${player}&date=${gameDate}`);
    const data = await res.json();
    displayStats(data);
  } catch (err) {
    console.error(err);
    document.getElementById('statsDisplay').innerHTML = "Error fetching stats.";
  }
}

// 2. Define the Display Stats function
function displayStats(stats) {
  const container = document.getElementById('statsDisplay');
  container.innerHTML = '';

  if (!stats || stats.length === 0) {
    container.textContent = 'No stats available for the selected game.';
    return;
  }

  const table = document.createElement('table');
  table.border = '1';
  table.style.borderCollapse = 'collapse';

  const headerRow = document.createElement('tr');
  const headers = Object.keys(stats[0]);
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.style.padding = '5px 10px';
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  stats.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = row[header];
      td.style.padding = '5px 10px';
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  container.appendChild(table);
}

function downloadReport() {
  alert("Download feature coming soon!");
}

// 3. Define the Date Loading Logic
async function loadGameDates(playerId) {
  const selectDate = document.getElementById('gameDate');
  
  // Check if element exists before doing anything
  if (!selectDate) {
      console.error("Critical Error: Could not find element with id='gameDate'");
      return;
  }

  selectDate.innerHTML = '<option value="">Loading...</option>';
  
  try {
    const res = await fetch(`/api/dates?player=${playerId}`);
    const dates = await res.json();
    
    selectDate.innerHTML = '<option value="">Select game date</option>';
    dates.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.date_str;
      opt.textContent = d.date_str;
      selectDate.appendChild(opt);
    });
    
    // Explicitly unlock
    selectDate.disabled = false;
    
  } catch (error) {
    console.error("Error loading dates:", error);
    selectDate.innerHTML = '<option value="">Error</option>';
    // Unlock anyway so user sees "Error"
    selectDate.disabled = false;
  }
}

// 4. Initialize the page
window.onload = async () => {
  const selectPlayer = document.getElementById('player');
  const selectDate = document.getElementById('gameDate');

  // A. Set up the event listener immediately
  if (selectPlayer) {
      selectPlayer.addEventListener('change', (e) => {
        const playerId = e.target.value;
        if (playerId) {
          loadGameDates(playerId);
        } else {
          // If they deselect a player, lock the date box again
          if(selectDate) {
             selectDate.innerHTML = '<option value="">Select player first</option>';
             selectDate.disabled = true;
          }
        }
      });
  } else {
      console.error("Critical Error: Could not find element with id='player'");
  }

  // B. Populate Players (Isolated in its own try/catch block)
  try {
    const res = await fetch('/api/players');
    const players = await res.json();
    
    // Clear existing (keep the default option)
    selectPlayer.innerHTML = '<option value="">Select player</option>';
    
    const seen = new Set();
    players.forEach(p => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        selectPlayer.appendChild(opt);
      }
    });
  } catch (err) {
    console.error("Error fetching players:", err);
  }
};
