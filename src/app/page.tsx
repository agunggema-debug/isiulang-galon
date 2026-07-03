import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Products from "@/components/products";
import HowItWorks from "@/components/how-it-works";
import Footer from "@/components/footer";
import Chatbot from "@/components/chatbot";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Products />
        <HowItWorks />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}