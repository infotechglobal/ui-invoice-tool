import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { initialFormulas } from '@/lib/utils'
import ConfirmDialog from './ConfirmDialog'
import { set } from 'date-fns'

const emptyTarrif = {
  _id: null,
  TVA: "",
  designation: "",
  x: "100",
  description: "",
}

// Helper function to validate French number format
const isValidFrenchNumber = (value) => {
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  if (trimmed === '') return false;
  
  // French number format rules:
  // - Only one comma allowed (decimal separator)
  // - Spaces allowed as thousands separator
  // - No other special characters except digits, one comma, and spaces
  
  const commaCount = (trimmed.match(/,/g) || []).length;
  
  // More than one comma is invalid
  if (commaCount > 1) return false;
  
  // Check if it matches valid French number pattern
  // Pattern: optional digits with spaces, optional comma with decimal part
  const frenchNumberPattern = /^[\d\s]*,?\d*$/;
  
  return frenchNumberPattern.test(trimmed);
}

// Helper function to convert French number format to English
const convertFrenchToEnglishNumber = (value) => {
  if (typeof value !== 'string') return value;
  
  // Remove spaces (thousands separator in French)
  let cleaned = value.replace(/\s/g, '');
  
  // Replace French decimal comma with English decimal point
  return cleaned.replace(',', '.');
}

// Helper function to parse and validate number from string
const parseNumberFromString = (value) => {
  if (!value || value.trim() === '') return null;
  
  const trimmed = value.trim();
  
  // First validate if it's a valid French number format
  if (!isValidFrenchNumber(trimmed)) return null;
  
  // Convert French format to English format
  const englishFormat = convertFrenchToEnglishNumber(trimmed);
  
  // Parse the number
  const parsed = parseFloat(englishFormat);
  
  return isNaN(parsed) ? null : parsed;
}

const TarrifDialog = ({ open = true, onClose }) => {
  const [tarrifs, setTarrifs] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [form, setForm] = useState(emptyTarrif)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
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
        setFetchError(null) // Reset fetch error state
        const infoId = toast.loading('Fetching tarrifs...')
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tarrif/getAllTarrifs`);
          setTarrifs(response.data)
          toast.dismiss(infoId)
        } catch (error) {
          toast.dismiss(infoId)
          console.error('Error fetching tarrifs:', error)
          
          // Set the appropriate error message
          if (error?.response?.data?.message) {
            setFetchError(error.response.data.message)
          } else if (error?.response?.status === 401) {
            setFetchError("Veuillez autoriser l'accès à Google Drive")
            toast.error("Veuillez autoriser l'accès à Google Drive");
          } else {
            setFetchError("Échec du chargement des tarifs. Veuillez réessayer.")
            toast.error('Échec du chargement des tarifs')
          }
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
    // Convert numbers back to strings for editing
    const tarrifToEdit = {
      ...tarrifs[idx],
      TVA: tarrifs[idx].TVA ? tarrifs[idx].TVA.toString() : "",
      x: tarrifs[idx].x ? tarrifs[idx].x.toString() : "100"
    };
    setForm(tarrifToEdit)
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
    // Validation with French number format support
    if(!form.designation || !form.TVA || !form.x) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Validate and parse X value with French format support
    if (!isValidFrenchNumber(form.x)) {
      setError("Format de X invalide. Utilisez le format français (ex: 99,5 ou 12 345,67)");
      return;
    }
    
    const xValue = parseNumberFromString(form.x);
    if (xValue === null || xValue < 0 || xValue > 100) {
      setError("La valeur de X doit être comprise entre 0 et 100.");
      return;
    }

    // Validate and parse TVA value with French format support
    if (!isValidFrenchNumber(form.TVA)) {
      setError("Format de TVA invalide. Utilisez le format français (ex: 20,5 ou 99,99)");
      return;
    }
    
    const tvaValue = parseNumberFromString(form.TVA);
    if (tvaValue === null || tvaValue < 0 || tvaValue > 100) {
      setError("La valeur de TVA doit être comprise entre 0 et 100.");
      return;
    }

    setError("");

    // Prepare form data with converted numbers for backend
    const formDataForBackend = {
      ...form,
      TVA: tvaValue,
      x: xValue
    };

    openConfirm({
      action: "save",
      idx: editingIndex,
      form: formDataForBackend, // Send the converted form data
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

  const handleRetry = () => {
    // Reset error state and retry fetching
    setFetchError(null);
    const fetchTarrifsAPI = async () => {
      setIsFetching(true);
      setLoading(true);
      const infoId = toast.loading('Fetching tarrifs...');
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tarrif/getAllTarrifs`);
        setTarrifs(response.data);
        toast.dismiss(infoId);
      } catch (error) {
        toast.dismiss(infoId);
        console.error('Error fetching tarrifs:', error);
        if (error?.response?.data?.message) {
          setFetchError(error.response.data.message);
        } else if (error?.response?.status === 401) {
          setFetchError("Veuillez autoriser l'accès à Google Drive");
          toast.error("Veuillez autoriser l'accès à Google Drive");
        } else {
          setFetchError("Échec du chargement des tarifs. Veuillez réessayer.");
          toast.error('Échec du chargement des tarifs');
        }
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };
    fetchTarrifsAPI();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-[1000] overflow-y-auto">
      <div className="fixed inset-0 w-full h-full" onClick={onClose}></div>
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <div className="bg-white rounded-lg min-w-[350px] max-w-[1100px] w-[95%] max-h-[90vh] p-6 shadow-2xl relative z-[1001] my-4">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
          <h2 className="m-0 text-2xl font-semibold text-gray-800">Gérer Tarifs</h2>
          <button
            onClick={onClose}
            className="text-xl bg-transparent border-none cursor-pointer hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center"
            aria-label="Close dialog"
          >✕</button>
        </div>
        
        {/* Show loading state */}
        {isFetching && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Chargement des tarifs...</p>
          </div>
        )}

        {/* Show error state */}
        {fetchError && !isFetching && (
          <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-semibold text-red-700 mb-2">Erreur de chargement des tarifs</h3>
            <p className="text-red-600 text-center mb-6">{fetchError}</p>
            <div className="flex gap-4">
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Show table when data is loaded successfully and there's no error */}
        {!isFetching && !fetchError && (
          <div>
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
                    <th className="py-2 px-2 text-left">X % du Montant</th>
                    <th className="py-2 px-2 text-left">TTC et autres détails</th>
                    <th className="py-2 px-2 text-left">Actions</th>
                  </tr>
                </thead>
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
                  {/* Removed tarrifCode input */}
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
                      placeholder="TVA (ex: 20,5)"
                      required
                      type="text"
                      value={form.TVA}
                      onChange={handleChange}
                      className="w-20 px-2 py-1 border border-gray-300 rounded"
                    />
                    <span className="ml-1 text-gray-500">%</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      name="x"
                      placeholder="X (ex: 99,5)"
                      type="text"
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
        )}
      </div>
    </div>
  )
}

export default TarrifDialog