<template>
  <header>
    <nav>
      <ul>
        <li><router-link to="/">Accueil</router-link></li>
        <li><router-link to="/mangas">Catalogue</router-link></li>
        <li class="cart-icon">
          <router-link to="/cart" class="cart-button">
            <i class="fas fa-shopping-cart"></i>
            <span v-if="cartCount > 0" class="cart-notification">{{ cartCount }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  data() {
    return {
      cartCount: 0,
    };
  },
  methods: {
    updateCartCount() {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      this.cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    },
  },
  mounted() {
  this.updateCartCount();
  window.addEventListener("cart-updated", this.updateCartCount);
},
beforeUnmount() {
  window.removeEventListener("cart-updated", this.updateCartCount);
}
};
</script>

<style scoped>
header {
  background-color: #ffffff;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
}

nav ul {
  list-style: none;
  display: flex; 
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 0;
  padding: 0;
}

nav ul li {
  position: relative;
}

header nav ul li a {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  padding: 5px 15px;
  border-radius: 20px; 
  transition: all 0.3s ease;
}

header nav ul li a:hover {
  color: #4f7fa8;
}

header nav ul li a.active {
  background-color: #4f7fa8;
  color: white;
}

.cart-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background-color: #ffffff;
  border: 2px solid #ddd;
  border-radius: 50%;
  color: #4f7fa8;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.cart-icon:hover {
  background-color: #f9f9f9;
  border-color: #ccc;
}

.cart-notification {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: rgb(230, 0, 0);
  color: white;
  font-size: 0.65rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  z-index: 1;
}
</style>


