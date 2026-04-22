<template>
  <div class="leaderboard">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <span class="btn-icon">←</span>
        返回
      </button>
      <h1 class="page-title">🏆 排行榜</h1>
      <div class="header-spacer"></div>
    </div>
    
    <div class="leaderboard-container">
      <div class="top-three" v-if="gameStore.highScores.length >= 3">
        <div class="top-card second">
          <div class="top-rank">🥈</div>
          <div class="top-score">{{ gameStore.highScores[1]?.score || 0 }}</div>
          <div class="top-level">第 {{ gameStore.highScores[1]?.level || 0 }} 关</div>
        </div>
        
        <div class="top-card first">
          <div class="top-rank">🥇</div>
          <div class="top-score">{{ gameStore.highScores[0]?.score || 0 }}</div>
          <div class="top-level">第 {{ gameStore.highScores[0]?.level || 0 }} 关</div>
        </div>
        
        <div class="top-card third">
          <div class="top-rank">🥉</div>
          <div class="top-score">{{ gameStore.highScores[2]?.score || 0 }}</div>
          <div class="top-level">第 {{ gameStore.highScores[2]?.level || 0 }} 关</div>
        </div>
      </div>
      
      <div class="scores-list">
        <div 
          v-for="(score, index) in gameStore.highScores" 
          :key="index"
          class="score-item"
          :class="{ 'top-3': index < 3 }"
        >
          <div class="score-rank">
            <span v-if="index === 0">🥇</span>
            <span v-else-if="index === 1">🥈</span>
            <span v-else-if="index === 2">🥉</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          
          <div class="score-info">
            <div class="score-value">{{ score.score }}</div>
            <div class="score-details">
              <span>第 {{ score.level }} 关</span>
              <span>最高连击 {{ score.maxCombo }}x</span>
            </div>
          </div>
          
          <div class="score-date">{{ score.date }}</div>
        </div>
        
        <div v-if="gameStore.highScores.length === 0" class="empty-state">
          <div class="empty-icon">🎮</div>
          <div class="empty-text">暂无记录</div>
          <div class="empty-hint">开始游戏，创造你的高分吧！</div>
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
</script>

<style scoped>
.leaderboard {
  max-width: 600px;
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

.leaderboard-container {
  background: var(--card-bg-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.top-three {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.top-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.top-card.first {
  order: 2;
  padding-top: 2.5rem;
  margin-bottom: 1rem;
  transform: scale(1.1);
}

.top-card.second {
  order: 1;
}

.top-card.third {
  order: 3;
}

.top-rank {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.top-score {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.top-level {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.scores-list {
  padding: 1rem;
}

.score-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: var(--bg-color);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.score-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow);
}

.score-item.top-3 {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1));
  border-left: 3px solid var(--primary-color);
}

.score-rank {
  width: 40px;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-align: center;
}

.score-info {
  flex: 1;
  margin: 0 1rem;
}

.score-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.score-details {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.score-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: right;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .top-three {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
  }
  
  .top-card {
    padding: 1rem;
  }
  
  .top-card.first {
    order: -1;
    width: 100%;
    margin-bottom: 0;
    transform: none;
    padding-top: 1rem;
  }
  
  .top-rank {
    font-size: 1.5rem;
  }
  
  .top-score {
    font-size: 1.25rem;
  }
  
  .score-item {
    flex-wrap: wrap;
  }
  
  .score-rank {
    width: 30px;
    font-size: 1rem;
  }
  
  .score-info {
    margin: 0 0.75rem;
  }
  
  .score-details {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .score-date {
    width: 100%;
    margin-top: 0.5rem;
    text-align: left;
  }
}

@media (max-width: 480px) {
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
  
  .top-three {
    flex-direction: column;
    align-items: stretch;
  }
  
  .top-card {
    order: 0 !important;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    margin-bottom: 0.5rem;
    transform: none;
  }
  
  .top-card.first {
    padding-top: 1rem;
  }
  
  .top-rank {
    margin-bottom: 0;
  }
  
  .top-score {
    margin-bottom: 0;
  }
}
</style>
