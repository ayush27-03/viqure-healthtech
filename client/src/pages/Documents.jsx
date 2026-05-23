import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../services/axiosConfig'
function Documents() {
  const { user, role } = useAuth()  // Remove roleId from here
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [newDoc, setNewDoc] = useState({ name: '', documentType: 'PDF', documentURL: '' })

  const roleId = user?.roleId  // Get roleId from user object

  useEffect(() => {
    if (roleId) {
      fetchDocuments()
    } else {
      console.error('roleId is undefined. User object:', user)
      setLoading(false)
    }
  }, [roleId])

  const fetchDocuments = async () => {
    if (!roleId) return
    
    try {
      let response
      if (role === 'patient') {
        response = await axiosInstance.get(`/patients/${roleId}`)
        setDocuments(response.data.documents || [])
      } else if (role === 'doctor') {
        response = await axiosInstance.get(`/doctors/${roleId}`)
        setDocuments(response.data.documents || [])
      } else if (role === 'admin') {
        setDocuments([])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  // For upload endpoint
  const handleUpload = async () => {
    if (!newDoc.name) {
      alert('Please provide document name')
      return
    }

    setUploading(true)
    try {
      let endpoint
      if (role === 'patient') {
        endpoint = `/patients/${roleId}/documents`
      } else if (role === 'doctor') {
        endpoint = `/doctors/${roleId}/documents`
      } else {
        alert('Upload not available for this role')
        return
      }
      
      await axiosInstance.post(endpoint, {
        name: newDoc.name,
        documentType: newDoc.documentType,
        documentURL: newDoc.documentURL || `/uploads/${Date.now()}_${newDoc.name.replace(/\s/g, '_')}.pdf`,
        uploadedBy: role.toUpperCase(),
        doctorId: role === 'doctor' ? roleId : null,
        appointmentId: null
      })
      
      setShowUpload(false)
      setNewDoc({ name: '', documentType: 'PDF', documentURL: '' })
      fetchDocuments()
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  // For delete endpoint
  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        let endpoint
        if (role === 'patient') {
          endpoint = `/patients/${roleId}/documents/${docId}`
        } else if (role === 'doctor') {
          endpoint = `/doctors/${roleId}/documents/${docId}`
        } else {
          return
        }
        
        await axiosInstance.delete(endpoint)
        fetchDocuments()
      } catch (error) {
        console.error('Error deleting document:', error)
        alert('Failed to delete document')
      }
    }
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF': return '📄'
      case 'IMAGE': return '🖼️'
      case 'DOC': return '📝'
      default: return '📎'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
              <p className="text-gray-500 mt-1">Manage your files and documents</p>
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span>+</span> Upload Document
            </button>
          </div>
        </div>

        {showUpload && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Document Name</label>
                <input
                  type="text"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Medical Report - 2024"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Document Type</label>
                <select
                  value={newDoc.documentType}
                  onChange={(e) => setNewDoc({ ...newDoc, documentType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PDF">PDF</option>
                  <option value="IMAGE">Image</option>
                  <option value="DOC">Document</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">File URL (or upload path)</label>
                <input
                  type="text"
                  value={newDoc.documentURL}
                  onChange={(e) => setNewDoc({ ...newDoc, documentURL: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/uploads/filename.pdf"
                />
                <p className="text-xs text-gray-400 mt-1">Enter the file path or URL where the document is stored</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={() => setShowUpload(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-800">No documents yet</h3>
            <p className="text-gray-500 mt-2">Click "Upload Document" to add your first file</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc.docId} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getFileIcon(doc.documentType)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{doc.name}</h3>
                      <p className="text-xs text-gray-500">{doc.documentType}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                      {doc.uploadedBy === 'DOCTOR' && (
                        <p className="text-xs text-blue-500 mt-1">Uploaded by Doctor</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.docId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
                <div className="mt-3">
                  <a href={doc.documentURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                    View Document
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Documents