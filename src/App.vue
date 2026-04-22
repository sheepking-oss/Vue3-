<template>
  <div class="app-container" :class="{ 'dark-mode': gameStore.isDarkMode }">
    <transition name="fade" mode="out-in">
      <component :is="currentComponent" :key="currentView" />
    </transition>
  </div>
</template>

<script setup>
import { ref, provide, computed, onMounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import MainMenu from './components/MainMenu.vue'
import GamePlay from './components/GamePlay.vue'
import LevelSelect from './components/LevelSelect.vue'
import Leaderboard from './components/Leaderboard.vue'
import Settings from './components/Settings.vue'

const gameStore = useGameStore()
const currentView = ref('MainMenu')

const componentMap = {
  MainMenu,
  GamePlay,
  LevelSelect,
  Leaderboard,
  Settings
}

const currentComponent = computed(() => componentMap[currentView.value])

function handleSwitchView(view) {
  if (componentMap[view]) {
    currentView.value = view
  }
}

provide('switchView', handleSwitchView)

onMounted(() => {
  gameStore.loadProgress()
})
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color);
  transition: var(--transition);
  padding: 1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .app-container {
    padding: 0.5rem;
  }
}
</style>
