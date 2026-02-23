const state = {
  canvasWidth: 500,
  canvasHeight: 500,
  elements: [],
  activeElementId: null,
  nextId: 1,
  resizeMode: false,
  resizeHandle: null,
  resizeStartClientX: 0,
  resizeStartClientY: 0,
  resizeStartWidth: 0,
  resizeStartHeight: 0
};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const HANDLE_SIZE = 10;
const MIN_DIM = 20;

function elementColor(id) {
  const h = (id * 137) % 360;
  return `hsl(${h}, 65%, 55%)`;
}

function toCanvasCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

function getElementAt(clientX, clientY) {
  const { x: mx, y: my } = toCanvasCoords(clientX, clientY);
  for (let i = state.elements.length - 1; i >= 0; i--) {
    const el = state.elements[i];
    if (!el.placed) continue;
    if (mx >= el.x && mx <= el.x + el.width && my >= el.y && my <= el.y + el.height) {
      return el;
    }
  }
  return null;
}

function getResizeHandle(el, clientX, clientY) {
  const { x: mx, y: my } = toCanvasCoords(clientX, clientY);
  const rx = el.x + el.width;
  const ry = el.y + el.height;
  const inCorner = mx >= rx - HANDLE_SIZE && mx <= rx + HANDLE_SIZE &&
                  my >= ry - HANDLE_SIZE && my <= ry + HANDLE_SIZE;
  const inRight = mx >= rx - HANDLE_SIZE && mx <= rx + HANDLE_SIZE &&
                  my >= el.y && my <= ry;
  const inBottom = my >= ry - HANDLE_SIZE && my <= ry + HANDLE_SIZE &&
                  mx >= el.x && mx <= rx;
  if (inCorner) return 'corner';
  if (inRight) return 'right';
  if (inBottom) return 'bottom';
  return null;
}

function renderElementsList() {
  const list = document.getElementById('elementsList');
  if (state.elements.length === 0) {
    list.innerHTML = '<div class="empty-elements">No elements. Click + Add to create one.</div>';
    return;
  }
  list.innerHTML = state.elements.map(el => `
    <div class="element-item ${el.id === state.activeElementId ? 'active' : ''}" data-id="${el.id}">
      <span class="el-num">${el.id}</span>
      <div class="swatch" style="background: ${el.color}"></div>
      <div class="dims">
        <input type="number" data-id="${el.id}" data-dim="w" value="${el.width}" min="${MIN_DIM}">
        <span>×</span>
        <input type="number" data-id="${el.id}" data-dim="h" value="${el.height}" min="${MIN_DIM}">
      </div>
      <button class="btn-remove-item" data-id="${el.id}">Remove</button>
    </div>
  `).join('');

  list.querySelectorAll('.element-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-remove-item') || e.target.tagName === 'INPUT') return;
      state.activeElementId = parseInt(item.dataset.id, 10);
      renderElementsList();
      render();
    });
  });

  list.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10);
      state.elements = state.elements.filter(x => x.id !== id);
      if (state.activeElementId === id) state.activeElementId = null;
      renderElementsList();
      render();
      updateStatus('Element removed.');
    });
  });

  list.querySelectorAll('.dims input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = parseInt(input.dataset.id, 10);
      const dim = input.dataset.dim;
      const el = state.elements.find(x => x.id === id);
      if (!el) return;
      const v = Math.max(MIN_DIM, parseInt(input.value, 10) || MIN_DIM);
      el[dim === 'w' ? 'width' : 'height'] = v;
      input.value = v;
      render();
    });
  });
}

function updateCanvasSize() {
  const placed = state.elements.filter(e => e.placed);
  if (placed.length === 0) {
    canvas.width = state.canvasWidth;
    canvas.height = state.canvasHeight;
  } else {
    let maxX = 0, maxY = 0;
    for (const el of placed) {
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    }
    canvas.width = Math.max(state.canvasWidth, maxX);
    canvas.height = Math.max(state.canvasHeight, maxY);
  }
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
}

function render() {
  updateCanvasSize();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (canvas.width > state.canvasWidth || canvas.height > state.canvasHeight) {
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, state.canvasWidth, state.canvasHeight);
    ctx.setLineDash([]);
  }

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  for (const el of state.elements) {
    if (!el.placed) continue;
    const isActive = el.id === state.activeElementId;
    ctx.fillStyle = el.color;
    ctx.fillRect(el.x, el.y, el.width, el.height);

    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeText(String(el.id), cx, cy);
    ctx.fillStyle = '#fff';
    ctx.fillText(String(el.id), cx, cy);

    ctx.strokeStyle = isActive ? '#60a5fa' : '#64748b';
    ctx.lineWidth = isActive ? 3 : 1;
    ctx.strokeRect(el.x, el.y, el.width, el.height);

    if (isActive) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.strokeStyle = '#60a5fa';
      const h = HANDLE_SIZE;
      ctx.fillRect(el.x + el.width - h, el.y + el.height - h, h, h);
      ctx.strokeRect(el.x + el.width - h, el.y + el.height - h, h, h);
      ctx.fillRect(el.x + el.width - h, el.y + (el.height - h) / 2, h, h);
      ctx.strokeRect(el.x + el.width - h, el.y + (el.height - h) / 2, h, h);
      ctx.fillRect(el.x + (el.width - h) / 2, el.y + el.height - h, h, h);
      ctx.strokeRect(el.x + (el.width - h) / 2, el.y + el.height - h, h, h);
    }
  }
}

