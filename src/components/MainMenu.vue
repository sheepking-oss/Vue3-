<template>
  <div class="main-menu">
    <div class="menu-header">
      <h1 class="game-title">数字消除</h1>
      <p class="game-subtitle">趣味数字消除游戏</p>
    </div>
    
    <div class="menu-buttons">
      <button class="menu-btn btn-primary" @click="startGame">
        <span class="btn-icon">🎮</span>
        开始游戏
      </button>
      
      <button class="menu-btn btn-secondary" @click="showLevelSelect">
        <span class="btn-icon">📋</span>
        关卡选择
      </button>
      
      <button class="menu-btn btn-secondary" @click="showLeaderboard">
        <span class="btn-icon">🏆</span>
        排行榜
      </button>
      
      <button class="menu-btn btn-secondary" @click="showSettings">
        <span class="btn-icon">⚙️</span>
        设置
      </button>
    </div>
    
    <div class="menu-info">
      <div class="info-card">
        <span class="info-icon">🎯</span>
        <span class="info-text">已解锁 {{ gameStore.unlockedLevels }}/{{ gameStore.levels.length }} 关卡</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const switchView = inject('switchView')

function startGame() {
  gameStore.startLevel(1)
  switchView('GamePlay')
}

function showLevelSelect() {
  switchView('LevelSelect')
}

function showLeaderboard() {
  switchView('Leaderboard')
}

function showSettings() {
  switchView('Settings')
}
</script>

<style scoped>
.main-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 2rem);
  padding: 2rem;
}

.menu-header {
  text-align: center;
  margin-bottom: 3rem;
}

.game-title {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 12px var(--shadow-color);
}

.game-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 2rem;
  font-size: 1.25rem;
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-icon {
  font-size: 1.5rem;
}

.menu-info {
  margin-top: 3rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--card-bg-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.info-icon {
  font-size: 1.5rem;
}

.info-text {
  font-weight: 600;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .main-menu {
    padding: 1rem;
  }
  
  .game-title {
    font-size: 2.5rem;
  }
  
  .game-subtitle {
    font-size: 1rem;
  }
  
  .menu-buttons {
    max-width: 100%;
  }
  
  .menu-btn {
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 2rem;
  }
  
  .menu-buttons {
    gap: 0.75rem;
  }
  
  .menu-btn {
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
  }
}
</style>
