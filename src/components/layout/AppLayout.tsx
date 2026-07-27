import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import PreferenceBar from "./PreferenceBar";

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="flex h-full flex-col">
      <PreferenceBar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
