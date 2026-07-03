export const quickReplies = [
  "Apa saja produk yang tersedia?",
  "Berapa harga air galon?",
  "Berapa harga gas elpiji?",
  "Bagaimana cara order?",
  "Apakah ada layanan antar?",
  "Info kontak dan alamat",
];

export const botResponses: Record<string, string> = {
  "apa saja produk yang tersedia?":
    "Kami menyediakan dua produk utama:\n\n💧 **Air Galon Murni** - Air galon berkualitas tinggi, higienis, dan siap minum.\n🔥 **Gas Elpiji 3 kg** - Gas elpiji bersubsidi dengan harga terjangkau.\n\nKunjungi halaman Shop untuk melihat detail produk!",
  "berapa harga air galon?":
    "💧 **Harga Air Galon Murni**: Rp20.000 - Rp25.000 per galon (tergantung wilayah).\n\nKami juga menawarkan promo khusus untuk pemesanan dalam jumlah banyak!",
  "berapa harga gas elpiji?":
    "🔥 **Harga Gas Elpiji 3 kg**: Rp25.000 - Rp30.000 per tabung (tergantung wilayah).\n\nStok terbatas, segera pesan sebelum kehabisan!",
  "bagaimana cara order?":
    "📋 **Cara Pemesanan**:\n\n1. Buka halaman Shop\n2. Pilih produk yang diinginkan (Air Galon / Gas Elpiji)\n3. Tentukan jumlah\n4. Masukkan alamat pengiriman\n5. Konfirmasi pesanan\n6. Pembayaran bisa dilakukan di tempat (COD)\n\nMudah dan praktis!",
  "apakah ada layanan antar?":
    "✅ **Ya, kami menyediakan layanan antar!**\n\n• Pengiriman cepat & tepat waktu\n• Gratis ongkir untuk area tertentu\n• Pengiriman setiap hari Senin - Sabtu (08.00 - 17.00)\n•Driver kami akan mengantarkan langsung ke rumah Anda",
  "info kontak dan alamat":
    "📞 **Kontak Kami**:\n\n• WhatsApp: 0812-3456-7890\n• Telepon: (021) 1234-5678\n• Email: info@aquagas-premium.com\n\n📍 **Alamat**:\nJl. Merdeka No. 123, Kelurahan Sukamaju, Kecamatan Cimahi Utara, Kota Cimahi, Jawa Barat 40512\n\nJam Operasional: Senin - Sabtu, 08.00 - 17.00 WIB",
};

export function getBotResponse(input: string): string {
  const lowerInput = input.toLowerCase().trim();

  // Check exact matches first
  for (const [key, response] of Object.entries(botResponses)) {
    if (lowerInput.includes(key) || key.includes(lowerInput)) {
      return response;
    }
  }

  // Check keyword-based matches
  if (lowerInput.includes("halo") || lowerInput.includes("hai") || lowerInput.includes("hi") || lowerInput.includes("siang") || lowerInput.includes("pagi") || lowerInput.includes("malam")) {
    return "Halo! 👋 Selamat datang di **AquaGas Premium**.\n\nAda yang bisa saya bantu? Silakan pilih pertanyaan di bawah ini atau ketik pertanyaan Anda!";
  }

  if (lowerInput.includes("terima kasih") || lowerInput.includes("makasih") || lowerInput.includes("thanks")) {
    return "Sama-sama! 😊 Senang bisa membantu.\n\nJika ada pertanyaan lain, jangan ragu untuk menghubungi kami lagi ya!";
  }

  if (lowerInput.includes("selamat datang") || lowerInput.includes("kenalan")) {
    return "Halo! Saya **AquaBot** 🤖, asisten virtual AquaGas Premium.\n\nSaya siap membantu Anda mengenai:\n• Informasi produk\n• Harga & pemesanan\n• Layanan pengiriman\n• Kontak & alamat\n\nAda yang bisa saya bantu?";
  }

  if (lowerInput.includes("galon") || lowerInput.includes("air")) {
    return "💧 **Air Galon Murni AquaGas**:\n\n• Air galon berkualitas tinggi\n• Higienis & aman dikonsumsi\n• Harga: Rp20.000 - Rp25.000/galon\n• Tersedia layanan antar gratis untuk area tertentu\n\nAda yang ingin ditanyakan seputar air galon?";
  }

  if (lowerInput.includes("gas") || lowerInput.includes("elpiji") || lowerInput.includes("tabung")) {
    return "🔥 **Gas Elpiji 3 kg**:\n\n• Gas elpiji bersubsidi kualitas terbaik\n• Cocok untuk kebutuhan rumah tangga\n• Harga: Rp25.000 - Rp30.000/tabung\n• Pengiriman cepat & aman\n\nAda yang bisa saya bantu seputar gas elpiji?";
  }

  if (lowerInput.includes("pembayaran") || lowerInput.includes("bayar") || lowerInput.includes("cod")) {
    return "💳 **Metode Pembayaran**:\n\nSaat ini kami menerima pembayaran **Cash on Delivery (COD)** - bayar di tempat saat pesanan tiba.\n\nMudah dan aman!";
  }

  if (lowerInput.includes("ongkir") || lowerInput.includes("ongkos kirim") || lowerInput.includes("gratis")) {
    return "🚚 **Informasi Ongkos Kirim**:\n\n• Gratis ongkir untuk area Cimahi dan Bandung Barat\n• Untuk luar area dikenakan biaya sesuai jarak\n• Minimal pemesanan untuk gratis ongkir: 2 galon atau 2 tabung\n\nHubungi kami untuk info lebih detail!";
  }

  return "Maaf, saya belum bisa menjawab pertanyaan tersebut. 😅\n\nSilakan pilih salah satu topik di bawah ini atau hubungi kami langsung melalui:\n📞 WhatsApp: 0812-3456-7890\n\nAtau pilih pertanyaan yang tersedia:";
}