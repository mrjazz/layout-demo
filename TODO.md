# Backpacking Problem – Webapp Plan

Simple 2D bin packing webapp in vanilla JavaScript, running in a single HTML page.

---

## 1. Project Structure

```
backpacking-problem/
├── index.html      # Single page: HTML + embedded CSS + JS
├── TODO.md         # This plan
```

All logic and styles live in one HTML file for simplicity.

---

## 2. Configuration

- **Canvas size**: 500×500 px (default)
- **Configurable** via:
  - Input fields for width and height, or
  - A small config panel at the top
- Store values in JS variables; use them for canvas and layout logic.

---

## 3. User Interface Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Config: Width 500] [Height 500] [Apply]               │
├─────────────────────────────────────────────────────────┤
│  [Add Element]  [Remove Active]  [Optimize]              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │              Canvas (500×500)                   │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Features & Implementation

### 4.1 Add Element

- **Button**: "Add Element"
- **Behavior**:
  - Create a new square element (e.g. default 50×50 px)
  - Append to an internal list of elements
  - Render it on the canvas (initially at a default position, e.g. top-left)
- **Data**: Each element has `{ id, x, y, size, isActive }`

### 4.2 Select & Resize Element

- **Selection**: Click on an element to select it (highlight border, e.g. blue)
- **Resize**:
  - Option A: Drag a corner handle when selected
  - Option B: Input field for size when selected
  - Option C: Drag from corner (no handle) to resize
- **Implementation**: Track `mousedown` / `mousemove` / `mouseup` for resize; keep element square (width = height).

### 4.3 Remove Active Element

- **Button**: "Remove Active"
- **Behavior**: Delete the currently selected element from the list and redraw the canvas
- **Edge case**: If nothing is selected, do nothing or show a short message

### 4.4 Optimize Layout

- **Button**: "Optimize"
- **Algorithm**: Place all elements starting from the **top-right corner**, minimizing empty space
- **Strategy** (simple approach):
  1. Sort elements by size (e.g. largest first)
  2. Place first element at top-right (x = canvasWidth - size, y = 0)
  3. Place next elements row-by-row or column-by-column, filling gaps
  4. Keep all elements within canvas bounds
- **Alternative**: Shelf-based packing (first-fit decreasing height) or simple row packing from right to left

---

## 5. Technical Approach

### 5.1 HTML

- One `<canvas>` for drawing
- Buttons: Add Element, Remove Active, Optimize
- Config inputs for canvas width/height
- Optional: status text for selected element size

### 5.2 Canvas Rendering

- Use `Canvas 2D API` (`getContext('2d')`)
- Draw each element as a filled rectangle with optional border
- Redraw on: add, remove, resize, optimize, config change

### 5.3 Event Handling

- **Canvas click**: Hit-test to find which element was clicked (point-in-rect)
- **Mouse drag**: Resize or move (if move is added later)
- **Buttons**: `click` handlers for Add, Remove, Optimize

### 5.4 Data Model

```javascript
const state = {
  canvasWidth: 500,
  canvasHeight: 500,
  elements: [
    { id: 1, x: 0, y: 0, size: 50 }
  ],
  activeElementId: null
};
```

---

## 6. Implementation Order

1. **Setup**: HTML structure, canvas, config inputs
2. **Add Element**: Button + render squares on canvas
3. **Selection**: Click to select, visual feedback
4. **Resize**: Corner drag or input to change size
5. **Remove**: Delete active element
6. **Optimize**: Implement packing algorithm and update positions

---

## 7. Packing Algorithm (Top-Right, Minimal Gaps)

**Goal**: Place squares from top-right, keep them in bounds, minimize gaps.

**Steps**:

1. Sort elements by `size` descending (largest first)
2. Initialize `currentX = canvasWidth`, `currentY = 0`, `rowHeight = 0`
3. For each element:
   - If `currentX - size < 0`: wrap to next row (`currentX = canvasWidth - size`, `currentY += rowHeight`, `rowHeight = 0`)
   - Place at `(currentX - size, currentY)`
   - Update `currentX -= size`, `rowHeight = max(rowHeight, size)`
4. If any element would go below `canvasHeight`, either:
   - Scale down all elements to fit, or
   - Show a warning that not all elements fit

---

## 8. Optional Enhancements (Out of Scope for MVP)

- Move elements by drag (before optimize)
- Undo/redo
- Load/save configuration
- Different shapes (rectangles)
- Export layout as image

---

## 9. Browser Support

- Modern browsers with Canvas 2D support (Chrome, Firefox, Safari, Edge)
- No build step; open `index.html` directly or serve via a simple HTTP server
