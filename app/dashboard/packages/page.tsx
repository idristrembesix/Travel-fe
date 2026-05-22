    'use client';

    import api from '@/app/lib/axios';
    import { useState, useEffect } from 'react';

    export default function PackagesPage() {
    // === STATE DATA PAKET ===
    const [packages, setPackages] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ totalHalaman: 1, totalData: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // === STATE DATA DESTINASI (UNTUK DROPDOWN) ===
    const [destinations, setDestinations] = useState<any[]>([]);

    // === STATE MODAL ===
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        quota: '',
        startDate: '',
        endDate: '',
        destinationId: '',
    });

    // 1. Tarik Data Paket Wisata
    const fetchPackages = async () => {
        setIsLoading(true);
        try {
        const response = await api.get('/packages', { params: { page, limit: 10, search } });
        setPackages(response.data.data);
        setMeta(response.data.meta);
        } catch (error) {
        console.error('Gagal mengambil data paket', error);
        } finally {
        setIsLoading(false);
        }
    };

    // 2. Tarik Data Destinasi (Untuk Dropdown Form)
    const fetchDestinationsForDropdown = async () => {
        try {
        // Ambil banyak data sekaligus untuk pilihan dropdown
        const response = await api.get('/destinations', { params: { limit: 100 } });
        setDestinations(response.data.data);
        } catch (error) {
        console.error('Gagal mengambil data destinasi untuk dropdown', error);
        }
    };

    useEffect(() => { 
        fetchPackages(); 
        fetchDestinationsForDropdown(); // Ditarik sekali saat halaman dimuat
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchPackages();
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditId(null);
        setFormData({ title: '', quota: '', startDate: '', endDate: '', destinationId: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setIsEditMode(true);
        setEditId(item.id);
        setFormData({
        title: item.title,
        quota: String(item.quota),
        // Format tanggal HTML Date Input (YYYY-MM-DD)
        startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
        destinationId: item.destinationId,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
        // Karena DTO hanya menerima JSON biasa (bukan gambar), kita pakai format JSON
        const payload = {
            title: formData.title,
            quota: Number(formData.quota), // Konversi ke angka sesuai DTO
            startDate: formData.startDate,
            endDate: formData.endDate,
            destinationId: formData.destinationId,
        };

        if (isEditMode && editId) {
            await api.patch(`/packages/${editId}`, payload);
        } else {
            await api.post('/packages', payload);
        }

        setIsModalOpen(false);
        fetchPackages();
        } catch (error: any) {
        console.error('Gagal simpan data', error);
        alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Hapus paket tur "${title}"?`)) return;
        try {
        // Endpoint yang kamu buat di BE adalah bulk delete, kita format id-nya ke dalam array
        await api.delete('/packages/bulk', { data: { ids: [id] } });
        fetchPackages();
        } catch (error) {
        console.error('Gagal menghapus', error);
        alert('Gagal menghapus data.');
        }
    };

    // Format Tanggal untuk Tampilan Tabel
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Paket Wisata</h1>
            <p className="text-slate-500 text-sm mt-1">Total {meta.totalData} paket tur tersedia.</p>
            </div>
            <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-blue-600/20">
            + Buat Paket
            </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-3">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama paket wisata..." className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" />
            <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium">Cari</button>
        </form>

        {/* TABEL DATA */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-600 text-sm uppercase tracking-wider font-bold">
                <th className="p-4">Nama Paket</th>
                <th className="p-4">Destinasi</th>
                <th className="p-4">Tanggal (Start - End)</th>
                <th className="p-4 text-center">Kuota</th>
                <th className="p-4 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
                ) : packages.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Belum ada paket wisata.</td></tr>
                ) : (
                packages.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{item.title}</td>
                    <td className="p-4 text-slate-600">
                        {/* Jika BE mengirimkan relasi destination, tampilkan namanya. Jika tidak, tampilkan ID */}
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm border border-indigo-100">
                        {item.destination?.name || 'ID Terhubung'}
                        </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                        {formatDate(item.startDate)} <span className="text-slate-400 mx-1">→</span> {formatDate(item.endDate)}
                    </td>
                    <td className="p-4 text-center font-medium">
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                        {item.quota} pax
                        </span>
                    </td>
                    <td className="p-4 text-center">
                        <button onClick={() => openEditModal(item)} className="text-blue-600 font-bold text-sm mr-3">Edit</button>
                        <button onClick={() => handleDelete(item.id, item.title)} className="text-red-500 font-bold text-sm">Hapus</button>
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

        {/* MODAL FORM */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Paket' : 'Buat Paket Baru'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Judul Paket</label>
                    <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Contoh: Japan Winter Tour" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* FITUR CANGGIH: DROPDOWN DESTINASI DINAMIS */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Pilih Destinasi Utama</label>
                    <select 
                    required 
                    value={formData.destinationId} 
                    onChange={(e) => setFormData({...formData, destinationId: e.target.value})} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                    <option value="" disabled>-- Pilih Destinasi --</option>
                    {destinations.map(dest => (
                        <option key={dest.id} value={dest.id}>{dest.name} ({dest.location})</option>
                    ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tgl Mulai</label>
                    {/* Tipe HTML Date otomatis disesuaikan DTO Backend */}
                    <input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tgl Selesai</label>
                    <input type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Kuota Peserta</label>
                    <input type="number" required value={formData.quota} onChange={(e) => setFormData({...formData, quota: e.target.value})} placeholder="Contoh: 20" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Paket'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
    }