// Put shared navbar into all pages
async function loadNavbar() {
  const navbarContainer = document.getElementById("navbar");
  if (!navbarContainer) return;

  // Load navBar.html file
  const res = await fetch("navBar.html");
  const html = await res.text();

  navbarContainer.innerHTML = html;
}

// Load on startup
loadNavbar();

async function loadStats() {
  const player = document.getElementById('player').value;
  const gameDate = document.getElementById('gameDate').value;
  const container = document.getElementById('statsDisplay');

  if (!player || !gameDate) {
      alert("Please select a player and a game date.");
      return;
  }

  container.innerHTML = "Calculating metrics...";

  try {
    const res = await fetch(`/api/stats?player=${player}&date=${gameDate}`);
    if (!res.ok) throw new Error(`Server status: ${res.status}`);

    const data = await res.json();

    // CALCULATE USAGE PERCENTAGE HERE
    // 1. Get total pitches count
    const totalPitches = data.reduce((sum, row) => sum + row.count, 0);

    // 2. Add calculated fields to the data
    const processedData = data.map(row => ({
        "Pitch Type": row.pitch_type,
        "Count": row.count,
        "Usage %": ((row.count / totalPitches) * 100).toFixed(1) + '%',
        "Max Vel": row.max_vel ? row.max_vel.toFixed(1) : "-",
        "Avg Vel": row.avg_vel ? row.avg_vel.toFixed(1) : "-",
        "IVB": row.ivb ? row.ivb.toFixed(1) : "-",
        "HB": row.hb ? row.hb.toFixed(1) : "-",
        "Horz Rel": row.horz_rel ? row.horz_rel.toFixed(2) : "-",
        "Vert Rel": row.vert_rel ? row.vert_rel.toFixed(2) : "-",
        "Spin": row.spin ? Math.round(row.spin) : "-",
        "Extension": row.extension ? row.extension.toFixed(1) : "-"
        //"Stuff+": null // Placeholder as requested
    }));

    displayStats(processedData);

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div style="color:red">Error: ${err.message}</div>`;
  }
}



function displayStats(stats) {
  const container = document.getElementById('statsDisplay');
  container.innerHTML = '';

  if (!stats || stats.length === 0) {
    container.textContent = 'No stats available.';
    return;
  }

  // --- DEFINE PITCH COLORS ---
  // We use lowercase keys to match the database values robustly
  const pitchColors = {
      'fastball': '#d22d49',           // Red
      'four-seam fastball': '#d22d49', 
      'fourseamfastball': '#d22d49',
      'four-seam': '#d22d49', 
      'ff': '#d22d49',
      
      'sinker': '#fe9d00',             // Orange
      'si': '#fe9d00',
      'sink': '#fe9d00',
      'two-seam fastball': '#fe9d00',
      
      'cutter': '#933f2c',             // Dark Red
      'fc': '#933f2c',
      'cut': '#933f2c',
      
      'slider': '#eee716',             // Yellow
      'sl': '#eee716',
      'sweeper': '#eee716',
      'st': '#eee716',        
      
      'curveball': '#00d1ed',          // Cyan/Blue
      'cu': '#00d1ed',
      'cb': '#00d1ed',
      
      'knuckle curve': '#3c44cd',      // Darker Blue
      'kc': '#3c44cd',
      
      'changeup': '#1db053',           // Green
      'ch': '#1db053',
      'change': '#1db053',
      
      'splitter': '#3ea430',           // Darker Green
      'fs': '#3ea430',
      'spl': '#3ea430'
  };

  const table = document.createElement('table');
  table.border = '1';
  table.style.borderCollapse = 'collapse';

  // Create Headers
  const headerRow = document.createElement('tr');
  const headers = Object.keys(stats[0]);
  
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.style.padding = '8px 12px';
    th.style.backgroundColor = '#333';
    th.style.color = '#fff';
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Create Rows
  stats.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      let value = row[header] !== null ? row[header] : "-";
      
      td.textContent = value; 
      td.style.padding = '8px 12px';
      td.style.textAlign = 'center';

      // --- COLOR LOGIC ---
      if (header === "Pitch Type" && value !== "-") {
          // 1. Convert value to lowercase and trim spaces for matching
          const cleanValue = String(value).trim().toLowerCase();
          
          if (pitchColors[cleanValue]) {
              // 2. Apply background color
              td.style.setProperty('background-color', pitchColors[cleanValue], 'important');
              td.style.fontWeight = 'bold';
              
              // 3. Set text color to white for dark backgrounds, black for light
              const darkBackgrounds = ['#933f2c', '#3c44cd', '#d22d49', '#3ea430'];
              if (darkBackgrounds.includes(pitchColors[cleanValue])) {
                  td.style.color = 'white';
              } else {
                  td.style.color = 'black';
              }
          } else {
             console.log(`No color match for: ${cleanValue}`);
          }
      }

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

