import './App.css'

function App() {
  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Stillstay home">
          <span className="wordmark-mark" aria-hidden="true">s</span>
          stillstay
        </a>
        <nav className="header-links" aria-label="Main navigation">
          <a href="#stays">Find a stay</a>
          <a href="#about">Our approach</a>
        </nav>
        <a className="header-cta" href="#search">Start exploring <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="search" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A little more room to feel at home</p>
          <h1 id="hero-title">Go somewhere.<br /><em>Feel everywhere.</em></h1>
          <p className="hero-description">
            Find welcoming places, thoughtful details, and a stay that feels like part of the journey.
          </p>
          <a className="text-link" href="#stays">Discover your next stay <span aria-hidden="true">→</span></a>
        </div>

        <div className="hero-art" role="img" aria-label="Illustration of a quiet hillside retreat at sunset">
          <div className="sun" />
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="cabin">
            <div className="cabin-roof" />
            <div className="cabin-body">
              <span className="cabin-window" />
              <span className="cabin-door" />
            </div>
          </div>
          <span className="art-note">Somewhere worth slowing down</span>
        </div>
      </section>

      <section className="search-panel" id="stays" aria-label="Search for a hotel">
        <label className="search-field">
          <span className="field-label">Where to?</span>
          <span className="field-value"><span aria-hidden="true">⌖</span> City or destination</span>
        </label>
        <label className="search-field">
          <span className="field-label">Check in</span>
          <span className="field-value"><span aria-hidden="true">▦</span> Add dates</span>
        </label>
        <label className="search-field">
          <span className="field-label">Check out</span>
          <span className="field-value"><span aria-hidden="true">▦</span> Add dates</span>
        </label>
        <button className="search-button" type="button" disabled>
          Search stays <span aria-hidden="true">→</span>
        </button>
      </section>

      <footer className="page-footer" id="about">
        <span>Made for the way you travel.</span>
        <span className="footer-note">A more thoughtful way to find your stay.</span>
      </footer>
    </main>
  )
}

export default App
