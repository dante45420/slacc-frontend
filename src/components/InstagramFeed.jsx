import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { apiGet } from "../api/client";
import { Button } from "./ui";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "./public/contactInfo.js";

// The backend answers /instagram/recent with stock placeholder posts ("ph1"…)
// until Graph API credentials are configured. Only real posts are shown.
const isRealPost = post =>
  post &&
  typeof post.id === "string" &&
  !/^ph\d+$/.test(post.id) &&
  typeof post.media_url === "string" &&
  !/\.mp4(\?|$)/i.test(post.media_url) &&
  typeof post.permalink === "string";

function PostTile({ post, onError }) {
  const { t } = useTranslation();
  const caption = (post.caption || "").trim();
  return (
    <li className="home-instagram__post">
      <a href={post.permalink} target="_blank" rel="noopener noreferrer">
        <img
          src={post.media_url}
          alt={caption ? caption.slice(0, 140) : t("home.instagram_view_post", "Ver publicación en Instagram")}
          loading="lazy"
          decoding="async"
          onError={() => onError(post.id)}
        />
        <span className="sr-only">{t("home.opens_new_tab", "(se abre en una pestaña nueva)")}</span>
      </a>
    </li>
  );
}

PostTile.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    caption: PropTypes.string,
    media_url: PropTypes.string.isRequired,
    permalink: PropTypes.string.isRequired,
  }).isRequired,
  onError: PropTypes.func.isRequired,
};

/**
 * "Síguenos en Instagram" block. Always shows an honest follow panel that
 * links to the official profile; when the backend has Instagram credentials
 * it also shows the latest posts (any image that fails to load is dropped).
 * Nothing hotlinks signed Instagram CDN URLs from the source code.
 */
export default function InstagramFeed() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [failed, setFailed] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    apiGet("/instagram/recent?limit=3")
      .then(data => {
        if (!cancelled) setPosts(Array.isArray(data) ? data.filter(isRealPost).slice(0, 3) : []);
      })
      .catch(() => {
        // The follow panel is enough when the feed is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = posts.filter(post => !failed.has(post.id));
  const markFailed = id => setFailed(prev => new Set(prev).add(id));

  return (
    <div className={`home-instagram${visible.length ? " home-instagram--with-posts" : ""}`}>
      <div className="home-instagram__panel">
        <span className="home-instagram__glyph" aria-hidden="true">
          <i className="fa-brands fa-instagram"></i>
        </span>
        <div className="home-instagram__text">
          <p className="eyebrow">{t("home.instagram_kicker", "Redes sociales")}</p>
          <h2 className="section-title">{t("home.instagram_title", "Síguenos en Instagram")}</h2>
          <p className="home-instagram__lead">
            {t(
              "home.instagram_text",
              "Fotos y novedades de congresos, cursos y actividades académicas de la sociedad.",
            )}
          </p>
          <a
            className="home-instagram__handle"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {INSTAGRAM_HANDLE}
            <span className="sr-only">{t("home.opens_new_tab", "(se abre en una pestaña nueva)")}</span>
          </a>
        </div>
        <div className="home-instagram__action">
          <Button variant="primary" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-instagram" aria-hidden="true"></i>
            {t("home.instagram_follow", "Seguir en Instagram")}
            <i className="fa-solid fa-arrow-up-right-from-square home-instagram__external" aria-hidden="true"></i>
            <span className="sr-only">{t("home.opens_new_tab", "(se abre en una pestaña nueva)")}</span>
          </Button>
        </div>
      </div>

      {visible.length > 0 && (
        <ul className="home-instagram__posts" aria-label={t("home.instagram_recent", "Publicaciones recientes")}>
          {visible.map(post => (
            <PostTile key={post.id} post={post} onError={markFailed} />
          ))}
        </ul>
      )}
    </div>
  );
}
