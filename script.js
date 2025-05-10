const playerGrid = [];
let currentPattern = [];
let selectedBlock = null;
let startTime;
let timer;
let currentTime;
let isGameRunning = false;
let completedPatterns = 0;
const totalPatterns = 5; 
let previousPatternIndex = -1;

function createGrid(containerId, isPlayer = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const grid = [];
  for (let row = 0; row < 16; row++) {
    const rowCells = [];
    for (let col = 0; col < 16; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (col % 4 === 0 && col !== 0) {
        cell.style.borderLeft = "2px solid silver";
      }
      if (row % 4 === 0 && row !== 0) {
        cell.style.borderTop = "2px solid silver";
      }

      if (isPlayer) {
        cell.addEventListener("click", () => handleCellClick(row, col));
      }

      container.appendChild(cell);
      rowCells.push(cell);
    }
    grid.push(rowCells);
  }
  return grid;
}


function loadNewPattern() {
  let patternIndex;
  do {
    patternIndex = Math.floor(Math.random() * patterns.length);
  } while (patternIndex === previousPatternIndex && patterns.length > 1);
  
  previousPatternIndex = patternIndex;

  const patternObj = patterns[patternIndex];
  const pattern = patternObj.grid;
  currentPattern = pattern;

  const usedBlockTypes = new Set();
  for (const row of currentPattern) {
    for (const cell of row) {
      if (cell) {
        usedBlockTypes.add(cell);
        if (!BLOCKS[cell]) {
          console.warn(`⚠️ Блок "${cell}" отсутствует в объекте BLOCKS`);
        }
      }
    }
  }

  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const cellType = pattern[row][col];
      const cell = patternGrid[row][col];
      cell.style.backgroundImage = BLOCKS[cellType] ? `url(${BLOCKS[cellType]})` : "";
    }
  }

  // Создаем палитру
  createPalette(usedBlockTypes);
}

function updateSelectedBlock(block) {
  const selectedBlockDisplay = document.getElementById('selected-block');
  if (block) {
    selectedBlockDisplay.style.backgroundImage = `url(${BLOCKS[block]})`;
  } else {
    selectedBlockDisplay.style.backgroundImage = '';
  }
}

function createPalette(blockTypesSet) {
  const palette = document.getElementById("palette");
  palette.innerHTML = "";

  const blockTypes = Array.from(blockTypesSet);

  blockTypes.forEach((blockType) => {
    if (!BLOCKS[blockType]) {
      console.warn(`❌ Пропущен блок "${blockType}" — текстура не найдена`);
      return;
    }

    const paletteCell = document.createElement("div");
    paletteCell.className = "palette-cell";
    paletteCell.style.backgroundImage = `url(${BLOCKS[blockType]})`;

    paletteCell.addEventListener("click", () => {
      selectedBlock = blockType;
      document.querySelectorAll(".palette-cell").forEach((c) => c.classList.remove("selected"));
      paletteCell.classList.add("selected");
      updateSelectedBlock(selectedBlock);
    });

    palette.appendChild(paletteCell);
  });

  const pickaxeCell = document.createElement("div");
  pickaxeCell.className = "palette-cell";
  pickaxeCell.style.backgroundImage = "url(blocks/pickaxe.png)";
  pickaxeCell.addEventListener("click", () => {
    selectedBlock = null;
    document.querySelectorAll(".palette-cell").forEach((c) => c.classList.remove("selected"));
    pickaxeCell.classList.add("selected");
    updateSelectedBlock(selectedBlock);
  });
  palette.appendChild(pickaxeCell);
  selectedBlock = null;
  updateSelectedBlock(null);
}

function clearGrid() {
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const cell = playerGrid[row][col];
      cell.style.backgroundImage = "";
      delete cell.dataset.block;
    }
  }
}

function handleCellClick(row, col) {
  const cell = playerGrid[row][col];
  if (selectedBlock) {
    if (!BLOCKS[selectedBlock]) {
      console.warn(`❗ Попытка использовать несуществующий блок "${selectedBlock}"`);
      return;
    }
    cell.style.backgroundImage = `url(${BLOCKS[selectedBlock]})`;
    cell.dataset.block = selectedBlock;
  } else {
    cell.style.backgroundImage = "";
    delete cell.dataset.block;
  }

  if (gridsMatch(playerGrid, currentPattern)) {
    console.log("Построено правильно, очищаем поле и показываем поздравление!");
    clearGrid();

    completedPatterns++;
    if (completedPatterns >= totalPatterns) {
      stopTimer();
      showCongratulatoryMessage();
    } else {
      setTimeout(() => {
        loadNewPattern();
      }, 1000);
    }
  }
}

function gridsMatch(playerGrid, pattern) {
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const playerBlock = playerGrid[row][col].dataset.block || null;
      const patternBlock = pattern[row][col] || null;
      if (playerBlock !== patternBlock) return false;
    }
  }
  return true;
}

function startTimer() {
  startTime = Date.now();
  isGameRunning = true;
  timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  if (!isGameRunning) return;
  currentTime = Date.now() - startTime;
  const seconds = Math.floor((currentTime / 1000) % 60);
  const minutes = Math.floor((currentTime / 1000 / 60) % 60);

  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  document.getElementById('timer').textContent = `${formattedMinutes}:${formattedSeconds}`;
}

function stopTimer() {
  clearInterval(timer);
  isGameRunning = false;
}

function showCongratulatoryMessage() {
  const finalTime = document.getElementById("timer").textContent;
  localStorage.setItem("gameCompleted", "true");
  localStorage.setItem("gameTime", finalTime);
  window.location.href = "index.html";
}

const patternGrid = createGrid("target-area", false);
playerGrid.push(...createGrid("build-area", true));

window.addEventListener("load", () => {
  startTimer();
  loadNewPattern();
});
