import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { initialFormulas } from '@/lib/utils'
import ConfirmDialog from './ConfirmDialog'
import { set } from 'date-fns'
const emptyTarrif = {
  _id: null,
  tarrifCode: "",
  TVA: "",
  designation: "",
  x: "100",
  description: "",
}

const TarrifDialog = ({ open = true, onClose }) => {
  const [tarrifs, setTarrifs] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [form, setForm] = useState(emptyTarrif)
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
  const [error, setError] = useState("");

  const openConfirm = ({ action, idx = null, form = null, title, message }) => {
    setConfirm({ open: true, action, idx, form, title, message });
  };

  // Fetch tarrifs on mount
  useEffect(() => {
    const fetchTarrifsAPI = async () => {
      if (open) {
        setIsFetching(true)
        setLoading(true)
        const infoId = toast.loading('Fetching tarrifs...')
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tarrif/getAllTarrifs`);
          setTarrifs(response.data)
          toast.dismiss(infoId)
        } catch (error) {
          console.error('Error fetching tarrifs:', error)
          toast.dismiss(infoId)
          toast.error('Failed to fetch tarrifs')
        } finally {
          setLoading(false)
          setIsFetching(false)
        }
      }
    }
    fetchTarrifsAPI()
  }, [open])

  const handleEdit = (idx) => {
    setEditingIndex(idx)
    setForm(tarrifs[idx])
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
    const tarrif = tarrifs[idx];
    const infoId = toast.info('Deleting...')
    setLoading(true);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tarrif/deleteTarrif`,
        { data: { id: tarrif._id } }
      );
      toast.dismiss(infoId);
      if (response.status === 200) {
        setTarrifs(tarrifs.filter((_, i) => i !== idx));
        if (editingIndex === idx) setShowForm(false);
        toast.success("Tarrif deleted successfully!");
      } else {
        toast.error("Failed to delete tarrif");
      }
    } catch (e) {
      toast.dismiss(infoId);
      toast.error("Failed to delete tarrif");
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/tarrif/updateTarrif`,
          formToSave
        );
        toast.dismiss(infoId);
        if (res.status === 200) {
          const updatedTarrif = res.data;
          const updatedTarrifs = tarrifs.map((f, i) =>
            i === idx ? updatedTarrif : f
          );
          setTarrifs(updatedTarrifs);

          toast.success("Tarrif updated successfully!");
        } else if (res.status === 400) {
          toast.error(res?.data?.message || "Failed to update tarrif");
        } else {
          toast.error("Failed to update tarrif");
        }
      } else {
        // Add
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/tarrif/createTarrif`,
          formToSave
        );
        toast.dismiss(infoId);
        if (res.status === 200) {
          const newTarrif = res.data;
          setTarrifs([...tarrifs, newTarrif]);
          toast.success("Tarrif added successfully!");
          setShowForm(false);
          setForm(emptyTarrif);
          setEditingIndex(null);
        } else if (res.status === 400) {
          toast.error(res?.data?.message || "Failed to add tarrif");
        } else {
          toast.error("Failed to add tarrif");
        }
      }
    } catch (error) {
      toast.dismiss(infoId);
      toast.error(error?.response?.data?.message || "Failed to save tarrif");
    } finally {
      toast.dismiss(infoId);
      setLoading(false);
    }
  };

  const handleDelete = (idx) => {
    openConfirm({
      action: "delete",
      idx,
      title: "Delete Tarrif",
      message: "Are you sure you want to delete this tarrif?",
    });
  };

  const handleSave = async () => {
    // Validation for x

     if(!form.tarrifCode || !form.designation  || !form.TVA || !form.x ) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const xValue = parseFloat(form.x);
    if (isNaN(xValue) || xValue < 1 || xValue > 100) {
      setError("La valeur de X doit être comprise entre 1 et 100.");
      return;
    }
    const tvaValue = parseFloat(form.TVA);
    if (isNaN(tvaValue) || tvaValue < 1 || tvaValue > 100) {
      setError("La valeur de TVA doit être comprise entre 0 et 100.");
      return;
    }
   

    setError("");
    openConfirm({
      action: "save",
      idx: editingIndex,
      form,
      title: editingIndex !== null ? "Update Tarrif" : "Add Tarrif",
      message:
        editingIndex !== null
          ? "Are you sure you want to update this tarrif?"
          : "Are you sure you want to add this tarrif?",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setError(""); // Clear error on change
  }

  const handleAddNew = () => {
    if (showForm) {
      setShowForm(false)
      setEditingIndex(null)
      setForm(emptyTarrif)
      return;
    }

    setForm({ ...emptyTarrif, x: "100" }) // Ensure x is set to 100 by default
    setEditingIndex(null)
    setShowForm(true)
  }

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
      <div className="bg-white rounded-lg min-w-[350px] max-w-[1100px] w-[95%] p-6 shadow-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="m-0 text-xl font-semibold">Tarrifs</h2>
          <button
            onClick={onClose}
            className="text-xl bg-transparent border-none cursor-pointer"
          >✕</button>
        </div>
        <div className="overflow-y-auto max-h-[350px] border border-gray-200 rounded-md mb-4 bg-gray-50">
          <table className="min-w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '10%' }} /> {/* Code */}
              <col style={{ width: '20%' }} /> {/* Designation */}
              <col style={{ width: '10%' }} /> {/* TVA */}
              <col style={{ width: '10%' }} /> {/* X */}
              <col style={{ width: '30%' }} /> {/* Description */}
              <col style={{ width: '20%' }} /> {/* Actions */}
            </colgroup>

            <thead>
              <tr className="bg-gray-100 sticky top-0">
                <th className="py-2 px-2 text-left">Code Tarrifaire</th>
                <th className="py-2 px-2 text-left">Designation</th>
                <th className="py-2 px-2 text-left">TVA</th>
                <th className="py-2 px-2 text-left">X % of Montant</th>
                <th className="py-2 px-2 text-left">TTC et autres détails</th>
                <th className="py-2 px-2 text-left">Actions</th>
              </tr>
            </thead>
            {!isFetching &&
              <tbody>
                {tarrifs.map((t, idx) => (
                  <tr key={t.id || t._id || idx} className="even:bg-gray-100 odd:bg-gray-200">
                    <td>
                      <input
                        type="text"
                        value={t.tarrifCode}
                        disabled
                        className="w-20 px-1 py-1 rounded bg-none "
                      />
                    </td>
                    <td className="">
                      <div className="w-full px-2 py-1  rounded  whitespace-pre-wrap break-words min-h-[48px]">
                        {t.designation}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={`${Number(t.TVA).toFixed(2)}%`}
                          disabled
                          className="w-20 px-2 py-1  rounded  "
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={`${Number(t.x).toFixed(2)}%`}
                        disabled
                        className="w-full px-2 py-1  rounded"
                      />
                    </td>
                    <td className="align-top">
                      <div className="w-full px-2 py-1 rounded whitespace-pre-wrap break-words min-h-[48px] max-w-[260px]">
                        {t.description}
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="flex gap-2 items-center justify-center h-full">
                        <button
                          onClick={() => handleEdit(idx)}
                          className="mr-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            }
          </table>
        </div>
        <button
          onClick={handleAddNew}
          disabled={loading || isFetching}
          className="mb-4 bg-blue-700 text-white border-none px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          {showForm ? 'Fermer le formulaire' : '+  Ajouter un nouveau tarrif'}
        </button>
        {showForm && (
          <div className="bg-gray-100 p-4 rounded mb-4 shadow">
            <div className="flex flex-wrap gap-3 mb-3">
              
              <input
                name="tarrifCode"
                placeholder="Code"
                value={form.tarrifCode}
                required
                onChange={handleChange}
                className="w-20 px-2 py-1 border border-gray-300 rounded"
              />
              <input
                name="designation"
                placeholder="Designation"
                required
                value={form.designation}
                onChange={handleChange}
                className="flex-2 min-w-[280px] px-2 py-1 border border-gray-300 rounded"
              />
              <div className="flex items-center">
                <input
                  name="TVA"
                  placeholder="TVA"
                  required
                  type="number"
                  value={form.TVA}
                  onChange={handleChange}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
                <span className="ml-1 text-gray-500">%</span>
              </div>
              <div className="flex items-center">
                <input
                  name="x"
                  placeholder="X (1-100)"
                  type="number"
                  step="0.01"
                  min="1"
                  max="100"
                  value={form.x}
                  onChange={handleChange}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
                <span className="ml-1 text-gray-500">%</span>
              </div>
              <input
                name="description"
                placeholder="Description"
                type="text"
                value={form.description}
                onChange={handleChange}
                className="flex-1 min-w-96 px-2 py-1 border border-gray-300 rounded"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm mb-2">{error}</div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
              >
                {editingIndex !== null ? 'Mise à jour' : 'Ajouter'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingIndex(null); setError(""); }}
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

export default TarrifDialog
