async function loadStats() { //updated load stats, now 
  const player = document.getElementById('player').value;
  const season = document.getElementById('season').value;

  if (!player || !season) {
      alert("Please select a player and a season.");
      return;
  }

  const res = await fetch(`/api/stats?player=${player}&season=${season}`);
  const data = await res.json();

  displayStats(data); // assuming displayStats() builds a table


  document.getElementById('statsDisplay').innerHTML = JSON.stringify(data, null, 2);
}

function downloadReport() {
  alert("Download feature coming soon!");
}

window.onload = async () => {
  const res = await fetch('/api/players');
  const players = await res.json();

  const select = document.getElementById('player');
  players.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    select.appendChild(opt);
  });
  const resSeasons = await fetch('/api/seasons'); // new route
  const seasons = await resSeasons.json();
  const selectSeason = document.getElementById('season');

  seasons.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.season_year;
    opt.textContent = s.season_year;
    selectSeason.appendChild(opt);
  });

};

