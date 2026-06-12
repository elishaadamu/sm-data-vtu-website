"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Logo from "@/assets/logo/sm-data.png";
import HappyWoman from "@/assets/happy-woman.png";
import MtnLogo from "@/assets/mtn-logo.jpg";
import NineMobileLogo from "@/assets/9mobile.png";
import GloLogo from "@/assets/glo.webp";
import AirtelLogo from "@/assets/airtel.png";
import {
  BadgeCheck,
  Bolt,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Headphones,
  Landmark,
  Menu,
  PhoneCall,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tv,
  Wifi,
  X,
  Zap,
  Star,
  Users,
  ArrowRight,
  CheckCircle2,
  Globe,
} from "lucide-react";

/* ─── Data ────────────────────────────────────────────── */

const networks = [
  { name: "MTN", logo: MtnLogo, color: "#FFCC00" },
  { name: "Airtel", logo: AirtelLogo, color: "#FF0000" },
  { name: "Glo", logo: GloLogo, color: "#50B748" },
  { name: "9mobile", logo: NineMobileLogo, color: "#006B53" },
];

const services = [
  {
    title: "Data Bundles",
    description:
      "Affordable plans across MTN, Airtel, Glo, and 9mobile. Get the best rates for all your data needs.",
    icon: Wifi,
    href: "/signin",
    color: "from-emerald-500 to-teal-600",
    bgGlow: "group-hover:shadow-emerald-500/20",
  },
  {
    title: "Airtime Top-up",
    description:
      "Recharge any Nigerian network instantly. Fast, secure, and always available.",
    icon: Smartphone,
    href: "/signin",
    color: "from-blue-500 to-indigo-600",
    bgGlow: "group-hover:shadow-blue-500/20",
  },
  {
    title: "Cable TV",
    description:
      "Renew DSTV, GOtv, and StarTimes subscriptions without leaving your home.",
    icon: Tv,
    href: "/signin",
    color: "from-purple-500 to-violet-600",
    bgGlow: "group-hover:shadow-purple-500/20",
  },
  {
    title: "Electricity Bills",
    description:
      "Pay prepaid and postpaid power bills securely from anywhere in Nigeria.",
    icon: Bolt,
    href: "/signin",
    color: "from-amber-500 to-orange-600",
    bgGlow: "group-hover:shadow-amber-500/20",
  },
  {
    title: "BVN & NIN Slips",
    description:
      "Access identity verification services from one convenient dashboard.",
    icon: ReceiptText,
    href: "/signin",
    color: "from-rose-500 to-pink-600",
    bgGlow: "group-hover:shadow-rose-500/20",
  },
  {
    title: "Airtime to Cash",
    description:
      "Convert excess airtime to wallet value with ease. Best conversion rates.",
    icon: CreditCard,
    href: "/signin",
    color: "from-cyan-500 to-sky-600",
    bgGlow: "group-hover:shadow-cyan-500/20",
  },
];

const stats = [
  { value: "100k+", label: "Happy Users", icon: Users },
  { value: "99.9%", label: "Uptime", icon: Zap },
  { value: "24/7", label: "Support", icon: Headphones },
  { value: "4+", label: "Networks", icon: Globe },
];

const highlights = [
  {
    title: "Instant Wallet Funding",
    description:
      "Fund once, buy repeatedly, and keep every payment traceable from your account. Multiple funding options available.",
    icon: Landmark,
  },
  {
    title: "Bank-Grade Security",
    description:
      "Protected sign-in, encrypted user storage, and payment-first transaction handling with 256-bit SSL encryption.",
    icon: ShieldCheck,
  },
  {
    title: "Dedicated Support Team",
    description:
      "Clear service paths for everyday users, agents, and business developers. Get help when you need it most.",
    icon: Headphones,
  },
];

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      "Click 'Get Started' or 'Sign Up' at the top right. Provide your email, phone number, and password. You'll receive a verification code via SMS to confirm your account.",
  },
  {
    question: "Is it safe to buy data and airtime with SM Data?",
    answer:
      "Yes! We use encrypted transactions and secure payment processing. Your wallet and personal data are protected with industry-standard security protocols.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Most services are instant! Data bundles, airtime, and bill payments are delivered within seconds to your network provider or service.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major debit and credit cards, bank transfers, and USSD. Fund your wallet using any method that works best for you.",
  },
  {
    question: "Can I use SM Data as an agent or reseller?",
    answer:
      "Absolutely! We have dedicated agent and business plans. Sign in with your agent credentials or contact support to set up your business account.",
  },
  {
    question: "What if my transaction fails?",
    answer:
      "If a transaction fails, funds are returned to your wallet automatically within 24 hours. Contact support if you need immediate assistance.",
  },
];

