import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Calculators from "@/components/Calculators";

export default function Home() {
  return (
    <>
      <Navbar />
      <Calculators />
      <Footer />
    </>
  );
}