function updateStatus(msg) {
  document.getElementById('status').textContent = msg;
}

function addElement() {
  const el = {
    id: state.nextId++,
    width: 50,
    height: 50,
    color: '',
    placed: false,
    x: 0, y: 0
  };
  el.color = elementColor(el.id);
  state.elements.push(el);
  state.activeElementId = el.id;
  renderElementsList();
  render();
  updateStatus(`Added element ${el.id}. Set width/height, then Optimize.`);
}

function optimize() {
  if (state.elements.length === 0) {
    updateStatus('No elements to optimize.');
    return;
  }

  const sorted = [...state.elements].sort((a, b) => (b.width * b.height) - (a.width * a.height));
  const placed = [];
  let overflow = false;

  function overlaps(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
  }

  for (const el of sorted) {
    const w = el.width;
    const h = el.height;

    const xCandidates = [0];
    const yCandidates = [0];
    for (const p of placed) {
      xCandidates.push(p.x + p.width);
      yCandidates.push(p.y + p.height);
    }

    let bestX = -1;
    let bestY = -1;
    for (const x of xCandidates) {
      for (const y of yCandidates) {
        if (x + w > state.canvasWidth || y + h > state.canvasHeight) continue;

        const candidate = { x, y, width: w, height: h };
        let collision = false;
        for (const p of placed) {
          if (overlaps(candidate, p)) {
            collision = true;
            break;
          }
        }
        if (collision) continue;

        if (bestX < 0 || y < bestY || (y === bestY && x < bestX)) {
          bestX = x;
          bestY = y;
        }
      }
    }

    if (bestX < 0) {
      const maxY = placed.length ? Math.max(...placed.map(p => p.y + p.height)) : 0;
      bestX = 0;
      bestY = maxY;
      overflow = true;
    }

    el.x = bestX;
    el.y = bestY;
    el.placed = true;
    placed.push({ x: el.x, y: el.y, width: el.width, height: el.height });
  }

  render();
  updateStatus(overflow
    ? 'Optimized. Warning: some elements extend below canvas.'
    : 'Optimized layout (bottom-left, minimal gaps).');
}

canvas.addEventListener('mousedown', (e) => {
  const el = getElementAt(e.clientX, e.clientY);
  if (!el) {
    state.activeElementId = null;
    renderElementsList();
    render();
    return;
  }
  const handle = getResizeHandle(el, e.clientX, e.clientY);
  if (handle && el.id === state.activeElementId) {
    state.resizeMode = true;
    state.resizeHandle = handle;
    state.resizeStartClientX = e.clientX;
    state.resizeStartClientY = e.clientY;
    state.resizeStartWidth = el.width;
    state.resizeStartHeight = el.height;
  } else {
    state.activeElementId = el.id;
    renderElementsList();
    render();
    updateStatus(`Selected element ${el.id} (${el.width}×${el.height}). Drag corner to resize.`);
  }
});

window.addEventListener('mousemove', (e) => {
  if (!state.resizeMode || !state.activeElementId) return;
  const el = state.elements.find(x => x.id === state.activeElementId);
  if (!el) return;

  const start = toCanvasCoords(state.resizeStartClientX, state.resizeStartClientY);
  const curr = toCanvasCoords(e.clientX, e.clientY);
  const dx = Math.round(curr.x - start.x);
  const dy = Math.round(curr.y - start.y);

  if (state.resizeHandle === 'corner') {
    el.width = Math.max(MIN_DIM, state.resizeStartWidth + dx);
    el.height = Math.max(MIN_DIM, state.resizeStartHeight + dy);
  } else if (state.resizeHandle === 'right') {
    el.width = Math.max(MIN_DIM, state.resizeStartWidth + dx);
  } else if (state.resizeHandle === 'bottom') {
    el.height = Math.max(MIN_DIM, state.resizeStartHeight + dy);
  }
  render();
});

window.addEventListener('mouseup', () => {
  if (state.resizeMode) renderElementsList();
  state.resizeMode = false;
  state.resizeHandle = null;
});

document.getElementById('btnAdd').addEventListener('click', addElement);
document.getElementById('btnOptimize').addEventListener('click', optimize);

document.getElementById('btnApply').addEventListener('click', () => {
  const w = Math.max(100, parseInt(document.getElementById('configWidth').value, 10) || 500);
  const h = Math.max(100, parseInt(document.getElementById('configHeight').value, 10) || 500);
  state.canvasWidth = w;
  state.canvasHeight = h;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  render();
  updateStatus(`Canvas resized to ${w}×${h}.`);
});

renderElementsList();
render();
