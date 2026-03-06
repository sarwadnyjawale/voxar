import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Voice Library", href: "/#voices" },
    { label: "API Docs", href: "/docs" },
  ],
  Company: [
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

function FooterWaveform() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0.6, 1, 0.4, 0.8, 0.5].map((scale, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full bg-voxar-violet/50"
          style={{
            height: `${scale * 100}%`,
            animation: `waveform ${1.2 + i * 0.2}s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[#030303]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Image
                src="/logo2.png"
                alt="VOXAR"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xl font-bold text-white">VOXAR</span>
              <FooterWaveform />
            </div>
            <p className="mt-3 text-sm text-voxar-text-muted">
              AI Voice Infrastructure for Multilingual Creators
            </p>
            <div className="mt-4 flex gap-4">
              {["YouTube", "X", "LinkedIn", "Discord"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs text-voxar-text-muted transition-colors hover:text-voxar-violet"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-voxar-text-muted transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[rgba(255,255,255,0.06)] pt-6">
          <p className="text-center text-xs text-voxar-text-muted">
            &copy; 2026 VOXAR. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
