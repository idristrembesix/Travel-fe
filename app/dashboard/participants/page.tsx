    'use client';

import api from '@/app/lib/axios';
    import { useState, useEffect } from 'react';

    export default function ParticipantsPage() {
    const [participants, setParticipants] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [filterSearch, setFilterSearch] = useState(''); // Menyimpan query resmi untuk API
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ totalHalaman: 1, totalData: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        identityNumber: '',
        fullName: '',
        phoneNumber: '',
    });

    const fetchParticipants = async () => {
        setIsLoading(true);
        try {
        const response = await api.get('/participants', {
            params: { page, limit: 10, search: filterSearch }
        });
        setParticipants(response.data.data);
        setMeta(response.data.meta);
        } catch (error) {
        console.error('Gagal mengambil data peserta', error);
        } finally {
        setIsLoading(false);
        }
    };

    // Pemicu Otomatis: Hanya berjalan jika halaman atau kata kunci filter resmi berubah
    useEffect(() => {
        fetchParticipants();
    }, [page, filterSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setFilterSearch(search); // Memicu useEffect secara aman
    };

    const openEditModal = (item: any) => {
        setEditId(item.id);
        setFormData({
        identityNumber: item.identityNumber,
        fullName: item.fullName,
        phoneNumber: item.phoneNumber,
        });
        setIsModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
        await api.patch(`/participants/${editId}`, formData);
        setIsModalOpen(false);
        setFilterSearch(search); // Segera perbarui tampilan data tabel
        alert('Data peserta berhasil diperbarui!');
        } catch (error) {
        console.error('Gagal memperbarui data peserta', error);
        alert('Gagal memperbarui data.');
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus peserta bernama "${name}" secara permanen?`)) return;
        try {
        await api.delete('/participants/bulk', { data: { ids: [id] } });
        fetchParticipants();
        } catch (error) {
        console.error('Gagal menghapus peserta', error);
        alert('Gagal mengeksekusi penghapusan.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-800">Daftar Induk Peserta</h1>
            <p className="text-slate-500 text-sm mt-1">Total {meta.totalData} pelanggan terdata di dalam sistem travel.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-3">
            <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari NIK, nama lengkap, atau nomor telepon..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
            />
            <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium">
            Cari
            </button>
        </form>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-600 text-sm uppercase tracking-wider font-bold">
                <th className="p-4">No. Identitas (NIK/Paspor)</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Nomor Handphone</th>
                <th className="p-4 text-center">Aksi Operasional</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Mentransfer data dari server...</td></tr>
                ) : participants.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Tidak ada data peserta ditemukan.</td></tr>
                ) : (
                participants.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-sm tracking-wider text-slate-700">{item.identityNumber}</td>
                    <td className="p-4 font-bold text-slate-800">{item.fullName}</td>
                    <td className="p-4 text-slate-600 font-medium">{item.phoneNumber}</td>
                    <td className="p-4 text-center whitespace-nowrap">
                        <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 font-bold text-sm mr-4">Edit</button>
                        <button onClick={() => handleDelete(item.id, item.fullName)} className="text-red-500 hover:text-red-700 font-bold text-sm">Hapus</button>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">Perbarui Data Peserta</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">No. Identitas (NIK / Paspor)</label>
                    <input type="text" required value={formData.identityNumber} onChange={(e) => setFormData({...formData, identityNumber: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                    <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nomor Handphone</label>
                    <input type="text" required value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none" />
                </div>
                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600">{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
    }