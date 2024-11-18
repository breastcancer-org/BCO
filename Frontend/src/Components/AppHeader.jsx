import React from "react";
import { Grid, AppBar } from "@mui/material";
import Logo from "../Assets/BCO_logo-new.png";
import Profile_logo from "../Assets/UserAvatar.svg";
import { useNavigate } from "react-router-dom";

function AppHeader({ onLogout }) {

  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: (theme) => theme.palette.background.header,
        height: "4rem",
      }}
    >
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ 
          padding: "0 1rem",
          paddingTop: "0.5rem",
        }}
        className="appHeight100"
      >
        <Grid item>
          <img src={Logo} alt={`App main Logo`} height={64} />
        </Grid>
        <Grid item>
          <Grid container alignItems="center" justifyContent="space-evenly" spacing={2}>
            <Grid item sx={{paddingRight: '12rem',  paddingBottom: '0rem'}}>
              <img 
                src={Profile_logo} 
                alt="icon" 
                height={32} 
                onClick={() => {
                  // Create menu element with logout option
                  const menu = document.createElement('div');
                  menu.style.position = 'absolute';
                  menu.style.top = '50px';
                  menu.style.right = '140px';
                  menu.style.backgroundColor = 'white';
                  menu.style.padding = '10px';
                  menu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                  menu.style.cursor = 'pointer';
                  menu.innerHTML = 'Logout';
                  menu.onclick = () => {
                    // Add logout logic here
                    onLogout();
                    document.body.removeChild(menu);
                    navigate('/login')
                    localStorage.clear()
                    console.log('Logging out...');
                  };
                  // Add mouseout event to remove menu when not hovering
                  menu.onmouseout = (e) => {
                    if (!menu.contains(e.relatedTarget)) {
                      document.body.removeChild(menu);
                    }
                  };
                  document.body.appendChild(menu);
                }}
                style={{cursor: 'pointer'}}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AppBar>
  );
}

export default AppHeader;
