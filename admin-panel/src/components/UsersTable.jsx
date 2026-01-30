import "./UsersTable.css";

const dummyUsers = [
  {
    _id: "1",
    email: "buyer1@example.com",
    role: "buyer",
    isApproved: true,
    isSuspended: false,
  },
  {
    _id: "2",
    email: "seller1@example.com",
    role: "seller",
    isApproved: false,
    isSuspended: false,
  },
  {
    _id: "3",
    email: "buyer2@example.com",
    role: "buyer",
    isApproved: true,
    isSuspended: true,
  },
  {
    _id: "4",
    email: "seller2@example.com",
    role: "seller",
    isApproved: false,
    isSuspended: false,
  },
];

const UsersTable = ({ users = dummyUsers, onApprove, onSuspend, onDelete }) => (
  <table className="users-table">
    <thead>
      <tr>
        <th>Email</th>
        <th>Role</th>
        <th>Approved</th>
        <th>Suspended</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {(users.length ? users : dummyUsers).map((user) => (
        <tr key={user._id}>
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
      ))}
    </tbody>
  </table>
);

export default UsersTable;
