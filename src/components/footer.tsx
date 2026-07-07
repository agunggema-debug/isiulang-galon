"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Globe, MessageCircle, Camera } from "lucide-react";

export default function Footer() {
  const [storeName, setStoreName] = useState("AquaGas Premium");
  const [storePhone, setStorePhone] = useState("+62 812-3456-7890");
  const [storeAddress, setStoreAddress] = useState("Jl. Contoh No. 123, Jakarta");
  const [storeEmail, setStoreEmail] = useState("info@aquagaspremium.com");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          if (data.settings.store_name) setStoreName(data.settings.store_name);
          if (data.settings.store_phone) setStorePhone(data.settings.store_phone);
          if (data.settings.store_address) setStoreAddress(data.settings.store_address);
          if (data.settings.store_email) setStoreEmail(data.settings.store_email);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer id="kontak" className="bg-[#0F4C81] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-auto brightness-0 invert"
              />
              <span className="text-lg font-bold">
                {storeName}
              </span>
            </Link>
            <p className="text-sm text-blue-200 leading-relaxed">
              Solusi terpercaya untuk kebutuhan air galon murni dan gas elpiji 
              berkualitas tinggi. Antar cepat, harga terbaik.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Camera className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Menu Cepat</h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Beranda" },
                { href: "#produk", label: "Produk" },
                { href: "#tentang", label: "Tentang Kami" },
                { href: "#kontak", label: "Kontak" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-white mb-4">Produk</h3>
            <ul className="space-y-3">
              {[
                "Air Galon 19L",
                "Gas Elpiji 3kg",
                "Gas Elpiji 5.5kg",
                "Air Mineral Kemasan",
              ].map((product) => (
                <li key={product}>
                  <Link
                    href="#produk"
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {product}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Kontak</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-blue-200">
                  {storeAddress}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#10B981] flex-shrink-0" />
                <a href={`tel:${storePhone.replace(/\s/g, "")}`} className="text-sm text-blue-200 hover:text-white transition-colors">
                  {storePhone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#10B981] flex-shrink-0" />
                <a href={`mailto:${storeEmail}`} className="text-sm text-blue-200 hover:text-white transition-colors">
                  {storeEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-blue-200">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
