import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import TagTextarea from 'vue-demi-test/packages/index'


createApp(App).use(store).use(router).use(TagTextarea).mount('#app')
