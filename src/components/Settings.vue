<template>
  <div class="settings">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <span class="btn-icon">←</span>
        返回
      </button>
      <h1 class="page-title">⚙️ 设置</h1>
      <div class="header-spacer"></div>
    </div>
    
    <div class="settings-container">
      <div class="settings-section">
        <h2 class="section-title">🎨 主题选择</h2>
        <div class="theme-grid">
          <button
            v-for="(config, name) in gameStore.themes"
            :key="name"
            class="theme-option"
            :class="{ 'selected': gameStore.selectedTheme === name }"
            @click="changeTheme(name)"
          >
            <div class="theme-preview" :data-theme="config.class">
              <div class="preview-header"></div>
              <div class="preview-content">
                <div class="preview-card"></div>
                <div class="preview-card"></div>
              </div>
            </div>
            <span class="theme-name">{{ config.name }}</span>
          </button>
        </div>
      </div>
      
      <div class="settings-section">
        <h2 class="section-title">🔧 游戏设置</h2>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-name">全屏模式</div>
            <div class="setting-desc">在全屏模式下游玩游戏</div>
          </div>
          <button class="toggle-btn" @click="toggleFullscreen">
            {{ gameStore.isFullscreen ? '开启' : '关闭' }}
          </button>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-name">深色模式</div>
            <div class="setting-desc">切换到深色主题保护眼睛</div>
          </div>
          <button 
            class="toggle-btn" 
            @click="toggleDarkMode"
            :class="{ 'active': gameStore.isDarkMode }"
          >
            {{ gameStore.isDarkMode ? '开启' : '关闭' }}
          </button>
        </div>
      </div>
      
      <div class="settings-section">
        <h2 class="section-title">ℹ️ 关于游戏</h2>
        
        <div class="about-content">
          <div class="about-item">
            <span class="about-label">游戏名称</span>
            <span class="about-value">数字消除</span>
          </div>
          <div class="about-item">
            <span class="about-label">游戏版本</span>
            <span class="about-value">1.0.0</span>
          </div>
          <div class="about-item">
            <span class="about-label">技术栈</span>
            <span class="about-value">Vue3 + Pinia</span>
          </div>
        </div>
        
        <div class="game-rules">
          <h3 class="rules-title">游戏规则</h3>
          <ul class="rules-list">
            <li>点击相连的相同数字进行消除</li>
            <li>消除越多，得分越高</li>
            <li>连续消除可触发连击加成</li>
            <li>达到目标分数即可通关</li>
            <li>使用道具可以帮助你过关</li>
          </ul>
        </div>
      </div>
      
      <div class="settings-section danger">
        <h2 class="section-title">⚠️ 危险操作</h2>
        
        <button class="danger-btn" @click="confirmReset">
          重置游戏进度
        </button>
        <p class="danger-hint">此操作将清除所有存档数据，包括关卡进度和排行榜</p>
      </div>
    </div>
    
    <transition name="modal">
      <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
        <div class="modal-content">
          <div class="modal-icon">⚠️</div>
          <h2 class="modal-title">确认重置？</h2>
          <p class="modal-message">此操作将清除所有游戏进度，无法恢复。</p>
          
          <div class="modal-buttons">
            <button class="modal-btn btn-secondary" @click="showConfirm = false">取消</button>
            <button class="modal-btn btn-primary danger" @click="resetProgress">确认重置</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const switchView = inject('switchView')

const showConfirm = ref(false)

function goBack() {
  switchView('MainMenu')
}

function changeTheme(theme) {
  gameStore.setTheme(theme)
}

function toggleFullscreen() {
  gameStore.toggleFullscreen()
}

function toggleDarkMode() {
  if (gameStore.isDarkMode) {
    gameStore.setTheme('light')
  } else {
    gameStore.setTheme('dark')
  }
}

function confirmReset() {
  showConfirm.value = true
}

function resetProgress() {
  gameStore.unlockedLevels = 1
  gameStore.highScores = []
  gameStore.selectedTheme = 'light'
  gameStore.setTheme('light')
  gameStore.saveProgress()
  showConfirm.value = false
}
</script>

<style scoped>
.settings {
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

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-section {
  background: var(--card-bg-color);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.settings-section.danger {
  border: 2px solid var(--danger-color);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.theme-option:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.theme-option.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1));
}

.theme-preview {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-header {
  height: 12px;
  background: var(--primary-color);
}

.preview-content {
  flex: 1;
  background: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px;
}

.preview-card {
  width: 20px;
  height: 20px;
  background: var(--card-bg-color);
  border-radius: 4px;
}

.theme-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.setting-name {
  font-weight: 600;
  color: var(--text-color);
}

.setting-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.toggle-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.toggle-btn:hover {
  border-color: var(--primary-color);
}

.toggle-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.about-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.about-label {
  color: var(--text-secondary);
}

.about-value {
  font-weight: 600;
  color: var(--text-color);
}

.game-rules {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.rules-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.75rem;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rules-list li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.rules-list li::before {
  content: '•';
  position: absolute;
  left: 0.5rem;
  color: var(--primary-color);
  font-weight: bold;
}

.danger-btn {
  width: 100%;
  padding: 1rem;
  background: var(--danger-color);
  border: none;
  border-radius: var(--border-radius);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.danger-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.danger-hint {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--danger-color);
  text-align: center;
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
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.modal-message {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
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

.modal-btn.danger {
  background: var(--danger-color);
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

@media (max-width: 768px) {
  .theme-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .theme-preview {
    width: 60px;
    height: 45px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
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
  
  .theme-grid {
    grid-template-columns: 1fr;
  }
  
  .theme-option {
    flex-direction: row;
  }
  
  .theme-preview {
    flex-shrink: 0;
  }
}
</style>
