import { useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://customer-support-e7jj.onrender.com";

const restaurants = [
  {
    id: 1,
    name: "Spice Garden",
    cuisine: "Indian • Biryani • Curries",
    rating: 4.8,
    time: "25–35 min",
    fee: "Free delivery",
    tag: "Bestseller",
    emoji: "🍛",
    color: "#FFF3CD",
  },
  {
    id: 2,
    name: "Burger Barn",
    cuisine: "American • Burgers • Sides",
    rating: 4.6,
    time: "20–30 min",
    fee: "₹29 delivery",
    tag: "Popular",
    emoji: "🍔",
    color: "#FFF8E1",
  },
  {
    id: 3,
    name: "Sushi Sakura",
    cuisine: "Japanese • Sushi • Ramen",
    rating: 4.9,
    time: "35–45 min",
    fee: "Free delivery",
    tag: "Top Rated",
    emoji: "🍱",
    color: "#FFFDE7",
  },
  {
    id: 4,
    name: "Pizza Pronto",
    cuisine: "Italian • Pizza • Pasta",
    rating: 4.5,
    time: "30–40 min",
    fee: "₹19 delivery",
    tag: "New",
    emoji: "🍕",
    color: "#FFF9C4",
  },
  {
    id: 5,
    name: "Green Bowl",
    cuisine: "Healthy • Salads • Wraps",
    rating: 4.7,
    time: "15–25 min",
    fee: "Free delivery",
    tag: "Trending",
    emoji: "🥗",
    color: "#F9FBE7",
  },
  {
    id: 6,
    name: "Wok & Roll",
    cuisine: "Chinese • Noodles • Dim Sum",
    rating: 4.4,
    time: "25–35 min",
    fee: "₹39 delivery",
    tag: "Fan Fav",
    emoji: "🥡",
    color: "#FFF8E1",
  },
];

const categories = ["🍕 Pizza", "🍔 Burgers", "🍜 Noodles", "🍣 Sushi", "🥗 Healthy", "🍛 Indian", "🌮 Mexican", "🍰 Desserts"];

export default function App() {
  const [complaint, setComplaint] = useState("");
  const [resp, setResp] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  async function submit() {
    setErr("");
    setResp("");
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/v1/complaints/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint_text: complaint }),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`API ${r.status}: ${t}`);
      }
      const data = await r.json();
      setResp(data.response_text || "");
    } catch (e) {
      setErr(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function addToCart(id) {
    setCartItems((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  const totalCartItems = Object.values(cartItems).reduce((a, b) => a + b, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --yellow: #FFD600;
          --yellow-light: #FFF9C4;
          --yellow-dark: #F9A825;
          --black: #1A1A1A;
          --gray: #6B7280;
          --gray-light: #F5F5F5;
          --white: #FFFFFF;
          --red: #EF4444;
          --green: #22C55E;
          --radius: 16px;
          --shadow: 0 4px 24px rgba(0,0,0,0.08);
          --shadow-lg: 0 8px 40px rgba(0,0,0,0.12);
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #FAFAFA;
          color: var(--black);
          line-height: 1.5;
        }

        .syne { font-family: 'Syne', sans-serif; }

        /* NAV */
        nav {
          position: sticky; top: 0; z-index: 100;
          background: var(--white);
          border-bottom: 1.5px solid #F0F0F0;
          padding: 0 5vw;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
          backdrop-filter: blur(12px);
        }
        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 1.4rem;
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; color: var(--black);
        }
        .nav-logo span { color: var(--yellow-dark); }
        .nav-logo-dot {
          width: 8px; height: 8px;
          background: var(--yellow);
          border-radius: 50%;
          display: inline-block;
        }
        .nav-search {
          flex: 1; max-width: 380px; margin: 0 24px;
          position: relative;
        }
        .nav-search input {
          width: 100%; padding: 10px 16px 10px 40px;
          border-radius: 50px; border: 1.5px solid #E5E7EB;
          background: #F9F9F9; font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem; outline: none; transition: border 0.2s;
        }
        .nav-search input:focus { border-color: var(--yellow-dark); background: var(--white); }
        .nav-search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: var(--gray); font-size: 0.9rem; pointer-events: none;
        }
        .nav-actions { display: flex; align-items: center; gap: 12px; }
        .nav-btn {
          padding: 8px 18px; border-radius: 50px;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          font-size: 0.875rem; cursor: pointer; transition: all 0.2s;
          border: 1.5px solid var(--black); background: transparent; color: var(--black);
        }
        .nav-btn:hover { background: var(--black); color: var(--white); }
        .nav-btn-primary {
          background: var(--yellow); border-color: var(--yellow); color: var(--black);
        }
        .nav-btn-primary:hover { background: var(--yellow-dark); border-color: var(--yellow-dark); color: var(--white); }
        .cart-btn {
          position: relative; padding: 8px 18px;
          border-radius: 50px; border: 1.5px solid var(--black);
          background: var(--black); color: var(--white);
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          font-size: 0.875rem; cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all 0.2s;
        }
        .cart-btn:hover { background: #333; }
        .cart-badge {
          background: var(--yellow); color: var(--black);
          border-radius: 50px; font-size: 0.7rem; font-weight: 700;
          padding: 1px 6px; min-width: 18px; text-align: center;
        }

        /* HERO */
        .hero {
          background: linear-gradient(135deg, #FFFDE7 0%, #FFF8E1 50%, #FFFDE7 100%);
          padding: 60px 5vw;
          display: flex; align-items: center; justify-content: space-between;
          gap: 40px; overflow: hidden; position: relative;
        }
        .hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 70% 50%, rgba(255,214,0,0.25) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-content { flex: 1; max-width: 520px; position: relative; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--white); border: 1.5px solid var(--yellow);
          border-radius: 50px; padding: 5px 14px;
          font-size: 0.78rem; font-weight: 600; color: var(--yellow-dark);
          margin-bottom: 20px; box-shadow: 0 2px 8px rgba(249,168,37,0.15);
        }
        .hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 800; line-height: 1.1;
          color: var(--black); margin-bottom: 16px;
        }
        .hero h1 em { font-style: normal; color: var(--yellow-dark); }
        .hero-sub {
          font-size: 1rem; color: var(--gray);
          margin-bottom: 28px; font-weight: 300; line-height: 1.6;
        }
        .hero-cta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .cta-primary {
          padding: 13px 28px; border-radius: 50px;
          background: var(--black); color: var(--white);
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          font-size: 0.95rem; border: none; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.25); }
        .cta-secondary {
          padding: 13px 28px; border-radius: 50px;
          background: var(--white); color: var(--black);
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          font-size: 0.95rem; border: 1.5px solid #DDD; cursor: pointer;
          transition: all 0.2s;
        }
        .cta-secondary:hover { border-color: var(--black); }
        .hero-stats {
          display: flex; gap: 28px; margin-top: 36px;
        }
        .stat { }
        .stat-num {
          font-family: 'Syne', sans-serif; font-size: 1.4rem;
          font-weight: 800; color: var(--black);
        }
        .stat-label { font-size: 0.78rem; color: var(--gray); margin-top: 2px; }
        .hero-visual {
          flex-shrink: 0; position: relative;
          font-size: clamp(80px, 12vw, 140px);
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        /* CATEGORIES */
        .section { padding: 40px 5vw; }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem; font-weight: 700;
          margin-bottom: 20px; color: var(--black);
        }
        .categories-scroll {
          display: flex; gap: 10px; overflow-x: auto;
          padding-bottom: 4px; scrollbar-width: none;
        }
        .categories-scroll::-webkit-scrollbar { display: none; }
        .cat-pill {
          flex-shrink: 0; padding: 9px 18px;
          border-radius: 50px; border: 1.5px solid #E5E7EB;
          background: var(--white); cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500;
          transition: all 0.2s; white-space: nowrap; color: var(--black);
        }
        .cat-pill:hover, .cat-pill.active {
          background: var(--black); color: var(--white); border-color: var(--black);
        }

        /* RESTAURANT GRID */
        .restaurant-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .restaurant-card {
          background: var(--white);
          border-radius: var(--radius);
          border: 1.5px solid #F0F0F0;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: var(--shadow);
        }
        .restaurant-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--yellow);
        }
        .card-header {
          padding: 24px 20px 20px;
          display: flex; align-items: center; justify-content: space-between;
          border-radius: var(--radius) var(--radius) 0 0;
        }
        .card-emoji { font-size: 2.8rem; line-height: 1; }
        .card-tag {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em;
          text-transform: uppercase;
          background: var(--yellow); color: var(--black);
          padding: 3px 10px; border-radius: 50px;
        }
        .card-body { padding: 0 20px 20px; }
        .card-name {
          font-family: 'Syne', sans-serif; font-size: 1.05rem;
          font-weight: 700; margin-bottom: 4px;
        }
        .card-cuisine { font-size: 0.8rem; color: var(--gray); margin-bottom: 14px; }
        .card-meta {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.8rem;
        }
        .card-rating {
          display: flex; align-items: center; gap: 4px;
          font-weight: 600; color: var(--black);
        }
        .card-rating span { color: #F59E0B; }
        .card-info { color: var(--gray); display: flex; align-items: center; gap: 6px; }
        .dot-sep { width: 3px; height: 3px; background: #CCC; border-radius: 50%; display: inline-block; }
        .card-footer {
          padding: 14px 20px;
          border-top: 1px solid #F0F0F0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .card-fee { font-size: 0.8rem; color: var(--green); font-weight: 600; }
        .card-fee.paid { color: var(--gray); }
        .add-btn {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--black); color: var(--white);
          border: none; cursor: pointer; font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .add-btn:hover { background: var(--yellow-dark); transform: scale(1.1); }
        .add-btn.added { background: var(--yellow); color: var(--black); }

        /* DIVIDER */
        .section-divider {
          margin: 0 5vw;
          border: none; border-top: 1.5px dashed #E5E7EB;
        }

        /* SUPPORT SECTION */
        .support-section {
          padding: 60px 5vw;
          background: var(--white);
        }
        .support-inner {
          max-width: 720px; margin: 0 auto;
        }
        .support-header { margin-bottom: 32px; text-align: center; }
        .support-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: var(--yellow); display: flex; align-items: center;
          justify-content: center; font-size: 1.6rem;
          margin: 0 auto 16px; box-shadow: 0 4px 16px rgba(255,214,0,0.4);
        }
        .support-header h2 {
          font-family: 'Syne', sans-serif; font-size: 1.8rem;
          font-weight: 800; margin-bottom: 8px;
        }
        .support-header p {
          font-size: 0.95rem; color: var(--gray); max-width: 460px; margin: 0 auto;
          line-height: 1.6;
        }
        .support-card {
          background: #FAFAFA;
          border: 1.5px solid #EFEFEF;
          border-radius: 20px; padding: 32px;
        }
        .field-label {
          font-weight: 600; font-size: 0.875rem;
          margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
          color: var(--black);
        }
        .complaint-textarea {
          width: 100%; padding: 16px;
          border-radius: 12px; border: 1.5px solid #E5E7EB;
          background: var(--white); font-family: 'DM Sans', sans-serif;
          font-size: 0.925rem; line-height: 1.6; resize: vertical;
          outline: none; transition: border 0.2s, box-shadow 0.2s;
          color: var(--black); min-height: 120px;
        }
        .complaint-textarea:focus {
          border-color: var(--yellow-dark);
          box-shadow: 0 0 0 3px rgba(249,168,37,0.12);
        }
        .complaint-textarea::placeholder { color: #ADADAD; }
        .char-count {
          text-align: right; font-size: 0.75rem; color: var(--gray);
          margin-top: 6px;
        }
        .btn-row {
          display: flex; gap: 10px; margin-top: 20px; align-items: center;
        }
        .submit-btn {
          flex: 1; padding: 14px 20px;
          border-radius: 12px; border: none;
          background: var(--black); color: var(--white);
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          font-size: 0.95rem; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center;
          justify-content: center; gap: 8px;
        }
        .submit-btn:hover:not(:disabled) {
          background: #2D2D2D; transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .submit-btn.loading { background: #444; }
        .clear-btn {
          padding: 14px 20px; border-radius: 12px;
          border: 1.5px solid #E5E7EB; background: var(--white);
          color: var(--gray); font-family: 'DM Sans', sans-serif;
          font-weight: 500; font-size: 0.875rem; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
        }
        .clear-btn:hover { border-color: var(--black); color: var(--black); }

        /* SPINNER */
        .spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: var(--white); border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* RESPONSE */
        .error-box {
          margin-top: 20px; padding: 16px;
          border-radius: 12px; border: 1.5px solid #FCA5A5;
          background: #FEF2F2; color: #DC2626;
          font-size: 0.875rem; display: flex; gap: 8px; align-items: flex-start;
        }
        .response-box {
          margin-top: 20px;
          border-radius: 16px; overflow: hidden;
          border: 1.5px solid var(--yellow);
          box-shadow: 0 4px 20px rgba(255,214,0,0.15);
          animation: fadeUp 0.4s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .response-header {
          background: var(--yellow); padding: 12px 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .response-header-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.875rem; color: var(--black);
        }
        .ai-badge {
          margin-left: auto; background: var(--black); color: var(--yellow);
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 3px 8px; border-radius: 50px;
        }
        .response-body {
          background: var(--white); padding: 20px;
          font-size: 0.925rem; line-height: 1.75;
          white-space: pre-wrap; color: var(--black);
        }

        /* FOOTER */
        footer {
          background: var(--black); color: rgba(255,255,255,0.55);
          padding: 32px 5vw; margin-top: 0;
        }
        .footer-inner {
          max-width: 900px; margin: 0 auto;
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; text-align: center;
        }
        .footer-logo {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 1.1rem; color: var(--white);
        }
        .footer-logo em { color: var(--yellow); font-style: normal; }
        .footer-disclaimer {
          font-size: 0.8rem; line-height: 1.6; max-width: 600px;
          color: rgba(255,255,255,0.45);
        }
        .footer-disclaimer strong { color: rgba(255,255,255,0.65); }
        .footer-divider {
          width: 40px; height: 2px; background: var(--yellow);
          border-radius: 2px; margin: 4px 0;
        }

        @media (max-width: 640px) {
          .hero { flex-direction: column; text-align: center; padding: 40px 5vw; }
          .hero-cta { justify-content: center; }
          .hero-stats { justify-content: center; }
          .hero-visual { font-size: 80px; }
          nav { padding: 0 16px; }
          .nav-search { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <a className="nav-logo" href="#">
          <span className="nav-logo-dot" />
          Benny's<span>Eats</span>
        </a>
        <div className="nav-search">
          <span className="nav-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search restaurants or dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="nav-actions">
          <button className="nav-btn">Sign In</button>
          <button className="nav-btn nav-btn-primary">Sign Up</button>
          <button className="cart-btn">
            🛒 Cart
            {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            ⚡ Fast delivery in your city
          </div>
          <h1 className="syne">
            Hungry? We've got<br /><em>great food</em> nearby
          </h1>
          <p className="hero-sub">
            From your favourite local spots to top-rated restaurants —
            hot meals delivered right to your door.
          </p>
          <div className="hero-cta">
            <button className="cta-primary">Order Now</button>
            <button className="cta-secondary">Browse Restaurants</button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">500+</div>
              <div className="stat-label">Restaurants</div>
            </div>
            <div className="stat">
              <div className="stat-num">30 min</div>
              <div className="stat-label">Avg Delivery</div>
            </div>
            <div className="stat">
              <div className="stat-num">4.8★</div>
              <div className="stat-label">User Rating</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">🛵</div>
      </section>

      {/* CATEGORIES */}
      <section className="section" style={{ paddingBottom: 16 }}>
        <h2 className="section-title syne">What are you craving?</h2>
        <div className="categories-scroll">
          {categories.map((c) => (
            <button
              key={c}
              className={`cat-pill${activeCategory === c ? " active" : ""}`}
              onClick={() => setActiveCategory(activeCategory === c ? null : c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* RESTAURANTS */}
      <section className="section" style={{ paddingTop: 24 }}>
        <h2 className="section-title syne">Top restaurants near you</h2>
        <div className="restaurant-grid">
          {restaurants.map((r) => (
            <div className="restaurant-card" key={r.id}>
              <div className="card-header" style={{ background: r.color }}>
                <div className="card-emoji">{r.emoji}</div>
                <div className="card-tag">{r.tag}</div>
              </div>
              <div className="card-body">
                <div className="card-name syne">{r.name}</div>
                <div className="card-cuisine">{r.cuisine}</div>
                <div className="card-meta">
                  <div className="card-rating">
                    <span>★</span> {r.rating}
                  </div>
                  <div className="card-info">
                    <span>🕐 {r.time}</span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <span className={`card-fee${r.fee !== "Free delivery" ? " paid" : ""}`}>
                  {r.fee === "Free delivery" ? "✓ " : ""}{r.fee}
                </span>
                <button
                  className={`add-btn${cartItems[r.id] ? " added" : ""}`}
                  onClick={() => addToCart(r.id)}
                  title="Add to cart"
                >
                  {cartItems[r.id] ? cartItems[r.id] : "+"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="section-divider" />

      {/* SUPPORT SECTION */}
      <section className="support-section">
        <div className="support-inner">
          <div className="support-header">
            <div className="support-icon">🎧</div>
            <h2 className="syne">Need help with your order?</h2>
            <p>
              Our AI support agent is here 24/7. Describe your issue below
              and get an instant, personalised response.
            </p>
          </div>

          <div className="support-card">
            <div className="field-label">
              📝 Describe your issue
            </div>
            <textarea
              className="complaint-textarea"
              rows={5}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Enter your complaints here....."
            />
            <div className="char-count">{complaint.length} characters</div>

            <div className="btn-row">
              <button
                className={`submit-btn${loading ? " loading" : ""}`}
                onClick={submit}
                disabled={loading || complaint.trim().length === 0}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Generating response…
                  </>
                ) : (
                  <>✨ Get AI Support</>
                )}
              </button>
              <button
                className="clear-btn"
                onClick={() => { setComplaint(""); setResp(""); setErr(""); }}
              >
                Clear
              </button>
            </div>

            {err && (
              <div className="error-box">
                <span>⚠️</span>
                <div><strong>Error:</strong> {err}</div>
              </div>
            )}

            {resp && (
              <div className="response-box">
                <div className="response-header">
                  <span>🤖</span>
                  <span className="response-header-title">AI Support Response</span>
                  <span className="ai-badge">AI Generated</span>
                </div>
                <div className="response-body">{resp}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo">Benny's<em>Eats</em></div>
          <div className="footer-divider" />
          <p className="footer-disclaimer">
            <strong>Disclaimer:</strong> Benny's Eats is a <strong>demonstration project</strong> and is not
            a real food delivery service. This website has been created solely to showcase the
            integration of <strong>AI-powered customer support</strong> into a web application.
            No real orders can be placed, and no actual deliveries are made. The AI support
            feature demonstrates how intelligent agents can be deployed to handle customer
            queries in real-world applications.
          </p>
          <p className="footer-disclaimer" style={{ marginTop: 4 }}>
            © {new Date().getFullYear()} ZapEats Demo · Built to demonstrate AI deployment
          </p>
        </div>
      </footer>
    </>
  );
}