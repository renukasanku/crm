import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import LeadDetail from '../components/LeadDetail';

const STATUS_FILTERS = ['all', 'new', 'contacted', 'converted', 'lost'];

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/leads', { params });
      setLeads(res.data.leads);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleLeadUpdated = (updatedLead) => {
    setLeads((prev) => prev.map((l) => (l._id === updatedLead._id ? updatedLead : l)));
    setSelectedLead(updatedLead);
  };

  const handleLeadDeleted = (id) => {
    setLeads((prev) => prev.filter((l) => l._id !== id));
    setTotal((t) => t - 1);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Leads</h1>
          <span className="lead-count">{total} total</span>
        </div>

        <div className="filters-bar">
          <div className="status-tabs">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                className={`tab ${statusFilter === s ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="table-wrapper">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Source</th>
                <th>Status</th>
                <th>Created</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Loading...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} onClick={() => setSelectedLead(lead)} className="lead-row">
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.source}</td>
                    <td>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td>{lead.notes?.length || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdated={handleLeadUpdated}
          onDeleted={handleLeadDeleted}
        />
      )}
    </div>
  );
};

export default Dashboard;
