<template>
  <div>
    <div class="hero">
      <h1>Bienvenue sur <span class="highlight">AkihaManga</span></h1>
      <p>Explorez notre collection de mangas et trouvez vos titres préférés !</p>
      <router-link to="/mangas" class="btn">Voir les volumes disponibles</router-link>
    </div>

    <div class="carousel-container" v-if="mangas.length">
      <h2>Explorez nos volumes disponibles</h2>
      <div class="carousel">
        <button class="carousel-btn left" @click="prevSlide">&#10094;</button>
        <div class="carousel-track-container">
          <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * (100 / mangasPerView)}%)` }">
            <div
              class="carousel-item"
              v-for="manga in mangas"
              :key="manga.id"
            >
              <img :src="manga.image" :alt="manga.titre" />
              <h3>{{ manga.titre }} - Tome {{ manga.tome }}</h3>
              <p>{{ manga.prix }} €</p>
            </div>
          </div>
        </div>
        <button class="carousel-btn right" @click="nextSlide">&#10095;</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mangas: [],
      currentSlide: 0,
      mangasPerView: 3,
    };
  },
  computed: {
    totalSlides() {
      return Math.ceil(this.mangas.length / this.mangasPerView);
    },
  },
  methods: {
    prevSlide() {
      if (this.currentSlide > 0) {
        this.currentSlide -= 1;
      }
    },
    nextSlide() {
      if (this.currentSlide < this.totalSlides - 1) {
        this.currentSlide += 1;
      }
    },
  },
  mounted() {
    fetch("/api/mangas")
      .then((res) => res.json())
      .then((data) => {
        this.mangas = data.map((manga) => ({
          id: manga.id,
          titre: manga.titre,
          tome: manga.tome,
          image: manga.image,
          prix: manga.prix,
        }));
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des mangas :", err);
      });
  },
};
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  color: #333;
  border-radius: 8px;
  margin: 30px auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 700px;
}
.hero h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 15px;
}
.hero .highlight {
  color: #4f7fa8;
}
.hero p {
  font-size: 1.1rem;
  margin-bottom: 20px;
  color: #555;
}
.hero .btn {
  background: #4f7fa8;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s ease-in-out;
}
.hero .btn:hover {
  background: #446a84;
}

.carousel-container {
  margin: 40px auto;
  max-width: 700px;
  text-align: center;
}
.carousel-container h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 20px;
}

.carousel {
  position: relative;
  overflow: hidden;
}
.carousel-track-container {
  overflow: hidden;
  width: 100%;
}
.carousel-track {
  display: flex;
  transition: transform 0.3s ease-in-out;
}
.carousel-item {
  min-width: calc(100% / 3);
  text-align: center;
  padding: 20px;
}
.carousel-item img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.carousel-item h3 {
  margin: 10px 0;
  font-size: 1rem;
  color: #333;
}
.carousel-item p {
  font-size: 1rem;
  color: #555;
}

.carousel-btn {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.65);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 50%;
  z-index: 10;
  transition: background-color 0.2s ease-in-out;
}
.carousel-btn:hover {
  background-color: rgba(0, 0, 0, 0.85);
}
.carousel-btn.left {
  left: 10px;
}
.carousel-btn.right {
  right: 10px;
}
</style>
