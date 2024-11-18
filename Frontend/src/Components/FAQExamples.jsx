import React, { useState, useEffect } from "react";
import { TEXT } from "../utilities/constants";
import { useLanguage } from "../utilities/LanguageContext"; // Adjust the import path
import { Box, Button, Grid } from "@mui/material";

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const FAQExamples = ({ onPromptClick }) => {
  const { language } = useLanguage();
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    // Shuffle FAQs on initial render
    const shuffledFAQs = shuffleArray([...TEXT[language].FAQS]).slice(0, 4);
    setFaqs(shuffledFAQs);
  }, [language]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Grid container spacing={1}>
          {faqs.map((prompt, index) => (
            <Grid item key={index} xs={3}>
              <Button
                variant=""
                size="small"
                onClick={() => onPromptClick(prompt)}
                sx={{
                  width: "100%",
                  textTransform: "none", // Prevent text from being uppercase
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                  backgroundColor: '#f5f5f5', // Light grey background
                  borderRadius: '12px', // More curved corners
                  '&:hover': {
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
                    backgroundColor: '#f0f0f0' // Slightly darker on hover
                  }
                }}
              >
                {prompt}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
  );
};

export default FAQExamples;
