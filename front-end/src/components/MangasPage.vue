<template>
  <div>
    <div class="header-container">
      <h1>Liste des volumes</h1>
      <input
        type="text"
        class="search-bar"
        v-model="searchQuery"
        placeholder="Rechercher un manga..."
      />
      <div class="filters">
        <label for="category-filter">Catégorie :</label>
        <select id="category-filter" v-model="selectedCategory">
          <option value="">Toutes</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>

        <label for="price-filter">Prix :</label>
        <input
          type="range"
          id="price-filter"
          v-model="priceRange[1]"
          :min="6"
          :max="10"
          step="1"
          @input="updatePriceRange"
        />
        <span>{{ priceRange[0] }}€ - {{ priceRange[1] }}€</span>
      </div>
    </div>
    <div class="mangas-container">
      <div v-if="loading">Chargement...</div>
      <div v-if="error">{{ error }}</div>
      <div v-for="manga in paginatedMangas" :key="manga.id" class="manga-box">
        <img :src="manga.image" :alt="manga.titre" class="manga-image" />
        <div class="manga-info">
          <h3>{{ manga.titre }} - Tome {{ manga.tome }}</h3>
          <p class="manga-summary">{{ manga.résumé }}</p>
          <div class="manga-details">
            <div class="price-button-container">
              <span class="price">{{ manga.prix }} €</span>
              <button class="btn-add-cart" @click="addToCart(manga)">Ajouter au panier</button>
            </div>
            <span class="category">{{ manga.categorie }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="pagination">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Précédent</button>
      <span>Page {{ currentPage }} sur {{ totalPages }}</span>
      <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Suivant</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mangas: [],
      categories: ["Shōnen", "Seinen", "Shōjo"],
      selectedCategory: "",
      priceRange: [6, 10],
      searchQuery: "",
      loading: true,
      error: null,
      currentPage: 1,
      mangasPerPage: 10,
    };
  },
  computed: {
    filteredMangas() {
      const search = this.searchQuery.toLowerCase();
      return this.mangas.filter((manga) => {
        const inCategory =
          !this.selectedCategory || manga.categorie === this.selectedCategory;
        const inPriceRange =
          manga.prix >= this.priceRange[0] && manga.prix <= this.priceRange[1];
        const matchesSearch = manga.titre.toLowerCase().includes(search);
        return inCategory && inPriceRange && matchesSearch;
      });
    },
    totalPages() {
      return Math.ceil(this.filteredMangas.length / this.mangasPerPage);
    },
    paginatedMangas() {
      const start = (this.currentPage - 1) * this.mangasPerPage;
      const end = start + this.mangasPerPage;
      return this.filteredMangas.slice(start, end);
    },
  },
  methods: {
    updatePriceRange(event) {
      const value = parseInt(event.target.value);
      this.priceRange = [6, value];
    },
    addToCart(manga) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingManga = cart.find((item) => item.id === manga.id);
      if (existingManga) {
        existingManga.quantity += 1;
      } else {
        cart.push({ ...manga, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
    },
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
  mounted() {
    fetch("/api/mangas")
      .then((response) => response.json())
      .then((data) => {
        this.mangas = data;
        this.loading = false;
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des mangas :", err);
        this.error = "Erreur lors du chargement des mangas.";
        this.loading = false;
      });
  },
};
</script>

<style scoped>
.header-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 40px auto 20px auto;
  padding: 0 15px;
  gap: 15px;
}

.header-container h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #333;
  flex-basis: 100%;
}

.search-bar {
  flex-grow: 1;
  max-width: 400px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.filters {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filters label {
  font-weight: bold;
  color: #333;
}

.filters select,
.filters input {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.filters span {
  font-weight: bold;
  color: #478cd6;
}

.mangas-container {
  padding: 20px;
  display: grid;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.manga-box {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 15px;
  overflow: hidden;
}

.manga-image {
  max-width: 100px;
  border-radius: 5px;
  margin-right: 15px;
}

.manga-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.manga-info h3 {
  font-size: 1.2rem;
  margin: 0;
  color: #333;
}

.manga-summary {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  max-height: 4.2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.manga-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-button-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #478cd6;
}

.category {
  background-color: #f1f1f1;
  color: #333;
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 5px;
  text-transform: uppercase;
}

.btn-add-cart {
  background-color: #ffd51a;
  color: rgb(0, 0, 0);
  border: none;
  padding: 6px 10px;
  font-size: 0.9rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.btn-add-cart:hover {
  background-color: #edc619;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 30px;
}

.pagination button {
  padding: 10px 20px;
  background-color: #4f7fa8;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease-in-out;
}

.pagination button:hover {
  background-color: #446a84;
}

.pagination button:disabled {
  background-color: #ddd;
  color: #aaa;
  cursor: not-allowed;
}

.pagination span {
  font-size: 1rem;
  font-weight: bold;
}
</style>
