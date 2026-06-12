import LandingHome from "@/components/LandingHome";

export const metadata = {
  title: "SM Data | VTU, Airtime, Data & Bills Payment",
  description:
    "Buy data, recharge airtime, and pay electricity and cable TV bills from one secure VTU platform.",
  keywords:
    "SM Data, VTU, data bundle, airtime recharge, electricity bill, cable TV, Nigeria",
  openGraph: {
    type: "website",
    title: "SM Data | VTU, Airtime, Data & Bills Payment",
    description:
      "A dependable VTU platform for data, airtime, and bill payments.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SM Data | VTU Services",
    description:
      "Buy data, airtime, pay bills, and manage daily digital services from one dashboard.",
  },
};

const Home = () => {
  return <LandingHome />;
};

export default Home;
