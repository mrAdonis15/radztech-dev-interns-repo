import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Box,
    Collapse,
    Container,
} from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import AssignmentIcon from '@material-ui/icons/Assignment';
import SettingsIcon from '@material-ui/icons/Settings';
import UlapBizLogo from 'src/images/ulapbiz.png';
import './Page.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});

    useEffect(() => {
        // Auto-expand menu if current path matches any submenu
        const allMenuItems = [
            {
                label: 'Transactions',
                submenu: [
                    { label: 'Evaluation', path: '/evaluation/evaluation' }
                ]
            },
            {
                label: 'Reports',
                submenu: [
                    { label: 'List of Applicants', path: '/evaluation/list-applicants' }
                ]
            },
            {
                label: 'Settings',
                submenu: [
                    { label: 'Applicant', path: '/evaluation/applicant' },
                    { label: 'Category', path: '/evaluation/category' },
                    { label: 'Criteria', path: '/evaluation/criteria' }
                ]
            }
        ];

        allMenuItems.forEach(item => {
            if (item.submenu) {
                const isActive = item.submenu.some(subitem => location.pathname === subitem.path);
                if (isActive) {
                    setExpandedMenus(prev => ({ ...prev, [item.label]: true }));
                }
            }
        });
    }, [location.pathname]);

    const toggleMenu = (menuName) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const menuItems = [
        {
            label: 'Transactions',
            icon: TouchAppIcon,
            submenu: [
                { label: 'Evaluation', path: '/evaluation/evaluation' }
            ]
        },
  
        {
            label: 'Reports',
            icon: AssignmentIcon,
            submenu: [
                { label: 'List of Applicants', path: '/evaluation/list-applicants' }
            ]
        },
        {
            label: 'Settings',
            icon: SettingsIcon,
            submenu: [
                { label: 'Applicant', path: '/evaluation/applicant' },
                { label: 'Category', path: '/evaluation/category' },
                { label: 'Criteria', path: '/evaluation/criteria' }
            ]
        }
    ];

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="navbar-root">
            {/* Header */}
            <AppBar position="static" className="navbar-appbar">
                <Toolbar className="navbar-toolbar">
                    <Box className="navbar-logo-section">
                        <img src={UlapBizLogo} alt="Ulap Biz" className="navbar-logo" />
                        <Box className="navbar-title">
                            Ulap<span className="navbar-biz-text">Biz</span>
                            <span className="navbar-version-text"> - Applicant Evaluation</span>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content Area */}
            <Box className="navbar-main-content">
                {/* Sidebar */}
                <Drawer
                    anchor="left"
                    className="navbar-drawer"
                    classes={{ paper: 'navbar-drawer-paper' }}
                    variant="permanent"
                >
                    <Box className="navbar-drawer-content">
                        {/* User Profile Section in Sidebar */}
                        <Box className="navbar-user-profile">
                            <Avatar className="navbar-user-avatar">KL</Avatar>
                            <Box className="navbar-user-info">
                                <span className="navbar-user-name">Kurt Lawrence Mana...</span>
                            </Box>
                        </Box>

                        {/* Menu Items */}
                        <List component="nav" className="navbar-menu-list">
                            {menuItems.map((item, index) => {
                                const IconComponent = item.icon;
                                const isExpanded = expandedMenus[item.label];
                                const hasSubmenu = item.submenu && item.submenu.length > 0;
                                const isActive = item.path && isActivePath(item.path);

                                return (
                                    <div key={index}>
                                        <ListItem
                                            button
                                            className={`navbar-menu-item ${isActive ? 'navbar-menu-item-active' : ''}`}
                                            onClick={() => {
                                                if (hasSubmenu) {
                                                    toggleMenu(item.label);
                                                } else if (item.path) {
                                                    navigate(item.path);
                                                }
                                            }}
                                        >
                                            <ListItemIcon className="navbar-menu-icon">
                                                <IconComponent />
                                            </ListItemIcon>
                                            <ListItemText primary={item.label} />
                                            {hasSubmenu && (
                                                isExpanded 
                                                    ? <ExpandLess className="navbar-expand-icon" /> 
                                                    : <ExpandMore className="navbar-expand-icon" />
                                            )}
                                        </ListItem>

                                        {hasSubmenu && (
                                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                <List component="div" disablePadding>
                                                    {item.submenu.map((subitem, subindex) => {
                                                        const isActive = isActivePath(subitem.path);
                                                        return (
                                                            <ListItem
                                                                button
                                                                key={subindex}
                                                                className={`navbar-submenu-item ${isActive ? 'navbar-submenu-item-active' : ''}`}
                                                                onClick={() => navigate(subitem.path)}
                                                            >
                                                                <ListItemText primary={subitem.label} />
                                                            </ListItem>
                                                        );
                                                    })}
                                                </List>
                                            </Collapse>
                                        )}
                                    </div>
                                );
                            })}
                        </List>
                    </Box>
                </Drawer>

                {/* Main Content */}
                <Box className="navbar-content">
                    <Container maxWidth="lg">
                        <Outlet />
                    </Container>
                </Box>
            </Box>
        </div>
    );
}

export default Navbar;
