import { Smartphone, ClipboardCheck, Truck, CreditCard } from "lucide-react";

const steps = [
  {
    icon: Smartphone,
    title: "Pesan via Aplikasi",
    description: "Pilih produk yang Anda butuhkan melalui website kami dengan mudah dan cepat.",
    color: "#0F4C81",
  },
  {
    icon: ClipboardCheck,
    title: "Konfirmasi Pesanan",
    description: "Tim kami akan memproses dan mengkonfirmasi pesanan Anda dalam hitungan menit.",
    color: "#10B981",
  },
  {
    icon: Truck,
    title: "Proses Pengiriman",
    description: "Kurir kami akan mengantar pesanan langsung ke alamat Anda dengan aman.",
    color: "#0F4C81",
  },
  {
    icon: CreditCard,
    title: "Pembayaran Mudah",
    description: "Bayar dengan metode COD atau transfer bank sesuai kenyamanan Anda.",
    color: "#10B981",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#10B981]/5 rounded-full text-sm font-medium text-[#10B981] mb-6">
            <ClipboardCheck className="h-4 w-4" />
            Cara Pemesanan
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Mudah & Cepat
          </h2>
          <p className="text-lg text-gray-600">
            Hanya 4 langkah mudah untuk mendapatkan kebutuhan air dan gas premium Anda.
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative group">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                  style={{ backgroundColor: step.color }}
                >
                  {index + 1}
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl p-6 pt-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${step.color}10` }}
                  >
                    <Icon className="h-7 w-7" style={{ color: step.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector Line (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-6 h-0.5 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}