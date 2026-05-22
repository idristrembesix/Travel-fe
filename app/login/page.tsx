    'use client';

    import { useState } from 'react';
    import { useRouter } from 'next/navigation';
    import Cookies from 'js-cookie';
    import api from '../lib/axios'; // Import disesuaikan dengan struktur foldermu

    export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
        const response = await api.post('/users/login', { email, password });
        Cookies.set('token', response.data.accessToken, { expires: 1 });
        router.push('/dashboard');
        } catch (err: any) {
        setError(err.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.');
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex text-gray-900 font-sans selection:bg-blue-200">
        {/* SISI KIRI: Area Visual & Branding (Disembunyikan di HP, muncul di layar besar) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
            {/* Gambar Background dari Unsplash dengan filter gelap */}
            <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay scale-105 hover:scale-100 transition-transform duration-1000"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')" }}
            ></div>
            
            {/* Teks Branding */}
            <div className="relative z-10 px-16 text-white w-full max-w-2xl">
            <div className="w-16 h-2 bg-blue-500 mb-8 rounded-full"></div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                Jelajahi <br/><span className="text-blue-400">Dunia.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md font-light leading-relaxed">
                Sistem Manajemen Portal Travel. Kelola destinasi, paket wisata, dan reservasi peserta dengan elegan dalam satu pintu.
            </p>
            </div>
        </div>

        {/* SISI KANAN: Area Fungsional (Form Login) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 sm:p-12 relative">
            {/* Ornamen pemanis background */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-50 blur-3xl opacity-50 pointer-events-none"></div>
            
            <div className="w-full max-w-md relative z-10">
            <div className="mb-10">
                <h2 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Selamat Datang 👋</h2>
                <p className="text-slate-500 font-medium">Silakan masuk menggunakan akun portal Anda.</p>
            </div>

            {/* Alert Error dengan Desain Soft UI */}
            {error && (
                <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">{error}</span>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Email</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 outline-none shadow-sm"
                    placeholder="admin@travel.com"
                />
                </div>

                <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Kata Sandi</label>
                    <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Lupa sandi?</a>
                </div>
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 outline-none shadow-sm"
                    placeholder="••••••••"
                />
                </div>

                <div className="pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Mengautentikasi...</span>
                    </>
                    ) : (
                    'Masuk ke Sistem'
                    )}
                </button>
                </div>
            </form>
            
            {/* Footer Form */}
            <div className="mt-12 text-center">
                <p className="text-sm text-slate-500 font-medium">
                Akses terbatas hanya untuk staf & administrator.
                </p>
            </div>
            </div>
        </div>
        </main>
    );
    }