const testimonials = [
  {
    name: "Adebayo O.",
    role: "Business Owner",
    text: "SM Data has transformed how I manage my telecom business. The agent panel is incredibly efficient!",
    rating: 5,
  },
  {
    name: "Chioma N.",
    role: "Student",
    text: "I save so much on data bundles using SM Data. The prices are unbeatable and delivery is always instant.",
    rating: 5,
  },
  {
    name: "Ibrahim M.",
    role: "Freelancer",
    text: "From electricity bills to cable TV, SM Data handles everything I need. One platform for all my payments!",
    rating: 5,
  },
];

/* ─── Hooks ───────────────────────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}

/* ─── Sub-Components ──────────────────────────────────── */

const FAQItem = ({ faq, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`group rounded-2xl border transition-all duration-300 ${
        open
          ? "border-emerald-200 bg-emerald-50/50 shadow-lg shadow-emerald-500/5"
          : "border-slate-200/80 bg-white hover:border-slate-300"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="pr-4 text-base font-semibold text-slate-900">
          {faq.question}
        </span>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            open
              ? "rotate-180 bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-60 pb-5" : "max-h-0"
        }`}
      >
        <p className="px-6 text-sm leading-relaxed text-slate-600">
          {faq.answer}
        </p>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────── */

const LandingHome = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [heroRef, heroVisible] = useInView(0.1);
  const [servicesRef, servicesVisible] = useInView();
  const [whyRef, whyVisible] = useInView();
  const [testimonialsRef, testimonialsVisible] = useInView();
  const [faqRef, faqVisible] = useInView();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#fafbfc] text-slate-900">
      {/* ═══ HEADER ═══ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <Image
              src={Logo}
              alt="SM Data"
              className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl object-contain"
              priority
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-950">
                SM Data
              </span>
              <span className="text-[8px] sm:text-[10px] font-medium uppercase tracking-widest text-emerald-600">
                VTU Platform
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a
              href="#services"
              className="transition-colors hover:text-emerald-600"
            >
              Services
            </a>
            <a
              href="#why-us"
              className="transition-colors hover:text-emerald-600"
            >
              Why SM Data
            </a>
            <a
              href="#testimonials"
              className="transition-colors hover:text-emerald-600"
            >
              Reviews
            </a>
            <a
              href="#faq"
              className="transition-colors hover:text-emerald-600"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 sm:gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200/60 bg-white/95 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-1 px-4 py-3">
              {["Services", "Why SM Data", "Reviews", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ═══ HERO ═══ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden hero-gradient"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute top-1/2 -left-20 h-60 w-60 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-emerald-300/10 blur-2xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-24 lg:pt-16">
          {/* Left column – text */}
          <div
            className={`flex flex-col justify-center ${
              heroVisible ? "animate-slide-in-left" : "opacity-0"
            }`}
          >
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-4 py-1.5 text-sm font-medium text-emerald-800 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Nigeria's trusted VTU platform
            </div>

            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem]">
              Buy Data, Airtime &{" "}
              <span className="gradient-text">Pay Bills</span> Instantly
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
              SM Data gives individuals, agents, and growing teams a simple
              place to recharge phones, manage subscriptions, and settle
              utilities — all from one powerful platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 hover:-translate-y-0.5"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Sign In to Dashboard
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-12 grid max-w-lg grid-cols-4 gap-4">
              {stats.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xl font-bold text-slate-950">
                      {item.value}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column – Hero image with logos */}
          <div
            className={`relative flex items-center justify-center ${
              heroVisible ? "animate-slide-in-right" : "opacity-0"
            }`}
          >
            {/* Main image container */}
            <div className="relative w-full max-w-lg">
              {/* Background glow */}
              <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-br from-emerald-400/20 via-transparent to-amber-400/10 blur-2xl" />

              {/* Main image */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-slate-900/15 animate-pulse-glow">
                <Image
                  src={HappyWoman}
                  alt="Happy woman using SM Data for VTU services"
                  className="h-full w-full object-cover"
                  priority
                />
                {/* Gradient overlay on bottom */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/60 to-transparent" />

                {/* Bottom text overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    Trusted by 100K+ users
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    Fast. Reliable. Affordable.
                  </p>
                </div>
              </div>

              {/* Floating network logos */}
              {/* MTN - top left */}
              <div className="absolute -top-4 -left-4 z-10 animate-float">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1.5 shadow-xl shadow-yellow-500/20 ring-2 ring-white/80 sm:h-20 sm:w-20 sm:p-2">
                  <Image
                    src={MtnLogo}
                    alt="MTN"
                    className="h-full w-full rounded-xl object-cover"
                  />
                </div>
              </div>

              {/* Airtel - top right */}
              <div
                className="absolute -top-3 -right-3 z-10 animate-float-delayed"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2.5 shadow-xl shadow-red-500/20 ring-2 ring-white/80 sm:h-20 sm:w-20 sm:p-3">
                  <Image
                    src={AirtelLogo}
                    alt="Airtel"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Glo - bottom left */}
              <div
                className="absolute -bottom-3 -left-3 z-10 animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-xl shadow-green-500/20 ring-2 ring-white/80 sm:h-20 sm:w-20 sm:p-2.5">
                  <Image
                    src={GloLogo}
                    alt="Glo"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* 9mobile - bottom right */}
              <div
                className="absolute -bottom-4 -right-4 z-10 animate-float-delayed"
                style={{ animationDelay: "1.5s" }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-xl shadow-teal-500/20 ring-2 ring-white/80 sm:h-20 sm:w-20 sm:p-2.5">
                  <Image
                    src={NineMobileLogo}
                    alt="9mobile"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Floating badge card */}
              <div
                className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 animate-float hidden sm:block"
                style={{ animationDelay: "2s" }}
              >
                <div className="rounded-2xl bg-white/95 backdrop-blur-md px-4 py-3 shadow-xl ring-1 ring-slate-200/50">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-950">
                        Instant Delivery
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Data sent in &lt;3s
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ NETWORK LOGOS STRIP ═══ */}
      <section className="border-y border-slate-200/60 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            All major networks supported
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
            {networks.map((network) => (
              <div
                key={network.name}
                className="group flex flex-col items-center gap-2 transition-transform hover:scale-110"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 p-2 shadow-sm ring-1 ring-slate-200/60 transition group-hover:shadow-md group-hover:ring-slate-300 sm:h-20 sm:w-20 sm:p-3">
                  <Image
                    src={network.logo}
                    alt={network.name}
                    className="h-full w-full object-contain rounded-lg"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                  {network.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section id="services" className="bg-[#fafbfc] py-20 sm:py-24" ref={servicesRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`flex flex-col justify-between gap-4 md:flex-row md:items-end ${
              servicesVisible ? "animate-slide-up" : "opacity-0"
            }`}
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <Zap className="h-3 w-3" />
                Core Services
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Everything you need,{" "}
                <span className="gradient-text">in one place</span>
              </h2>
              <p className="mt-3 max-w-2xl text-base text-slate-500">
                From data bundles to bill payments, we've got every digital
                service your daily life requires.
              </p>
            </div>
            <Link
              href="/signin"
              className="group inline-flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <Link
                  href={service.href}
                  key={service.title}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${service.bgGlow} ${
                    servicesVisible
                      ? "animate-scale-in"
                      : "opacity-0"
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Gradient orb */}
                  <div
                    className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${service.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
                  />

                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-lg`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {service.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    Get started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ WHY SM DATA ═══ */}
      <section id="why-us" className="bg-white py-20 sm:py-24" ref={whyRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`grid gap-12 lg:grid-cols-2 ${
              whyVisible ? "animate-slide-up" : "opacity-0"
            }`}
          >
            {/* Left – content */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <Star className="h-3 w-3" />
                Why choose us
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                A smarter way to manage{" "}
                <span className="gradient-text">digital payments</span>
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500">
                The interface keeps essential VTU actions close, so customers can
                move from wallet funding to service purchase without switching
                tools or losing transaction records.
              </p>

              <div className="mt-10 space-y-5">
                {highlights.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="group flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-950">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right – Wallet mock card */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Glow */}
                <div className="absolute inset-0 -m-6 rounded-3xl bg-gradient-to-br from-emerald-400/15 to-teal-400/10 blur-2xl" />

                <div className="relative rounded-3xl bg-gradient-to-br from-[#0f2820] to-[#1a3d32] p-1 shadow-2xl">
                  <div className="rounded-[22px] bg-gradient-to-br from-[#132e24] to-[#0d2119] p-7">
                    {/* Top bar */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-5">
                      <div className="flex items-center gap-3">
                        <Image
                          src={Logo}
                          alt="SM Data"
                          className="h-11 w-11 rounded-xl bg-white/90 object-contain p-1"
                        />
                        <div>
                          <p className="text-sm font-semibold text-emerald-100">
                            SM Data Wallet
                          </p>
                          <p className="text-xs text-white/40">
                            Ready for purchase
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-300">
                          LIVE
                        </span>
                      </div>
                    </div>

                    {/* Balance card */}
                    <div className="mt-5 rounded-2xl bg-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Wallet Balance
                      </p>
                      <p className="mt-2 text-3xl font-extrabold text-slate-950">
                        ₦25,000
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link
                          href="/signin"
                          className="group rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-center text-xs font-bold text-white transition-all hover:shadow-lg hover:shadow-emerald-600/25"
                        >
                          Buy Data
                        </Link>
                        <Link
                          href="/signin"
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-xs font-bold text-slate-800 transition hover:bg-slate-50"
                        >
                          Pay Bill
                        </Link>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {[
                        { label: "MTN 2GB", value: "₦500", color: "bg-yellow-400/10 text-yellow-300" },
                        { label: "Airtel 1GB", value: "₦300", color: "bg-red-400/10 text-red-300" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10 transition hover:bg-white/10"
                        >
                          <p className={`text-[10px] font-semibold uppercase tracking-wider ${item.color}`}>
                            {item.label}
                          </p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Recent transaction */}
                    <div className="mt-4 rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/20">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">
                              Glo 3GB
                            </p>
                            <p className="text-[10px] text-white/40">
                              Just now
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">
                          Success
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section
        id="testimonials"
        className="bg-[#fafbfc] py-20 sm:py-24"
        ref={testimonialsRef}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center ${
              testimonialsVisible ? "animate-slide-up" : "opacity-0"
            }`}
          >
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <Star className="h-3 w-3" />
              Customer Stories
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Loved by{" "}
              <span className="gradient-text">thousands of Nigerians</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">
              From students managing their data to business owners paying
              utilities daily, SM Data simplifies digital payments for everyone.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`group rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200 ${
                  testimonialsVisible ? "animate-scale-in" : "opacity-0"
                }`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  "{t.text}"
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-950">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-14 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
            <div className="flex -space-x-3">
              {["E", "A", "M", "C", "O"].map((initial, i) => (
                <div
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white shadow-md"
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-950">500,000+</span> happy
              users and counting
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="bg-white py-20 sm:py-24" ref={faqRef}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center ${
              faqVisible ? "animate-slide-up" : "opacity-0"
            }`}
          >
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <BadgeCheck className="h-3 w-3" />
              FAQ
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Got questions?{" "}
              <span className="gradient-text">We've got answers</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
              Everything you need to know about SM Data and our VTU services.
            </p>
          </div>

          <div
            className={`mt-12 space-y-3 ${
              faqVisible ? "animate-fade-in delay-300" : "opacity-0"
            }`}
          >
            {faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 text-center">
            <p className="font-semibold text-emerald-900">
              Still have questions?{" "}
              <a
                href="tel:+2348140950947"
                className="inline-flex items-center gap-1 font-bold underline decoration-emerald-400 decoration-2 underline-offset-4 hover:decoration-emerald-600"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                Call our support team
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1f18] via-[#0f2d22] to-[#0a1f18] py-20 text-white sm:py-24">
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <Sparkles className="h-3 w-3" />
              Ready to start?
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Start saving on data, airtime &{" "}
              <span className="text-emerald-400">bill payments</span> today.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
              Join thousands of Nigerians who trust SM Data for all their VTU
              needs. Agents and business teams can use their dedicated sign-in
              paths as the platform grows.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-7 py-3.5 text-sm font-bold text-emerald-950 shadow-xl shadow-emerald-500/20 transition-all hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              Create Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:+2348140950947"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              <PhoneCall className="h-4 w-4" />
              Call Support
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <Image
                  src={Logo}
                  alt="SM Data"
                  className="h-11 w-11 rounded-xl object-contain"
                />
                <div>
                  <span className="text-lg font-bold text-slate-950">
                    SM Data
                  </span>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-600">
                    VTU Platform
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                Your trusted partner for data bundles, airtime, bill payments,
                and identity verification services across all major Nigerian
                networks.
              </p>

              {/* Network logos in footer */}
              <div className="mt-5 flex items-center gap-3">
                {networks.map((n) => (
                  <div
                    key={n.name}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 p-1 ring-1 ring-slate-200/60"
                  >
                    <Image
                      src={n.logo}
                      alt={n.name}
                      className="h-full w-full rounded object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-sm font-bold text-slate-950">Quick Links</h4>
              <nav className="mt-4 flex flex-col gap-2.5">
                {[
                  { label: "Buy Data", href: "/signin" },
                  { label: "Buy Airtime", href: "/signin" },
                  { label: "Pay Bills", href: "/signin" },
                  { label: "BVN / NIN", href: "/signin" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-slate-500 transition hover:text-emerald-600"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-sm font-bold text-slate-950">Account</h4>
              <nav className="mt-4 flex flex-col gap-2.5">
                {[
                  { label: "Sign In", href: "/signin" },
                  { label: "Create Account", href: "/signup" },
                  { label: "Agent Login", href: "/signin" },
                  { label: "Support", href: "tel:+2348140950947" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-slate-500 transition hover:text-emerald-600"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} SM Data. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Secured with 256-bit SSL encryption
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingHome;
