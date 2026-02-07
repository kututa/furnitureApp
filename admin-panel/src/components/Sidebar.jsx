import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      {/* Logo/Brand */}
      <div className="sidebar-brand">
        <h2>🛋️ FurnitureApp</h2>
        <p>Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/users"
              className={`nav-link ${isActive("/users") ? "active" : ""}`}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Users</span>
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={`nav-link ${isActive("/settings") ? "active" : ""}`}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer Info */}
      <div className="sidebar-footer">
        <p>v1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
