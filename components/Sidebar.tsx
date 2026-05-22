    'use client';

    import Link from 'next/link';
    import { usePathname, useRouter } from 'next/navigation';
    import Cookies from 'js-cookie';

    export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        Cookies.remove('token'); // Hapus kunci akses
        router.push('/login'); // Lempar kembali ke gerbang utama
    };

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Destinasi', path: '/dashboard/destinations', icon: '🏝️' },
        { name: 'Paket Wisata', path: '/dashboard/packages', icon: '🏷️' },
        { name: 'Peserta', path: '/dashboard/participants', icon: '👥' },
        { name: 'Registrasi', path: '/dashboard/registrations', icon: '📝' },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800">
            <h2 className="text-2xl font-extrabold text-blue-500 tracking-tight">Travel<span className="text-white">OS</span></h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Portal Manajemen v1.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
                <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                    isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                >
                <span className="text-lg">{item.icon}</span>
                {item.name}
                </Link>
            );
            })}
        </nav>

        <div className="p-4 border-t border-slate-800">
            <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200 font-bold"
            >
            <span>🚪</span> Keluar Sistem
            </button>
        </div>
        </aside>
    );
    }