import React, { useState } from 'react';
import { Grid, TextField, Button, Typography, Checkbox, FormControlLabel, AppBar, Box, MenuItem } from '@mui/material';
import Logo from '../Assets/BCO_logo-new.png';
import Check from '../Assets/tick.png';
import { signUp } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import axios, { formToJSON } from 'axios';
import { API_URL } from '../utilities/constants';

function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [reEmail, setReEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [diagnosisStatus, setDiagnosisStatus] = useState('');
  const [gender, setGender] = useState('');

  const navigate = useNavigate();

  const addUserToDynamoDB = async () => {
    try {
      const response = await axios.put(API_URL, {
        
          action: 'addUser',
          email: email,
          username: username,
          chatHistory: [],
          breastCancerType: 'Invasive Ductal Carcinoma',
          breastCancerStage: diagnosisStatus,
        // Important: Set content type header
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('User added to DynamoDB:', response.data);
    } catch (error) {
      console.error('Error adding user to DynamoDB:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
        signUp({ username: email, gender: gender, password ,
        options:{
            userAttributes: {
                email: email,
                given_name: username
                // gender: gender
            }
        }});
        console.log("Sign-up successful");
        // Handle successful sign-up (e.g., redirect to login page)
        
        navigate('/login');
        addUserToDynamoDB();
        
      } catch (error) {
        console.error("Error signing up:", error);
      }
  };

  return (
    <>
    <AppBar
      position="static"
      sx={{
        backgroundColor: (theme) => theme.palette.background.header,
        height: "3rem",
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
          paddingTop: "0rem",
          // borderBottom: "1px solid #ccc"
        }}
        className="appHeight100"
      >
        <Grid item sx={{paddingLeft: '5rem'}}>
          <img src={Logo} alt={`App main Logo`} height={54} />
        </Grid>
      </Grid>
    </AppBar>
    <Grid container style={{ height: '100vh' }}>
      {/* Left Section - Create Profile Form */}
      <Grid item xs={12} md={6} container justifyContent="center" alignItems="top">
        <Box sx={{ padding: '1rem', maxWidth: '500px', width: '100%', backgroundColor: '#f9f9f9', borderRadius: '25px', marginTop: '0.2rem'}}>
          <Typography variant="h4" sx={{ fontWeight: 'normal', marginBottom: '0rem', fontFamily: 'Times New Roman'  }}>
            Create your profile
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="standard"
              margin="dense"
            />
            <Typography variant="body2" sx={{ backgroundColor: '#f0f0f0', padding: '0.5rem', borderRadius: '5px', marginBottom: '0rem' }}>
              To protect your privacy, avoid using a username that identifies you. Usernames can’t be an email address or start with a number. They must be 6 to 20 characters long and can include letters, numbers, periods, and underscores.
            </Typography>

            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="standard"
              margin="dense"
            />
            <TextField
              fullWidth
              label="Re-Enter Email"
              value={reEmail}
              onChange={(e) => setReEmail(e.target.value)}
              variant="standard"
              margin="dense"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="standard"
              margin="dense"
            />
            <Typography variant="body2" sx={{ marginBottom: '0rem' }}>
              Must be at least 8-20 characters long and include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character (e.g., $, %, &, *).
            </Typography>
            <TextField
              fullWidth
              label="Re-enter password"
              type="password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              variant="standard"
              margin="dense"
              sx={{ marginBottom: '1rem' }}
            />

            <FormControlLabel control={<Checkbox />} label="I am 18 years of age or older. I agree to the Terms of Use and Privacy Policy." />

            <FormControlLabel 
            control={<Checkbox />} 
            label="Yes I would like to receive updates from BreastCancer.org about updates, events, and ways to support."
            sx={{ mt: 2 }}
            />

            <TextField
              select
              fullWidth
              label="Diagnosis Status"
              value={diagnosisStatus}
              onChange={(e) => setDiagnosisStatus(e.target.value)}
              variant="outlined"
              margin="dense"
              sx={{ marginBottom: '1rem', marginTop: '1rem'}}
            >
              <MenuItem value="">Select Diagnosis</MenuItem>
              <MenuItem value="Diagnosed">Recently Diagnosed</MenuItem>
              <MenuItem value="Metastatic">MetaStatic</MenuItem>
            </TextField>

            {/* <TextField
            select
            fullWidth
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)} // Capture gender selection
            variant="outlined"
            margin="normal"
          >
            <MenuItem value="">Select Gender</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </TextField> */}

            <Button type="submit" variant="contained" color="primary" sx={{ width: '25%', padding: '1rem', borderRadius: '25px', backgroundColor: '#000' }}>
              Join Now
            </Button>
          </form>
        </Box>
      </Grid>

      {/* Right Section - Help Information */}
      <Grid item xs={12} md={6} container justifyContent="center" alignItems="top">
        <Box sx={{ paddingLeft: '2rem', paddingTop: '1rem'}}>
          <Typography variant="h3" sx={{ fontWeight: 'normal', marginBottom: '2rem', fontFamily: 'Times New Roman' }}>
            We’re here to help you
          </Typography>
          <Typography variant="h7" sx={{ fontFamily: 'Times New Roman', lineHeight: 2}} >
            <img src={Check} alt="check" style={{width: '30px', height: '30px'}} />&nbsp;&nbsp;&nbsp;&nbsp;Connect with community members for support and practical information<br />
            <img src={Check} alt="check" style={{width: '30px', height: '30px'}} />&nbsp;&nbsp;&nbsp;&nbsp;Track and share your diagnostic and treatment information<br />
            <img src={Check} alt="check" style={{width: '30px', height: '30px'}} />&nbsp;&nbsp;&nbsp;&nbsp;Save information and resources important to you<br />
            <img src={Check} alt="check" style={{width: '30px', height: '30px'}} />&nbsp;&nbsp;&nbsp;&nbsp;Be a part of research to improve care and help others<br />
          </Typography>

          <Typography variant="body1" sx={{marginTop: '12rem' }}>
            A welcome message from BreastCancer.org’s community members
          </Typography>
          <Typography variant="body2" sx={{ marginTop: '1rem' }}>
            Need help? Email us at breastcancer.org
          </Typography>
        </Box>
      </Grid>
    </Grid>
    </>
  );
}

export default SignUpPage;