import Sidebar from "@/components/Sidebar";

    export default function DashboardLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (
        // 1. SOLUSI MUTLAK: Gunakan h-screen (mengunci tinggi pas 1 layar) dan overflow-hidden (mencegah layar utama ikut scroll)
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        
        {/* 2. Sidebar otomatis diam di tempat (fixed) di sisi kiri */}
        <Sidebar />
        
        {/* 3. Area utama menggunakan overflow-y-auto, sehingga hanya bagian konten ini yang bisa di-scroll ke bawah */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto relative scroll-smooth">
            {children}
        </main>
        
        </div>
    );
    }