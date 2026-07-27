function DashboardCard({ title, value, icon, color }) {
  return (
    <div className={`card shadow-sm border-0 h-100 border-start border-4 ${color}`}>
      <div className="card-body d-flex justify-content-between align-items-center">

        <div>
          <h6 className="text-muted">{title}</h6>
          <h3 className="fw-bold">{value}</h3>
        </div>

        <div style={{ fontSize: "35px" }}>
          {icon}
        </div>

      </div>
    </div>
  );
}

export default DashboardCard;