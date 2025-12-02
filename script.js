async function loadStats() {
  const player = document.getElementById('player').value;
  const gameDate = document.getElementById('gameDate').value;
  const container = document.getElementById('statsDisplay');

  if (!player || !gameDate) {
      alert("Please select a player and a game date.");
      return;
  }

  container.innerHTML = "Loading data...";

  try {
    // 1. Attempt to fetch
    const res = await fetch(`/api/stats?player=${player}&date=${gameDate}`);
    
    if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
    }

    // 2. Attempt to parse JSON
    const data = await res.json();
    console.log("Data received from server:", data); // Check your Browser Console for this!

    // 3. Attempt to display
    displayStats(data);

  } catch (err) {
    console.error("CRITICAL ERROR:", err);
    // This will print the ACTUAL error message to your webpage
    container.innerHTML = `<div style="color:red; font-weight:bold;">
        Error: ${err.message} <br>
        (Open Browser Console F12 for details)
    </div>`;
  }
}

function displayStats(stats) {
  const container = document.getElementById('statsDisplay');
  container.innerHTML = '';

  // Safety Check: Is stats actually an array?
  if (!Array.isArray(stats)) {
      throw new Error("Server returned data, but it is not a list (Array).");
  }

  if (stats.length === 0) {
    container.textContent = 'No stats available for the selected game.';
    return;
  }

  const table = document.createElement('table');
  table.border = '1';
  table.style.borderCollapse = 'collapse';

  // Create Headers dynamically based on the first row
  const headerRow = document.createElement('tr');
  const firstItem = stats[0];
  
  if (!firstItem) {
      throw new Error("Data exists but the first row is empty.");
  }

  const headers = Object.keys(firstItem);
  
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.style.padding = '5px 10px';
    th.style.backgroundColor = '#f4f4f4';
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Create Rows
  stats.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      // Safety check: if value is null, show empty string
      td.textContent = row[header] !== null ? row[header] : ""; 
      td.style.padding = '5px 10px';
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  container.appendChild(table);
}

function downloadReport() {
  const table = document.querySelector('#statsDisplay table');

  if (!table) {
    alert("No stats available to download. Please load stats first.");
    return;
  }

  const playerName = document.getElementById('player').options[document.getElementById('player').selectedIndex].text;
  const gameDate = document.getElementById('gameDate').value;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4'); 

  doc.setFontSize(14);
  doc.text("Pitching Performance Report", 40, 40);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Player: ${playerName} | Game Date: ${gameDate}`, 40, 55);

  doc.autoTable({ 
    html: table,
    startY: 70,
    theme: 'grid', 
    styles: { fontSize: 7, cellPadding: 3, valign: 'middle', overflow: 'linebreak' },
    headStyles: { fillColor: [40, 40, 40], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    margin: { top: 70, left: 40, right: 40 },
    horizontalPageBreak: true 
  });

  const safeName = playerName.replace(/\s+/g, '_');
  doc.save(`Stats_${safeName}_${gameDate}.pdf`);
}

async function loadGameDates(playerId) {
  const selectDate = document.getElementById('gameDate');
  selectDate.innerHTML = '<option value="">Loading...</option>';
  
  try {
    const res = await fetch(`/api/dates?player=${playerId}`);
    const dates = await res.json();
    
    if (dates.length === 0) {
         selectDate.innerHTML = '<option value="">No games found</option>';
    } else {
        selectDate.innerHTML = '<option value="">Select game date</option>';
        dates.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.date_str;
            opt.textContent = d.date_str;
            selectDate.appendChild(opt);
        });
    }
    selectDate.disabled = false;
  } catch (error) {
    console.error("Error loading dates:", error);
    selectDate.innerHTML = '<option value="">Error</option>';
    selectDate.disabled = false;
  }
}

window.onload = async () => {
  const selectPlayer = document.getElementById('player');
  const selectDate = document.getElementById('gameDate');

  if (selectPlayer) {
      selectPlayer.addEventListener('change', (e) => {
        const playerId = e.target.value;
        if (playerId) {
          loadGameDates(playerId);
        } else {
          if(selectDate) {
             selectDate.innerHTML = '<option value="">Select player first</option>';
             selectDate.disabled = true;
          }
        }
      });
  }

  try {
    const res = await fetch('/api/players');
    const players = await res.json();
    
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
