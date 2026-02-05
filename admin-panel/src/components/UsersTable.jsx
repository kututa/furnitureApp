import "./UsersTable.css";

const UsersTable = ({ users = [], onApprove, onSuspend, onDelete }) => (
  <table className="users-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Approved</th>
        <th>Suspended</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.length === 0 ? (
        <tr>
          <td colSpan={6} style={{ textAlign: "center", padding: "16px" }}>
            No users found.
          </td>
        </tr>
      ) : (
        users.map((user) => (
          <tr key={user._id}>
            <td>{user.fullName || "N/A"}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{user.isApproved ? "Yes" : "No"}</td>
            <td>{user.isSuspended ? "Yes" : "No"}</td>
            <td>
              {!user.isApproved && (
                <button
                  className="approve-btn"
                  onClick={() => onApprove && onApprove(user._id)}
                >
                  Approve
                </button>
              )}
              <button
                className="suspend-btn"
                onClick={() => onSuspend && onSuspend(user._id)}
              >
                {user.isSuspended ? "Reactivate" : "Suspend"}
              </button>
              <button
                className="delete-btn"
                onClick={() => onDelete && onDelete(user._id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default UsersTable;
