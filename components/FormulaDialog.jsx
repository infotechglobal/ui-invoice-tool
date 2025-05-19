import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { initialFormulas } from '@/lib/utils'

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
  const [form, setForm] = useState(emptyFormula)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)


  // Fetch formulas on mount
  useEffect(() => {
    const fetchFormulasAPI = async () => {
      if (open) {
        setLoading(true)
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/formula/getAllFormulas`);
          console.log(response.data)
          setFormulas(response.data)
        } catch (error) {
          // setFormulas([])
          console.error('Error fetching formulas:', error)
          toast.error('Failed to fetch formulas')
        } finally {
          setLoading(false)
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

  const handleDelete = async (idx) => {
    const formula = formulas[idx]
    console.log('Deleting formula:', formula)
    setLoading(true)
    try {
      const response =await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/formula/deleteFormula`, {
  data: { id: formula._id }
});
      if (response.status === 200) {
        setFormulas(formulas.filter((_, i) => i !== idx))
        if (editingIndex === idx) setShowForm(false)
        toast.success('Formula deleted successfully!')
      }
      else {
        toast.error('Failed to delete formula')
      }
    } catch (e) {
      console.error('Error deleting formula:', e)
      toast.error('Failed to delete formula')
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

const handleSave = async () => {
  setLoading(true);
  console.log('Saving formula:', form);


  try {
    let res;

    if (editingIndex !== null) {
      // Updating an existing formula
      res = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/formula/updateFormula`, form);
      console.log(res)
      if (res.status === 200) {
        const updatedFormula = res.data;
        const updatedFormulas = formulas.map((f, i) =>
          i === editingIndex ? updatedFormula : f
        );
        setFormulas(updatedFormulas);
        toast.success('Formula updated successfully!');
      } 
      else if(res.status == 400) {
        toast.error(res?.data?.message || 'Failed to update formula');
        
      }
      else {
        toast.error('Failed to update formula');
      }

    } else {
      // Adding a new formula
      res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/formula/createFormula`, form);

      if (res.status === 200) {
        const newFormula = res.data;
        setFormulas([...formulas, newFormula]);
        toast.success('Formula added successfully!');
        setShowForm(false);
        setForm(emptyFormula);
        setEditingIndex(null);
      }
      else if(res.status == 400) {
        toast.error(res?.data?.message || 'Failed to add formula');
      } 
       else {
        toast.error('Failed to add formula');
        console.error('Error adding formula:', res);
      }
    }
  } catch (error) {
    console.error('Error saving formula:', error);
    toast.error(error?.response?.data?.message || 'Failed to save formula');  
  } finally {
    setLoading(false);
  }
};


  const handleAddNew = () => {
    setForm(emptyFormula)
    setEditingIndex(null)
    setShowForm(true)
  }

  if (!open) return null

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-30 flex items-center justify-center z-[1000]">
      <ToastContainer position="top-right" autoClose={2500} />
      <div className="bg-white rounded-lg min-w-[350px] max-w-[700px] w-[90%] p-6 shadow-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="m-0 text-xl font-semibold">Formula</h2>
          <button
            onClick={onClose}
            className="text-xl bg-transparent border-none cursor-pointer"
          >✕</button>
        </div>
        {loading && <div className="mb-3 text-gray-600">Loading...</div>}
        <div
          className="overflow-y-auto max-h-[350px] border border-gray-200 rounded-md mb-4 bg-gray-50"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 sticky top-0">
                <th className="py-2 px-2 text-left">Code</th>
                <th className="py-2 px-2 text-left">TVA</th>
                <th className="py-2 px-2 text-left">HT</th>
                <th className="py-2 px-2 text-left">Prix TTC</th>
                <th className="py-2 px-2 text-left">Designation</th>
                <th className="py-2 px-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formulas.map((f, idx) => (
                <tr key={f.id || idx} className="even:bg-white odd:bg-gray-50">
                  <td>
                    <input
                      type="text"
                      value={f.codePennylane}
                      disabled
                      className="w-20 px-2 py-1 bg-gray-100 rounded border border-gray-200"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={f.TVA}
                      disabled
                      className="w-16 px-2 py-1 bg-gray-100 rounded border border-gray-200"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={f.HT}
                      disabled
                      className="w-20 px-2 py-1 bg-gray-100 rounded border border-gray-200"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={f.PrixTTC}
                      disabled
                      className="w-20 px-2 py-1 bg-gray-100 rounded border border-gray-200"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={f.designation}
                      disabled
                      className="w-44 px-2 py-1 bg-gray-100 rounded border border-gray-200"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(idx)}
                      className="mr-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={handleAddNew}
          className="mb-4 bg-blue-700 text-white border-none px-4 py-2 rounded hover:bg-blue-800"
        >
          + New Formula
        </button>
        {showForm && (
          <div className="bg-gray-100 p-4 rounded mb-4 shadow">
            <div className="flex flex-wrap gap-3 mb-3">
              <input
                name="codePennylane"
                placeholder="Code"
                value={form.codePennylane}
                onChange={handleChange}
                className="flex-1 min-w-[80px] px-2 py-1 border border-gray-300 rounded"
              />
              <input
                name="TVA"
                placeholder="TVA"
                type="number"
                value={form.TVA}
                onChange={handleChange}
                className="flex-1 min-w-[60px] px-2 py-1 border border-gray-300 rounded"
              />
              <input
                name="HT"
                placeholder="HT"
                type="number"
                value={form.HT}
                onChange={handleChange}
                className="flex-1 min-w-[80px] px-2 py-1 border border-gray-300 rounded"
              />
              <input
                name="PrixTTC"
                placeholder="Prix TTC"
                type="number"
                value={form.PrixTTC}
                onChange={handleChange}
                className="flex-1 min-w-[80px] px-2 py-1 border border-gray-300 rounded"
              />
              <input
                name="designation"
                placeholder="Designation"
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
                {editingIndex !== null ? 'Update' : 'Add'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingIndex(null); }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FormulaDialog
