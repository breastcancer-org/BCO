import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useLanguage } from "../utilities/LanguageContext"; // Adjust the import path
import { ABOUT_US_HEADER_BACKGROUND, ABOUT_US_TEXT, FAQ_HEADER_BACKGROUND, FAQ_TEXT, TEXT } from "../utilities/constants"; // Adjust the import path
import closeIcon from "../Assets/close.svg"; // Assuming close.svg is an image
import arrowRightIcon from "../Assets/arrow_right.svg"; // Assuming arrow_right.svg is an image

function LeftNav({ showLeftNav = true, setLeftNav }) {
  const { language } = useLanguage();
  console.log(language)

  return (
    <>
      {/* <Grid className="appHeight100" sx={{ borderRight: '1px solid #ccc' }}> */}
      <Grid className="appHeightCustom" justifyContent="flex-end" sx={{ '--height': '700px', borderRight: '5px solid #eee', transform: 'translateY(16px)' }}>              
        <Grid container direction="column" justifyContent="flex-end" alignItems="stretch" padding={4} spacing={2}>
          {showLeftNav ? (
            <>
              <Grid item container direction="column" justifyContent="flex-start" alignItems="flex-end">
                <img
                  src={closeIcon}
                  alt="Close Panel"
                  onClick={() => setLeftNav(false)} // Removed extra parentheses
                />
              </Grid>
              <Grid item >
                <Typography variant="h6" sx={{fontWeight:"bold"}} color={ABOUT_US_HEADER_BACKGROUND}>{TEXT[language].ABOUT_US_TITLE}</Typography>
              </Grid>
              <Grid item sx={{ marginBottom: '-8px' }}>
                <Typography variant="subtitle1" color={ABOUT_US_TEXT} sx={{fontFamily: 'Times New Roman', lineHeight: '1.2'}}>Our mission is to <em>help people</em> make sense of the complex information in the complex medical and personal information about <em>breast health</em> and <em>breast cancer</em>, so that they can make informed decisions about their lives</Typography>              
              </Grid>
              {/* <Grid item>
                <Typography variant="h6" sx={{fontWeight:"bold"}} color={FAQ_HEADER_BACKGROUND}>{TEXT[language].FAQ_TITLE}</Typography>
              </Grid> */}
              {/* <Grid item>
                <ul >
                  {TEXT[language].FAQS.map((question, index) => (
                    <li key={index} >
                      <Typography variant="subtitle1" color={FAQ_TEXT}>{question}</Typography>
                    </li>
                  ))}
                </ul>
              </Grid> */}
            </>
          ) : (
            <>
              <Grid item container direction="column" justifyContent="flex-start" alignItems="flex-end">
                <img
                  src={arrowRightIcon}
                  alt="Open Panel"
                  onClick={() => setLeftNav(true)} // Removed extra parentheses
                />
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default LeftNav;
