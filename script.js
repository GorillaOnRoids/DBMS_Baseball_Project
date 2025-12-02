async function loadStats() {
  const player = document.getElementById('player').value;
  const season = document.getElementById('season').value;

  if (!player || !season) {
      alert("Please select a player and a season.");
      return;
  }

  try {
    const res = await fetch(`/api/stats?player=${player}&season=${season}`);
    const data = await res.json();
    displayStats(data);
  } catch (err) {
    console.error(err);
    document.getElementById('statsDisplay').innerHTML = "Error fetching stats.";
  }
}

function displayStats(stats) {
  const container = document.getElementById('statsDisplay');
  container.innerHTML = '';

  if (!stats || stats.length === 0) {
    container.textContent = 'No stats available for the selected player and season.';
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

window.onload = async () => {
  // Populate players
  const res = await fetch('/api/players');
  const players = await res.json();
  const select = document.getElementById('player');
  select.innerHTML = '<option value="">Select player</option>';
  const seen = new Set();
  players.forEach(p => {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    }
  });

  // Populate seasons
  const resSeasons = await fetch('/api/seasons');
  const seasons = await resSeasons.json();
  const selectSeason = document.getElementById('season');
  selectSeason.innerHTML = '<option value="">Select season</option>';
  seasons.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.season_year;
    opt.textContent = s.season_year;
    selectSeason.appendChild(opt);
  });
};
