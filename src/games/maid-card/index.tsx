import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { defaultMaidCardRuleSet, type MaidCard, type MaidCardRuleSet } from "./data";
import type { LiveGame } from "../types";
import "./styles.css";

const CUSTOM_RULES_STORAGE_KEY = "maid-card-custom-rules-v1";

const drawRandomCard = (cards: MaidCard[]) => cards[Math.floor(Math.random() * cards.length)];

const createDraftMap = (cards: MaidCard[]) =>
  Object.fromEntries(cards.map((card) => [card.rank, card.lines.join("\n")]));

const sanitizeCardLines = (value: string, fallback: string[]) => {
  const nextLines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return nextLines.length > 0 ? nextLines : fallback;
};

const readSavedCards = (fallbackCards: MaidCard[]) => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CUSTOM_RULES_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as MaidCard[];
    if (!Array.isArray(parsed)) {
      return null;
    }

    const savedByRank = new Map(parsed.map((card) => [card.rank, card]));
    return fallbackCards.map((card) => {
      const saved = savedByRank.get(card.rank);
      if (!saved || !Array.isArray(saved.lines)) {
        return card;
      }

      return {
        ...card,
        lines: sanitizeCardLines(saved.lines.join("\n"), card.lines),
      };
    });
  } catch {
    return null;
  }
};

function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="dialog-backdrop" onClick={onClose} role="presentation">
      <section
        aria-modal="true"
        className="dialog-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="dialog-header">
          <div>
            <p className="eyebrow">小姐牌</p>
            <h2>{title}</h2>
          </div>
          <button className="dialog-close" onClick={onClose} type="button">
            关闭
          </button>
        </header>
        <div className="dialog-body">{children}</div>
      </section>
    </div>
  );
}

