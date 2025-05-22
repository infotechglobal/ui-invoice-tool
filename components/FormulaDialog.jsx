import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { initialFormulas } from '@/lib/utils'
import ConfirmDialog from './ConfirmDialog'
import { set } from 'date-fns'
const emptyFormula = {
  _id: null,
  codePennylane: "",
  TVA: "",
  HT: "",
  PrixTTC: "",
  designation: "",
}

const FormulaDialog = ({ open = true, onClose }) => {
  const [formulas, setFormulas] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)
  const [isFeteching, setIsFetching] = useState(false)  
  const [form, setForm] = useState(emptyFormula)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState({
    open: false,
    action: null,
    idx: null,
    form: null,
    message: "",
    title: "",
  });
  const openConfirm = ({ action, idx = null, form = null, title, message }) => {
    setConfirm({ open: true, action, idx, form, title, message });
  };

  // Fetch formulas on mount
useEffect(() => {
  const fetchFormulasAPI = async () => {
    if (open) {
      setIsFetching(true)
      setLoading(true)
      const infoId = toast.loading('Fetching formulas...')
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/formula/getAllFormulas`);
        setFormulas(response.data)
        toast.dismiss(infoId)
       
      } catch (error) {
        console.error('Error fetching formulas:', error)
        toast.dismiss(infoId)
        toast.error('Failed to fetch formulas')
      } finally {
        setLoading(false)
        setIsFetching(false)
      }
    }
  }
  fetchFormulasAPI()
}, [open])


  const handleEdit = (idx) => {
    setEditingIndex(idx)
    setForm(formulas[idx])
    setShowForm(true)
  }

  // Handler for confirmation
  const handleConfirm = async () => {
    setConfirm((c) => ({ ...c, open: false }));
    if (confirm.action === "delete") {
      await doDelete(confirm.idx);
    } else if (confirm.action === "save") {
      await doSave(confirm.form, confirm.idx);
    }
  };

  // Handler for cancel
  const handleCancel = () => setConfirm((c) => ({ ...c, open: false }));

  // Actual delete logic
  const doDelete = async (idx) => {
    const formula = formulas[idx];
    const infoId = toast.info('Deleting...')
    setLoading(true);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/formula/deleteFormula`,
        { data: { id: formula._id } }
      );
      toast.dismiss(infoId);
      if (response.status === 200) {
        setFormulas(formulas.filter((_, i) => i !== idx));
        if (editingIndex === idx) setShowForm(false);
        toast.success("Formula deleted successfully!");
      } else {
        toast.error("Failed to delete formula");
      }
    } catch (e) {
      toast.dismiss(infoId);
      toast.error("Failed to delete formula");
    }
    finally {
      setLoading(false);
    }

  };

  // Actual save logic
  const doSave = async (formToSave, idx) => {
    setLoading(true);
    const infoId = toast.info('Saving...')
    try {
      let res;
      if (idx !== null) {
        // Update
        res = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/formula/updateFormula`,
          formToSave
        );
        toast.dismiss(infoId);
        if (res.status === 200) {
          const updatedFormula = res.data;
          const updatedFormulas = formulas.map((f, i) =>
            i === idx ? updatedFormula : f
          );
          setFormulas(updatedFormulas);

          toast.success("Formula updated successfully!");
        } else if (res.status === 400) {
          toast.error(res?.data?.message || "Failed to update formula");
        } else {
          toast.error("Failed to update formula");
        }
      } else {
        // Add
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/formula/createFormula`,
          formToSave
        );
        toast.dismiss(infoId);
        if (res.status === 200) {
          const newFormula = res.data;
          setFormulas([...formulas, newFormula]);
          toast.success("Formula added successfully!");
          setShowForm(false);
          setForm(emptyFormula);
          setEditingIndex(null);
        } else if (res.status === 400) {
          toast.error(res?.data?.message || "Failed to add formula");
        } else {
          toast.error("Failed to add formula");
        }
      }
    } catch (error) {
      toast.dismiss(infoId);
      toast.error(error?.response?.data?.message || "Failed to save formula");
    } finally {
      toast.dismiss(infoId);
      setLoading(false);
    }
  };

  const handleDelete = (idx) => {
    openConfirm({
      action: "delete",
      idx,
      title: "Delete Formula",
      message: "Are you sure you want to delete this formula?",
    });
  };

  const handleSave = async () => {
    openConfirm({
      action: "save",
      idx: editingIndex,
      form,
      title: editingIndex !== null ? "Update Formula" : "Add Formula",
      message:
        editingIndex !== null
          ? "Are you sure you want to update this formula?"
          : "Are you sure you want to add this formula?",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleAddNew = () => {
    setForm(emptyFormula)
    setEditingIndex(null)
    setShowForm(true)
  }

  // Calculate PrixTTC automatically when HT or TVA changes in the form
  useEffect(() => {
    const ht = parseFloat(form.HT);
    const tva = parseFloat(form.TVA);
    if (!isNaN(ht) && !isNaN(tva)) {
      const prixTTC = ht + (tva / 100) * ht;
      setForm((prev) => ({
        ...prev,
        PrixTTC: prixTTC,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.HT, form.TVA]);

  if (!open) return null
 

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-30 flex items-center justify-center z-[1000]">
    
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <div className="bg-white rounded-lg min-w-[350px] max-w-[900px] w-[90%] p-6 shadow-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="m-0 text-xl font-semibold">Formule</h2>
          <button
            onClick={onClose}
            className="text-xl bg-transparent border-none cursor-pointer"
          >✕</button>
        </div>
        
        <div
          className="overflow-y-auto max-h-[350px] border border-gray-200 rounded-md mb-4 bg-gray-50"
        >
          <table className="min-w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '8%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '43%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-100 sticky top-0">
                <th className="py-2 px-2 text-left">Code Tarifare</th>
                <th className="py-2 px-2 text-left">TVA</th>
                <th className="py-2 px-2 text-left">HT</th>
                <th className="py-2 px-2 text-left">Prix TTC</th>
                <th className="py-2 px-2 text-left">Designation</th>
                <th className="py-2 px-2 text-left">Actions</th>
              </tr>
            </thead>
            { !isFeteching &&
            <tbody>
              {formulas.map((f, idx) => (
                <tr key={f.id || f._id || idx} className="even:bg-white odd:bg-gray-50">
                  <td>
                    <input
                      type="text"
                      value={f.codePennylane}
                      disabled
                      className="w-20 px-1 py-1 bg-gray-100 rounded border border-gray-200"
                    />
                  </td>
                  <td>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={`${Number(f.TVA).toFixed(2)}%`}
                        disabled
                        className="w-20 px-2 py-1 bg-gray-100 rounded border border-gray-200"
                      />
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={Number(f.HT).toFixed(2)}
                      disabled
                      className="w-full px-2 py-1 bg-gray-100 rounded border border-gray-200"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={Number(f.PrixTTC).toFixed(2)}
                      disabled
                      className="w-full px-2 py-1 bg-gray-100 rounded border border-gray-200"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={f.designation}
                      disabled
                      className="w-full px-2 py-1 bg-gray-100 rounded border border-gray-200"
                    />
                  </td>
                  <td className='flex gap-2'>
                    <button
                      onClick={() => handleEdit(idx)}
                      className="mr-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="px-3 py-1  bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            }
          </table>
        </div>
        <button
          onClick={handleAddNew}
          disabled={loading || isFeteching }
          className="mb-4 bg-blue-700 text-white border-none px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          + Nouvelle formule
        </button>
        {showForm && (
          <div className="bg-gray-100 p-4 rounded mb-4 shadow">
            <div className="flex flex-wrap gap-3 mb-3">
              <input
                name="codePennylane"
                placeholder="Code"
                value={form.codePennylane}
                required
                onChange={handleChange}
                className="flex-1 min-w-[80px] px-2 py-1 border border-gray-300 rounded"
              />
              <input
                name="TVA"
                placeholder="TVA"
                required
                type="number"
                value={form.TVA}
                onChange={handleChange}
                className="flex-1 min-w-[60px] px-2 py-1 border border-gray-300 rounded"
              />
              <input
                name="HT"
                placeholder="HT"
                type="number"
                required
                value={form.HT}
                onChange={handleChange}
                className="flex-1 min-w-[80px] px-2 py-1 border border-gray-300 rounded"
              />
              <input
                name="PrixTTC"
                placeholder="Prix TTC"
                required
                type="number"
                value={
                  form.HT && form.TVA
                    ? (
                      parseFloat(form.HT) +
                      (parseFloat(form.TVA) / 100) * parseFloat(form.HT)
                    ).toFixed(2)
                    : ""
                }
                disabled
                className="flex-1 min-w-[80px] px-2 py-1 border border-gray-300 rounded bg-gray-200 cursor-not-allowed"
              />
              <input
                name="designation"
                placeholder="Designation"
                required
                value={form.designation}
                onChange={handleChange}
                className="flex-2 min-w-[180px] px-2 py-1 border border-gray-300 rounded"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
              >
                {editingIndex !== null ? 'Mise à jour' : 'Ajouter'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingIndex(null); }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FormulaDialog
