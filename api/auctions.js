export default async function handler(req, res) {
  try {
    // 1️⃣ Hämta huvud-sidan
    const htmlRes = await fetch("https://carstore.eu/auction/se");
    const htmlText = await htmlRes.text();

    // 2️⃣ Extrahera dynamisk sträng (Build ID)
    // Exempelrad: <script src="/auction/se/_next/static/vZUZauoDYP0-wtHk5k0KR/_buildManifest.js">
    const match = htmlText.match(/_next\/static\/([a-zA-Z0-9-_]+)\/_buildManifest\.js/);

    if (!match) throw new Error("Kan inte hitta Next.js Build ID");

    const buildId = match[1];
    console.log("Dynamisk buildId:", buildId);

    // 3️⃣ Hämta alla auktioner
    const auctionsUrl = "https://carstore.eu/auction/se/api/auctions";
    const auctionsRes = await fetch(auctionsUrl);
    const auctionsList = await auctionsRes.json();

    const results = [];

    const detailTemplate = `https://carstore.eu/auction/se/_next/data/${buildId}/sv-SE/%d.json?path=%d`;

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
        image: basePath.car.car_primary_image?.thumbnail_url ?? null
      });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
