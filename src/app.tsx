import { Link, Navigate, Route, Routes } from "react-router-dom";
import { liveGames } from "./games";

function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Game Hub</p>
          <h1>聚会游戏的趣味目录站</h1>
          <p className="hero-text">
            人生苦短，何不快乐一下。
          </p>
        </div>
        <div className="hero-orbit">
          <div className="orbit-card orbit-card--one">目录</div>
          <div className="orbit-card orbit-card--two">翻牌</div>
          <div className="orbit-card orbit-card--three">Cloudflare</div>
        </div>
      </section>

      <section className="catalog-panel">
        <div className="section-heading">
          <p className="eyebrow">游戏目录</p>
          <h2>奇珍异宝小游戏</h2>
        </div>

        <div className="catalog-grid">
          {liveGames.map((game) => (
            <article className="game-card" key={game.slug}>
              <div className="game-card__topline">
                <span>{game.accent}</span>
                <span className="status-pill status-pill--available">已上线</span>
              </div>
              <h3>{game.title}</h3>
              <p className="game-card__subtitle">{game.subtitle}</p>
              <p className="game-card__description">{game.description}</p>
              <Link className="game-card__link" to={`/games/${game.slug}`}>
                进入游戏
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {liveGames.map((game) => (
        <Route key={game.slug} path={`/games/${game.slug}`} element={<game.Component />} />
      ))}
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
