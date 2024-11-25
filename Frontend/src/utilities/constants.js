// --------------------------------------------------------------------------------------------------------//
// Primary color constants for the theme
export const PRIMARY_MAIN = "#444E56"; // The main primary color used for buttons, highlights, etc.
export const primary_50 = "#E7B00C"; // The 50 variant of the primary color

// Background color constants
export const SECONDARY_MAIN = "#E6A834"; // The main secondary color used for less prominent elements

// Chat component background colors
export const CHAT_BODY_BACKGROUND = "#FFFFFF"; // Background color for the chat body area
export const CHAT_LEFT_PANEL_BACKGROUND = "#FFFFFF"; // Background color for the left panel in the chat
export const ABOUT_US_HEADER_BACKGROUND = "#000000"; // Background color for the About Us section in the left panel
export const FAQ_HEADER_BACKGROUND = "#000000"; // Background color for the FAQ section in the left panel
export const ABOUT_US_TEXT = "#000000"; // Text color for the About Us section in the left panel
export const FAQ_TEXT = "#000000"; // Text color for the FAQ section in the left panel
export const HEADER_BACKGROUND = "#FFFFFF"; // Background color for the header
export const HEADER_TEXT_GRADIENT = "#444E56"; // Text gradient color for the header

// Message background colors
export const BOTMESSAGE_BACKGROUND = "#F5F5F5"; // Background color for messages sent by the bot
export const USERMESSAGE_BACKGROUND = "#FFEFCA"; // Background color for messages sent by the user

// --------------------------------------------------------------------------------------------------------//
// --------------------------------------------------------------------------------------------------------//
// Text Constants
export const TEXT = {
  EN: {
    APP_NAME: "Chatbot Template App",
    APP_ASSISTANT_NAME: "GenAI Bot",
    ABOUT_US_TITLE: "About us",
    ABOUT_US: "Our mission is to help people make sense of the complex information in the complex medical and personal information about breast health and breast cancer, so that they can make informed decisions about their lives",
    FAQ_TITLE: "Search History",
    FAQS : [
      "What type of breast cancer do I have?",
      "What stage is my breast cancer, and how does that affect my treatment?",
      "What are my treatment options?",
      "What is the survival rate for my type and stage of breast cancer?",
      "How soon should I begin treatment?",
      "Can I get a second opinion, and will that delay my treatment?",
      "What are the side effects of the treatments you are recommending?",
      "Will I lose my hair from chemotherapy?",
      "Will I need surgery, and if so, what type (lumpectomy vs. mastectomy)?",
      "What are the risks of surgery and other treatments?",
      "How will treatment affect my daily life, including work and family?",
      "Should I consider genetic testing to determine if my cancer is hereditary?",
      "Will I need to change my diet or lifestyle during treatment?",
      "Are there clinical trials available for my type of breast cancer?",
      "Where can I find emotional support or support groups for breast cancer patients?"
  ],
    // CHAT_HEADER_TITLE: localStorage.getItem('User_data', 'Ganesh').getItem('username', 'Ganesh'),
    CHAT_HEADER_TITLE: "Welcome, "+ localStorage.getItem('User_data', 'Ganesh'), // FIXME: Make the dynamic depending on the user
    CHAT_INPUT_PLACEHOLDER: "Type Your Search Query Here...",
    HELPER_TEXT: "Cannot send empty message",
    SPEECH_RECOGNITION_START: "Start Listening",
    SPEECH_RECOGNITION_STOP: "Stop Listening",
    SPEECH_RECOGNITION_HELPER_TEXT: "Stop speaking to send the message" // New helper text
  },
  ES: {
    APP_NAME: "Aplicación de Plantilla de Chatbot",
    APP_ASSISTANT_NAME: "Bot GenAI",
    ABOUT_US_TITLE: "Acerca de nosotros",
    ABOUT_US: "¡Bienvenido al chatbot GenAI! Estamos aquí para ayudarte a acceder rápidamente a la información relevante.",
    FAQ_TITLE: "Preguntas frecuentes",
    FAQS: [
      "¿Qué es React JS? y ¿Cómo puedo empezar?",
      "¿Qué es un Chatbot y cómo funciona?",
      "Escríbeme un ensayo sobre la historia de Internet.",
      "¿Cuál es la capital de Francia y su población?",
      "¿Cómo está el clima en Nueva York?"
    ],
    CHAT_HEADER_TITLE: "Asistente de Chat AI de Ejemplo",
    CHAT_INPUT_PLACEHOLDER: "Escribe una Consulta...",
    HELPER_TEXT: "No se puede enviar un mensaje vacío",
    SPEECH_RECOGNITION_START: "Comenzar a Escuchar",
    SPEECH_RECOGNITION_STOP: "Dejar de Escuchar",
    SPEECH_RECOGNITION_HELPER_TEXT: "Deja de hablar para enviar el mensaje" // New helper text
  }
};

export const SWITCH_TEXT = {
  SWITCH_LANGUAGE_ENGLISH: "English",
  SWITCH_TOOLTIP_ENGLISH: "Language",
  SWITCH_LANGUAGE_SPANISH: "Español",
  SWITCH_TOOLTIP_SPANISH: "Idioma"
};

export const LANDING_PAGE_TEXT = {
  EN: {
    CHOOSE_LANGUAGE: "Choose language:",
    ENGLISH: "English",
    SPANISH: "Español",
    SAVE_CONTINUE: "Save and Continue",
    APP_ASSISTANT_NAME: "Sample GenAI Bot Landing Page",
  },
  ES: {
    CHOOSE_LANGUAGE: "Elige el idioma:",
    ENGLISH: "English",
    SPANISH: "Español",
    SAVE_CONTINUE: "Guardar y continuar",
    APP_ASSISTANT_NAME: "Bot GenAI de Ejemplo Página de Inicio",
  }
};


// --------------------------------------------------------------------------------------------------------//
// --------------------------------------------------------------------------------------------------------//

// API endpoints


export const CHAT_API = process.env.REACT_APP_CHAT_API; // URL for the chat API endpoint
// export const WEBSOCKET_API = 'wss://b21w3jq2ld.execute-api.us-east-1.amazonaws.com/production/';
export const WEBSOCKET_API = process.env.REACT_APP_WEBSOCKET_API; // URL for the WebSocket API endpoint
// export const API_URL = 'https://z5s1s8rp0d.execute-api.us-east-1.amazonaws.com/dev1'
export const API_URL = process.env.REACT_APP_API_URL;

// --------------------------------------------------------------------------------------------------------//
// --------------------------------------------------------------------------------------------------------//

// Features
export const ALLOW_FILE_UPLOAD = false; // Set to true to enable file upload feature
export const ALLOW_VOICE_RECOGNITION = false; // Set to true to enable voice recognition feature

export const ALLOW_MULTLINGUAL_TOGGLE = false; // Set to true to enable multilingual support
export const ALLOW_LANDING_PAGE = false; // Set to true to enable the landing page

// --------------------------------------------------------------------------------------------------------//
// Styling under work, would reccomend keeping it false for now
export const ALLOW_MARKDOWN_BOT = true; // Set to true to enable markdown support for bot messages
export const ALLOW_FAQ = true; // Set to true to enable the FAQs to be visible in Chat body 