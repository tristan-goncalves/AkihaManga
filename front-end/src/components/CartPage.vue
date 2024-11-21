<template>
  <div class="cart-container">
    <h1>Votre Panier</h1>
    <div v-if="cart.length === 0">Votre panier est vide.</div>
    <div v-else>
      <div class="cart-item" v-for="item in cart" :key="item.id">
        <img :src="item.image" :alt="item.titre" class="cart-item-image" />
        <div class="cart-item-details">
          <h3>{{ item.titre }} - Tome {{ item.tome }}</h3>
          <p class="cart-item-price">{{ item.prix }} €</p>
          <div class="cart-item-actions">
            <button class="quantity-btn" @click="updateQuantity(item, -1)" :disabled="item.quantity === 1">-</button>
            <span>{{ item.quantity }}</span>
            <button class="quantity-btn" @click="updateQuantity(item, 1)">+</button>
            <button class="delete-btn" @click="removeItemFromCart(item.id)">Supprimer</button>
          </div>
        </div>
      </div>
      <div class="cart-total">
        <h3>Total : {{ total.toFixed(2) }} €</h3>
        <button class="validate-btn" @click="showForm = true">Valider la commande</button>
      </div>
    </div>

    <div v-if="showForm" class="modal-overlay">
      <div class="modal">
        <h2>Finaliser la commande</h2>
        <div class="form-group"> 
          <label for="nom">Nom :</label>
          <input type="text" id="nom" v-model="user.nom" placeholder="Entrez votre nom" />
        </div>
        <div class="form-group">
          <label for="adresse">Adresse :</label>
          <input type="text" id="adresse" v-model="user.adresse" placeholder="Entrez votre adresse" />
        </div>
        <div class="form-group">
          <label for="email">Email :</label>
          <input type="email" id="email" v-model="user.email" placeholder="Entrez votre email" />
        </div>
        <div class="form-actions">
          <button class="submit-btn" @click="submitOrder">Passer commande</button>
          <button class="cancel-btn" @click="cancelForm">Annuler</button>
        </div>
      </div>
    </div>

    <div v-if="showRecap" class="recap-container">
  <button class="close-recap-btn" @click="closeRecap">Fermer</button>
  <h2>Récapitulatif de la commande</h2>
  <div class="recap-details">
    <p><strong>Nom :</strong> {{ recapData.utilisateur.nom }}</p>
    <p><strong>Adresse :</strong> {{ recapData.utilisateur.adresse }}</p>
    <p><strong>Email :</strong> {{ recapData.utilisateur.email }}</p>
    <p><strong>Total :</strong> {{ recapData.total }} €</p>
    <h3>Articles :</h3>
    <ul>
      <li v-for="article in recapData.articles" :key="article.id" class="recap-article">
        <img :src="article.image" :alt="article.titre" class="recap-image" />
        <span>{{ article.titre }} x{{ article.quantity }} - {{ article.prix }} €</span>
      </li>
    </ul>
  </div>
</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cart: [],
      user: {
        nom: "",
        adresse: "",
        email: "",
      },
      showForm: false,
      showRecap: false,
      recapData: null,
    };
  },
  computed: {
    total() {
      return this.cart.reduce(
        (total, item) => total + item.prix * item.quantity,
        0
      );
    },
  },
  methods: {
    updateCart() {
      this.cart = JSON.parse(localStorage.getItem("cart")) || [];
    },
    updateQuantity(item, amount) {
      const cartItem = this.cart.find((cartItem) => cartItem.id === item.id);
      if (cartItem) {
        cartItem.quantity += amount;
        if (cartItem.quantity <= 0) {
          this.removeItemFromCart(cartItem.id);
        } else {
          this.saveCart();
        }
      }
    },
    saveCart() {
      localStorage.setItem("cart", JSON.stringify(this.cart));
      window.dispatchEvent(new Event("cart-updated"));
    },
    removeItemFromCart(itemId) {
      this.cart = this.cart.filter((item) => item.id !== itemId);
      this.saveCart();
    },
    submitOrder() {
      if (!this.user.nom || !this.user.adresse || !this.user.email) {
        alert("Veuillez remplir tous les champs du formulaire.");
        return;
      }

      const payload = {
        utilisateur: this.user,
        articles: this.cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        total: this.total,
      };

      fetch("http://localhost:3000/factures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur lors de la validation de la commande");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Commande validée avec succès :", data);
          if (!data.factureId) {
            throw new Error("ID de la facture non défini");
          }

          fetch(`http://localhost:3000/factures/${data.factureId}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Erreur lors de la récupération du récapitulatif");
              }
              return response.json();
            })
            .then((recapData) => {
              console.log("Récapitulatif récupéré :", recapData);
              this.recapData = recapData;
              this.showForm = false;
              this.showRecap = true;
              this.cart = [];
              localStorage.removeItem("cart");
              window.dispatchEvent(new Event("cart-updated"));
            })
            .catch((err) => {
              console.error(
                "Erreur lors de la récupération des données de la facture :",
                err
              );
              alert(
                "Une erreur est survenue lors de la récupération des données."
              );
            });
        })
        .catch((err) => {
          console.error("Erreur lors de la validation de la commande :", err);
          alert("Une erreur est survenue lors de la validation de la commande.");
        });
    },
    closeRecap() {
      this.showRecap = false;
    },
    cancelForm() {
      this.showForm = false;
    },
  },
  mounted() {
    this.updateCart();
    window.addEventListener("cart-updated", this.updateCart);
  },
  beforeUnmount() {
    window.removeEventListener("cart-updated", this.updateCart);
  },
};
</script>


<style scoped>
.cart-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.cart-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}
.cart-item-image {
  max-width: 80px;
  margin-right: 15px;
}
.cart-item-details {
  flex: 1;
}
.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cart-item-actions button {
  padding: 5px 10px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.cart-item-actions button:hover {
  background-color: #dfdddd;
}
.cart-item-actions span {
  font-size: 1.2rem;
  font-weight: bold;
}
.cart-total {
  text-align: right;
  margin-top: 20px;
  font-size: 1.5rem;
  font-weight: bold;
}
.cart-item-actions .quantity-btn {
  background-color: #f1f1f1;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease-in-out;
}

.cart-item-actions .quantity-btn:hover {
  background-color: #e0e0e0;
  border-color: #ccc;
}

.cart-item-actions .quantity-btn:disabled {
  background-color: #ddd;
  color: #aaa;
  cursor: not-allowed;
}
.cart-item-actions .delete-btn {
  background-color: #e20307;
  color: white;
  border: none;
  border-radius: 35px;
  padding: 5px 11px;
  font-size: 0.7rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.cart-item-actions .delete-btn:hover {
  background-color: #ac2228;
}

.validate-btn {
  background-color: #ffd51a;
  color: black;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.validate-btn:hover {
  background-color: #edc619;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.modal h2 {
  margin-top: 0;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.submit-btn {
  background-color: #ffd51a;
  color: black;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease-in-out;
}

.submit-btn:hover {
  background-color: #edc619;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: black;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease-in-out;
}

.cancel-btn:hover {
  background-color: #e3e3e3;
}

.recap-container {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
}
.recap-details p {
  font-size: 1rem;
  margin: 5px 0;
}
.recap-details h3 {
  margin-top: 20px;
}
.recap-article {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.recap-image {
  max-width: 50px;
  margin-right: 10px;
}
.close-recap-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #f1f1f1;
  color: black;
  border: none;
  padding: 10px 15px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  transition: background-color 0.3s ease-in-out;
}

.close-recap-btn:hover {
  background-color: #e3e3e3;
}
</style>
