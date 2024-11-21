import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import MangasPage from '../components/MangasPage.vue';
import CartPage from '../components/CartPage.vue';

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/mangas', name: 'Mangas', component: MangasPage },
  { path: '/cart', name: 'Cart', component: CartPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
