import { Sidebar } from "./components/sidebar";
import { Header } from "./components/header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
