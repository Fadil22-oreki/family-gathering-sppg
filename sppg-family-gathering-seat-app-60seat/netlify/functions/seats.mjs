
import { getStore } from "@netlify/blobs";

const STORE = "sppg-family-gathering";
const KEY = "reservations";

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,x-admin-pin",
    "Cache-Control": "no-store"
  }
});

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,x-admin-pin"
      }
    });
  }

  const store = getStore(STORE);
  const records = await store.get(KEY, { type: "json" }) || [];

  const pin = req.headers.get("x-admin-pin");
  const isAdmin = Boolean(pin) && pin === Netlify.env.get("ADMIN_PIN");

  if (req.method === "GET") {
    if (new URL(req.url).searchParams.get("admin") === "1") {
      if (!isAdmin) return json({ error: "PIN admin salah." }, 401);
      return json({ reservations: records });
    }

    return json({
      reservations: records.map(r => ({
        seat: r.seat,
        name: r.name
      }))
    });
  }

  if (req.method === "POST") {
    let body;

    try {
      body = await req.json();
    } catch {
      return json({ error: "Data tidak valid." }, 400);
    }

    const name = String(body.name || "").trim().slice(0, 80);
    const seat = Number(body.seat);

    if (!name || !Number.isInteger(seat) || seat < 1 || seat > 60) {
      return json({ error: "Nama atau nomor kursi tidak valid." }, 400);
    }

    if (records.some(r => r.seat === seat)) {
      return json({
        error: "Kursi ini baru saja dipilih orang lain. Silakan pilih kursi lain."
      }, 409);
    }

    if (records.some(r => r.name.toLowerCase() === name.toLowerCase())) {
      return json({
        error: "Nama ini sudah memilih kursi. Hubungi admin jika ingin mengubah pilihan."
      }, 409);
    }

    const updated = [
      ...records,
      { name, seat, createdAt: new Date().toISOString() }
    ];

    await store.setJSON(KEY, updated);

    return json({ ok: true, seat });
  }

  if (req.method === "DELETE") {
    if (!isAdmin) {
      return json({ error: "PIN admin salah." }, 401);
    }

    let body = {};

    try {
      body = await req.json();
    } catch {
      // Tanpa body berarti hapus semua kursi.
    }

    // Jika nomor kursi dikirim, hapus satu peserta saja.
    if (body.seat !== undefined) {
      const seat = Number(body.seat);

      if (!Number.isInteger(seat) || seat < 1 || seat > 60) {
        return json({ error: "Nomor kursi tidak valid." }, 400);
      }

      const updated = records.filter(r => r.seat !== seat);

      if (updated.length === records.length) {
        return json({ error: "Data kursi tidak ditemukan." }, 404);
      }

      await store.setJSON(KEY, updated);

      return json({
        ok: true,
        message: "Pilihan kursi berhasil dihapus.",
        reservations: updated
      });
    }

    // Tanpa nomor kursi, tetap hapus seluruh data.
    await store.setJSON(KEY, []);

    return json({ ok: true, message: "Semua kursi berhasil dikosongkan." });
  }

  return json({ error: "Method tidak didukung." }, 405);
};
