// Enkel minnes-cache för län (för att slippa göra samma request flera gånger)
const countyCache = {};

async function getCounty(city) {
  if (!city) return "Okänt län";
  if (countyCache[city]) return countyCache[city];

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      city
    )},Sweden&format=json&addressdetails=1&limit=1`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Vue-CarAuction-App/1.0" }
    });

    const data = await res.json();
    const county = data[0]?.address?.state || "Okänt län";

    countyCache[city] = county;
    return county;
  } catch (err) {
    console.error("Error fetching county for", city, err);
    return "Okänt län";
  }
}

export default async function handler(req, res) {
  try {
    // 1️⃣ Hämta dynamiskt buildId från HTML
    const htmlRes = await fetch("https://carstore.eu/auction/se");
    const htmlText = await htmlRes.text();
    const match = htmlText.match(/_next\/static\/([a-zA-Z0-9-_]+)\/_buildManifest\.js/);
    if (!match) throw new Error("Kan inte hitta Next.js Build ID");
    const buildId = match[1];

    // 2️⃣ Hämta alla auktioner
    const auctionsUrl = "https://carstore.eu/auction/se/api/auctions";
    const auctionsRes = await fetch(auctionsUrl);
    const auctionsList = await auctionsRes.json();

    const detailTemplate = `https://carstore.eu/auction/se/_next/data/${buildId}/sv-SE/%d.json?path=%d`;

    const results = [];

    // 3️⃣ Hämta detaljer och län
    for (const auction of auctionsList) {
      const id = auction.id;
      const detailUrl = detailTemplate.replace(/%d/g, id);

      const detailRes = await fetch(detailUrl);
      const json = await detailRes.json();

      const basePath =
        json?.pageProps?.componentProps?.[
          "d85208dc-ef72-44b1-9152-d24372ae1dab"
        ];

      if (!basePath?.car) continue;

      const county = await getCounty(basePath.site?.site_city);

      results.push({
        id,
        regNumber: basePath.car.car_regno ?? "N/A",
        brand: basePath.car.car_brand ?? "N/A",
        model: basePath.car.car_model ?? "N/A",
        year: basePath.car.car_year ?? "N/A",
        mileage: basePath.car.car_mileage_text ?? "N/A",
        gearbox: basePath.car.car_gearbox ?? "N/A",
        reservePrice: basePath.auction?.acceptPrice ?? "N/A",
        location: basePath.site?.site_official_name ?? "N/A",
        city: basePath.site?.site_city ?? "N/A",
        image: basePath.car.car_primary_image?.thumbnail_url ?? null,
        county
      });
    }

    // 4️⃣ Sortera: Skåne först, sen andra län i ordning
    const preferredOrder = ["Skåne", "Blekinge", "Halland", "Västra Götaland", "Östergötland", "Stockholm"];
    results.sort((a, b) => {
      const indexA = preferredOrder.indexOf(a.county);
      const indexB = preferredOrder.indexOf(b.county);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
