import { VoxarLogo, IconTwitter, IconGithub, IconLinkedin, IconYoutube, IconInstagram } from './Icons'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-logo">
              <VoxarLogo width={32} />
              <span className="footer-logo-text">VOXAR</span>
            </div>
            <p className="footer-tagline">AI Voice Infrastructure for Multilingual Creators.</p>
          </div>
          <div>
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-col-links">
              <li><a href="#">Text-to-Speech</a></li>
              <li><a href="#">Voice Cloning</a></li>
              <li><a href="#">Transcription</a></li>
              <li><a href="#">Voice Library</a></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-col-links">
              <li><a href="#">API Docs</a></li>
              <li><a href="#">Changelog</a></li>
              <li><a href="#">Status Page</a></li>
              <li><a href="#">Help Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-col-links">
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col-title">Legal</h4>
            <ul className="footer-col-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Refund Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© {new Date().getFullYear()} VOXAR. All rights reserved.</span>
          <div className="footer-socials">
            <a href="https://x.com/voxar_ai" target="_blank" rel="noopener noreferrer" className="footer-social"><IconTwitter /></a>
            <a href="https://www.youtube.com/@voxar_ai" target="_blank" rel="noopener noreferrer" className="footer-social"><IconYoutube /></a>
            <a href="https://www.instagram.com/voxar.ai/" target="_blank" rel="noopener noreferrer" className="footer-social"><IconInstagram /></a>
            <a href="#" className="footer-social"><IconGithub /></a>
            <a href="#" className="footer-social"><IconLinkedin /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
