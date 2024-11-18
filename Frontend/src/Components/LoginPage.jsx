import React, { useState } from 'react';
import { Grid, TextField, Button, Typography, AppBar, Box} from '@mui/material';
import { signIn } from 'aws-amplify/auth';
import { styled } from '@mui/system';
import Logo from '../Assets/BCO_logo-new.png';
import { Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utilities/constants';

// { onLogin }
function LoginPage( {onLogin} ) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // DynamoDB API
  const getUserDynamoDB = async () => {
    try {
      const response = await axios.put(API_URL, {
        action: 'getUser',
        email: email
      });
      localStorage.setItem("user_data", response.data.body);
      const parsedUserData = JSON.parse(localStorage.getItem("user_data"));
      console.log(parsedUserData.chatHistory)
      console.log(localStorage)
      localStorage.setItem("chatHistory", JSON.stringify(parsedUserData.chatHistory))
      localStorage.setItem("conversationData", '[]')
      console.log(localStorage)
      // console
      // FIXME : Add username to chatheader
      const username = parsedUserData.username;
      localStorage.setItem("username", parsedUserData.username);
      navigate('/main');
      console.log(localStorage.getItem("username"))
      console.log(parsedUserData.username);
      console.log(localStorage.getItem("user_data"));
      console.log(parsedUserData)
      console.log('User Info Retrieved from DynamoDB:', response.data);
    } catch (error) {
      console.error('Error adding user to DynamoDB:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // AWS Cognito login
      signIn({
        username: email,
        password: password,
      });
      onLogin(); // Call the onLogin function when successful
      console.log('Login successful');
      // localStorage.setItem("isLoggedIn", "true");
      getUserDynamoDB();
      
    } catch (error) {
      console.error('Login error', error);
      setErrorMessage('Invalid credentials! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const LoginButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: '25px',
    padding: '0.75rem 2rem',
    '&:hover': {
      backgroundColor: '#333',
    },
  }));

  return (
    <>
    
    <AppBar
      position="static"
      sx={{
        backgroundColor: 'white',        
        height: "4rem",
        boxShadow: 'none',
        // borderBottom: (theme) => `7px solid ${theme.palette.primary[0]}`,
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
          // borderBottom: "1px solid #ccc"
        }}
        className="appHeight100"
      >
        <Grid item sx={{paddingLeft: '6rem'}}>
          <img src={Logo} alt={`App main Logo`} height={64} />
        </Grid>
      </Grid>
    </AppBar>
    <Grid container style={{ height: '100vh' }}>
      {/* Left Section */}
      <Grid
        item
        xs={12}
        md={6}
        container
        direction="column"
        justifyContent="top"
        alignItems="top"
        sx={{ paddingLeft: '10rem', paddingTop: '5rem'}}
      >
        {/* <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
           BREASTCANCER.ORG
        </Typography> */}
        <Typography variant="h2" sx={{ fontWeight: 'normal', marginBottom: '1rem', fontFamily: 'Times New Roman' }}>
          Log in to our<br/><em>Community</em>
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
           Not a member of the community?<Link to="/signup" >Join now</Link> 
        </Typography>
        <Typography variant="body1">
          Need help? Email us at <a href="mailto:help@breastcancer.org">help@breastcancer.org</a>
        </Typography>
      </Grid>

      {/* Right Section */}
      <Grid
        item
        xs={12}
        md={6}
        direction={'column'}
        container
        justifyContent="top"
        alignItems="left"
        sx={{ paddingTop: '8rem'}}
      >
        <Box
          sx={{
            padding: '22 rem',
            // borderRadius: '10px',
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#fff',
            // boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container direction="column" spacing={8}>
              <Grid item>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  // required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="standard"
                  // InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  // required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="standard"
                  // InputLabelProps={{ shrink: true }}
                />
                <Typography variant="body2" sx={{ textAlign: 'left', marginTop: '0.5rem' }}>
                  <a href="/reset-password">Forgot password? Reset here</a>
                </Typography>
              </Grid>

              {errorMessage && (
                <Grid item>
                  <Typography variant="body2" style={{ color: 'red', textAlign: 'center' }}>
                    {errorMessage}
                  </Typography>
                </Grid>
              )}

              <Grid item container justifyContent="left">
                <LoginButton type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Sign In'}
                </LoginButton>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Grid>
    </Grid>
    </>
  );
}

export default LoginPage;