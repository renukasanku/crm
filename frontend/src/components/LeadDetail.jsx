import { useState } from 'react';
import api from '../api/axios';
import StatusBadge from './StatusBadge';

const STATUS_OPTIONS = ['new', 'contacted', 'converted', 'lost'];

const LeadDetail = ({ lead, onClose, onUpdated, onDeleted }) => {
  const [status, setStatus] = useState(lead.status);
  const [noteText, setNoteText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleStatusChange = async (newStatus) => {
    setError('');
    try {
      const res = await api.patch(`/leads/${lead._id}/status`, { status: newStatus });
      setStatus(newStatus);
      onUpdated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.post(`/leads/${lead._id}/notes`, {
        text: noteText,
        followUpDate: followUpDate || undefined
      });
      onUpdated(res.data);
      setNoteText('');
      setFollowUpDate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await api.delete(`/leads/${lead._id}/notes/${noteId}`);
      onUpdated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note');
    }
  };

  const handleDeleteLead = async () => {
    if (!window.confirm('Delete this lead permanently?')) return;
    try {
      await api.delete(`/leads/${lead._id}`);
      onDeleted(lead._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{lead.name}</h2>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="lead-info-grid">
          <div>
            <strong>Email:</strong> {lead.email}
          </div>
          <div>
            <strong>Phone:</strong> {lead.phone || '—'}
          </div>
          <div>
            <strong>Source:</strong> {lead.source}
          </div>
          <div>
            <strong>Created:</strong> {new Date(lead.createdAt).toLocaleString()}
          </div>
        </div>

        {lead.message && (
          <div className="lead-message">
            <strong>Message:</strong>
            <p>{lead.message}</p>
          </div>
        )}

        <div className="status-section">
          <strong>Status:</strong>
          <div className="status-buttons">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                className={`status-pill ${status === s ? 'active' : ''}`}
                onClick={() => handleStatusChange(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="notes-section">
          <h3>Notes & Follow-ups</h3>
          <form onSubmit={handleAddNote} className="note-form">
            <textarea
              placeholder="Add a note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
            />
            <div className="note-form-row">
              <label>
                Follow-up date:
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </label>
              <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Add Note'}
              </button>
            </div>
          </form>

          <ul className="notes-list">
            {lead.notes && lead.notes.length > 0 ? (
              [...lead.notes]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((note) => (
                  <li key={note._id} className="note-item">
                    <div className="note-text">{note.text}</div>
                    <div className="note-meta">
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                      {note.followUpDate && (
                        <span className="follow-up-tag">
                          Follow up: {new Date(note.followUpDate).toLocaleDateString()}
                        </span>
                      )}
                      <button className="link-btn" onClick={() => handleDeleteNote(note._id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))
            ) : (
              <li className="note-empty">No notes yet.</li>
            )}
          </ul>
        </div>

        <div className="modal-footer">
          <button className="btn-danger" onClick={handleDeleteLead}>
            Delete Lead
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
