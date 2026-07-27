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
      <h1 className="mb-1 text-xl font-semibold text-slate-800">
        {t("home.welcome", { name: user.name })}
      </h1>
      <p className="mb-6 text-sm text-slate-500">{t("home.subtitle")}</p>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {tiles.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="card card-hover touch-target flex flex-col items-center gap-3 py-6 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon size={26} strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold text-slate-700">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
