import { createApp } from 'vue'
import './style.css'
import App from './App.vue'


import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';



// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
createApp(App).mount('#app')
