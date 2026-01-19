export default async function handler(req, res) {
  try {
    const auctionsUrl = "https://carstore.eu/auction/se/api/auctions";
    const detailTemplate =
      "https://carstore.eu/auction/se/_next/data/vZUZauoDYP0-wtHk5k0KR/sv-SE/%d.json?path=%d";

    const auctionsResponse = await fetch(auctionsUrl);
    const auctionsList = await auctionsResponse.json();

    const results = [];

    for (const auction of auctionsList) {
      const id = auction.id;
      const url = detailTemplate.replace(/%d/g, id);

      const detailRes = await fetch(url);
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
        city: basePath.site?.site_city ?? "N/A"
      });
    }

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
