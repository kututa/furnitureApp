import "./Settings.css";

const Settings = () => (
  <div className="settings-container">
    <div className="page-header">
      <h1>Settings</h1>
      <p>Configure your admin panel and application settings</p>
    </div>

    <div className="settings-content">
      <div className="settings-section">
        <h2>General Settings</h2>
        <div className="settings-group">
          <label>Application Name</label>
          <input type="text" placeholder="FurnitureApp" disabled />
        </div>
        <div className="settings-group">
          <label>Support Email</label>
          <input type="email" placeholder="support@furnitureapp.com" />
        </div>
      </div>

      <div className="settings-section">
        <h2>Admin Settings</h2>
        <div className="settings-group">
          <label>Admin Notifications</label>
          <select>
            <option>Enable</option>
            <option>Disable</option>
          </select>
        </div>
        <div className="settings-group">
          <label>Auto-approve Users</label>
          <select>
            <option>Disabled</option>
            <option>Enabled</option>
          </select>
        </div>
      </div>

      <div className="settings-actions">
        <button className="save-btn">Save Settings</button>
        <button className="reset-btn">Reset to Default</button>
      </div>
    </div>
  </div>
);

export default Settings;
