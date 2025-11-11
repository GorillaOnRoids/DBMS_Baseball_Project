async function loadStats() {
  const player = document.getElementById('player').value;
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;

  const res = await fetch(`/api/stats?player=${player}&start=${start}&end=${end}`);
  const data = await res.json();

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
};