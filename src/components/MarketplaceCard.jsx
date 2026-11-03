import { Link } from "react-router-dom";
import AssetPlaceholder from "./AssetPlaceholder.jsx";

export default function MarketplaceCard({ id, icon, title, description, to, buttonLabel, imageName, theme }) {
  const themes = {
    sky: { card: "border-sky-100 bg-sky-50", icon: "bg-sky-100", button: "bg-blue-900 hover:bg-blue-800", image: "bg-sky-100" },
    amber: { card: "border-amber-100 bg-amber-50", icon: "bg-amber-100", button: "bg-amber-700 hover:bg-amber-800", image: "bg-amber-100" },
    violet: { card: "border-violet-100 bg-violet-50", icon: "bg-violet-100", button: "bg-violet-800 hover:bg-violet-900", image: "bg-violet-100" },
  };
  const style = themes[theme] || themes.sky;

  return (
    <article id={id} className={`group overflow-hidden rounded-3xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${style.card}`}>
      <div className="p-5 sm:p-6">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${style.icon}`} aria-hidden="true">{icon}</div>
        <h3 className="text-xl font-extrabold">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{description}</p>
        <Link to={to} className={`mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition ${style.button}`}>
          {buttonLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>
      {/* Replace this placeholder with an image imported from src/assets. */}
      <AssetPlaceholder name={imageName} description="Section banner" className={`mx-4 mb-4 min-h-[170px] sm:mx-5 sm:mb-5 ${style.image}`} />
    </article>
  );
}