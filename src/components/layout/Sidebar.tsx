export default function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-slate-900 p-6 text-white">
      <h1 className="mb-8 text-2xl font-bold">METLAS ERP</h1>
      <nav className="space-y-4">
        <a href="#" className="block hover:text-cyan-400">Dashboard</a>
        <a href="#" className="block hover:text-cyan-400">Müşteriler</a>
        <a href="#" className="block hover:text-cyan-400">Siparişler</a>
        <a href="#" className="block hover:text-cyan-400">Araçlar</a>
        <a href="#" className="block hover:text-cyan-400">Personeller</a>
        <a href="#" className="block hover:text-cyan-400">Kasa</a>
        <a href="#" className="block hover:text-cyan-400">Raporlar</a>
      </nav>
    </aside>
  );
}
