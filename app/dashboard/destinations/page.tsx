    'use client';

    import api from '@/app/lib/axios';
    import { useState, useEffect } from 'react';

    export default function DestinationsPage() {
    const [destinations, setDestinations] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ totalHalaman: 1, totalData: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // === STATE MODAL (CREATE & EDIT) ===
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // Penanda apakah ini mode Edit
    const [editId, setEditId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        estimatedPrice: '',
        image: null as File | null,
    });

        const getValidImageUrl = (imageVal: any) => {
    // Jika database kosong, mengirim string "null", atau "undefined"
    if (!imageVal || imageVal === 'null' || imageVal === 'undefined') return null;
    
    // Bersihkan backslash bawaan Windows
    let cleanPath = String(imageVal).replace(/\\/g, '/');
    
    // Jika backend sudah mengirim URL utuh (http...), langsung pakai
    if (cleanPath.startsWith('http')) return cleanPath;

    // Hapus slash di awal jika ada (mencegah double slash)
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
    
    // Pastikan direktori uploads/ selalu ada
    if (!cleanPath.startsWith('uploads/')) {
        cleanPath = `uploads/${cleanPath}`;
    }
    
    return `http://localhost:3000/${cleanPath}`;
    };

    const fetchDestinations = async () => {
        setIsLoading(true);
        try {
        const response = await api.get('/destinations', { params: { page, limit: 10, search } });
        setDestinations(response.data.data);
        setMeta(response.data.meta);
        } catch (error) {
        console.error('Gagal mengambil data', error);
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => { fetchDestinations(); }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchDestinations();
    };

    // === FUNGSI BUKA MODAL TAMBAH BARU ===
    const openCreateModal = () => {
        setIsEditMode(false);
        setEditId(null);
        setFormData({ name: '', location: '', estimatedPrice: '', image: null });
        setIsModalOpen(true);
    };

    // === FUNGSI BUKA MODAL EDIT ===
    const openEditModal = (item: any) => {
        setIsEditMode(true);
        setEditId(item.id);
        setFormData({
        name: item.name,
        location: item.location,
        estimatedPrice: item.estimatedPrice || '',
        image: null, // Kosongkan file input, user hanya upload jika ingin ganti gambar
        });
        setIsModalOpen(true);
    };

    // === FUNGSI SIMPAN (CREATE ATAU UPDATE) ===
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('location', formData.location);
        data.append('estimatedPrice', formData.estimatedPrice);
        if (formData.image) {
            data.append('image', formData.image);
        }

        if (isEditMode && editId) {
            // Tembak API PATCH jika mode Edit
            await api.patch(`/destinations/${editId}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            });
        } else {
            // Tembak API POST jika mode Tambah Baru
            await api.post('/destinations', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            });
        }

        setIsModalOpen(false);
        fetchDestinations();
        } catch (error) {
        console.error('Gagal simpan data', error);
        alert('Gagal menyimpan data.');
        } finally {
        setIsSubmitting(false);
        }
    };

    // === FUNGSI HAPUS DATA (DELETE) ===
    const handleDelete = async (id: string, name: string) => {
        // Keamanan objektif: Selalu minta konfirmasi sebelum menghapus
        if (!window.confirm(`Apakah Anda yakin ingin menghapus destinasi "${name}" secara permanen?`)) return;
        
        try {
        await api.delete(`/destinations/${id}`);
        fetchDestinations();
        } catch (error) {
        console.error('Gagal menghapus', error);
        alert('Gagal menghapus data.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Manajemen Destinasi</h1>
            <p className="text-slate-500 text-sm mt-1">Total {meta.totalData} destinasi terdaftar di sistem.</p>
            </div>
            <button 
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
            + Tambah Destinasi
            </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-3">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama destinasi..." className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" />
            <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Cari</button>
        </form>

        {/* TABEL DATA */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-600 text-sm uppercase tracking-wider font-bold">
                <th className="p-4">Foto</th>
                <th className="p-4">Nama & Lokasi</th>
                <th className="p-4">Harga Tiket</th>
                <th className="p-4 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
                ) : destinations.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Tidak ada data.</td></tr>
                ) : (
                destinations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                        <div className="w-24 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm relative group">
                            {getValidImageUrl(item.imagePath || item.image) ? (
                                <img 
                                src={getValidImageUrl(item.imagePath || item.image)!} 
                                alt={item.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => { 
                                    // SUPER FALLBACK: Jika gambar dari backend error/404, PAKSA ganti ke Borobudur
                                    e.currentTarget.onerror = null; // Mencegah infinite loop
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800&auto=format&fit=crop"; 
                                }}
                                />
                            ) : (
                                <img 
                                src="https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800&auto=format&fit=crop" 
                                alt="Placeholder Default" 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                                />
                            )}
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-sm text-slate-500">{item.location}</div>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">
                        {item.estimatedPrice ? `Rp ${item.estimatedPrice.toLocaleString('id-ID')}` : <span className="text-slate-400 italic text-xs px-2 py-1 bg-slate-100 rounded-md border border-slate-200">Belum diatur</span>}
                    </td>
                    <td className="p-4 text-center">
                        {/* TOMBOL EDIT DAN HAPUS SEKARANG AKTIF */}
                        <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 font-bold text-sm mr-3 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="text-red-500 hover:text-red-700 font-bold text-sm transition-colors">Hapus</button>
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

        {/* MODAL (UNTUK CREATE DAN EDIT) */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">
                    {isEditMode ? 'Edit Destinasi' : 'Tambah Destinasi Baru'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nama Destinasi</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Lokasi</label>
                    <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Estimasi Harga Tiket (Rp)</label>
                    <input type="number" required value={formData.estimatedPrice} onChange={(e) => setFormData({...formData, estimatedPrice: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Foto Destinasi {isEditMode && '(Biarkan kosong jika tidak ingin ganti)'}</label>
                    <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, image: e.target.files ? e.target.files[0] : null})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                </div>

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
    }