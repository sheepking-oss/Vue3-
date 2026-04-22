<template>
  <div class="game-play">
    <div class="game-header">
      <button class="back-btn" @click="goBack">
        <span class="btn-icon">←</span>
        返回
      </button>
      
      <div class="level-info">
        <span class="level-number">第 {{ gameStore.level }} 关</span>
        <span class="level-type">{{ levelTypeText }}</span>
      </div>
      
      <div class="header-actions">
        <button class="action-btn" @click="toggleFullscreen" title="全屏">
          {{ gameStore.isFullscreen ? '⛶' : '⛶' }}
        </button>
        <button class="action-btn" @click="toggleSettings" title="设置">
          ⚙️
        </button>
      </div>
    </div>
    
    <div class="game-stats">
      <div class="stat-item">
        <span class="stat-label">分数</span>
        <span class="stat-value">{{ gameStore.score }}</span>
      </div>
      
      <div class="stat-item" v-if="gameStore.isTimeLimit">
        <span class="stat-label">时间</span>
        <span class="stat-value" :class="{ 'warning': gameStore.timeRemaining <= 10 }">
          {{ gameStore.formatTime(gameStore.timeRemaining) }}
        </span>
      </div>
      
      <div class="stat-item" v-else-if="gameStore.isMovesLimit">
        <span class="stat-label">剩余步数</span>
        <span class="stat-value" :class="{ 'warning': gameStore.movesLimit - gameStore.moves <= 5 }">
          {{ gameStore.movesLimit - gameStore.moves }}
        </span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">连击</span>
        <span class="stat-value combo-value">{{ gameStore.combo }}x</span>
      </div>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: gameStore.progress + '%' }"></div>
      <div class="progress-text">
        {{ gameStore.score }} / {{ gameStore.levelGoal }}
      </div>
    </div>
    
    <div class="items-bar">
      <div 
        v-for="(count, item) in gameStore.items" 
        :key="item"
        class="item-btn"
        :class="{ 
          'selected': gameStore.selectedItem === item,
          'disabled': count <= 0
        }"
        @click="selectItem(item)"
        :title="itemNames[item]"
      >
        <span class="item-icon">{{ itemIcons[item] }}</span>
        <span class="item-count">{{ count }}</span>
      </div>
    </div>
    
    <div class="game-board-container">
      <div 
        class="game-board" 
        :style="{ 
          gridTemplateColumns: `repeat(${gameStore.gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gameStore.gridSize}, 1fr)`
        }"
      >
        <transition-group name="cell" tag="div" class="grid-inner">
          <div
            v-for="cell in flatGrid"
            :key="`${cell.row}-${cell.col}`"
            class="cell"
            :class="{
              'selected': cell.isSelected,
              'matched': cell.isMatched,
              'clickable': canClick(cell)
            }"
            :style="{
              backgroundColor: getNumberColor(cell.value),
              transform: cell.isMatched ? 'scale(0)' : 'scale(1)',
              opacity: cell.isMatched ? '0' : '1'
            }"
            @click="handleCellClick(cell.row, cell.col)"
          >
            <span class="cell-value">{{ cell.value }}</span>
          </div>
        </transition-group>
      </div>
    </div>
    
    <div class="game-controls">
      <button 
        class="control-btn" 
        @click="undoMove"
        :disabled="!gameStore.canUndo()"
        title="回退一步"
      >
        <span class="control-icon">↩️</span>
        <span class="control-label">回退</span>
      </button>
      
      <button 
        class="control-btn" 
        @click="shuffleBoard"
        title="重新排列"
      >
        <span class="control-icon">🔄</span>
        <span class="control-label">重排</span>
      </button>
      
      <button 
        class="control-btn" 
        @click="restartGame"
        title="重新开始"
      >
        <span class="control-icon">🔃</span>
        <span class="control-label">重开</span>
      </button>
    </div>
    
    <transition name="modal">
      <div v-if="showGameOver" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-icon">😔</div>
          <h2 class="modal-title">游戏结束</h2>
          <p class="modal-message">再接再厉！</p>
          
          <div class="modal-stats">
            <div class="modal-stat">
              <span class="modal-stat-label">最终分数</span>
              <span class="modal-stat-value">{{ gameStore.score }}</span>
            </div>
            <div class="modal-stat">
              <span class="modal-stat-label">最高连击</span>
              <span class="modal-stat-value">{{ gameStore.maxCombo }}x</span>
            </div>
          </div>
          
          <div class="modal-buttons">
            <button class="modal-btn btn-secondary" @click="goToMenu">返回菜单</button>
            <button class="modal-btn btn-primary" @click="restartGame">重新挑战</button>
          </div>
        </div>
      </div>
    </transition>
    
    <transition name="modal">
      <div v-if="showLevelComplete" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-icon">🎉</div>
          <h2 class="modal-title">关卡完成！</h2>
          <p class="modal-message">恭喜通过第 {{ gameStore.level }} 关</p>
          
          <div class="modal-stats">
            <div class="modal-stat">
              <span class="modal-stat-label">最终分数</span>
              <span class="modal-stat-value">{{ gameStore.score }}</span>
            </div>
            <div class="modal-stat">
              <span class="modal-stat-label">最高连击</span>
              <span class="modal-stat-value">{{ gameStore.maxCombo }}x</span>
            </div>
            <div class="modal-stat" v-if="!gameStore.isTimeLimit">
              <span class="modal-stat-label">使用步数</span>
              <span class="modal-stat-value">{{ gameStore.moves }}</span>
            </div>
          </div>
          
          <div class="modal-buttons">
            <button class="modal-btn btn-secondary" @click="goToMenu">返回菜单</button>
            <button 
              class="modal-btn btn-primary" 
              @click="nextLevel"
              :disabled="gameStore.level >= gameStore.levels.length"
            >
              {{ gameStore.level >= gameStore.levels.length ? '已通关' : '下一关' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <transition name="modal">
      <div v-if="showSettingsPanel" class="modal-overlay" @click.self="toggleSettings">
        <div class="modal-content settings-panel">
          <h2 class="modal-title">设置</h2>
          
          <div class="settings-section">
            <h3 class="settings-section-title">主题选择</h3>
            <div class="theme-options">
              <button
                v-for="(config, name) in gameStore.themes"
                :key="name"
                class="theme-btn"
                :class="{ 'selected': gameStore.selectedTheme === name }"
                @click="changeTheme(name)"
              >
                <div class="theme-preview" :data-theme="config.class"></div>
                <span class="theme-name">{{ config.name }}</span>
              </button>
            </div>
          </div>
          
          <div class="modal-buttons">
            <button class="modal-btn btn-primary" @click="toggleSettings">确定</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const switchView = inject('switchView')

const showGameOver = ref(false)
const showLevelComplete = ref(false)
const showSettingsPanel = ref(false)
const timer = ref(null)

const flatGrid = computed(() => {
  return gameStore.grid.flat()
})

const levelTypeText = computed(() => {
  const info = gameStore.levelInfo
  if (info.type === 'time') {
    return `限时 ${info.timeLimit}秒`
  } else if (info.type === 'moves') {
    return `限 ${info.movesLimit} 步`
  }
  return '经典模式'
})

const itemIcons = {
  hammer: '🔨',
  bomb: '💣',
  refresh: '🔄',
  time: '⏰',
  freeze: '❄️'
}

const itemNames = {
  hammer: '锤子 - 消除单个方块',
  bomb: '炸弹 - 消除3x3区域',
  refresh: '刷新 - 重新排列棋盘',
  time: '时间 - 增加30秒',
  freeze: '冻结 - 暂停10秒'
}

function getNumberColor(value) {
  if (value === null) return 'transparent'
  return `var(--number-${value}-color)`
}

function canClick(cell) {
  if (cell.isMatched || gameStore.isFrozen.value) return false
  if (gameStore.selectedItem) return true
  const matches = gameStore.findAdjacentMatches(cell.row, cell.col)
  return matches.length >= 2
}

function handleCellClick(row, col) {
  gameStore.selectCell(row, col)
}

function selectItem(item) {
  if (gameStore.items[item] <= 0) return
  if (gameStore.selectedItem === item) {
    gameStore.selectedItem = null
  } else {
    gameStore.selectedItem = item
  }
}

function undoMove() {
  gameStore.undoMove()
}

function shuffleBoard() {
  gameStore.shuffleBoard()
}

function restartGame() {
  showGameOver.value = false
  showLevelComplete.value = false
  gameStore.restartLevel()
}

function nextLevel() {
  showLevelComplete.value = false
  gameStore.nextLevel()
}

function goBack() {
  switchView('MainMenu')
}

function goToMenu() {
  showGameOver.value = false
  showLevelComplete.value = false
  switchView('MainMenu')
}

function toggleFullscreen() {
  gameStore.toggleFullscreen()
}

function toggleSettings() {
  showSettingsPanel.value = !showSettingsPanel.value
}

function changeTheme(theme) {
  gameStore.setTheme(theme)
}

function closeModal() {
  showGameOver.value = false
  showLevelComplete.value = false
}

watch(() => gameStore.isGameOver, (val) => {
  if (val) showGameOver.value = true
})

watch(() => gameStore.isLevelComplete, (val) => {
  if (val) showLevelComplete.value = true
})

onMounted(() => {
  if (gameStore.isTimeLimit) {
    timer.value = setInterval(() => {
      gameStore.startTimer()
    }, 1000)
  }
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.game-play {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 2rem);
  max-width: 600px;
  margin: 0 auto;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.back-btn, .action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--card-bg-color);
  border: none;
  border-radius: var(--border-radius);
  color: var(--text-color);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow);
}

.back-btn:hover, .action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.level-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.level-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
}

