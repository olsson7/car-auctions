<template>
  <div>
    <h1>Aktiva auktioner</h1>

    <table border="1">
      <thead>
        <tr>
          <th>Regnummer</th>
          <th>Modell</th>
          <th>Årsmodell</th>
          <th>Mil</th>
          <th>Växellåda</th>
          <th>Pris</th>
          <th>Plats</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="a in auctions" :key="a.id">
          <td>{{ a.regNumber }}</td>
          <td>{{ a.brand }} {{ a.model }}</td>
          <td>{{ a.year }}</td>
          <td>{{ a.mileage }}</td>
          <td>{{ a.gearbox }}</td>
          <td>{{ a.reservePrice }}</td>
          <td>{{ a.location }}, {{ a.city }}</td>
          <td>
            <a
              :href="`https://carstore.eu/auction/se/${a.id}`"
              target="_blank"
            >
              Visa
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const auctions = ref([]);

onMounted(async () => {
  const res = await fetch("/api/auctions");
  auctions.value = await res.json();
});
</script>
