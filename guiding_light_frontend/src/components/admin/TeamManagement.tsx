/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Loader, Trash2, Edit3, Image as ImageIcon, Mail, Users, Upload, User, Layers } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  image_url?: string;
  display_order?: number;
}

export default function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1); // Row Number
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/guiding_light_backend/get_team.php');
      const data = await response.json();
      if (!data.error) setMembers(data);
    } catch (err) {
      console.error("Failed to fetch team:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // Instantly move a member to a different row
  const handleRowChange = async (id: number, newRow: number) => {
    setIsUpdatingOrder(true);
    
    // Optimistic UI Update
    setMembers(members.map(m => m.id === id ? { ...m, display_order: newRow } : m));

    try {
      await fetch('/guiding_light_backend/update_team_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ id, display_order: newRow }])
      });
    } catch (err) {
      console.error("Failed to sync row change", err);
      alert("Network error while moving team member.");
      fetchTeam(); // Revert on failure
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleOpenModal = (member?: TeamMember) => {
    if (member) {
      setEditingId(member.id);
      setName(member.name);
      setRole(member.role);
      setEmail(member.email || '');
      setDisplayOrder(member.display_order || 1);
      setImagePreview(member.image_url || null);
    } else {
      setEditingId(null);
      setName('');
      setRole('');
      setEmail('');
      setDisplayOrder(1); // Default to Row 1
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return alert("Name and Role are required");

    setIsSaving(true);
    const formData = new FormData();
    if (editingId) formData.append('id', editingId.toString());
    formData.append('name', name);
    formData.append('role', role);
    formData.append('email', email);
    formData.append('display_order', displayOrder.toString());

    if (imageFile) formData.append('image', imageFile);

    try {
      const response = await fetch('/guiding_light_backend/save_team_member.php', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchTeam();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to save team member.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, memberName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;

    try {
      const response = await fetch('/guiding_light_backend/delete_team_member.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) fetchTeam();
      else alert(data.error);
    } catch (err) {
      alert("Failed to delete member.");
    }
  };

  // Group members by their assigned Row
  const groupedMembers = members.reduce((acc, member) => {
    const row = member.display_order || 1;
    if (!acc[row]) acc[row] = [];
    acc[row].push(member);
    return acc;
  }, {} as Record<number, TeamMember[]>);

  const sortedRows = Object.keys(groupedMembers).map(Number).sort((a, b) => a - b);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-2xl font-serif italic text-stone-700">Team Hierarchy</h2>
          <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-bold">Assign members to rows to build the org chart</p>
        </div>
        <div className="flex items-center gap-4">
          {isUpdatingOrder && <Loader className="w-4 h-4 text-stone-400 animate-spin" />}
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center bg-[#4b5e52] text-white px-5 py-3 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-[#3a4740] hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Member
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader className="w-8 h-8 text-[#4b5e52] animate-spin" /></div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-stone-100 p-16 text-center shadow-sm">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-serif italic text-stone-600 mb-2">No Team Members Found</h3>
          <p className="text-sm text-stone-400">Click the button above to start building your organization chart.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedRows.map(rowNum => (
            <div key={rowNum} className="bg-stone-50/50 rounded-[32px] p-8 border border-stone-200/60">
              <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
                <Layers className="w-5 h-5 text-[#4b5e52]" />
                <h3 className="text-lg font-bold text-stone-700">Row {rowNum}</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-2">
                  ({groupedMembers[rowNum].length} Member{groupedMembers[rowNum].length !== 1 ? 's' : ''})
                </span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6">
                {groupedMembers[rowNum].map((member) => (
                  <motion.div layout key={member.id} className="bg-white rounded-[24px] p-6 border border-stone-200 shadow-sm flex flex-col items-center text-center relative group w-64 transition-shadow hover:shadow-md">
                    
                    {/* Floating Action Buttons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={() => handleOpenModal(member)} className="p-2 bg-stone-100 text-stone-600 hover:bg-[#4b5e52] hover:text-white rounded-full transition-colors shadow-sm" title="Edit Profile">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(member.id, member.name)} className="p-2 bg-stone-100 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors shadow-sm" title="Delete Profile">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Circular Avatar */}
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-stone-50 shadow-sm bg-stone-100 flex items-center justify-center">
                      {member.image_url ? (
                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-stone-300" />
                      )}
                    </div>
                    
                    <h3 className="text-md font-bold text-stone-800">{member.name}</h3>
                    <p className="text-[10px] text-[#4b5e52] font-bold uppercase tracking-widest mb-4">{member.role}</p>
                    
                    {/* Quick Row Assignment */}
                    <div className="mt-auto w-full pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Move to:</span>
                      <select
                        value={member.display_order || 1}
                        onChange={(e) => handleRowChange(member.id, parseInt(e.target.value))}
                        className="text-xs font-bold text-stone-700 bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer hover:bg-stone-200 transition-colors"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>Row {num}</option>
                        ))}
                      </select>
                    </div>

                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-[32px] shadow-2xl p-8 max-w-md w-full my-auto">
              
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif italic text-stone-800">{editingId ? 'Edit Member' : 'Add Team Member'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-stone-100 transition-colors"><X className="w-5 h-5 text-stone-400" /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Avatar Uploader */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full border-4 border-dashed border-stone-200 overflow-hidden relative cursor-pointer group hover:border-[#4b5e52] transition-colors flex items-center justify-center bg-stone-50"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-stone-300 group-hover:text-[#4b5e52] transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-3">Click to upload photo</p>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-700 text-sm font-bold" />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Role / Position</label>
                    <input type="text" required value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., CEO" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-700 text-sm" />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Row Assignment</label>
                    <select 
                      value={displayOrder} 
                      onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-700 text-sm font-bold appearance-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>Row {num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Contact Email (Optional)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-700 text-sm" />
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={isSaving} className="w-full bg-[#4b5e52] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-[#3a4740] hover:scale-[1.02] transition-all disabled:opacity-70 flex justify-center items-center">
                    {isSaving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isSaving ? 'Saving...' : 'Save Team Member'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}