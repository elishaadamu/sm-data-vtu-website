import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/logo/sm-data.png";

const sections = [
  {
    title: "Information we collect",
    body: "When you create an SM DATA account or use our VTU services, we may collect your name, email address, phone number, National Identification Number (NIN) (to create and verify your virtual account), and information you choose to add to your profile. We also receive technical information such as your IP address, browser, device, and basic usage data.",
  },
  {
    title: "How we use your information",
    body: "We use this information to create and secure your account, process data, airtime and bill-payment orders, maintain your wallet and transaction history, provide support, prevent fraud, send important service notices, and improve SM DATA. We do not use your information for unrelated purposes without your consent.",
  },
  {
    title: "Sharing and disclosure",
    body: "We share only the information needed to complete a requested transaction with payment processors, network operators, bill providers, and other service partners. We may also disclose information where required by law or when necessary to protect our users, platform, or legal rights. We do not sell your personal information.",
  },
  {
    title: "Security and retention",
    body: "We use reasonable technical and organisational safeguards to protect your information. No online service can guarantee absolute security, so please keep your password and transaction PIN confidential. We retain information only for as long as needed to provide services, meet legal obligations, resolve disputes, and enforce our agreements.",
  },
  {
    title: "Your choices and rights",
    body: "You may review and update your profile from Personal Details, disable your account, or request permanent deletion from Account Controls in your dashboard. Some records may need to be retained for legal, fraud-prevention, accounting, or transaction-settlement purposes. You may also contact support with questions about your personal information.",
  },
  {
    title: "Cookies and service communications",
    body: "SM DATA may use essential browser storage and similar technologies to keep you signed in, remember preferences, and protect sessions. We may send transactional messages about your account and orders. You can opt out of non-essential communications where an unsubscribe option is provided.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src={Logo} alt="SM Data" className="h-10 w-10 rounded-xl object-contain" priority />
            <span className="text-xl font-extrabold tracking-tight text-slate-900">SM DATA</span>
          </Link>
          <Link href="/signin" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            Sign in
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-12 md:py-16">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">SM DATA</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">Last updated: August 28, 2026</p>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            This policy explains how SM DATA collects, uses, protects, and handles information when you use our data, airtime, and bill-payment services.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-5 border border-blue-100 bg-blue-50 p-6">
          <h2 className="text-lg font-bold text-slate-950">Contact us</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            For privacy questions or requests, message our support team on WhatsApp at{" "}
            <a
              className="font-semibold text-blue-700 hover:underline"
              href="https://wa.me/2347073775347"
              target="_blank"
              rel="noopener noreferrer"
            >
              +234 707 377 5347
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}