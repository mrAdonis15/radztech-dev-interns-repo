import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
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
  makeStyles,
  Container,
} from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import AssignmentIcon from '@material-ui/icons/Assignment';
import SettingsIcon from '@material-ui/icons/Settings';
import UlapBizLogo from 'src/images/ulapbiz.png';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  appBar: {
    background: 'linear-gradient(135deg, #FF7704 0%, #FF6B00 100%)',
    zIndex: theme.zIndex.drawer + 1,
    height: 50,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingRight: theme.spacing(3),
    minHeight: 50,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  logo: {
    width: 35,
    height: 35,
    borderRadius: 6,
  },
  title: {
    color: 'white',
    fontWeight: 700,
    fontSize: '1.1rem',
  },
  bizText: {
    color: '#FFE5CC',
    fontWeight: 800,
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    marginTop: 0,
    height: 'calc(100vh - 50px)',
  },
  drawer: {
    width: 280,
    backgroundColor: '#fff',
    flexShrink: 0,
    height: '100%',
  },
  drawerPaper: {
    width: 280,
    backgroundColor: '#fff',
    borderRight: '1px solid #e0e0e0',
    position: 'relative',
    height: '100%',
    marginTop: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  drawerContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '678px',
  },
  userProfileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#fafafa',
    },
  },
  userAvatar: {
    background: 'linear-gradient(135deg, #FFB380 0%, #FF9500 100%)',
    fontWeight: 700,
    width: 40,
    height: 40,
    fontSize: '0.9rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    color: '#333',
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userRole: {
    fontSize: '0.7rem',
    color: '#666',
  },
  content: {
    flex: 1,
    padding: theme.spacing(3),
    backgroundColor: '#f5f5f5',
    overflowY: 'auto',
  },
  menuItem: {
    paddingLeft: theme.spacing(2),
    color: '#333',
    fontSize: '0.95rem',
    '&:hover': {
      backgroundColor: '#efefef',
    },
  },
  submenuItem: {
    paddingLeft: theme.spacing(8),
    fontSize: '0.9rem',
    color: '#666',
    '&:hover': {
      backgroundColor: '#efefef',
    },
  },
  submenuItemActive: {
    backgroundColor: '#fff3e0',
    color: '#FF7704',
    fontWeight: 600,
  },
  listItemIcon: {
    minWidth: 40,
    color: '#000000',
  },
  expandIcon: {
    color: '#999',
  },
}));

const Navbar = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const menuItems = [
    {
      label: 'Transaction',
      icon: SwapHorizIcon,
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

  return (
    <div className={classes.root}>
      {/* Header */}
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Box className={classes.logoSection}>
            <img src={UlapBizLogo} alt="Ulap Biz" className={classes.logo} />
            <Box className={classes.title}>
              Ulap<span className={classes.bizText}>Biz</span>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box className={classes.mainContent}>
        {/* Sidebar */}
        <Drawer
          anchor="left"
          className={classes.drawer}
          classes={{ paper: classes.drawerPaper }}
          variant="permanent"
        >
          <Box className={classes.drawerContent}>
            {/* User Profile Section in Sidebar */}
            <Box className={classes.userProfileSection}>
              <Avatar className={classes.userAvatar}>KL</Avatar>
              <Box className={classes.userInfo}>
                <span className={classes.userName}>Kurt Lawrence Mana...</span>
              </Box>
            </Box>

            {/* Menu Items */}
            <List component="nav" style={{ flex: 1 }}>
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                const isExpanded = expandedMenus[item.label];

                return (
                  <div key={index}>
                    <ListItem
                      button
                      className={classes.menuItem}
                      onClick={() => toggleMenu(item.label)}
                    >
                      <ListItemIcon className={classes.listItemIcon}>
                        <IconComponent />
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                      {item.submenu && (
                        isExpanded ? <ExpandLess className={classes.expandIcon} /> : <ExpandMore className={classes.expandIcon} />
                      )}
                    </ListItem>

                    {item.submenu && (
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.submenu.map((subitem, subindex) => (
                            <ListItem
                              button
                              key={subindex}
                              className={classes.submenuItem}
                              onClick={() => navigate(subitem.path)}
                            >
                              <ListItemText primary={subitem.label} />
                            </ListItem>
                          ))}
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
        <Box className={classes.content}>
          <Container maxWidth="lg">
            <Outlet />
          </Container>
        </Box>
      </Box>
    </div>
  );
};

export default Navbar;
