import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useT } from "../../i18n/useT";
import { NAV_ITEMS } from "../../config/navItems";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const t = useT();

  if (!user) return null;

  const tiles = NAV_ITEMS.filter((item) => item.to !== "/" && item.roles.includes(user.role));

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-800">
        {t("home.welcome", { name: user.name })}
      </h1>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {tiles.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="touch-target group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-7 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
            >
              <div className="flex h-16 w-16 items-center justify-center text-orange-500 transition-transform duration-200 group-hover:scale-110">
                <Icon size={34} strokeWidth={1.75} />
              </div>
              <span className="text-sm font-semibold text-slate-700">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