.level-type {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.game-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: var(--card-bg-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
}

.stat-value.warning {
  color: var(--danger-color);
  animation: pulse 1s infinite;
}

.combo-value {
  color: var(--primary-color);
}

.progress-bar {
  position: relative;
  height: 12px;
  background: var(--card-bg-color);
  border-radius: 6px;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: inset 0 2px 4px var(--shadow-color);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.items-bar {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.item-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--card-bg-color);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow);
}

.item-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.item-btn.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1));
}

.item-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-icon {
  font-size: 1.5rem;
}

.item-count {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-board-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.game-board {
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--card-bg-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
}

.grid-inner {
  display: contents;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px var(--shadow-color);
  position: relative;
  overflow: hidden;
}

.cell::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
  pointer-events: none;
}

.cell:hover.clickable {
  transform: scale(1.05);
  box-shadow: 0 4px 8px var(--shadow-color);
}

.cell.selected {
  transform: scale(1.1);
  box-shadow: 0 0 0 3px var(--primary-color), 0 4px 8px var(--shadow-color);
}

.cell.matched {
  animation: pop 0.3s ease-out;
}

.cell-value {
  font-size: 2rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.cell-enter-active {
  animation: bounceIn 0.5s ease;
}

.cell-leave-active {
  animation: pop 0.3s ease-out;
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1.5rem;
  background: var(--card-bg-color);
  border: none;
  border-radius: var(--border-radius);
  color: var(--text-color);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow);
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-icon {
  font-size: 1.25rem;
}

.control-label {
  font-size: 0.75rem;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--card-bg-color);
  border-radius: var(--border-radius);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.modal-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.modal-message {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.modal-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modal-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--bg-color);
  border-radius: var(--border-radius);
}

