<template>
  <div id="app">
    <HeaderPage />
    <router-view />
    <FooterPage />
  </div>
</template>

<script>
import HeaderPage from './components/HeaderPage.vue';
import FooterPage from './components/FooterPage.vue';

export default {
  components: {
    HeaderPage,
    FooterPage
  },
};
</script>

<style>
body {
  font-family: 'Roboto', sans-serif;
  background-color: #f6f6f6;
  margin: 0;
  padding: 0;
  color: #333;
}
</style>
