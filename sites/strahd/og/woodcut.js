// Cuts a woodcut sky into every <g data-sky="top horizon">: rows of paper-coloured
// gouges that thicken towards the horizon, so the sky lightens behind the silhouettes.
// Seeded, so a card renders the same every time it is regenerated.
const NS = 'http://www.w3.org/2000/svg';

function random(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

for (const g of document.querySelectorAll('[data-sky]')) {
  const [top, horizon] = g.dataset.sky.split(' ').map(Number);
  const left = Number(g.dataset.left ?? 0);
  const width = Number(g.dataset.width ?? 520);
  const rand = random(Number(g.dataset.seed ?? 7));
  for (let y = top; y < horizon; y += 8) {
    const t = (y - top) / (horizon - top);
    const stroke = 0.8 + t * t * 6.2;
    let x = left - 10 + rand() * 30;
    while (x < left + width) {
      const len = 40 + rand() * 160;
      const wobble = (rand() - 0.5) * 3;
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', `M${x} ${y} Q${x + len / 2} ${y + wobble} ${x + len} ${y + (rand() - 0.5)}`);
      path.setAttribute('stroke-width', stroke.toFixed(2));
      g.append(path);
      x += len + 6 + rand() * (18 * (1 - t) + 4);
    }
  }
}

// ?arte: the frontispiece for the session page, a wider crop of the same block.
if (new URLSearchParams(location.search).has('arte')) {
  document.documentElement.classList.add('arte');
  for (const svg of document.querySelectorAll('svg[data-arte]')) svg.setAttribute('viewBox', svg.dataset.arte);
}

// Long titles shrink until the cartouche holds the numeral, the title and the places.
for (const box of document.querySelectorAll('.cartouche')) {
  const title = box.querySelector('.title');
  const room = box.clientHeight - 2 * 48;
  const height = () => box.lastElementChild.getBoundingClientRect().bottom - box.firstElementChild.getBoundingClientRect().top;
  for (let size = 80; size > 40 && height() > room; size -= 4) title.style.fontSize = `${size}px`;
}
