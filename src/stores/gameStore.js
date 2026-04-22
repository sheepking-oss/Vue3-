import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useGameStore = defineStore('game', () => {
  const grid = ref([])
  const gridSize = ref(6)
  const maxNumber = ref(6)
  const score = ref(0)
  const moves = ref(0)
  const level = ref(1)
  const levelGoal = ref(100)
  const isGameOver = ref(false)
  const isLevelComplete = ref(false)
  const combo = ref(0)
  const maxCombo = ref(0)
  const timeRemaining = ref(0)
  const isTimeLimit = ref(false)
  const isMovesLimit = ref(false)
  const movesLimit = ref(0)
  const gameHistory = ref([])
  const unlockedLevels = ref(1)
  const highScores = ref([])
  const selectedTheme = ref('light')
  const isDarkMode = ref(false)
  const isFullscreen = ref(false)
  const isFrozen = ref(false)
  
  const items = ref({
    hammer: 3,
    bomb: 2,
    refresh: 2,
    time: 1,
    freeze: 1
  })
  
  const selectedItem = ref(null)
  
  const levels = [
    { gridSize: 6, maxNumber: 6, goal: 100, type: 'normal', timeLimit: 0, movesLimit: 0 },
    { gridSize: 6, maxNumber: 6, goal: 200, type: 'normal', timeLimit: 0, movesLimit: 0 },
    { gridSize: 6, maxNumber: 7, goal: 300, type: 'normal', timeLimit: 0, movesLimit: 0 },
    { gridSize: 6, maxNumber: 7, goal: 400, type: 'time', timeLimit: 60, movesLimit: 0 },
    { gridSize: 7, maxNumber: 7, goal: 500, type: 'normal', timeLimit: 0, movesLimit: 0 },
    { gridSize: 7, maxNumber: 8, goal: 600, type: 'moves', timeLimit: 0, movesLimit: 30 },
    { gridSize: 7, maxNumber: 8, goal: 700, type: 'normal', timeLimit: 0, movesLimit: 0 },
    { gridSize: 7, maxNumber: 8, goal: 800, type: 'time', timeLimit: 90, movesLimit: 0 },
    { gridSize: 8, maxNumber: 8, goal: 900, type: 'normal', timeLimit: 0, movesLimit: 0 },
    { gridSize: 8, maxNumber: 8, goal: 1000, type: 'moves', timeLimit: 0, movesLimit: 40 },
    { gridSize: 8, maxNumber: 8, goal: 1200, type: 'normal', timeLimit: 0, movesLimit: 0 },
    { gridSize: 8, maxNumber: 8, goal: 1400, type: 'time', timeLimit: 120, movesLimit: 0 },
    { gridSize: 8, maxNumber: 8, goal: 1600, type: 'moves', timeLimit: 0, movesLimit: 35 },
    { gridSize: 8, maxNumber: 8, goal: 1800, type: 'normal', timeLimit: 0, movesLimit: 0 },
    { gridSize: 8, maxNumber: 8, goal: 2000, type: 'time', timeLimit: 90, movesLimit: 0 },
    { gridSize: 8, maxNumber: 8, goal: 2500, type: 'moves', timeLimit: 0, movesLimit: 50 },
    { gridSize: 8, maxNumber: 8, goal: 3000, type: 'normal', timeLimit: 0, movesLimit: 0 },
    { gridSize: 8, maxNumber: 8, goal: 3500, type: 'time', timeLimit: 60, movesLimit: 0 },
    { gridSize: 8, maxNumber: 8, goal: 4000, type: 'moves', timeLimit: 0, movesLimit: 45 },
    { gridSize: 8, maxNumber: 8, goal: 5000, type: 'normal', timeLimit: 0, movesLimit: 0 }
  ]
  
  const progress = computed(() => {
    return Math.min(100, (score.value / levelGoal.value) * 100)
  })
  
  const levelInfo = computed(() => {
    return levels[level.value - 1] || levels[levels.length - 1]
  })
  
  const themes = {
    light: { name: '明亮模式', class: '' },
    dark: { name: '深色模式', class: 'dark' },
    ocean: { name: '海洋主题', class: 'ocean' },
    forest: { name: '森林主题', class: 'forest' },
    space: { name: '太空主题', class: 'space' }
  }
  
  function initializeGrid() {
    grid.value = []
    for (let i = 0; i < gridSize.value; i++) {
      const row = []
      for (let j = 0; j < gridSize.value; j++) {
        row.push({
          value: Math.floor(Math.random() * maxNumber.value) + 1,
          row: i,
          col: j,
          isSelected: false,
          isMatched: false,
          isAnimating: false
        })
      }
      grid.value.push(row)
    }
    
    ensurePlayableBoard()
  }
  
  function ensurePlayableBoard() {
    let attempts = 0
    const maxAttempts = 100
    
    while (!hasMatches() && attempts < maxAttempts) {
      regenerateBoard()
      attempts++
    }
    
    if (!hasMatches()) {
      forceCreateMatches()
    }
  }
  
  function forceCreateMatches() {
    const size = gridSize.value
    const mid = Math.floor(size / 2)
    const value = grid.value[mid][mid].value
    
    if (mid + 1 < size) {
      grid.value[mid][mid + 1].value = value
    }
    if (mid - 1 >= 0) {
      grid.value[mid][mid - 1].value = value
    }
  }
  
  function regenerateBoard() {
    for (let i = 0; i < gridSize.value; i++) {
      for (let j = 0; j < gridSize.value; j++) {
        grid.value[i][j].value = Math.floor(Math.random() * maxNumber.value) + 1
      }
    }
  }
  
  function hasMatches() {
    for (let i = 0; i < gridSize.value; i++) {
      for (let j = 0; j < gridSize.value; j++) {
        if (findAdjacentMatches(i, j).length >= 2) {
          return true
        }
      }
    }
    return false
  }
  
  function findAdjacentMatches(row, col) {
    const value = grid.value[row][col].value
    const matches = []
    const visited = new Set()
    const queue = [{ row, col }]
    
    while (queue.length > 0) {
      const { row: r, col: c } = queue.shift()
      const key = `${r},${c}`
      
      if (visited.has(key)) continue
      if (r < 0 || r >= gridSize.value || c < 0 || c >= gridSize.value) continue
      if (grid.value[r][c].value !== value) continue
      
      visited.add(key)
      matches.push({ row: r, col: c })
      
      queue.push({ row: r - 1, col: c })
      queue.push({ row: r + 1, col: c })
      queue.push({ row: r, col: c - 1 })
      queue.push({ row: r, col: c + 1 })
    }
    
    return matches
  }
  
  function selectCell(row, col) {
    if (isGameOver.value || isLevelComplete.value || isFrozen.value) return
    
    if (selectedItem.value) {
      useItem(row, col)
      return
    }
    
    const matches = findAdjacentMatches(row, col)
    
    if (matches.length >= 2) {
      saveGameState()
      
      combo.value++
      if (combo.value > maxCombo.value) {
        maxCombo.value = combo.value
      }
      
      const points = calculatePoints(matches.length, combo.value)
      score.value += points
      moves.value++
      
      if (isMovesLimit.value && moves.value >= movesLimit.value) {
        checkGameOver()
      }
      
      matches.forEach(({ row: r, col: c }) => {
        grid.value[r][c].isMatched = true
      })
      
      setTimeout(() => {
        matches.forEach(({ row: r, col: c }) => {
          grid.value[r][c].value = null
        })
        
        dropCells()
        fillEmptyCells()
        
        if (score.value >= levelGoal.value) {
          completeLevel()
        } else if (!hasPossibleMoves()) {
          ensurePlayableBoard()
        }
      }, 300)
    } else {
      combo.value = 0
    }
  }
  
  function calculatePoints(matchCount, comboCount) {
    const basePoints = matchCount * 10
    const comboMultiplier = 1 + (comboCount - 1) * 0.5
    return Math.floor(basePoints * comboMultiplier)
  }
  
  function dropCells() {
    for (let col = 0; col < gridSize.value; col++) {
      let writePos = gridSize.value - 1
      
      for (let row = gridSize.value - 1; row >= 0; row--) {
        if (grid.value[row][col].value !== null) {
          if (row !== writePos) {
            grid.value[writePos][col].value = grid.value[row][col].value
            grid.value[row][col].value = null
          }
          writePos--
        }
      }
    }
  }
  
  function fillEmptyCells() {
    for (let i = 0; i < gridSize.value; i++) {
      for (let j = 0; j < gridSize.value; j++) {
        if (grid.value[i][j].value === null) {
          grid.value[i][j].value = Math.floor(Math.random() * maxNumber.value) + 1
          grid.value[i][j].isMatched = false
        }
      }
    }
  }
  
  function hasPossibleMoves() {
    for (let i = 0; i < gridSize.value; i++) {
      for (let j = 0; j < gridSize.value; j++) {
        if (findAdjacentMatches(i, j).length >= 2) {
          return true
        }
      }
    }
    return false
  }
  
  function checkGameOver() {
    if (score.value < levelGoal.value) {
      isGameOver.value = true
      saveHighScore()
    }
  }
  
  function completeLevel() {
    isLevelComplete.value = true
    if (level.value >= unlockedLevels.value && level.value < levels.length) {
      unlockedLevels.value = level.value + 1
    }
    saveHighScore()
    saveProgress()
  }
  
  function saveGameState() {
    const state = {
      grid: JSON.parse(JSON.stringify(grid.value)),
      score: score.value,
      moves: moves.value,
      combo: combo.value,
      items: { ...items.value },
      timeRemaining: timeRemaining.value
    }
    gameHistory.value.push(state)
    
    if (gameHistory.value.length > 20) {
      gameHistory.value.shift()
    }
  }
  
  function undoMove() {
    if (gameHistory.value.length === 0) return
    
    const state = gameHistory.value.pop()
    grid.value = state.grid
    score.value = state.score
    moves.value = state.moves
    combo.value = state.combo
    items.value = { ...state.items }
    timeRemaining.value = state.timeRemaining
    isGameOver.value = false
    isLevelComplete.value = false
  }
  
  function canUndo() {
    return gameHistory.value.length > 0
  }
  
  function useItem(row, col) {
    if (!selectedItem.value || items.value[selectedItem.value] <= 0) return
    
    saveGameState()
    
    switch (selectedItem.value) {
      case 'hammer':
        grid.value[row][col].value = null
        grid.value[row][col].isMatched = true
        items.value.hammer--
        setTimeout(() => {
          dropCells()
          fillEmptyCells()
        }, 300)
        break
        
      case 'bomb':
        const bombTargets = []
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const r = row + i
            const c = col + j
            if (r >= 0 && r < gridSize.value && c >= 0 && c < gridSize.value) {
              bombTargets.push({ row: r, col: c })
            }
          }
        }
        bombTargets.forEach(({ row: r, col: c }) => {
          grid.value[r][c].value = null
          grid.value[r][c].isMatched = true
        })
        items.value.bomb--
        setTimeout(() => {
          dropCells()
          fillEmptyCells()
        }, 300)
        break
        
      case 'refresh':
        regenerateBoard()
        ensurePlayableBoard()
        items.value.refresh--
        break
        
      case 'time':
        if (isTimeLimit.value) {
          timeRemaining.value += 30
        }
        items.value.time--
        break
        
      case 'freeze':
        isFrozen.value = true
        items.value.freeze--
        setTimeout(() => {
          isFrozen.value = false
        }, 10000)
        break
    }
    
    selectedItem.value = null
  }
  
  function addItem(type, count = 1) {
    if (items.value[type] !== undefined) {
      items.value[type] += count
    }
  }
  
  function startLevel(levelNum) {
    if (levelNum > levels.length) {
      levelNum = levels.length
    }
    
    level.value = levelNum
    const config = levels[levelNum - 1]
    
    gridSize.value = config.gridSize
    maxNumber.value = config.maxNumber
    levelGoal.value = config.goal
    
    score.value = 0
    moves.value = 0
    combo.value = 0
    maxCombo.value = 0
    isGameOver.value = false
    isLevelComplete.value = false
    gameHistory.value = []
    isFrozen.value = false
    selectedItem.value = null
    
    items.value = {
      hammer: 3,
      bomb: 2,
      refresh: 2,
      time: 1,
      freeze: 1
    }
    
    if (config.type === 'time') {
      isTimeLimit.value = true
      isMovesLimit.value = false
      timeRemaining.value = config.timeLimit
      movesLimit.value = 0
    } else if (config.type === 'moves') {
      isTimeLimit.value = false
      isMovesLimit.value = true
      timeRemaining.value = 0
      movesLimit.value = config.movesLimit
    } else {
      isTimeLimit.value = false
      isMovesLimit.value = false
      timeRemaining.value = 0
      movesLimit.value = 0
    }
    
    initializeGrid()
  }
  
  function nextLevel() {
    if (level.value < levels.length) {
      startLevel(level.value + 1)
    }
  }
  
  function restartLevel() {
    startLevel(level.value)
  }
  
  function saveProgress() {
    const data = {
      unlockedLevels: unlockedLevels.value,
      highScores: highScores.value,
      selectedTheme: selectedTheme.value
    }
    localStorage.setItem('numberMatchGame', JSON.stringify(data))
  }
  
  function loadProgress() {
    const saved = localStorage.getItem('numberMatchGame')
    if (saved) {
      const data = JSON.parse(saved)
      unlockedLevels.value = data.unlockedLevels || 1
      highScores.value = data.highScores || []
      selectedTheme.value = data.selectedTheme || 'light'
      
      applyTheme(selectedTheme.value)
    }
  }
  
  function saveHighScore() {
    const entry = {
      level: level.value,
      score: score.value,
      moves: moves.value,
      maxCombo: maxCombo.value,
      date: new Date().toLocaleDateString()
    }
    
    highScores.value.push(entry)
    highScores.value.sort((a, b) => b.score - a.score)
    
    if (highScores.value.length > 10) {
      highScores.value = highScores.value.slice(0, 10)
    }
    
    saveProgress()
  }
  
  function setTheme(themeName) {
    selectedTheme.value = themeName
    applyTheme(themeName)
    saveProgress()
  }
  
  function applyTheme(themeName) {
    const html = document.documentElement
    
    Object.keys(themes).forEach(theme => {
      html.removeAttribute('data-theme')
    })
    
    if (themeName !== 'light') {
      html.setAttribute('data-theme', themes[themeName].class)
    }
    
    isDarkMode.value = themeName === 'dark' || themeName === 'space'
  }
  
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      isFullscreen.value = true
    } else {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
  
  function startTimer() {
    if (isTimeLimit.value && timeRemaining.value > 0 && !isFrozen.value) {
      timeRemaining.value--
      if (timeRemaining.value <= 0) {
        checkGameOver()
      }
    }
  }
  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  function shuffleBoard() {
    saveGameState()
    regenerateBoard()
    ensurePlayableBoard()
  }
  
  return {
    grid,
    gridSize,
    maxNumber,
    score,
    moves,
    level,
    levelGoal,
    isGameOver,
    isLevelComplete,
    combo,
    maxCombo,
    timeRemaining,
    isTimeLimit,
    isMovesLimit,
    movesLimit,
    gameHistory,
    unlockedLevels,
    highScores,
    selectedTheme,
    isDarkMode,
    isFullscreen,
    isFrozen,
    items,
    selectedItem,
    levels,
    themes,
    progress,
    levelInfo,
    
    initializeGrid,
    selectCell,
    findAdjacentMatches,
    undoMove,
    canUndo,
    useItem,
    addItem,
    startLevel,
    nextLevel,
    restartLevel,
    saveProgress,
    loadProgress,
    setTheme,
    toggleFullscreen,
    startTimer,
    formatTime,
    shuffleBoard
  }
})
