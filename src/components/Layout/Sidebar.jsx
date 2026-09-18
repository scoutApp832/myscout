import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { navConfig } from '../../data/data';
const Sidebar = () => {
 const { user } = useAuth();
 const config = navConfig[user?.role] || navConfig.scout;
 return (
 <aside className="dashboard-sidebar">
 <nav className="sidebar-nav">
 {config.links.map((link) => {
 // Hide unit leader only links for non-unit leaders
 if (link.unitLeaderOnly && user?.role !== 'district') return null;
 return (
 <NavLink
 key={link.path}
 to={link.path}
 className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`
}
 >
 <i className={`fas ${link.icon}`}></i>
 <span>{link.label}</span>
 {link.badge && <span className="badge">{link.badge}</span>}
 </NavLink>
 );
 })}
 </nav>
 </aside>
 );
};
export default Sidebar;