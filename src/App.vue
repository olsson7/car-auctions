<template>
  <div class="container">
    <h1>Aktiva auktioner</h1>

    <div v-if="loading" class="loader-container">
      <div class="spinner"></div>
      <p>Laddar auktioner…</p>
    </div>
    <div v-else-if="error" class="status error">{{ error }}</div>

    <div v-else class="list">
      <div
        v-for="a in auctions"
        :key="a.id"
        class="card"
      >
        <img
          :src="a.image"
          alt="Bilbild"
          class="image"
          @error="onImageError"
        />

        <div class="info">
          <h2>{{ a.brand }} {{ a.model }}</h2>

          <p class="meta">
            {{ a.year }} • {{ a.mileage }} • {{ a.gearbox }}
          </p>

          <p class="price">
            {{ a.reservePrice }}
          </p>

          <p class="location">
            {{ a.location }}, {{ a.city }}
          </p>

          <a
            class="link"
            :href="`https://carstore.eu/auction/se/${a.id}`"
            target="_blank"
          >
            Visa auktion →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const auctions = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const res = await fetch("/api/auctions");
    if (!res.ok) throw new Error("Kunde inte hämta auktioner");
    auctions.value = await res.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

function onImageError(e) {
  e.target.src =
    "https://via.placeholder.com/160x100?text=Ingen+bild";
}
</script>

<style>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  font-family: system-ui, sans-serif;
}

.status {
  padding: 20px;
  color: #666;
}

.status.error {
  color: red;
}

.list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.card {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  overflow: hidden;
  padding: 1em;
}

.image {
  width: 100%;
  max-height: 140px;
  object-fit: cover;
}

.info {
  flex: 1;
}

.info h2 {
  margin: 0 0 6px;
  font-size: 18px;
}

.meta {
  color: #666;
  font-size: 14px;
}

.price {
  font-weight: bold;
  margin: 8px 0;
}

.location {
  font-size: 14px;
  color: #444;
}

.link {
  display: inline-block;
  margin-top: 8px;
  color: #0070f3;
  text-decoration: none;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #555;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  border-top: 4px solid #0070f3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1200px) {
  .list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 800px) {
  .list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .list {
    grid-template-columns: 1fr;
  }
}
</style>
