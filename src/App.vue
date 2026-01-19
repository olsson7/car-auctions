<template>
  <div class="container">
    <h1>Aktiva auktioner</h1>

    <div v-if="loading" class="loader-container">
      <div class="spinner"></div>
      <p>Laddar auktioner…</p>
    </div>
    <div v-else-if="error" class="status error">{{ error }}</div>

    <div v-else>
      <!-- Loop över län -->
      <div v-for="(group, county) in auctionsByCounty" :key="county" class="county-group">
        <h2 class="county-title">{{ county }}</h2>
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
  const preferredOrder = ["Skåne län", "Blekinge län", "Halland län", "Västra Götalands län", "Östergötland län", "Stockholm län"];
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
/* Behåll all befintlig CSS från din fil */

/* Lägg till styling för länsrubriker */
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

/* Anpassa grid för responsiv design */
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
