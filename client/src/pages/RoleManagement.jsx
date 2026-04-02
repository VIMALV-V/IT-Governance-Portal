import React, { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiSave, FiShield, FiLayers } from "react-icons/fi";

const permissionOptions = [
  { value: "view_data", label: "View Data" },
  { value: "edit_data", label: "Edit Data" },
  { value: "delete_records", label: "Delete Records" },
  { value: "manage_users", label: "Manage Users" },
  { value: "manage_roles", label: "Manage Roles" },
  { value: "view_audit_logs", label: "View Audit Logs" },
  { value: "export_reports", label: "Export Reports" },
];

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", permissions: [] });
  const [saving, setSaving] = useState(false);

  const permissionMap = useMemo(() => Object.fromEntries(permissionOptions.map((option) => [option.value, option.label])), []);

  const stats = useMemo(() => {
    const custom = roles.filter((r) => !r.isSystem).length;
    const system = roles.filter((r) => r.isSystem).length;
    return { custom, system };
  }, [roles]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin/roles");
      setRoles(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const createRole = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    setSaving(true);
    try {
      await API.post("/admin/roles", {
        name: form.name.trim(),
        description: form.description.trim(),
        permissions: form.permissions,
      });
      toast.success("Role created");
      setForm({ name: "", description: "", permissions: [] });
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create role");
    } finally {
      setSaving(false);
    }
  };

  const updateRolePermissions = async (roleId, permissions) => {
    try {
      await API.put(`/admin/roles/${roleId}`, { permissions });
      toast.success("Role permissions updated");
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const deleteRole = async (roleId) => {
    try {
      await API.delete(`/admin/roles/${roleId}`);
      toast.success("Role deleted");
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete role");
    }
  };

  const togglePermission = (current, permission) => {
    if (current.includes(permission)) return current.filter((item) => item !== permission);
    return [...current, permission];
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Role Management</h1>
        <p>Define fine-grained permission packs and control enterprise access boundaries.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "14px" }}>
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}><FiLayers /> Total Roles</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{roles.length}</div>
        </div>
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}><FiShield /> System Roles</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{stats.system}</div>
        </div>
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Custom Roles</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{stats.custom}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "minmax(280px, 1fr) 2fr" }}>
        <div className="card" style={{ padding: "18px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Create Role</h3>
          <form onSubmit={createRole} style={{ display: "grid", gap: "10px" }}>
            <input className="input-field" placeholder="Role name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <textarea className="input-field" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            <div className="card" style={{ padding: "10px", maxHeight: "250px", overflowY: "auto" }}>
              {permissionOptions.map((option) => (
                <label key={option.value} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", marginBottom: "8px" }}>
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(option.value)}
                    onChange={() => setForm((prev) => ({ ...prev, permissions: togglePermission(prev.permissions, option.value) }))}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <button className="btn-primary" disabled={saving}><FiPlus size={14} /> Create Role</button>
          </form>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Existing Roles</h3>
          {loading ? (
            <div>Loading roles...</div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {roles.map((role) => {
                const currentPermissions = role.permissions || [];
                return (
                  <div key={role._id} className="card" style={{ padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{role.name} {role.isSystem ? "(System)" : ""}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{role.description || "No description"}</div>
                      </div>
                      {!role.isSystem && (
                        <button className="btn-danger" onClick={() => deleteRole(role._id)}><FiTrash2 size={13} /> Delete</button>
                      )}
                    </div>

                    <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "8px" }}>
                      {permissionOptions.map((option) => (
                        <label key={option.value} style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "12px" }}>
                          <input
                            type="checkbox"
                            checked={currentPermissions.includes(option.value)}
                            onChange={() => updateRolePermissions(role._id, togglePermission(currentPermissions, option.value))}
                          />
                          {permissionMap[option.value]}
                        </label>
                      ))}
                    </div>

                    <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {currentPermissions.map((permission) => <span key={permission} className="badge-active">{permissionMap[permission] || permission}</span>)}
                    </div>

                    <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiSave size={12} /> Changes save immediately
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default RoleManagement;
