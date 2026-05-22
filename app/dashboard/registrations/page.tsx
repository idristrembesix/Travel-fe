    'use client';

import api from '@/app/lib/axios';
    import { useState, useEffect } from 'react';
    export default function RegistrationsPage() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ totalHalaman: 1, totalData: 0 });
    const [isLoading, setIsLoading] = useState(true);
    
    const [tourPackages, setTourPackages] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        packageId: '',
        identityNumber: '',
        fullName: '',
        phoneNumber: '',
    });

    // FUNGSI TEMBAK API LANGSUNG (Tanpa state perantara)
    const fetchRegistrations = async (querySearch = search) => {
        setIsLoading(true);
        try {
        const response = await api.get('/registrations', { 
            params: { page, limit: 10, search: querySearch } 
        });
        setRegistrations(response.data.data);
        setMeta(response.data.meta);
        } catch (error) {
        console.error('Gagal mengambil data registrasi', error);
        } finally {
        setIsLoading(false);
        }
    };

    const fetchPackagesForDropdown = async () => {
        try {
        const response = await api.get('/packages', { params: { limit: 100 } });
        setTourPackages(response.data.data);
        } catch (error) {}
    };

    // Hanya tarik data dropdown 1 kali saat halaman dimuat
    useEffect(() => {
        fetchPackagesForDropdown();
    }, []);

    // Tarik data tabel setiap kali ganti halaman
    useEffect(() => {
        fetchRegistrations(search);
    }, [page]);

    // EKSEKUSI PENCARIAN MUTLAK
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchRegistrations(search); // Langsung kirim kata kunci ke API!
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
        await api.post('/registrations', formData);
        setIsModalOpen(false);
        setFormData({ packageId: '', identityNumber: '', fullName: '', phoneNumber: '' });
        setSearch(''); 
        fetchRegistrations(''); // Segarkan tabel tanpa filter
        alert('Pendaftaran berhasil ditambahkan!');
        } catch (error: any) {
        alert(error.response?.data?.message || 'Gagal menyimpan pendaftaran.');
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id: string, currentStatus: string) => {
        const newStatus = window.prompt('Ketik status baru: CONFIRMED, PENDING, atau CANCELLED', currentStatus)?.toUpperCase();
        if (!newStatus || newStatus === currentStatus) return;
        if (!['CONFIRMED', 'PENDING', 'CANCELLED'].includes(newStatus)) {
        alert('Status tidak valid!');
        return;
        }
        try {
        await api.patch(`/registrations/${id}/status`, { status: newStatus });
        fetchRegistrations(search); 
        } catch (error) {
        alert('Gagal mengubah status.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Hapus pendaftaran ini?')) return;
        try {
        await api.delete('/registrations/bulk', { data: { ids: [id] } });
        fetchRegistrations(search);
        } catch (error) {}
    };

    const renderStatusBadge = (status: string) => {
        const s = status?.toUpperCase();
        if (s === 'CONFIRMED') return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">✅ SUKSES</span>;
        if (s === 'PENDING') return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">⏳ PENDING</span>;
        if (s === 'CANCELLED') return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">❌ BATAL</span>;
        return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{status || 'UNKNOWN'}</span>;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Manajemen Registrasi</h1>
            <p className="text-slate-500 text-sm mt-1">Total {meta.totalData} pendaftar tercatat di sistem.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-blue-600/20">+ Tambah Pendaftaran</button>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-3">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari NIK, Nama Peserta, atau Nama Paket Tour..." className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" />
            <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium">Cari</button>
        </form>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-600 text-sm uppercase tracking-wider font-bold">
                <th className="p-4">Tgl Daftar</th>
                <th className="p-4">Data Peserta</th>
                <th className="p-4">Paket Tour</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Aksi (Admin)</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
                ) : registrations.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Belum ada pendaftaran yang masuk / ditemukan.</td></tr>
                ) : (
                registrations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-500 font-medium whitespace-nowrap">{formatDate(item.createdAt || item.registeredAt)}</td>
                    <td className="p-4">
                        <div className="font-bold text-slate-800">{item.participant?.fullName || 'User Tidak Diketahui'}</div>
                        <div className="text-sm text-blue-600 font-medium">NIK: {item.participant?.identityNumber || '-'}</div>
                    </td>
                    <td className="p-4"><div className="font-bold text-slate-700">{item.package?.title || 'Paket Dihapus/Kosong'}</div></td>
                    <td className="p-4 text-center">{renderStatusBadge(item.status)}</td>
                    <td className="p-4 text-center">
                        <button onClick={() => handleUpdateStatus(item.id, item.status)} className="text-indigo-600 font-bold text-sm mr-4">Ubah Status</button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 font-bold text-sm">Hapus</button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        <div className="mt-6 flex justify-between items-center text-sm text-slate-500">
            <p>Halaman {page} dari {meta.totalHalaman}</p>
            <div className="flex gap-2">
            <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">Mundur</button>
            <button onClick={() => setPage((prev) => Math.min(prev + 1, meta.totalHalaman))} disabled={page === meta.totalHalaman || meta.totalHalaman === 0} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">Lanjut</button>
            </div>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Form Pendaftaran Baru</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Pilih Paket Wisata</label>
                    <select required value={formData.packageId} onChange={(e) => setFormData({...formData, packageId: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="" disabled>-- Pilih Paket Tour --</option>
                    {tourPackages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">NIK / No. Identitas</label>
                    <input type="text" required value={formData.identityNumber} onChange={(e) => setFormData({...formData, identityNumber: e.target.value})} placeholder="Masukkan NIK Peserta" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                    <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Contoh: Ahmad Faqih" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nomor Handphone</label>
                    <input type="tel" required value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} placeholder="Contoh: 08123456789" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600">{isSubmitting ? 'Memproses...' : 'Daftarkan Peserta'}</button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
    }