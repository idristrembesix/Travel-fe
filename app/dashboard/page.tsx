        'use client';

        import { useEffect, useState } from 'react';
    import api from '../lib/axios';

        export default function DashboardPage() {
        const [stats, setStats] = useState<any>(null);
        const [loading, setLoading] = useState(true);
        const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
        setLoading(true);
        setErrorMsg(null);
        
        try {
            // Tembakan presisi: Langsung arahkan ke /dashboard/stats sesuai dengan Controller Backend-mu!
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (error: any) {
            console.error('❌ Gagal mengambil data statistik', error);
            setErrorMsg('Gagal memuat statistik. Pastikan endpoint Dashboard di backend sudah aktif.');
        } finally {
            setLoading(false);
        }
        };
        
        fetchStats();
    }, []);    if (loading) {
            return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                <p className="text-slate-500 font-medium animate-pulse">Menghitung statistik...</p>
                </div>
            </div>
            );
        }

        // === LOGIKA PINTAR: EKSTRAKSI DATA AMAN ===
        // Kita buat fleksibel untuk menangkap berbagai kemungkinan format nama variabel dari Backend NestJS-mu
        const totalRegistrations = stats?.registrations?.total ?? stats?.totalRegistrations ?? stats?.registrations ?? 0;
        const pendingRegistrations = stats?.registrations?.pending ?? stats?.pendingRegistrations ?? 0;
        const confirmedRegistrations = stats?.registrations?.confirmed ?? stats?.confirmedRegistrations ?? 0;
        const totalParticipants = stats?.participants ?? stats?.totalParticipants ?? 0;
        const totalPackages = stats?.packages ?? stats?.totalPackages ?? stats?.tourPackages ?? 0;
        const totalDestinations = stats?.destinations ?? stats?.totalDestinations ?? 0;

        const cardData = [
            { title: 'Total Registrasi', value: totalRegistrations, icon: '📝', color: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
            { title: 'Pendaftaran Pending', value: pendingRegistrations, icon: '⏳', color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
            { title: 'Pendaftaran Sukses', value: confirmedRegistrations, icon: '✅', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
            { title: 'Total Peserta', value: totalParticipants, icon: '👥', color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' },
            { title: 'Paket Wisata', value: totalPackages, icon: '🏷️', color: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
            { title: 'Destinasi', value: totalDestinations, icon: '🏝️', color: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
        ];

        return (
            <div className="pb-10">
            <header className="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Ringkasan Sistem</h1>
                <p className="text-slate-500 font-medium mt-1">Pantau performa operasional travel Anda secara real-time.</p>
                </div>
                <div className="hidden md:flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl text-blue-700 font-bold border border-blue-100">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                Sistem Online
                </div>
            </header>

            {errorMsg && (
                <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 shadow-sm">
                <span className="text-xl">⚠️</span>
                <p className="font-semibold">{errorMsg}</p>
                </div>
            )}

            {/* Grid Statistik Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {cardData.map((item, index) => (
                <div 
                    key={index} 
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                >
                    <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg ${item.shadow} group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.title}</p>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight">
                        {item.value}
                        </h3>
                    </div>
                    </div>
                </div>
                ))}
            </div>

            {/* Placeholder Grafik Masa Depan */}
            <div className="mt-8 p-12 bg-white border border-slate-100 shadow-sm rounded-3xl flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📈</span>
                <h3 className="font-bold text-xl text-slate-700">Analisis Visual</h3>
                <p className="font-medium text-slate-500 mt-2 text-center max-w-md">
                Grafik performa pendaftaran dan tren destinasi favorit akan ditampilkan di area ini pada rilis versi selanjutnya.
                </p>
            </div>
            </div>
        );
        }