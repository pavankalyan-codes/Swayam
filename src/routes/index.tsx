import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { BiodataMaker } from '../BiodataMaker'
import { Sparkles, FileText, Languages, ShieldCheck, ArrowRight, Heart, Check, Palette, Download, Star } from 'lucide-react'
import { useI18n } from '../i18n'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [showMaker, setShowMaker] = useState(false)
  const { t } = useI18n()

  if (showMaker) {
    return <BiodataMaker />
  }

  return (
    <div className="min-h-screen bg-[#f8f4ec] text-stone-950 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-12 pb-12 text-center lg:pt-20">
        <div className="animate-fade-in-up max-w-[680px] mx-auto">
          <h1 className="brand-heading text-5xl font-black tracking-tight text-stone-900 sm:text-7xl mb-6">
            {t('swayam')}
          </h1>
          <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-medium px-3 py-1 rounded-full mb-5">
            <Heart className="h-3 w-3 fill-current" />
            Trusted by 50,000+ families
          </div>
          <h2 className="text-3xl font-semibold text-stone-900 leading-[1.3] mb-3 sm:text-4xl">
            Your perfect marriage biodata,<br /><span className="text-[#9F1239]">ready in 3 minutes</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[460px] text-base leading-relaxed text-stone-600">
            Beautiful, professional biodata that represents you and your family — with full support for Hindi, Tamil, Telugu, and 8 more Indian languages.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => setShowMaker(true)}
              className="bg-[#9F1239] hover:bg-[#881337] text-white flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-medium transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-rose-200"
            >
              <FileText className="h-5 w-5" />
              Create my biodata free
            </button>
            <button
              onClick={() => setShowMaker(true)}
              className="bg-transparent text-stone-600 border border-stone-200 hover:bg-white/50 rounded-xl px-5 py-3 text-sm font-medium transition-all"
            >
              See sample templates ↗
            </button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-stone-500 font-medium">
              <Check className="h-4 w-4 text-rose-600" /> No account needed
            </span>
            <span className="flex items-center gap-1 text-xs text-stone-500 font-medium">
              <Check className="h-4 w-4 text-rose-600" /> Instant PDF/JPEG download
            </span>
            <span className="flex items-center gap-1 text-xs text-stone-500 font-medium">
              <Check className="h-4 w-4 text-rose-600" /> 100% free
            </span>
          </div>
        </div>
      </section>

      {/* Sample Preview Section */}
      <section className="px-4 max-w-4xl mx-auto">
        <div className="bg-stone-200/50 rounded-2xl p-5 sm:p-8">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-4 text-center">Sample biodata preview</p>
          <div className="mx-auto bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.02]">
            <img 
              src="/Sample-bio/sample-generated-bio.jpg" 
              alt="Sample Marriage Biodata" 
              className="w-full h-auto block"
            />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard 
            icon={<Palette className="h-6 w-6" />}
            title="12 beautiful templates"
            desc="Traditional, modern, and regional styles for every family."
          />
          <FeatureCard 
            icon={<Download className="h-6 w-6" />}
            title="Instant PDF + JPEG"
            desc="WhatsApp-ready size or print quality — your choice."
          />
          <FeatureCard 
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Private & Secure"
            desc="Your data is never stored or shared with third parties."
          />
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-xl mx-auto px-6 py-8">
        <h2 className="text-sm font-medium text-stone-500 mb-8 text-center">How it works</h2>
        <div className="space-y-6">
          <StepRow num={1} title="Fill your details" desc="Personal, family, career, and horoscope info — takes about 3 minutes." />
          <StepRow num={2} title="Pick a template & language" desc="Choose from 12 designs and 11+ Indian languages instantly." />
          <StepRow num={3} title="Download & share" desc="Get a polished PDF ready to share on WhatsApp or email in one click." />
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="max-w-xl mx-auto px-4 mt-8">
        <div className="bg-stone-200/50 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="flex -space-x-2 shrink-0">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-rose-50 flex items-center justify-center text-[10px] font-bold text-[#9F1239]">AN</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#E1F5EE] flex items-center justify-center text-[10px] font-bold text-[#0F6E56]">RS</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#FAECE7] flex items-center justify-center text-[10px] font-bold text-[#993C1D]">DM</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#FBEAF0] flex items-center justify-center text-[10px] font-bold text-[#993556]">PV</div>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-stone-900 leading-tight">50,000+ biodatas created this month</p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              <span className="text-[#BA7517] font-bold">★★★★★</span> 4.9 rating · "Exactly what we needed"
            </p>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-8">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Why choose Swayam for your Marriage Biodata?</h2>
        <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
          <p>
            In the journey of finding a life partner, the first impression matters. A well-crafted <strong>marriage biodata</strong> acts as your personal ambassador. Swayam is designed to help you create a polished and respectful biodata that highlights your personality, education, and family background effectively.
          </p>
          <p>
            Unlike other tools, Swayam offers true <strong>Unicode support for Indian languages</strong>. Whether you need a biodata in Telugu, Hindi, or Tamil, our A4-optimized templates ensure your printouts look professional and clean.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 text-center">
        <button
          onClick={() => setShowMaker(true)}
          className="bg-[#9F1239] hover:bg-[#881337] text-white inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-medium transition-all hover:scale-[1.05] active:scale-95 shadow-xl shadow-rose-100"
        >
          <Sparkles className="h-5 w-5" />
          Get started — it's free
        </button>
        <p className="mt-4 text-xs text-stone-400">No sign-up · No watermarks · Instant download</p>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-stone-200 py-8 text-center text-xs text-stone-500">
        <p>© 2024 Swayam Marriage Biodata Maker. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white border border-stone-100 rounded-2xl p-6 transition-all hover:shadow-md">
      <div className="mb-4 text-[#9F1239]">{icon}</div>
      <h3 className="text-[13px] font-semibold text-stone-900 mb-1">{title}</h3>
      <p className="text-[12px] text-stone-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function StepRow({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-6 h-6 rounded-full bg-[#9F1239] text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-rose-100">
        {num}
      </div>
      <div>
        <h4 className="text-[13px] font-semibold text-stone-900">{title}</h4>
        <p className="text-[12px] text-stone-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}