.modal-stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.modal-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.modal-buttons {
  display: flex;
  gap: 1rem;
}

.modal-btn {
  flex: 1;
  padding: 0.875rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.settings-panel {
  max-width: 500px;
  text-align: left;
}

.settings-section {
  margin-bottom: 1.5rem;
}

.settings-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.theme-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.theme-btn:hover {
  border-color: var(--primary-color);
}

.theme-btn.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1));
}

.theme-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.theme-preview[data-theme="dark"] {
  background: #0f172a;
}

.theme-preview[data-theme="ocean"] {
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
}

.theme-preview[data-theme="forest"] {
  background: linear-gradient(135deg, #22c55e, #84cc16);
}

.theme-preview[data-theme="space"] {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
}

.theme-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pop {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .game-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .items-bar {
    gap: 0.25rem;
  }
  
  .item-btn {
    width: 50px;
    height: 50px;
  }
  
  .item-icon {
    font-size: 1.25rem;
  }
  
  .cell-value {
    font-size: 1.5rem;
  }
  
  .theme-options {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .game-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .level-info {
    order: -1;
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .game-stats {
    grid-template-columns: 1fr 1fr;
  }
  
  .game-board {
    padding: 0.5rem;
    gap: 0.25rem;
  }
  
  .cell {
    border-radius: 8px;
  }
  
  .cell-value {
    font-size: 1.25rem;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .modal-icon {
    font-size: 3rem;
  }
  
  .modal-title {
    font-size: 1.5rem;
  }
}
</style>
