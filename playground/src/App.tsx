import { motion } from 'motion/react';
import ShinyText from './components/ShinyText';
import GradientText from './components/GradientText';
import SpotlightCard from './components/SpotlightCard';
import LogoLoop from './components/LogoLoop';
import './App.css';

// ─── ICONS (inline SVGs) ──────────────────────────────────
const IconMic = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const IconGlobe = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);
const IconWaveform = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2"/></svg>
);
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconZap = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
);
const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
);
const IconPlay = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

// ─── WAVEFORM BARS ─────────────────────────────────────────
const WaveformBars = () => (
  <div className="flex items-center gap-[3px] h-8">
    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
      <motion.div
        key={i}
        className="w-[3px] rounded-full bg-violet-500"
        animate={{ height: [8, 28 + Math.random() * 10, 8] }}
        transition={{ duration: 0.8 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
      />
    ))}
  </div>
);

// ─── NAVBAR ────────────────────────────────────────────────
const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
          <IconWaveform />
        </div>
        <span className="text-xl font-bold tracking-tight">VOXAR</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#voices" className="hover:text-white transition-colors">Voices</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        <a href="#docs" className="hover:text-white transition-colors">API Docs</a>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-sm text-zinc-300 hover:text-white transition-colors px-4 py-2">
          Log in
        </button>
        <button className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg transition-colors font-medium">
          Get Started
        </button>
      </div>
    </div>
  </nav>
);

// ─── HERO ──────────────────────────────────────────────────
const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
    {/* Background gradient blobs */}
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[128px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-fuchsia-600/10 rounded-full blur-[128px]" />
    </div>

    {/* Grid overlay */}
    <div
      className="absolute inset-0 -z-10 opacity-[0.03]"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '64px 64px'
      }}
    />

    <div className="max-w-5xl mx-auto px-6 text-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GradientText
          colors={['#8b5cf6', '#d946ef', '#8b5cf6']}
          animationSpeed={4}
          showBorder
          className="text-sm mb-8"
        >
          India's Most Advanced AI Voice Platform
        </GradientText>
      </motion.div>

      {/* Main heading */}
      <motion.h1
        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <span className="text-white">Turn Text Into </span>
        <br />
        <ShinyText
          text="Human Voice"
          speed={3}
          color="#8b5cf6"
          shineColor="#d946ef"
          className="text-5xl md:text-7xl lg:text-8xl font-bold"
        />
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        Generate studio-quality voiceovers in <span className="text-white font-medium">12 Indian languages</span>.
        Clone any voice. Transcribe anything. Built for creators who demand perfection.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        className="flex items-center justify-center gap-4 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        <button className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all animate-pulse-glow flex items-center gap-2">
          Start Free <IconArrowRight />
        </button>
        <button className="glass text-white px-8 py-3.5 rounded-xl text-base font-medium transition-all hover:bg-white/10 flex items-center gap-2">
          <IconPlay /> Watch Demo
        </button>
      </motion.div>

      {/* Waveform visualizer */}
      <motion.div
        className="flex items-center justify-center gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <WaveformBars />
        <div className="text-sm text-zinc-500 font-mono">
          "Namaste, main VOXAR hoon..."
        </div>
        <WaveformBars />
      </motion.div>

      {/* Stats */}
      <motion.div
        className="flex items-center justify-center gap-8 md:gap-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {[
          { value: '12', label: 'Languages' },
          { value: '20+', label: 'Premium Voices' },
          { value: '0.5s', label: 'Generation Speed' },
          { value: '99%', label: 'Accuracy' },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ─── LOGO STRIP ────────────────────────────────────────────
const LogoStrip = () => {
  const logos = [
    'YouTube', 'Spotify', 'Audible', 'Instagram', 'Coursera', 'Notion', 'Netflix', 'Amazon'
  ].map(name => ({
    node: <span className="text-zinc-600 font-semibold text-base tracking-wider uppercase">{name}</span>
  }));

  return (
    <section className="py-12 border-t border-b border-white/5">
      <p className="text-center text-xs text-zinc-600 uppercase tracking-widest mb-6">
        Built for creators on
      </p>
      <LogoLoop logos={logos} speed={60} gap={64} logoHeight={20} fadeOut fadeOutColor="#0a0a0f" pauseOnHover />
    </section>
  );
};

