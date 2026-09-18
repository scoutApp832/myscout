import { useAuth } from '../contexts/AuthContext';

const usePermissions = () => {
  const { user, hasPermission } = useAuth();

  // Check if user can manage members
  const canManageMembers = hasPermission('canManageMembers');
  
  // Check if user can manage events
  const canManageEvents = hasPermission('canManageEvents');
  
  // Check if user can manage courses
  const canManageCourses = hasPermission('canManageCourses');
  
  // Check if user can manage reports
  const canManageReports = hasPermission('canManageReports');
  
  // Check if user can manage projects
  const canManageProjects = hasPermission('canManageProjects');
  
  // Check if user can view statistics
  const canViewStatistics = hasPermission('canViewStatistics');
  
  // Check if user can manage announcements
  const canManageAnnouncements = hasPermission('canManageAnnouncements');
  
  // Check if user can export data
  const canExportData = hasPermission('canExportData');
  
  // Check if user can view dashboard
  const canViewDashboard = hasPermission('canViewDashboard') || true;

  // Check if user is National Commissioner
  const isNationalCommissioner = user?.role === 'national_commissioner';

  return {
    canManageMembers,
    canManageEvents,
    canManageCourses,
    canManageReports,
    canManageProjects,
    canViewStatistics,
    canManageAnnouncements,
    canExportData,
    canViewDashboard,
    isNationalCommissioner,
    // Check if user has any management permission
    hasAnyManagementPermission: canManageMembers || canManageEvents || canManageCourses || 
                               canManageReports || canManageProjects || canManageAnnouncements
  };
};

export default usePermissions;