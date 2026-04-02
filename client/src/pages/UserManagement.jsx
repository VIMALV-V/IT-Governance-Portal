import React, { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import { FiSearch, FiUserCheck, FiUserX, FiRefreshCw, FiUsers, FiShield } from "react-icons/fi";
import { toast } from "react-toastify";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const roleOptions = useMemo(() => roles.map((role) => ({ value: role._id, label: role.name })), [roles]);

  const stats = useMemo(() => {
    const active = users.filter((u) => u.isActive).length;
    const inactive = users.filter((u) => !u.isActive).length;
    return { active, inactive };
  }, [users]);

  const fetchRoles = async () => {
    const response = await API.get("/admin/roles");
    setRoles(response.data);
  };

  const fetchUsers = async (nextPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: "10" });
      if (query.trim()) params.set("q", query.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (roleFilter !== "all") params.set("role", roleFilter);

      const response = await API.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.data || []);
      setPagination(response.data.pagination || { pages: 1, total: 0 });
      setPage(nextPage);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchRoles(), fetchUsers(1)]).catch(() => {
      toast.error("Failed to initialize user management");
    });
  }, []);

  const updateUser = async (userId, updates) => {
    setSavingUserId(userId);
    try {
      await API.patch(`/admin/users/${userId}/access`, updates);
      toast.success("User updated");
      fetchUsers(page);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setSavingUserId("");
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Admin User Management</h1>
        <p>Assign roles, enforce status controls, and maintain identity hygiene.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "14px" }}>
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}><FiUsers /> Loaded Users</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{users.length}</div>
        </div>
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}><FiUserCheck /> Active</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{stats.active}</div>
        </div>
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}><FiUserX /> Inactive</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{stats.inactive}</div>
        </div>
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}><FiShield /> Total in Org</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{pagination.total}</div>
        </div>
      </div>

      <div className="card" style={{ padding: "16px", marginBottom: "16px", display: "grid", gap: "12px", gridTemplateColumns: "minmax(180px, 1fr) 180px 160px auto" }}>
        <div style={{ position: "relative" }}>
          <FiSearch style={{ position: "absolute", left: 10, top: 10, color: "var(--text-muted)" }} />
          <input
            className="input-field"
            style={{ paddingLeft: "34px" }}
            value={query}
            placeholder="Search by name or email"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select className="input-field" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          {roles.map((role) => <option key={role._id} value={role.name}>{role.name}</option>)}
        </select>

        <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button className="btn-secondary" onClick={() => fetchUsers(1)}>
          <FiRefreshCw size={14} /> Apply Filters
        </button>
      </div>

      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: "24px", textAlign: "center" }}>Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "24px", textAlign: "center" }}>No users found</td></tr>
              ) : users.map((user) => {
                const selectedRoleIds = (user.roles || []).map((role) => role._id);
                const isSaving = savingUserId === user._id;

                return (
                  <tr key={user._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{user.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{user.email}</div>
                    </td>
                    <td>
                      <select
                        className="input-field"
                        multiple
                        value={selectedRoleIds}
                        style={{ minWidth: "210px", minHeight: "84px" }}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions).map((option) => option.value);
                          updateUser(user._id, { roleIds: values });
                        }}
                        disabled={isSaving}
                      >
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={user.isActive ? "badge-approved" : "badge-rejected"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={user.isActive ? "btn-danger" : "btn-success"}
                        disabled={isSaving}
                        onClick={() => updateUser(user._id, { isActive: !user.isActive })}
                      >
                        {user.isActive ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Total users: {pagination.total}</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-secondary" disabled={page <= 1} onClick={() => fetchUsers(page - 1)}>Previous</button>
          <button className="btn-secondary" disabled={page >= pagination.pages} onClick={() => fetchUsers(page + 1)}>Next</button>
        </div>
      </div>
    </Layout>
  );
}

export default UserManagement;
