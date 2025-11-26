import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Shield, UserCog } from "lucide-react";
import apiService from "../services/apiService";
import { useNavigate } from "react-router-dom";

export default function UserManagementPage({ auth }) {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiService.getUsers(page, search);
      setUsers(res.users);
      setPages(res.pages);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  // ✅ Delete User
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await apiService.deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Change Role
  const handleRoleChange = async (id, newRole) => {
    try {
      await apiService.updateUserRole(id, newRole);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 text-white">
      {/* Back */}
      <button
        onClick={() => navigate("/admin")}
        className="flex items-center text-gray-400 mb-6 hover:text-white"
      >
        <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <UserCog className="text-blue-400" /> Manage Users
        </h2>

        <button
          onClick={() => navigate("/admin/register-user")}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold"
        >
          + Add User
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or username..."
        className="w-full p-3 bg-gray-800 rounded-lg mb-5"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="bg-gray-900 p-5 rounded-lg border border-gray-800 overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-5">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 py-5">No users found</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-3">Full Name</th>
                <th>Username</th>
                <th>Role</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-800">
                  <td className="py-3">{u.fullName}</td>
                  <td>{u.username}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-gray-800 p-2 rounded-lg"
                    >
                      <option value="Staff">Staff</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>

                  <td className="text-center">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-gray-300">
          Page {page} of {pages}
        </span>

        <button
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
