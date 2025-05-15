import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { set } from 'date-fns'
import { initialFormulas } from '../src/lib/utils' // Assuming you have a data file with initial formulas

const emptyFormula = {
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
  const [error, setError] = useState(null)

  const API_BASE = '/api/formulas'

  // Fetch formulas on mount
  useEffect(() => {
    if (open) {
    
      setLoading(true)
      setError(null)
      // Fetch initial formulas from the API
      try{
        const response = axios.get(`process.env.NEXT_PUBLIC_API_URL}/formulas`);
        const data = response.data;
        setFormulas(data);


      }
      catch (error) {
        console.error("Error fetching formulas:", error);
        
        setError("Failed to fetch formulas");
      }
      finally {
        setLoading(false);
      }
      
    }

  }, [open])

  const handleEdit = (idx) => {
    setEditingIndex(idx)
    setForm(formulas[idx])
    setShowForm(true)
  }

  const handleDelete = async (idx) => {
    const formula = formulas[idx]
    setLoading(true)
    setError(null)
    try {
      await axios.delete(`${API_BASE}/${formula.id}`)
      setFormulas(formulas.filter((_, i) => i !== idx))
      if (editingIndex === idx) setShowForm(false)
      toast.success('Formula deleted successfully!')
    } catch (e) {
      setError('Failed to delete formula')
      toast.error('Failed to delete formula')
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      if (editingIndex !== null) {
        // Update
        const formula = formulas[editingIndex]
        const res = await axios.put(`${API_BASE}/${formula.id}`, form)
        const updatedFormula = res.data
        const updated = formulas.map((f, i) => (i === editingIndex ? updatedFormula : f))
        setFormulas(updated)
        toast.success('Formula updated successfully!')
      } else {
        // Create
        const res = await axios.post(API_BASE, form)
        const newFormula = res.data
        setFormulas([...formulas, newFormula])
        toast.success('Formula added successfully!')
      }
      setShowForm(false)
      setForm(emptyFormula)
      setEditingIndex(null)
    } catch (e) {
      setError('Failed to save formula')
      toast.error('Failed to save formula')
    }
    setLoading(false)
  }

  const handleAddNew = () => {
    setForm(emptyFormula)
    setEditingIndex(null)
    setShowForm(true)
  }

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <ToastContainer position="top-right" autoClose={2500} />
      <div style={{
        background: '#fff', borderRadius: 8, minWidth: 350, maxWidth: 700, width: '90%',
        padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Formula</h2>
          <button onClick={onClose} style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        {loading && <div style={{ marginBottom: 12 }}>Loading...</div>}
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <div
          style={{
            overflowY: 'auto',
            maxHeight: 350,
            border: '1px solid #eee',
            borderRadius: 6,
            marginBottom: 16,
            background: '#fafafa'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                <th>Code</th>
                <th>TVA</th>
                <th>HT</th>
                <th>Prix TTC</th>
                <th>Designation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formulas.map((f, idx) => (
                <tr key={f.id || idx}>
                  <td><input type="text" value={f.codePennylane} disabled style={{ width: 80 }}/></td>
                  <td><input type="number" value={f.TVA} disabled style={{ width: 60 }}/></td>
                  <td><input type="number" value={f.HT} disabled style={{ width: 80 }}/></td>
                  <td><input type="number" value={f.PrixTTC} disabled style={{ width: 80 }}/></td>
                  <td><input type="text" value={f.designation} disabled style={{ width: 180 }}/></td>
                  <td>
                    <button onClick={() => handleEdit(idx)} style={{ marginRight: 8 }}>Edit</button>
                    <button onClick={() => handleDelete(idx)} style={{ color: 'red' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={handleAddNew} style={{ marginBottom: 16, background: '#1976d2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
          + New Formula
        </button>
        {showForm && (
          <div style={{
            background: '#f9f9f9', padding: 16, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <input name="codePennylane" placeholder="Code" value={form.codePennylane} onChange={handleChange} style={{ flex: '1 1 80px' }} />
              <input name="TVA" placeholder="TVA" type="number" value={form.TVA} onChange={handleChange} style={{ flex: '1 1 60px' }} />
              <input name="HT" placeholder="HT" type="number" value={form.HT} onChange={handleChange} style={{ flex: '1 1 80px' }} />
              <input name="PrixTTC" placeholder="Prix TTC" type="number" value={form.PrixTTC} onChange={handleChange} style={{ flex: '1 1 80px' }} />
              <input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} style={{ flex: '2 1 180px' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} style={{ background: '#388e3c', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 4, cursor: 'pointer' }}>
                {editingIndex !== null ? 'Update' : 'Add'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingIndex(null); }} style={{ background: '#eee', border: 'none', padding: '6px 16px', borderRadius: 4, cursor: 'pointer' }}>
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
