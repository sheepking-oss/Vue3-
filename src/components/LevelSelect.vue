<template>
  <div class="level-select">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <span class="btn-icon">←</span>
        返回
      </button>
      <h1 class="page-title">关卡选择</h1>
      <div class="header-spacer"></div>
    </div>
    
    <div class="level-grid">
      <div
        v-for="(level, index) in gameStore.levels"
        :key="index"
        class="level-card"
        :class="{
          'locked': index + 1 > gameStore.unlockedLevels,
          'current': index + 1 === gameStore.unlockedLevels
        }"
        @click="selectLevel(index + 1)"
      >
        <div class="level-number">{{ index + 1 }}</div>
        <div class="level-info-small">
          <span class="level-type-small">
            {{ getLevelType(level.type) }}
          </span>
          <span class="level-goal-small">
            目标: {{ level.goal }}
          </span>
        </div>
        <div v-if="index + 1 > gameStore.unlockedLevels" class="level-lock">
          🔒
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const switchView = inject('switchView')

function goBack() {
  switchView('MainMenu')
}

function selectLevel(levelNum) {
  if (levelNum > gameStore.unlockedLevels) return
  
  gameStore.startLevel(levelNum)
  switchView('GamePlay')
}

function getLevelType(type) {
  switch (type) {
    case 'time':
      return '⏱️ 限时'
    case 'moves':
      return '📊 限步'
    default:
      return '🎯 经典'
  }
}
</script>

<style scoped>
.level-select {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.back-btn {
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

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
}

.header-spacer {
  width: 80px;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.level-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  background: var(--card-bg-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.level-card:hover:not(.locked) {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.level-card.current {
  border: 2px solid var(--primary-color);
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(124, 58, 237, 0.05));
}

.level-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.level-number {
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.level-info-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
}

.level-type-small {
  color: var(--primary-color);
  font-weight: 600;
}

.level-goal-small {
  color: var(--text-secondary);
}

.level-lock {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .level-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
  
  .level-card {
    padding: 1rem;
  }
  
  .level-number {
    font-size: 1.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .level-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .page-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .page-title {
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .header-spacer {
    display: none;
  }
}
</style>
