<template>
  <div class="container">
    <h1>Auktioner</h1>

    <div v-if="loading" class="loader-container">
      <div class="spinner"></div>
      <p>Laddar auktioner…</p>
    </div>
    <div v-else-if="error" class="status error">{{ error }}</div>

    <div v-else>
      <!-- Loop över län -->
      <div v-for="(group, county) in auctionsByCounty" :key="county" class="county-group">
        <h2 class="county-title">
          {{ county }} ({{ group.length }})
        </h2>
        <div class="list">
          <div v-for="a in group" :key="a.id" class="card">
            <img
              :src="a.image"
              alt="Bilbild"
              class="image"
              @error="onImageError"
            />

            <div class="info">
              <h2>{{ a.brand }} {{ a.model }}</h2>
              <p class="meta">{{ a.year }} • {{ a.mileage }} • {{ a.gearbox }}</p>
              <p class="price">{{ formatPrice(a.reservePrice) }}</p>
              <p class="location">{{ a.location }}, {{ a.city }} ({{ a.county }})</p>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

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

function formatPrice(price) {
  if (!price || isNaN(price)) return "N/A";
  const number = Number(price);
  return new Intl.NumberFormat("sv-SE").format(number) + " kr";
}

function onImageError(e) {
  e.target.src = "https://via.placeholder.com/160x100?text=Ingen+bild";
}

// ✅ Gruppera auktioner per län
const auctionsByCounty = computed(() => {
  const groups = {};
  auctions.value.forEach(a => {
    const county = a.county || "Okänt län";
    if (!groups[county]) groups[county] = [];
    groups[county].push(a);
  });

  // Sortera grupper enligt preferred order
  const preferredOrder = [
          "Skåne län",
          "Hallands län",
          "Blekinge län",
          "Kronobergs län",
          "Västra Götalands län",
          "Kalmar län",
          "Jönköpings län",
          "Östergötlands län",
          "Södermanlands län",
          "Uppsala län",
          "Stockholms län",
          "Västmanlands län",
          "Örebro län",
          "Värmlands län",
          "Gävleborgs län",
          "Västernorrlands län",
          "Jämtlands län",
          "Västerbottens län",
          "Norrbottens län",
          "Okänt län"
        ];

  const orderedGroups = {};

  preferredOrder.forEach(c => {
    if (groups[c]) orderedGroups[c] = groups[c];
  });

  // Lägg till övriga län sist
  Object.keys(groups).forEach(c => {
    if (!orderedGroups[c]) orderedGroups[c] = groups[c];
  });

  return orderedGroups;
});
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

/* --- Cards --- */
.card {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  overflow: hidden;
  padding: 1em;
}

.info {
  flex: 1; /* tar all återstående höjd */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* pushar länken längst ner */
}


.image {
  width: 100%;
  max-height: 140px;
  object-fit: cover;
}

.info h2 {
  margin: 0 0 6px;
  font-size: 18px;
  color: gray;
}

.meta {
  color: #666;
  font-size: 14px;
}

.price {
  font-weight: bold;
  margin: 8px 0;
  color: black;
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

/* --- Loader / Spinner --- */
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
  margin-bottom: 12px;
  animation: spin 0.8s linear infinite; /* ✅ applicerad animation */
}

/* Keyframes för rotation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* --- County grouping --- */
.county-title {
  font-size: 24px;
  margin-top: 40px;
  margin-bottom: 16px;
  border-bottom: 2px solid #0070f3;
  padding-bottom: 4px;
}

.county-group .list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* --- Responsiv grid --- */
@media (max-width: 1200px) {
  .county-group .list {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 800px) {
  .county-group .list {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 500px) {
  .county-group .list {
    grid-template-columns: 1fr;
  }
}

</style>
