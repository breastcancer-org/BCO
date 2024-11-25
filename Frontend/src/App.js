import React, { useState} from "react";
import theme from "./theme"; // Import your theme
import { ThemeProvider } from "@mui/material/styles"; // Import ThemeProvider
import Grid from "@mui/material/Grid";
import AppHeader from "./Components/AppHeader";
import LeftNav from "./Components/LeftNav";
import ChatHeader from "./Components/ChatHeader";
import ChatBody from "./Components/ChatBody";
import { LanguageProvider} from "./utilities/LanguageContext";
import { useCookies } from "react-cookie";
import { TranscriptProvider } from './utilities/TranscriptContext';
import LoginPage from "./Components/LoginPage";
import SignUpPage from "./Components/SignUpPage";
import { Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from "aws-amplify";
import { signOut } from 'aws-amplify/auth';

function MainApp( {onLogout} ) {
  const [showLeftNav, setLeftNav] = useState(true);
  const [cookies] = useCookies(['language']);

  console.log(cookies.language)

  return (
    <>
    <Grid container direction="column" justifyContent="center" alignItems="stretch" className="appHeight100 appHideScroll">
      <Grid item >
        <AppHeader onLogout={ onLogout } />
      </Grid>
      <Grid item container direction="row" justifyContent="flex-start" alignItems="stretch" className="appFixedHeight100">
        <Grid item xs={showLeftNav ? 3 : 0.5} sx={{ backgroundColor: (theme) => theme.palette.background.chatLeftPanel }}>
          <LeftNav showLeftNav={showLeftNav} setLeftNav={setLeftNav} />
        </Grid>
        <Grid
          container
          item
          xs={showLeftNav ? 9 : 11.5}
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          className="appHeight100"
          sx={{
            padding: { xs: "1.5rem", md: "1.5rem 5%", lg: "1.5rem 10%", xl: "1.5rem 10%" },
            backgroundColor: (theme) => theme.palette.background.chatBody,
          }}
        >
          <Grid item>
            <ChatHeader />
          </Grid>
          <Grid
            container
            item
            direction="row"
            justifyContent={"center"}
            alignItems="flex-end"
            sx={{
              height: { xs: "calc(100% - 2.625rem)", md: "calc(100% - 2.625rem)", lg: "calc(100% - 2.625rem)", xl: "calc(100% - 2.625rem)" },
            }}
          >
            <ChatBody />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
    </>
  );
}

function App() {
  const [cookies] = useCookies(['language']);
  const languageSet = Boolean(cookies.language);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  // Check if user is authenticated on component mount
  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(); // AWS Cognito sign out
      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  Amplify.configure({
    Auth: {
      Cognito: {
        region: "us-east-1", // Your Cognito User Pool region
        userPoolId: "us-east-1_NOMiG9b8p", // Your Cognito User Pool ID
        userPoolClientId: "18uj8tqdjpou8r5p6dh5mtv5np", // Your App Client ID
        // identityPoolId: "us-west-2:f5d16473-a78f-4636-bcc5-6c3f483c3423", // Optional: Identity Pool ID if using Federated Identities
        loginWith: {
          oauth: {
            domain: 'https://bco-v3.auth.us-east-1.amazoncognito.com',
            scopes: ['email','gender','aws.cognito.signin.user.admin'],
            redirectSignIn: ['http://localhost:3000/','https://example.com/'],
            redirectSignOut: ['http://localhost:3000/','https://example.com/'],
            responseType: 'code',
          },
          email: true, // Login using email
        },
        signUpVerificationMethod: "code", // Code-based verification during sign-up
        userAttributes: {
          email: {
            required: true, // Email is required as an attribute
          },
          gender: {
            required: true, // Gender is required as an attribute
          },
          firstName: {
            required: true, // Email is required as an attribute
          },
          lastName: {
            required: true, // Email is required as an attribute
          },
          Diagnosis: {
            required: true, // Email is required as an attribute
          },
        },
        allowGuestAccess: false, // Set to true if guest access is needed
        passwordFormat: {
          minLength: 6,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: true,
        },
      },
    },
  });

  // console.log(isLoggedIn)
  if (!isLoggedIn) {
    return (
      <>
      <LanguageProvider>
        <TranscriptProvider>
          <ThemeProvider theme={theme}>
          
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          {/* Define routes for each page */}
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/main" element={<MainApp onLogout={handleLogout}/>} />
        </Routes>
      
        {/* <LoginPage onLogin={handleLogin} />; */}
          </ThemeProvider>
        </TranscriptProvider>
      </LanguageProvider>
      </>
    );
  }
  if (isLoggedIn) {
    // console.log("logged in")
    return (
      <>
      <LanguageProvider>
        <TranscriptProvider>
          <ThemeProvider theme={theme}>
        <Routes>
          {/* Define routes for each page */}
          <Route path="/login" element={<LoginPage onLogin={handleLogin}/>} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/main" element={<MainApp onLogout={handleLogout}/>} />
        </Routes>
      
        {/* <MainApp onLogout={handleLogout} />; */}
          </ThemeProvider>
        </TranscriptProvider>
      </LanguageProvider>
      </>
    );
  }

}

export default App;
