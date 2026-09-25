// src/components/national/ManageLeaders.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// =========================================================
// ALL DISTRICTS IN RWANDA - Hardcoded fallback
// =========================================================

const ALL_DISTRICTS = [
  'Gasabo',
  'Kicukiro',
  'Nyarugenge',
  'Musanze',
  'Rubavu',
  'Rulindo',
  'Gakenke',
  'Burera',
  'Huye',
  'Nyanza',
  'Muhanga',
  'Ruhango',
  'Gisagara',
  'Nyagatare',
  'Gatsibo',
  'Kayonza',
  'Rwamagana',
  'Ngoma',
  'Rusizi',
  'Nyamasheke',
  'Karongi',
  'Ngororero',
];

// =========================================================
// NATIONAL DASHBOARD MODULE PERMISSIONS
//
// IMPORTANT:
// The "permissionKey" values MUST match the permission
// names checked by Sidebar.jsx / usePermissions.
//
// Example:
// members -> canManageMembers
// events -> canManageEvents
// statistics -> canViewStatistics
// =========================================================

const PERMISSION_MODULES = {
  members: {
    label: 'Manage Members',
    permissionKey: 'canManageMembers',
    actions: [
      'view',
      'create',
      'edit',
      'delete',
      'export',
      'import',
    ],
    icon: 'fa-users',
  },

  events: {
    label: 'National Events',
    permissionKey: 'canManageEvents',
    actions: [
      'view',
      'create',
      'edit',
      'delete',
      'export',
      'manage_attendance',
    ],
    icon: 'fa-calendar-alt',
  },

  statistics: {
    label: 'Reports & Stats',
    permissionKey: 'canViewStatistics',
    actions: [
      'view',
      'export',
    ],
    icon: 'fa-chart-bar',
  },

  announcements: {
    label: 'Manage Announcements',
    permissionKey: 'canManageAnnouncements',
    actions: [
      'view',
      'create',
      'edit',
      'delete',
    ],
    icon: 'fa-bullhorn',
  },

  reports: {
    label: 'Received Reports',
    permissionKey: 'canManageReports',
    actions: [
      'view',
      'create',
      'edit',
      'delete',
      'export',
      'approve',
    ],
    icon: 'fa-file-alt',
  },

  courses: {
    label: 'Manage Courses',
    permissionKey: 'canManageCourses',
    actions: [
      'view',
      'create',
      'edit',
      'delete',
      'enroll',
      'export',
    ],
    icon: 'fa-book',
  },

  projects: {
    label: 'Received Projects',
    permissionKey: 'canManageProjects',
    actions: [
      'view',
      'create',
      'edit',
      'delete',
      'approve',
      'export',
    ],
    icon: 'fa-project-diagram',
  },

  payments: {
    label: 'Payments',
    permissionKey: 'canManagePayments',
    actions: [
      'view',
      'create',
      'edit',
      'delete',
      'export',
      'approve',
    ],
    icon: 'fa-credit-card',
  },

  marketplace: {
    label: 'Marketplace',
    permissionKey: 'canManageMarketplace',
    actions: [
      'view',
      'create',
      'edit',
      'delete',
      'export',
    ],
    icon: 'fa-store',
  },

  news: {
    label: 'News Management',
    permissionKey: 'canManageNews',
    actions: [
      'view',
      'create',
      'edit',
      'delete',
      'export',
    ],
    icon: 'fa-newspaper',
  },
};

// =========================================================
// ACTION LABELS
// =========================================================

const ACTION_LABELS = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export',
  import: 'Import',
  approve: 'Approve',
  enroll: 'Enroll',
  manage_attendance: 'Manage Attendance',
};

// =========================================================
// COMPONENT
// =========================================================

