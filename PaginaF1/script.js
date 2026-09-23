// --- Render driver cards ---
const grid = document.getElementById('driverGrid');
grid.innerHTML = drivers.map(d => {
  const initials = d.n.split(' ').map(w=>w[0]).join('');
  return `<div class="card" style="--tc:${d.tc}">
    <div class="photo-wrap">
      <div class="avatar">
        <img src="assets/drivers/${d.photo}" alt="${d.n}"
             onerror="this.parentElement.textContent='${initials}'; this.remove();">
      </div>
    </div>
    <div class="card-body">
      <h3>${d.n}</h3>
      <div class="team">${d.team} · #${d.num}</div>
      <div class="stats">
        <div>PAÍS<b>${d.country}</b></div>
        <div>AUTO<b>${d.car}</b></div>
        <div>MUNDIALES<b>${d.champs}</b></div>
        <div>VICTORIAS GP<b>${d.wins}</b></div>
      </div>
    </div>
  </div>`;
}).join('');

// --- Lights out reaction game ---
const lightsEl = document.getElementById('lights');
const track = document.getElementById('track');
const statusBig = document.getElementById('statusBig');
const statusSmall = document.getElementById('statusSmall');
const bestEl = document.getElementById('best');

for(let i=0;i<5;i++){
  const b = document.createElement('div');
  b.className = 'bulb';
  lightsEl.appendChild(b);
}
const bulbs = [...lightsEl.children];

// Tiempos ajustados para que se sientan como una salida real de F1:
// 1000ms entre cada luz que se enciende, y una pausa aleatoria más larga
// antes de apagarlas todas, para que no se pueda anticipar el "ya".
const LIGHT_STEP_MS = 1000;
const MIN_RANDOM_DELAY = 1500;
const MAX_RANDOM_DELAY = 3500;

let state = 'idle'; // idle -> sequencing -> waiting -> go -> result
let timers = [];
let goTime = 0;
let best = null;

function clearTimers(){ timers.forEach(t=>clearTimeout(t)); timers=[]; }
function setBulbs(n){ bulbs.forEach((b,i)=> b.classList.toggle('on', i<n)); }

function startSequence(){
  state = 'sequencing';
  setBulbs(0);
  statusBig.textContent = 'Prepárate...';
  statusSmall.textContent = 'Las luces se están encendiendo.';
  track.querySelector('span').textContent = 'ESPERA...';

  for(let i=1;i<=5;i++){
    timers.push(setTimeout(()=> setBulbs(i), i*LIGHT_STEP_MS));
  }

  const randomDelay = MIN_RANDOM_DELAY + Math.random()*(MAX_RANDOM_DELAY-MIN_RANDOM_DELAY);
  timers.push(setTimeout(()=>{
    setBulbs(0);
    state = 'go';
    goTime = performance.now();
    statusBig.textContent = '¡YA!';
    statusSmall.textContent = 'Toca ahora';
    track.querySelector('span').textContent = 'TOCA AHORA';
  }, 5*LIGHT_STEP_MS + randomDelay));

  state = 'waiting';
}

function reset(msg, sub){
  clearTimers();
  setBulbs(0);
  state = 'idle';
  statusBig.textContent = msg;
  statusSmall.textContent = sub;
  track.querySelector('span').textContent = 'TOCA AQUÍ PARA COMENZAR';
}

track.addEventListener('click', ()=>{
  if(state === 'idle'){
    startSequence();
  } else if(state === 'sequencing' || state === 'waiting'){
    reset('Salida en falso', 'Esperaste a que se apagaran todas las luces. Inténtalo de nuevo.');
  } else if(state === 'go'){
    const rt = Math.round(performance.now() - goTime);
    if(best === null || rt < best){ best = rt; bestEl.textContent = `Mejor tiempo: ${best} ms`; }
    statusBig.textContent = rt + ' ms';
    statusSmall.textContent = 'Toca para intentarlo de nuevo';
    track.querySelector('span').textContent = 'TOCA AQUÍ PARA COMENZAR';
    state = 'idle';
  }
});
