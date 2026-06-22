const STATUS_COLORS = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  converted: '#10b981',
  lost: '#ef4444'
};

const StatusBadge = ({ status }) => (
  <span
    className="status-badge"
    style={{ backgroundColor: `${STATUS_COLORS[status]}20`, color: STATUS_COLORS[status] }}
  >
    {status}
  </span>
);

export default StatusBadge;