const ManageLeaders = () => {
  const { user } = useAuth();

  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] =
    useState(false);

  const [selectedLeader, setSelectedLeader] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [districts, setDistricts] =
    useState(ALL_DISTRICTS);

  const [expandedModules, setExpandedModules] =
    useState({});

  // =======================================================
  // SUPER ADMIN PERMISSION
  // =======================================================

  const isSuperAdmin =
    user?.role === 'super-admin' ||
    user?.role === 'super_admin' ||
    user?.permissions?.canManageSuperAdmins === true ||
    user?.permissions?.isSuperAdmin === true;

  // =======================================================
  // FORM DATA
  // =======================================================

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    district: '',
    role: 'national_commissioner',
  });

  // =======================================================
  // SELECTED PERMISSIONS
  // =======================================================

  const [selectedPermissions, setSelectedPermissions] =
    useState({});

  const [assignedDistricts, setAssignedDistricts] =
    useState([]);

  // =======================================================
  // CREATE EMPTY PERMISSION OBJECT
  // =======================================================

  const createEmptyPermissions = () => {
    const permissions = {};

    Object.keys(PERMISSION_MODULES).forEach(
      (moduleKey) => {
        permissions[moduleKey] = [];
      }
    );

    return permissions;
  };

  // =======================================================
  // GET MODULE PERMISSIONS FROM EXISTING LEADER
  //
  // Supports:
  // 1. permissions.modules
  // 2. direct canManage... flags
  //
  // This is important for compatibility with records that
  // were saved before this permission fix.
  // =======================================================

  const getInitialPermissions = (leader) => {
    const result = createEmptyPermissions();

    const perms = leader?.permissions || {};
    const modulePerms = perms.modules || {};

    Object.keys(PERMISSION_MODULES).forEach(
      (moduleKey) => {
        const module =
          PERMISSION_MODULES[moduleKey];

        const savedActions =
          Array.isArray(modulePerms[moduleKey])
            ? modulePerms[moduleKey]
            : [];

        if (savedActions.length > 0) {
          result[moduleKey] = [
            ...savedActions,
          ];
          return;
        }

        // -------------------------------------------------
        // Backward-compatible fallback:
        // if direct permission flag is true but there are
        // no granular actions, give VIEW access.
        // -------------------------------------------------

        if (
          perms[module.permissionKey] === true
        ) {
          result[moduleKey] = ['view'];
        }
      }
    );

    return result;
  };

  // =======================================================
  // BUILD FINAL PERMISSIONS
  //
  // Saves BOTH:
  //
  // permissions.modules.members
  //
  // AND:
  //
  // permissions.canManageMembers
  //
  // This makes the granular system and Sidebar work
  // together.
  // =======================================================

  const buildPermissionsPayload = (
    permissionSelection,
    selectedDistricts,
    role
  ) => {
    const permissions = {
      modules: {},
      assignedDistricts: Array.isArray(
        selectedDistricts
      )
        ? [...selectedDistricts]
        : [],
    };

    Object.keys(PERMISSION_MODULES).forEach(
      (moduleKey) => {
        const module =
          PERMISSION_MODULES[moduleKey];

        const actions = Array.isArray(
          permissionSelection[moduleKey]
        )
          ? permissionSelection[moduleKey]
          : [];

        // -------------------------------------------------
        // Keep granular module permissions.
        // -------------------------------------------------

        if (actions.length > 0) {
          permissions.modules[moduleKey] = [
            ...actions,
          ];
        }

        // -------------------------------------------------
        // IMPORTANT:
        // Sidebar checks the direct permissionKey.
        //
        // Any selected action means the module is enabled.
        // No selected actions means the module is disabled.
        // -------------------------------------------------

        permissions[module.permissionKey] =
          actions.length > 0;
      }
    );

    // -----------------------------------------------------
    // Super Admin receives full access.
    // -----------------------------------------------------

    if (
      role === 'super_admin' ||
      role === 'super-admin'
    ) {
      permissions.isSuperAdmin = true;
      permissions.canManageSuperAdmins = true;

      Object.keys(PERMISSION_MODULES).forEach(
        (moduleKey) => {
          const module =
            PERMISSION_MODULES[moduleKey];

          permissions[module.permissionKey] = true;

          permissions.modules[moduleKey] = [
            ...module.actions,
          ];
        }
      );
    }

    return permissions;
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchLeaders();
    fetchDistricts();
  }, []);

  // =======================================================
  // CLEAR MESSAGES
  // =======================================================

  useEffect(() => {
    if (!error && !success) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setError('');
      setSuccess('');
    }, 6000);

    return () => clearTimeout(timer);
  }, [error, success]);

  // =======================================================
  // FETCH LEADERS
  // =======================================================

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('token');

      const response = await axios.get(
        `${API_URL}/national/leaders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const leadersData =
        response.data?.leaders ||
        response.data ||
        [];

      setLeaders(
        Array.isArray(leadersData)
          ? leadersData
          : []
      );
    } catch (err) {
      console.error(
        'Fetch leaders error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to load leaders'
      );

      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // FETCH DISTRICTS
  // =======================================================

  const fetchDistricts = async () => {
    try {
      const token =
        localStorage.getItem('token');

      const response = await axios.get(
        `${API_URL}/national/districts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const districtsData =
        response.data?.districts ||
        response.data ||
        [];

      if (
        Array.isArray(districtsData) &&
        districtsData.length > 0
      ) {
        const districtNames =
          districtsData
            .map((district) => {
              if (
                typeof district ===
                'string'
              ) {
                return district;
              }

              return (
                district.name ||
                district.district_name ||
                district.code ||
                String(district)
              );
            })
            .filter(Boolean);

        if (districtNames.length > 0) {
          setDistricts(districtNames);
        }
      }
    } catch (err) {
      console.error(
        'Failed to load districts, using fallback:',
        err
      );

      setDistricts(ALL_DISTRICTS);
    }
  };

  // =======================================================
  // SEARCH
  // =======================================================

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // =======================================================
  // FORM CHANGE
  // =======================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  // =======================================================
  // PERMISSION TOGGLE
  // =======================================================

  const handlePermissionToggle = (
    moduleKey,
    action
  ) => {
    setSelectedPermissions((previous) => {
      const currentActions =
        Array.isArray(previous[moduleKey])
          ? previous[moduleKey]
          : [];

      const newActions =
        currentActions.includes(action)
          ? currentActions.filter(
              (item) => item !== action
            )
          : [
              ...currentActions,
              action,
            ];

      return {
        ...previous,
        [moduleKey]: newActions,
      };
    });
  };

  // =======================================================
  // TOGGLE ALL MODULE ACTIONS
  // =======================================================

  const handleToggleAllActions = (
    moduleKey
  ) => {
    setSelectedPermissions((previous) => {
      const module =
        PERMISSION_MODULES[moduleKey];

      if (!module) {
        return previous;
      }

      const currentActions =
        Array.isArray(previous[moduleKey])
          ? previous[moduleKey]
          : [];

      const allActions =
        module.actions;

      const areAllSelected =
        allActions.every(
          (action) =>
            currentActions.includes(action)
        );

      return {
        ...previous,
        [moduleKey]: areAllSelected
          ? []
          : [...allActions],
      };
    });
  };

  // =======================================================
  // CHECK ALL ACTIONS
  // =======================================================

  const areAllActionsSelected = (
    moduleKey
  ) => {
    const module =
      PERMISSION_MODULES[moduleKey];

    if (!module) {
      return false;
    }

    const currentActions =
      Array.isArray(
        selectedPermissions[moduleKey]
      )
        ? selectedPermissions[moduleKey]
        : [];

    return (
      module.actions.length > 0 &&
      module.actions.every(
        (action) =>
          currentActions.includes(action)
      )
    );
  };

  // =======================================================
  // MODULE EXPANSION
  // =======================================================

  const toggleModuleExpansion = (
    moduleKey
  ) => {
    setExpandedModules((previous) => ({
      ...previous,
      [moduleKey]:
        !previous[moduleKey],
    }));
  };

  // =======================================================
  // DISTRICT TOGGLE
  // =======================================================

  const handleDistrictToggle = (
    districtName
  ) => {
    setAssignedDistricts((previous) =>
      previous.includes(districtName)
        ? previous.filter(
            (district) =>
              district !== districtName
          )
        : [
            ...previous,
            districtName,
          ]
    );
  };

  // =======================================================
  // SELECT ALL DISTRICTS
  // =======================================================

  const handleSelectAllDistricts = () => {
    if (
      assignedDistricts.length ===
      districts.length
    ) {
      setAssignedDistricts([]);
    } else {
      setAssignedDistricts([
        ...districts,
      ]);
    }
  };

  // =======================================================
  // ADD NATIONAL COMMISSIONER
  // =======================================================

  const handleAddLeader = async (e) => {
    e.preventDefault();

    if (!isSuperAdmin) {
      setError(
        '❌ Only Super National Commissioners can add new National Commissioners'
      );
      return;
    }

    if (!formData.fullName.trim()) {
      setError(
        'Full name is required'
      );
      return;
    }

    if (!formData.email.trim()) {
      setError(
        'Email is required'
      );
      return;
    }

    if (!formData.password) {
      setError(
        'Password is required'
      );
      return;
    }

    if (
      formData.password.length < 6
    ) {
      setError(
        'Password must be at least 6 characters'
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        'Passwords do not match'
      );
      return;
    }

    if (!formData.district) {
      setError(
        'Please select a district'
      );
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token =
        localStorage.getItem('token');

      const permissions =
        buildPermissionsPayload(
          selectedPermissions,
          assignedDistricts,
          formData.role
        );

      const leaderData = {
        fullName:
          formData.fullName.trim(),

        email:
          formData.email.trim(),

        password:
          formData.password,

        phone:
          formData.phone?.trim() || '',

        district:
          formData.district,

        role:
          formData.role ||
          'national_commissioner',

        permissions,
      };

      console.log(
        'Creating National Commissioner with permissions:',
        permissions
      );

      await axios.post(
        `${API_URL}/national/leaders`,
        leaderData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        '✅ National Commissioner added successfully!'
      );

      resetForm();

      setTimeout(() => {
        setShowAddModal(false);
        fetchLeaders();
      }, 1000);
    } catch (err) {
      console.error(
        'Add leader error:',
        err
      );

      setError(
        err.response?.data?.message ||
          '❌ Failed to add National Commissioner'
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // UPDATE PERMISSIONS
  // =======================================================

  const handleUpdatePermissions =
    async (e) => {
      e.preventDefault();

      if (!isSuperAdmin) {
        setError(
          '❌ Only Super National Commissioners can update permissions'
        );
        return;
      }

      if (!selectedLeader?.id) {
        setError(
          '❌ No National Commissioner selected'
        );
        return;
      }

      setError('');
      setSuccess('');

      try {
        const token =
          localStorage.getItem('token');

        const permissions =
          buildPermissionsPayload(
            selectedPermissions,
            assignedDistricts,
            selectedLeader.role
          );

        console.log(
          'Updating National Commissioner permissions:',
          permissions
        );

        await axios.put(
          `${API_URL}/national/leaders/${selectedLeader.id}/permissions`,
          {
            permissions,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setSuccess(
          '✅ Permissions updated successfully!'
        );

        setShowPermissionsModal(
          false
        );

        setSelectedLeader(null);
        setSelectedPermissions({});
        setAssignedDistricts([]);
        setExpandedModules({});

        await fetchLeaders();
      } catch (err) {
        console.error(
          'Update permissions error:',
          err
        );

        setError(
          err.response?.data?.message ||
            '❌ Failed to update permissions'
        );
      }
    };

  // =======================================================
  // DELETE LEADER
  // =======================================================

  const handleDeleteLeader =
    async (id) => {
      if (!isSuperAdmin) {
        setError(
          '❌ Only Super National Commissioners can remove National Commissioners'
        );
        return;
      }

      if (!id) {
        setError(
          '❌ Invalid National Commissioner ID'
        );
        return;
      }

      if (
        !window.confirm(
          'Are you sure you want to remove this National Commissioner?'
        )
      ) {
        return;
      }

      try {
        const token =
          localStorage.getItem('token');

        await axios.delete(
          `${API_URL}/national/leaders/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setSuccess(
          '✅ National Commissioner removed successfully!'
        );

        await fetchLeaders();
      } catch (err) {
        console.error(
          'Delete leader error:',
          err
        );

        setError(
          err.response?.data?.message ||
            '❌ Failed to remove leader'
        );
      }
    };

  // =======================================================
  // TOGGLE STATUS
  // =======================================================

  const handleToggleStatus =
    async (
      id,
      currentStatus
    ) => {
      if (!isSuperAdmin) {
        setError(
          '❌ Only Super National Commissioners can change status'
        );
        return;
      }

      if (!id) {
        setError(
          '❌ Invalid National Commissioner ID'
        );
        return;
      }

      const newStatus =
        currentStatus === 'active'
          ? 'inactive'
          : 'active';

      try {
        const token =
          localStorage.getItem('token');

        await axios.put(
          `${API_URL}/national/leaders/${id}/status`,
          {
            status:
              newStatus,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setSuccess(
          `✅ National Commissioner ${
            newStatus === 'active'
              ? 'activated'
              : 'deactivated'
          }!`
        );

        await fetchLeaders();
      } catch (err) {
        console.error(
          'Toggle status error:',
          err
        );

        setError(
          err.response?.data?.message ||
            '❌ Failed to update status'
        );
      }
    };

  // =======================================================
  // RESET FORM
  // =======================================================

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      district: '',
      role: 'national_commissioner',
    });

    setSelectedPermissions(
      createEmptyPermissions()
    );

    setAssignedDistricts([]);
    setExpandedModules({});
  };

  // =======================================================
  // OPEN ADD MODAL
  // =======================================================

  const openAddModal = () => {
    setError('');
    setSuccess('');

    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      district: '',
      role: 'national_commissioner',
    });

    setSelectedPermissions(
      createEmptyPermissions()
    );

    setAssignedDistricts([]);
    setExpandedModules({});

    setShowAddModal(true);
  };

  // =======================================================
  // CLOSE ADD MODAL
  // =======================================================

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  // =======================================================
  // OPEN PERMISSIONS MODAL
  // =======================================================

  const openPermissionsModal = (
    leader
  ) => {
    if (!isSuperAdmin) {
      setError(
        '❌ Only Super National Commissioners can manage permissions'
      );
      return;
    }

    if (!leader) {
      setError(
        '❌ No National Commissioner selected'
      );
      return;
    }

    setError('');
    setSuccess('');

    setSelectedLeader(leader);

    const initialPermissions =
      getInitialPermissions(leader);

    setSelectedPermissions(
      initialPermissions
    );

    const perms =
      leader.permissions || {};

    const existingDistricts =
      Array.isArray(
        perms.assignedDistricts
      )
        ? perms.assignedDistricts
        : [];

    setAssignedDistricts(
      existingDistricts
    );

    setExpandedModules({});

    setShowPermissionsModal(
      true
    );
  };

  // =======================================================
  // CLOSE PERMISSIONS MODAL
  // =======================================================

  const closePermissionsModal = () => {
    setShowPermissionsModal(false);
    setSelectedLeader(null);
    setSelectedPermissions({});
    setAssignedDistricts([]);
    setExpandedModules({});
  };

  // =======================================================
  // CHECK SPECIFIC PERMISSION
  // =======================================================

  const hasPermission = (
    leader,
    moduleKey,
    action
  ) => {
    const perms =
      leader?.permissions || {};

    const modulePerms =
      perms.modules || {};

    const actions =
      Array.isArray(
        modulePerms[moduleKey]
      )
        ? modulePerms[moduleKey]
        : [];

    if (actions.includes(action)) {
      return true;
    }

    const module =
      PERMISSION_MODULES[moduleKey];

    return module
      ? perms[module.permissionKey] ===
          true && action === 'view'
      : false;
  };

  // =======================================================
  // PERMISSION SUMMARY
  // =======================================================

  const getPermissionSummary =
    (leader) => {
      const perms =
        leader?.permissions || {};

      const modulePerms =
        perms.modules || {};

      const summary = [];

      Object.keys(
        PERMISSION_MODULES
      ).forEach((moduleKey) => {
        const module =
          PERMISSION_MODULES[moduleKey];

        const actions =
          Array.isArray(
            modulePerms[moduleKey]
          )
            ? modulePerms[moduleKey]
            : [];

        const directPermission =
          perms[module.permissionKey] ===
          true;

        if (
          actions.length > 0 ||
          directPermission
        ) {
          const actionText =
            actions.length > 0
              ? actions.length
              : 'View';

          summary.push(
            `${module.label} (${actionText})`
          );
        }
      });

      return summary.length > 0
        ? summary.join(', ')
        : 'No permissions';
    };

  // =======================================================
  // COUNT ENABLED MODULES
  // =======================================================

  const getEnabledModuleCount =
    (leader) => {
      const perms =
        leader?.permissions || {};

      const modulePerms =
        perms.modules || {};

      return Object.keys(
        PERMISSION_MODULES
      ).filter((moduleKey) => {
        const module =
          PERMISSION_MODULES[moduleKey];

        const actions =
          Array.isArray(
            modulePerms[moduleKey]
          )
            ? modulePerms[moduleKey]
            : [];

        return (
          actions.length > 0 ||
          perms[module.permissionKey] ===
            true
        );
      }).length;
    };

  // =======================================================
  // STATUS BADGE
  // =======================================================

  const getStatusBadge = (
    status
  ) => {
    if (
      status === 'active'
    ) {
      return 'badge-approved';
    }

    if (
      status === 'pending'
    ) {
      return 'badge-pending';
    }

    if (
      status === 'inactive'
    ) {
      return 'badge-rejected';
    }

    return 'badge-default';
  };

  // =======================================================
  // STATUS TEXT
  // =======================================================

  const getStatusText = (
    status
  ) => {
    const map = {
      active: 'Active',
      pending: 'Pending',
      inactive: 'Inactive',
      suspended: 'Suspended',
    };

    return (
      map[status] ||
      status ||
      'Pending'
    );
  };

  // =======================================================
  // FILTER LEADERS
  // =======================================================

  const safeLeaders =
    Array.isArray(leaders)
      ? leaders
      : [];

  const filteredLeaders =
    safeLeaders.filter(
      (leader) => {
        const fullName = (
          leader.fullName ||
          leader.name ||
          ''
        ).toLowerCase();

        const email = (
          leader.email ||
          ''
        ).toLowerCase();

        const search =
          searchTerm.toLowerCase();

        return (
          fullName.includes(
            search
          ) ||
          email.includes(
            search
          )
        );
      }
    );

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading leaders...</p>
      </div>
    );
  }

  // =======================================================
  // RETURN
  // =======================================================

  return (
    <div className="dashboard-container">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="page-header">
        <div>
          <h2>
            <i
              className="fas fa-user-tie"
              style={{
                color: '#FFD100',
              }}
            ></i>{' '}
            National Commissioner Management
          </h2>

          <p>
            Add and manage National Commissioners with
            granular permissions
          </p>

          {!isSuperAdmin && (
            <div className="permission-warning">
              <i
                className="fas fa-lock"
                style={{
                  color: '#FF6B6B',
                }}
              ></i>

              <span
                style={{
                  color: '#FF6B6B',
                  fontSize: '14px',
                }}
              >
                You have read-only access. Only Super
                National Commissioners can manage
                commissioners.
              </span>
            </div>
          )}
        </div>

        {isSuperAdmin && (
          <button
            className="btn-primary"
            onClick={openAddModal}
          >
            <i className="fas fa-user-plus"></i>{' '}
            Add National Commissioner
          </button>
        )}
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="console-log console-log-error">
          <i className="fas fa-exclamation-circle"></i>

          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* ===================================================
          SUCCESS
      =================================================== */}

      {success && (
        <div className="console-log console-log-success">
          <i className="fas fa-check-circle"></i>

          <div>
            <strong>Success</strong>
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* ===================================================
          SEARCH
      =================================================== */}

      <div className="search-filter-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="stats-info">
          <span>
            Total:{' '}
            <strong>
              {filteredLeaders.length}
            </strong>{' '}
            National Commissioners
          </span>

          {isSuperAdmin && (
            <span className="super-admin-badge">
              <i className="fas fa-crown"></i>{' '}
              Super Admin
            </span>
          )}
        </div>
      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SIN</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>District</th>
              <th>Status</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeaders.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center"
                >
                  No National Commissioners found
                </td>
              </tr>
            ) : (
              filteredLeaders.map(
                (leader, index) => {
                  const fullName =
                    leader.fullName ||
                    leader.name ||
                    'N/A';

                  const perms =
                    leader.permissions ||
                    {};

                  const leaderAssignedDistricts =
                    Array.isArray(
                      perms.assignedDistricts
                    )
                      ? perms.assignedDistricts
                      : [];

                  const districtDisplay =
                    leaderAssignedDistricts.length >
                    0
                      ? leaderAssignedDistricts
                          .slice(0, 2)
                          .join(', ') +
                        (
                          leaderAssignedDistricts.length >
                          2
                            ? ` +${
                                leaderAssignedDistricts.length -
                                2
                              } more`
                            : ''
                        )
                      : 'All districts';

                  const uniqueKey =
                    leader.id
                      ? `${leader.id}-${index}`
                      : `leader-${index}`;

                  const isSuperAdminUser =
                    leader.role ===
                      'super-admin' ||
                    leader.role ===
                      'super_admin' ||
                    leader.permissions
                      ?.isSuperAdmin === true;

                  return (
                    <tr
                      key={uniqueKey}
                    >
                      <td>
                        <strong>
                          {leader.sin ||
                            '—'}
                        </strong>
                      </td>

                      <td>
                        {fullName}

                        {isSuperAdminUser && (
                          <span
                            className="super-badge"
                          >
                            Super
                          </span>
                        )}
                      </td>

                      <td>
                        {leader.email ||
                          'N/A'}
                      </td>

                      <td>
                        <div className="district-info">
                          <span className="district-name">
                            {typeof leader.district ===
                            'string'
                              ? leader.district
                              : (
                                  leader
                                    .district
                                    ?.name ||
                                  leader
                                    .district
                                    ?.district_name ||
                                  leader
                                    .district
                                    ?.code ||
                                  'N/A'
                                )}
                          </span>

                          {districtDisplay !==
                            'All districts' && (
                            <small className="assigned-districts-small">
                              Assigned:{' '}
                              {
                                districtDisplay
                              }
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusBadge(
                            leader.status
                          )}`}
                        >
                          {getStatusText(
                            leader.status
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="permission-summary">
                          <span className="permission-count">
                            {
                              getEnabledModuleCount(
                                leader
                              )
                            }{' '}
                            modules
                          </span>

                          <span className="permission-detail">
                            {getPermissionSummary(
                              leader
                            )}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="action-buttons">
                          {isSuperAdmin ? (
                            <>
                              <button
                                type="button"
                                className="btn-sm btn-permissions"
                                onClick={() =>
                                  openPermissionsModal(
                                    leader
                                  )
                                }
                                title="Manage Permissions"
                              >
                                <i className="fas fa-key"></i>
                              </button>

                              <button
                                type="button"
                                className="btn-sm btn-toggle"
                                onClick={() =>
                                  handleToggleStatus(
                                    leader.id,
                                    leader.status
                                  )
                                }
                                title={
                                  leader.status ===
                                  'active'
                                    ? 'Deactivate'
                                    : 'Activate'
                                }
                              >
                                <i
                                  className={`fas ${
                                    leader.status ===
                                    'active'
                                      ? 'fa-pause'
                                      : 'fa-play'
                                  }`}
                                ></i>
                              </button>

                              <button
                                type="button"
                                className="btn-sm btn-delete"
                                onClick={() =>
                                  handleDeleteLeader(
                                    leader.id
                                  )
                                }
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </>
                          ) : (
                            <span className="read-only-badge">
                              <i className="fas fa-lock"></i>{' '}
                              Read Only
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ===================================================
          ADD NATIONAL COMMISSIONER MODAL
      =================================================== */}

      {showAddModal &&
        isSuperAdmin && (
          <div
            className="modal-overlay"
            onClick={closeAddModal}
          >
            <div
              className="modal-content modal-large"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <h3>
                  <i
                    className="fas fa-user-tie"
                    style={{
                      color: '#FFD100',
                    }}
                  ></i>{' '}
                  Add National Commissioner
                </h3>

                <button
                  type="button"
                  className="modal-close"
                  onClick={closeAddModal}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form
                onSubmit={
                  handleAddLeader
                }
              >
                {/* BASIC INFO */}

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Full Name{' '}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={
                        formData.fullName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Email{' '}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Password{' '}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={
                        formData.password
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Create password (min 6 characters)"
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Confirm Password{' '}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <input
                      type="password"
                      name="confirmPassword"
                      value={
                        formData.confirmPassword
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                {/* PHONE + DISTRICT */}

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Phone
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      District{' '}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <select
                      name="district"
                      value={
                        formData.district
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="district-select"
                    >
                      <option value="">
                        — Select District —
                      </option>

                      {districts.map(
                        (district) => {
                          const districtValue =
                            typeof district ===
                            'string'
                              ? district
                              : district.name ||
                                district.district_name ||
                                district.code;

                          return (
                            <option
                              key={
                                districtValue
                              }
                              value={
                                districtValue
                              }
                            >
                              {
                                districtValue
                              }
                            </option>
                          );
                        }
                      )}
                    </select>
                  </div>
                </div>

                {/* ROLE */}

                <div className="form-group">
                  <label>
                    Role
                  </label>

                  <select
                    name="role"
                    value={
                      formData.role
                    }
                    onChange={
                      handleChange
                    }
                    className="role-select"
                  >
                    <option value="national_commissioner">
                      National Commissioner
                    </option>

                    <option value="super_admin">
                      Super National Commissioner
                    </option>
                  </select>

                  <small className="form-hint">
                    <i className="fas fa-info-circle"></i>{' '}
                    Super National Commissioners have full
                    access to all features and can manage
                    other commissioners.
                  </small>
                </div>

                {/* MODULE PERMISSIONS */}

                <div className="form-group">
                  <label>
                    <i
                      className="fas fa-shield-alt"
                      style={{
                        color: '#FFD100',
                      }}
                    ></i>{' '}
                    National Dashboard Module Permissions
                  </label>

                  <small className="form-hint">
                    <i className="fas fa-info-circle"></i>{' '}
                    Select actions for each National Dashboard
                    module. Selecting at least one action
                    enables that module in the National
                    Commissioner Sidebar.
                  </small>

                  <div className="permissions-modules">
                    {Object.keys(
                      PERMISSION_MODULES
                    ).map(
                      (moduleKey) => {
                        const module =
                          PERMISSION_MODULES[
                            moduleKey
                          ];

                        const selectedActions =
                          selectedPermissions[
                            moduleKey
                          ] || [];

                        const allSelected =
                          areAllActionsSelected(
                            moduleKey
                          );

                        return (
                          <div
                            key={
                              moduleKey
                            }
                            className="permission-module"
                          >
                            <div
                              className="module-header"
                              onClick={() =>
                                toggleModuleExpansion(
                                  moduleKey
                                )
                              }
                            >
                              <div className="module-title">
                                <i
                                  className={`fas ${module.icon}`}
                                ></i>

                                <span>
                                  {
                                    module.label
                                  }
                                </span>

                                <span className="action-count">
                                  {
                                    selectedActions.length
                                  }
                                  /
                                  {
                                    module
                                      .actions
                                      .length
                                  }{' '}
                                  actions
                                </span>
                              </div>

                              <div className="module-actions">
                                <label
                                  className="select-all-label"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      allSelected
                                    }
                                    onChange={(
                                      e
                                    ) => {
                                      e.stopPropagation();

                                      handleToggleAllActions(
                                        moduleKey
                                      );
                                    }}
                                  />

                                  Select All
                                </label>

                                <i
                                  className={`fas ${
                                    expandedModules[
                                      moduleKey
                                    ]
                                      ? 'fa-chevron-up'
                                      : 'fa-chevron-down'
                                  }`}
                                ></i>
                              </div>
                            </div>

                            {expandedModules[
                              moduleKey
                            ] && (
                              <div className="module-actions-grid">
                                {module.actions.map(
                                  (
                                    action
                                  ) => (
                                    <label
                                      key={
                                        action
                                      }
                                      className="action-checkbox"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedActions.includes(
                                          action
                                        )}
                                        onChange={() =>
                                          handlePermissionToggle(
                                            moduleKey,
                                            action
                                          )
                                        }
                                      />

                                      <span className="action-label">
                                        {
                                          ACTION_LABELS[
                                            action
                                          ]
                                        }
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* ASSIGNED DISTRICTS */}

                <div className="form-group">
                  <label>
                    <i
                      className="fas fa-map-marker-alt"
                      style={{
                        color: '#FFD100',
                      }}
                    ></i>{' '}
                    Assigned Districts
                  </label>

                  <div className="districts-grid">
                    <label className="district-checkbox select-all">
                      <input
                        type="checkbox"
                        checked={
                          assignedDistricts.length ===
                            districts.length &&
                          districts.length >
                            0
                        }
                        onChange={
                          handleSelectAllDistricts
                        }
                      />

                      <strong>
                        📌 Select All Districts
                      </strong>
                    </label>

                    {districts.map(
                      (district) => {
                        const districtName =
                          typeof district ===
                          'string'
                            ? district
                            : district.name ||
                              district.district_name ||
                              district.code;

                        return (
                          <label
                            key={
                              districtName
                            }
                            className="district-checkbox"
                          >
                            <input
                              type="checkbox"
                              checked={assignedDistricts.includes(
                                districtName
                              )}
                              onChange={() =>
                                handleDistrictToggle(
                                  districtName
                                )
                              }
                            />

                            {
                              districtName
                            }
                          </label>
                        );
                      }
                    )}
                  </div>

                  <small className="form-hint">
                    <i className="fas fa-info-circle"></i>{' '}
                    <strong>
                      {
                        assignedDistricts.length
                      }
                    </strong>{' '}
                    of{' '}
                    <strong>
                      {districts.length}
                    </strong>{' '}
                    districts selected
                  </small>
                </div>

                {/* FORM ACTIONS */}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={
                      closeAddModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>{' '}
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus"></i>{' '}
                        Add National Commissioner
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* ===================================================
          PERMISSIONS MODAL
      =================================================== */}

      {showPermissionsModal &&
        selectedLeader &&
        isSuperAdmin && (
          <div
            className="modal-overlay"
            onClick={
              closePermissionsModal
            }
          >
            <div
              className="modal-content modal-large"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <h3>
                  <i
                    className="fas fa-key"
                    style={{
                      color: '#FFD100',
                    }}
                  ></i>{' '}
                  Manage Permissions -{' '}
                  {selectedLeader.fullName ||
                    selectedLeader.name}
                </h3>

                <button
                  type="button"
                  className="modal-close"
                  onClick={
                    closePermissionsModal
                  }
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form
                onSubmit={
                  handleUpdatePermissions
                }
              >
                <div className="form-group">
                  <label>
                    <i
                      className="fas fa-shield-alt"
                      style={{
                        color: '#FFD100',
                      }}
                    ></i>{' '}
                    National Dashboard Module Permissions
                  </label>

                  <small className="form-hint">
                    <i className="fas fa-info-circle"></i>{' '}
                    Select specific actions for each National
                    Dashboard module. Unselected modules will
                    have their corresponding Sidebar permission
                    disabled.
                  </small>

                  <div className="permissions-modules">
                    {Object.keys(
                      PERMISSION_MODULES
                    ).map(
                      (moduleKey) => {
                        const module =
                          PERMISSION_MODULES[
                            moduleKey
                          ];

                        const selectedActions =
                          selectedPermissions[
                            moduleKey
                          ] || [];

                        const allSelected =
                          areAllActionsSelected(
                            moduleKey
                          );

                        return (
                          <div
                            key={
                              moduleKey
                            }
                            className="permission-module"
                          >
                            <div
                              className="module-header"
                              onClick={() =>
                                toggleModuleExpansion(
                                  moduleKey
                                )
                              }
                            >
                              <div className="module-title">
                                <i
                                  className={`fas ${module.icon}`}
                                ></i>

                                <span>
                                  {
                                    module.label
                                  }
                                </span>

                                <span className="permission-key">
                                  {
                                    module.permissionKey
                                  }
                                </span>

                                <span className="action-count">
                                  {
                                    selectedActions.length
                                  }
                                  /
                                  {
                                    module
                                      .actions
                                      .length
                                  }{' '}
                                  actions
                                </span>
                              </div>

                              <div className="module-actions">
                                <label
                                  className="select-all-label"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      allSelected
                                    }
                                    onChange={(
                                      e
                                    ) => {
                                      e.stopPropagation();

                                      handleToggleAllActions(
                                        moduleKey
                                      );
                                    }}
                                  />

                                  Select All
                                </label>

                                <i
                                  className={`fas ${
                                    expandedModules[
                                      moduleKey
                                    ]
                                      ? 'fa-chevron-up'
                                      : 'fa-chevron-down'
                                  }`}
                                ></i>
                              </div>
                            </div>

                            {expandedModules[
                              moduleKey
                            ] && (
                              <div className="module-actions-grid">
                                {module.actions.map(
                                  (
                                    action
                                  ) => (
                                    <label
                                      key={
                                        action
                                      }
                                      className="action-checkbox"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedActions.includes(
                                          action
                                        )}
                                        onChange={() =>
                                          handlePermissionToggle(
                                            moduleKey,
                                            action
                                          )
                                        }
                                      />

                                      <span className="action-label">
                                        {
                                          ACTION_LABELS[
                                            action
                                          ]
                                        }
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* ASSIGNED DISTRICTS */}

                <div className="form-group">
                  <label>
                    <i
                      className="fas fa-map-marker-alt"
                      style={{
                        color: '#FFD100',
                      }}
                    ></i>{' '}
                    Assigned Districts
                  </label>

                  <div className="districts-grid">
                    <label className="district-checkbox select-all">
                      <input
                        type="checkbox"
                        checked={
                          assignedDistricts.length ===
                            districts.length &&
                          districts.length >
                            0
                        }
                        onChange={
                          handleSelectAllDistricts
                        }
                      />

                      <strong>
                        📌 Select All Districts
                      </strong>
                    </label>

                    {districts.map(
                      (district) => {
                        const districtName =
                          typeof district ===
                          'string'
                            ? district
                            : district.name ||
                              district.district_name ||
                              district.code;

                        return (
                          <label
                            key={
                              districtName
                            }
                            className="district-checkbox"
                          >
                            <input
                              type="checkbox"
                              checked={assignedDistricts.includes(
                                districtName
                              )}
                              onChange={() =>
                                handleDistrictToggle(
                                  districtName
                                )
                              }
                            />

                            {
                              districtName
                            }
                          </label>
                        );
                      }
                    )}
                  </div>

                  <small className="form-hint">
                    <i className="fas fa-info-circle"></i>{' '}
                    <strong>
                      {
                        assignedDistricts.length
                      }
                    </strong>{' '}
                    of{' '}
                    <strong>
                      {districts.length}
                    </strong>{' '}
                    districts selected
                  </small>
                </div>

                {/* FORM ACTIONS */}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={
                      closePermissionsModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    <i className="fas fa-save"></i>{' '}
                    Update Permissions
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* ===================================================
          COMPONENT CSS
      =================================================== */}

    <style jsx>{`
  /* =====================================================
     PERMISSION WARNING
  ===================================================== */

  .permission-warning {
    margin-top: 8px;
    padding: 8px 12px;
    background: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
  }

  .super-admin-badge {
    margin-left: 12px;
    background: #ffd100;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
  }

  .super-badge {
    margin-left: 8px;
    background: #ffd100;
    color: #111827;
    padding: 1px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: bold;
    white-space: nowrap;
  }

  .read-only-badge {
    font-size: 12px;
    color: #999;
    padding: 4px 8px;
    background: #f3f4f6;
    border-radius: 4px;
    white-space: nowrap;
  }

  /* =====================================================
     FORM SELECTS
  ===================================================== */

  .role-select,
  .district-select {
    width: 100%;
    max-width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
  }

  /* =====================================================
     PERMISSIONS
  ===================================================== */

  .permissions-modules {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-top: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
  }

  .permission-module {
    border-bottom: 1px solid #e5e7eb;
    min-width: 0;
  }

  .permission-module:last-child {
    border-bottom: none;
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: #f9fafb;
    cursor: pointer;
    transition: background 0.2s ease;
    min-width: 0;
    box-sizing: border-box;
  }

  .module-header:hover {
    background: #f3f4f6;
  }

  .module-title {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1;
    font-weight: 500;
    flex-wrap: wrap;
  }

  .module-title > i {
    color: #ffd100;
    width: 18px;
    min-width: 18px;
    text-align: center;
  }

  .module-title > span {
    min-width: 0;
  }

  .permission-key {
    font-size: 10px;
    color: #6b7280;
    background: #eef2ff;
    border: 1px solid #e0e7ff;
    padding: 2px 6px;
    border-radius: 5px;
    font-family: monospace;
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .action-count {
    font-size: 12px;
    font-weight: normal;
    color: #6b7280;
    background: #e5e7eb;
    padding: 2px 8px;
    border-radius: 10px;
    white-space: nowrap;
  }

  .module-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .select-all-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: normal;
    cursor: pointer;
    white-space: nowrap;
  }

  .module-actions-grid {
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(140px, 1fr)
    );
    gap: 6px;
    padding: 10px 14px;
    background: #ffffff;
    box-sizing: border-box;
  }

  .action-checkbox {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    cursor: pointer;
    padding: 5px 6px;
    border-radius: 4px;
    transition: background 0.2s ease;
    min-width: 0;
  }

  .action-checkbox:hover {
    background: #f3f4f6;
  }

  .action-checkbox input[type='checkbox'] {
    width: 15px;
    height: 15px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .action-label {
    text-transform: capitalize;
    overflow-wrap: anywhere;
  }

  /* =====================================================
     PERMISSION SUMMARY
  ===================================================== */

  .permission-summary {
    font-size: 12px;
    min-width: 160px;
    max-width: 260px;
  }

  .permission-count {
    font-weight: 500;
    color: #374151;
  }

  .permission-detail {
    font-size: 11px;
    color: #6b7280;
    display: block;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 2px;
  }

  /* =====================================================
     FORM HINT
  ===================================================== */

  .form-hint {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .form-hint i {
    margin-right: 4px;
  }

  /* =====================================================
     DISTRICTS
  ===================================================== */

  .districts-grid {
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(150px, 1fr)
    );
    gap: 6px;
    margin-top: 8px;
    max-height: 200px;
    overflow-y: auto;
    padding: 4px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-sizing: border-box;
    width: 100%;
  }

  .district-checkbox {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    cursor: pointer;
    padding: 5px 6px;
    border-radius: 4px;
    transition: background 0.2s ease;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .district-checkbox:hover {
    background: #f3f4f6;
  }

  .district-checkbox.select-all {
    grid-column: 1 / -1;
    font-weight: 500;
    color: #6a1b9a;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 8px;
    margin-bottom: 4px;
  }

  .district-checkbox input[type='checkbox'] {
    width: 15px;
    height: 15px;
    cursor: pointer;
    flex-shrink: 0;
  }

  /* =====================================================
     FORM ROWS
  ===================================================== */

  .form-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    width: 100%;
  }

  .form-group {
    min-width: 0;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    max-width: 100%;
    box-sizing: border-box;
  }

  /* =====================================================
     MODAL
  ===================================================== */

  .modal-large {
    width: min(800px, 100%);
    max-width: 800px;
  }

  .required {
    color: #ef4444;
  }

  .text-center {
    text-align: center;
  }

  .district-info {
    min-width: 120px;
    max-width: 100%;
  }

  .district-name {
    display: block;
    overflow-wrap: anywhere;
  }

  .assigned-districts-small {
    display: block;
    margin-top: 3px;
    font-size: 10px;
    color: #6b7280;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  /* =====================================================
     MODAL SAFETY
  ===================================================== */

  .modal-overlay {
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
    box-sizing: border-box;
    width: 100%;
  }

  .modal-content.modal-large {
    width: min(800px, 100%);
    max-width: 800px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
  }

  /* =====================================================
     TABLE
     
     IMPORTANT:
     The table remains a table.
     On small screens it scrolls horizontally instead
     of breaking the page layout.
  ===================================================== */

  .table-container {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
  }

  .table-container .data-table {
    min-width: 1050px;
    width: 100%;
  }

  .table-container th,
  .table-container td {
    white-space: nowrap;
  }

  /* =====================================================
     ACTION BUTTONS
  ===================================================== */

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
  }

  .action-buttons .btn-sm {
    flex-shrink: 0;
  }

  /* =====================================================
     SEARCH AREA
  ===================================================== */

  .search-filter-bar {
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
  }

  .search-box {
    min-width: 0;
  }

  .search-box input {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .stats-info {
    min-width: 0;
    max-width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* =====================================================
     PAGE HEADER
  ===================================================== */

  .page-header {
    min-width: 0;
  }

  .page-header h2 {
    overflow-wrap: anywhere;
  }

  .page-header p {
    overflow-wrap: anywhere;
  }

  /* =====================================================
     FORM ACTIONS
  ===================================================== */

  .form-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  .form-actions button {
    max-width: 100%;
  }

  /* =====================================================
     MOBILE - 768px
  ===================================================== */

  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .page-header h2 {
      font-size: 20px;
      line-height: 1.3;
    }

    .page-header p {
      font-size: 13px;
      line-height: 1.4;
    }

    .permission-warning {
      align-items: flex-start;
      font-size: 12px;
    }

    .super-admin-badge {
      margin-left: 0;
    }

    /* -------------------------
       Search
    ------------------------- */

    .search-filter-bar {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }

    .search-box {
      width: 100%;
    }

    .stats-info {
      width: 100%;
      justify-content: space-between;
    }

    /* -------------------------
       Form
    ------------------------- */

    .form-row {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    /* -------------------------
       Modal
    ------------------------- */

    .modal-overlay {
      padding: 10px;
      align-items: flex-start;
    }

    .modal-content.modal-large {
      width: 100%;
      max-width: 100%;
      max-height: calc(100vh - 20px);
      margin: 0 auto;
      border-radius: 8px;
    }

    /* -------------------------
       Permission modules
    ------------------------- */

    .module-header {
      align-items: flex-start;
      padding: 10px;
    }

    .module-title {
      gap: 7px;
    }

    .module-actions {
      gap: 7px;
    }

    .module-actions-grid {
      grid-template-columns: repeat(
        2,
        minmax(0, 1fr)
      );
      padding: 9px 10px;
    }

    /* -------------------------
       Districts
    ------------------------- */

    .districts-grid {
      grid-template-columns: repeat(
        2,
        minmax(0, 1fr)
      );
    }

    /* -------------------------
       Permissions
    ------------------------- */

    .permission-summary {
      min-width: 150px;
      max-width: 200px;
    }

    .permission-detail {
      max-width: 190px;
    }

    .action-count {
      font-size: 10px;
    }

    .select-all-label {
      font-size: 11px;
    }

    .permission-key {
      font-size: 9px;
    }

    /* -------------------------
       Buttons
    ------------------------- */

    .form-actions {
      justify-content: stretch;
    }

    .form-actions button {
      flex: 1 1 140px;
    }
  }

  /* =====================================================
     SMALL MOBILE - 480px
  ===================================================== */

  @media (max-width: 480px) {
    .page-header h2 {
      font-size: 18px;
    }

    .page-header p {
      font-size: 12px;
    }

    .permission-warning {
      padding: 7px 9px;
    }

    .permission-warning span {
      font-size: 12px !important;
    }

    .stats-info {
      align-items: flex-start;
      flex-direction: column;
    }

    .super-admin-badge {
      margin-left: 0;
    }

    /* -------------------------
       Modal
    ------------------------- */

    .modal-overlay {
      padding: 6px;
    }

    .modal-content.modal-large {
      max-height: calc(100vh - 12px);
      border-radius: 6px;
    }

    /* -------------------------
       Permission header
    ------------------------- */

    .module-header {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .module-title {
      width: 100%;
    }

    .module-actions {
      width: 100%;
      justify-content: space-between;
    }

    .module-actions-grid {
      grid-template-columns: 1fr;
    }

    /* -------------------------
       Districts
    ------------------------- */

    .districts-grid {
      grid-template-columns: 1fr;
    }

    .district-checkbox.select-all {
      grid-column: auto;
    }

    /* -------------------------
       Permission summary
    ------------------------- */

    .permission-summary {
      min-width: 130px;
      max-width: 180px;
    }

    .permission-key {
      width: fit-content;
      max-width: 100%;
    }

    /* -------------------------
       Form buttons
    ------------------------- */

    .form-actions {
      flex-direction: column-reverse;
      width: 100%;
    }

    .form-actions button {
      width: 100%;
      flex: none;
    }

    /* -------------------------
       Table
    ------------------------- */

    .table-container .data-table {
      min-width: 950px;
    }
  }

  /* =====================================================
     VERY SMALL MOBILE - 360px
  ===================================================== */

  @media (max-width: 360px) {
    .page-header h2 {
      font-size: 16px;
    }

    .module-title {
      font-size: 13px;
    }

    .module-actions-grid {
      padding: 8px;
    }

    .action-checkbox {
      font-size: 12px;
    }

    .district-checkbox {
      font-size: 12px;
    }

    .permission-key {
      display: none;
    }

    .action-count {
      font-size: 9px;
      padding: 2px 5px;
    }

    .select-all-label {
      font-size: 10px;
    }

    .form-hint {
      font-size: 11px;
    }

    .modal-content.modal-large {
      border-radius: 4px;
    }
  }

  /* =====================================================
     TABLET - 769px TO 1024px
  ===================================================== */

  @media (min-width: 769px) and (max-width: 1024px) {
    .page-header h2 {
      font-size: 22px;
    }

    .module-actions-grid {
      grid-template-columns: repeat(
        2,
        minmax(120px, 1fr)
      );
    }

    .modal-content.modal-large {
      width: 90%;
      max-width: 800px;
    }

    .table-container .data-table {
      min-width: 1000px;
    }
  }

  /* =====================================================
     LARGE DESKTOP
  ===================================================== */

  @media (min-width: 1400px) {
    .module-actions-grid {
      grid-template-columns: repeat(
        auto-fit,
        minmax(150px, 1fr)
      );
    }
  }

  /* =====================================================
     TOUCH DEVICES
  ===================================================== */

  @media (hover: none) and (pointer: coarse) {
    .module-header:hover,
    .action-checkbox:hover,
    .district-checkbox:hover {
      background: inherit;
    }

    .action-checkbox,
    .district-checkbox,
    .select-all-label {
      min-height: 34px;
    }

    .action-checkbox input[type='checkbox'],
    .district-checkbox input[type='checkbox'] {
      width: 17px;
      height: 17px;
    }
  }

  /* =====================================================
     PREVENT HORIZONTAL PAGE OVERFLOW
  ===================================================== */

  .dashboard-container {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .dashboard-container * {
    box-sizing: border-box;
  }
`}</style>
    </div>
  );
};

export default ManageLeaders;