function MaidCardPage() {
  const [ruleSet, setRuleSet] = useState<MaidCardRuleSet | null>(null);
  const [cards, setCards] = useState<MaidCard[]>([]);
  const [draftByRank, setDraftByRank] = useState<Record<string, string>>({});
  const [isFaceUp, setIsFaceUp] = useState(false);
  const [currentCard, setCurrentCard] = useState<MaidCard | null>(null);
  const [activeDialog, setActiveDialog] = useState<"rules" | "customize" | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let isMounted = true;

    const loadRules = async () => {
      setLoadState("loading");

      try {
        const response = await fetch("/api/games/maid-card/rules");
        if (!response.ok) {
          throw new Error(`Failed to load rules: ${response.status}`);
        }

        const backendRuleSet = (await response.json()) as MaidCardRuleSet;
        if (!isMounted) {
          return;
        }

        const nextCards = readSavedCards(backendRuleSet.cards) ?? backendRuleSet.cards;
        setRuleSet(backendRuleSet);
        setCards(nextCards);
        setDraftByRank(createDraftMap(nextCards));
        setLoadState("ready");
      } catch {
        if (!isMounted) {
          return;
        }

        const nextCards = readSavedCards(defaultMaidCardRuleSet.cards) ?? defaultMaidCardRuleSet.cards;
        setRuleSet(defaultMaidCardRuleSet);
        setCards(nextCards);
        setDraftByRank(createDraftMap(nextCards));
        setLoadState("error");
      }
    };

    void loadRules();

    return () => {
      isMounted = false;
    };
  }, []);

  const instruction =
    loadState === "loading"
      ? "正在载入后台规则..."
      : isFaceUp
        ? "再点一下，把牌翻回去"
        : "点击这张背对的牌，随机翻开";

  const handleCardClick = () => {
    if (cards.length === 0) {
      return;
    }

    if (isFaceUp) {
      setIsFaceUp(false);
      return;
    }

    setCurrentCard(drawRandomCard(cards));
    setIsFaceUp(true);
  };

  const handleDraftChange = (rank: string, value: string) => {
    setDraftByRank((current) => ({
      ...current,
      [rank]: value,
    }));
  };

  const handleSaveCustomRules = () => {
    if (!ruleSet) {
      return;
    }

    const nextCards = ruleSet.cards.map((card) => ({
      ...card,
      lines: sanitizeCardLines(draftByRank[card.rank] ?? card.lines.join("\n"), card.lines),
    }));

    window.localStorage.setItem(CUSTOM_RULES_STORAGE_KEY, JSON.stringify(nextCards));
    setCards(nextCards);
    setDraftByRank(createDraftMap(nextCards));

    if (currentCard) {
      setCurrentCard(nextCards.find((card) => card.rank === currentCard.rank) ?? currentCard);
    }

    setActiveDialog(null);
  };

  const handleResetCustomRules = () => {
    if (!ruleSet) {
      return;
    }

    window.localStorage.removeItem(CUSTOM_RULES_STORAGE_KEY);
    setCards(ruleSet.cards);
    setDraftByRank(createDraftMap(ruleSet.cards));

    if (currentCard) {
      setCurrentCard(ruleSet.cards.find((card) => card.rank === currentCard.rank) ?? currentCard);
    }
  };

  return (
    <main className="page-shell page-shell--game">
      <section className="game-stage">
        <div className="game-stage__header">
          <div className="section-heading section-heading--compact">
            <p className="eyebrow">游戏 01</p>
            <h1>小姐牌</h1>
            <p className="hero-text">
              点击翻牌，快速开局。规则按钮查看玩法，自定义按钮可以修改每张牌的文案并保存到当前浏览器。
            </p>
          </div>
          <div className="game-stage__actions">
            <button className="secondary-link secondary-link--button" onClick={() => setActiveDialog("rules")} type="button">
              规则
            </button>
            <button
              className="secondary-link secondary-link--button"
              onClick={() => setActiveDialog("customize")}
              type="button"
            >
              自定义规则
            </button>
            <Link className="secondary-link" to="/">
              返回目录
            </Link>
          </div>
        </div>

        <button
          className={`flip-card ${isFaceUp ? "is-face-up" : ""}`}
          disabled={cards.length === 0}
          onClick={handleCardClick}
          type="button"
          aria-label={instruction}
        >
          <span className="flip-card__inner">
            <span className="flip-card__face flip-card__face--back">
              <span className="flip-card__brand">Maid Card</span>
              <span className="flip-card__hint">
                {loadState === "loading" ? "Loading Rules" : "Tap To Reveal"}
              </span>
            </span>

            <span className="flip-card__face flip-card__face--front">
              <span className="flip-card__rank">{currentCard?.rank ?? "?"}</span>
              <span className="flip-card__title">{currentCard?.title ?? "待抽牌"}</span>
              <span className="flip-card__divider" />
              <span className="flip-card__content">
                {(currentCard?.lines ?? ["点击牌背开始随机抽牌。"]).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            </span>
          </span>
        </button>

        <p className="flip-tip">{instruction}</p>
        {loadState === "error" ? (
          <p className="game-note">后台规则加载失败，当前已回退到内置默认规则。</p>
        ) : (
          <p className="game-note">默认规则来自后台接口；自定义规则会保存在当前浏览器。</p>
        )}
      </section>

      {activeDialog === "rules" && ruleSet ? (
        <Dialog onClose={() => setActiveDialog(null)} title="游戏规则">
          <ul className="rules-list">
            {ruleSet.howToPlay.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Dialog>
      ) : null}

      {activeDialog === "customize" && ruleSet ? (
        <Dialog onClose={() => setActiveDialog(null)} title="自定义牌面规则">
          <p className="dialog-intro">
            默认规则先从后台载入。你可以修改下面每一张牌的内容，点击保存后，之后翻开的牌会优先显示你的自定义文案。
          </p>
          <div className="editor-list">
            {ruleSet.cards.map((card) => (
              <label className="editor-card" key={card.rank}>
                <span className="editor-card__heading">
                  <strong>{card.rank}</strong>
                  <span>{card.title}</span>
                </span>
                <textarea
                  className="editor-card__input"
                  onChange={(event) => handleDraftChange(card.rank, event.target.value)}
                  rows={Math.max(3, draftByRank[card.rank]?.split("\n").length ?? 3)}
                  value={draftByRank[card.rank] ?? card.lines.join("\n")}
                />
              </label>
            ))}
          </div>
          <div className="dialog-actions">
            <button className="secondary-link secondary-link--button" onClick={handleResetCustomRules} type="button">
              恢复后台默认
            </button>
            <button className="game-card__link game-card__link--button" onClick={handleSaveCustomRules} type="button">
              Save
            </button>
          </div>
        </Dialog>
      ) : null}
    </main>
  );
}

export const maidCardGame: LiveGame = {
  slug: "maid-card",
  title: "小姐牌",
  subtitle: "翻一张牌，立刻开局",
  description: "把线下喝酒游戏改成在线翻牌体验。点击牌背随机抽牌，再点一次翻回牌背重新抽。",
  accent: "蜜桃金",
  Component: MaidCardPage,
};