// ─── FEATURES ──────────────────────────────────────────────
const features = [
  {
    icon: <IconWaveform />,
    title: 'Text-to-Speech',
    description: 'Generate natural, expressive voice in Hindi, English, and 10 more Indian languages. Studio quality, every time.',
    color: 'rgba(139, 92, 246, 0.3)',
  },
  {
    icon: <IconMic />,
    title: 'Voice Cloning',
    description: 'Clone any voice with just 30 seconds of audio. Your voice, your brand, at scale. ElevenLabs-grade quality analysis.',
    color: 'rgba(217, 70, 239, 0.3)',
  },
  {
    icon: <IconGlobe />,
    title: '12 Indian Languages',
    description: 'Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati, Punjabi, Odia, and English. True native pronunciation.',
    color: 'rgba(99, 102, 241, 0.3)',
  },
  {
    icon: <IconUsers />,
    title: 'Speaker Diarization',
    description: 'Automatically identify who said what. Perfect for interviews, podcasts, and multi-speaker content.',
    color: 'rgba(34, 211, 238, 0.3)',
  },
  {
    icon: <IconZap />,
    title: 'Hinglish Intelligence',
    description: 'Type in Romanized Hindi and we auto-convert to Devanagari. "Kya haal hai" just works. 5,000+ word dictionary.',
    color: 'rgba(250, 204, 21, 0.3)',
  },
  {
    icon: <IconShield />,
    title: 'Enterprise API',
    description: 'RESTful API with async job queue, GPU-powered processing, and 99.9% uptime. Scale to millions of requests.',
    color: 'rgba(74, 222, 128, 0.3)',
  },
];

const Features = () => (
  <section id="features" className="py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <GradientText
          colors={['#8b5cf6', '#d946ef', '#6366f1']}
          animationSpeed={6}
          className="text-sm font-semibold uppercase tracking-wider mb-4"
        >
          Features
        </GradientText>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Everything you need to create
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Six powerful engines working together. One unified platform. Zero compromises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <SpotlightCard
              className="h-full"
              spotlightColor={feature.color as any}
            >
              <div className="text-violet-400 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── HOW IT WORKS ──────────────────────────────────────────
const steps = [
  {
    step: '01',
    title: 'Type or Upload',
    description: 'Paste your script, type in Hinglish, or upload audio for transcription.',
  },
  {
    step: '02',
    title: 'Choose Your Voice',
    description: 'Pick from 20+ premium voices or clone your own. Select language and style.',
  },
  {
    step: '03',
    title: 'Generate & Download',
    description: 'Get studio-quality audio in seconds. Export as MP3, WAV, or SRT subtitles.',
  },
];

const HowItWorks = () => (
  <section className="py-24 px-6">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Three steps. That's it.
        </h2>
        <p className="text-zinc-400 text-lg">
          From text to production-ready audio in under 60 seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((item, i) => (
          <motion.div
            key={item.step}
            className="relative text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <div className="text-6xl font-black text-violet-500/10 mb-2">{item.step}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-zinc-400 text-sm">{item.description}</p>
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 text-zinc-700">
                <IconArrowRight />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── CTA ───────────────────────────────────────────────────
const CTA = () => (
  <section className="py-24 px-6">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        className="glass rounded-3xl p-12 md:p-16 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-violet-600/20 rounded-full blur-[100px]" />

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 relative z-10">
          Ready to build?
        </h2>
        <p className="text-zinc-400 text-lg mb-8 relative z-10 max-w-xl mx-auto">
          Start with 1,000 free characters. No credit card required. Upgrade when you're ready.
        </p>
        <div className="flex items-center justify-center gap-4 relative z-10">
          <button className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all animate-pulse-glow">
            Get Started Free
          </button>
          <button className="text-zinc-400 hover:text-white px-6 py-3.5 text-base transition-colors">
            View Pricing
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

// ─── FOOTER ────────────────────────────────────────────────
const Footer = () => (
  <footer className="border-t border-white/5 py-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center">
              <IconWaveform />
            </div>
            <span className="font-bold">VOXAR</span>
          </div>
          <p className="text-sm text-zinc-500">
            India's most advanced AI voice technology platform.
          </p>
        </div>
        {[
          { title: 'Product', links: ['Text-to-Speech', 'Voice Cloning', 'Transcription', 'API'] },
          { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
          { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
        ].map(col => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-white mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(link => (
                <li key={link}>
                  <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-zinc-600">
        <p>2026 VOXAR. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-zinc-400 transition-colors">Twitter</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">GitHub</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Discord</a>
        </div>
      </div>
    </div>
  </footer>
);

// ─── APP ───────────────────────────────────────────────────
function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
