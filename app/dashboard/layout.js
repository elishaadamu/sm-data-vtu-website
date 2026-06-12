export const metadata = {
  title: "Dashboard - VTU Services | Data, Airtime, Bills Payment",
  description:
    "Access all your VTU services in one place. Buy data, airtime, pay electricity bills, cable TV subscriptions, and verify BVN/NIN. Fast, secure, and reliable.",
  keywords:
    "VTU, data bundle, airtime, electricity bill, cable TV, DSTV, GOTV, Startimes, BVN verification, NIN slip, mobile recharge",
  openGraph: {
    type: "website",
    title: "Dashboard - VTU Services | Data, Airtime, Bills Payment",
    description:
      "Access all your VTU services in one place. Buy data, airtime, pay bills, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard - VTU Services",
    description:
      "Access all your VTU services in one place. Buy data, airtime, pay bills, and more.",
  },
};

import DashboardLayout from "./layout-client";

export default function Layout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
