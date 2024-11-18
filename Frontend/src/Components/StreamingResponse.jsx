import React, { useState, useEffect, useRef } from "react";
import { Grid, Avatar, Typography } from "@mui/material";
import BCO_avatar from "../Assets/BCO_circle.png";
import { WEBSOCKET_API, ALLOW_MARKDOWN_BOT } from "../utilities/constants";
import ReactMarkdown from "react-markdown";


const StreamingMessage = ({ initialMessage, setProcessing }) => {
  const [responses, setResponses] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const ws = useRef(null);
  const hasSentInitialChatHistory = useRef(false);
  const messageBuffer = useRef(""); // Buffer to hold incomplete JSON strings

  useEffect(() => {
    // Initialize WebSocket connection
    ws.current = new WebSocket(WEBSOCKET_API);
    function getConversationData() {
      return localStorage.getItem('conversationData');
    }

    function saveConversationData(data) {
      localStorage.setItem('conversationData', JSON.stringify(data));
    }

    ws.current.onopen = () => {
      console.log("WebSocket Connected");

      if (!hasSentInitialChatHistory.current){
      // Send initial message
      const parsedUserData = JSON.parse(localStorage.getItem("user_data"));
      console.log(parsedUserData)

      

      let conversationData = eval(getConversationData());
      console.log("conversationData evaluated", conversationData)
      conversationData.push({ role: "user", content: initialMessage })
      console.log("conversationData after push", conversationData)

      saveConversationData(conversationData);
      // console.log(eval(getConversationData()));
      console.log(localStorage)

      console.log("Send Chat History: ", localStorage.getItem('conversationData'));
      console.log(localStorage)
      ws.current.send(JSON.stringify({ 
        action: "sendMessage",
        breastCancerType: parsedUserData.breastCancerType,
        breastCancerStage: parsedUserData.breastCancerStage,
        username: parsedUserData.username,
        email: parsedUserData.email,
        Message: initialMessage,
        chatHistory: conversationData}));
    };

    hasSentInitialChatHistory.current = true;
  }
    

    ws.current.onmessage = (event) => {
      try {
        console.log("Received message: ", event);
        const parsed_event_data = JSON.parse(event.data)  
        console.log("Received Chathistory:", parsed_event_data.ChatHistory)
        console.log("Chat History type", typeof parsed_event_data.ChatHistory)
        console.log(Array.isArray(parsed_event_data.ChatHistory));
        console.log(parsed_event_data.ChatHistory[0])
        console.log(parsed_event_data.ChatHistory[0].content)

        let conversationData = eval(getConversationData());
        console.log("conversationData evaluated", conversationData)
        console.log("conversationData type", typeof conversationData)
        conversationData.push(parsed_event_data.ChatHistory[1])
        console.log("conversationData after push", conversationData)

        saveConversationData(conversationData)
        console.log(localStorage)

        localStorage.setItem("chatHistory", parsed_event_data.ChatHistory);
        setChatHistory((prev) => [...prev, "oleole"]);
        
        console.log("Parsed event: ", parsed_event_data);
        messageBuffer.current += parsed_event_data.Response; // Append new data to buffer                    
        const parsedData = JSON.parse(event.data); // Try to parse the full buffer
        
        console.log(chatHistory)
        if (event.type === "message") {
          // Implement your logic here
          setResponses((prev) => [...prev, parsed_event_data.Response]);
          setProcessing(false); // Set processing to false when parsing is complete
          console.log("end of conversation");
        }
        
        if (parsedData.type === "delta") {
          setResponses((prev) => [...prev, parsedData.text]);
        }

        // Update the previous data type
        messageBuffer.current = ""; // Clear buffer on successful parse
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.log("Received incomplete JSON, waiting for more data...");
          console.log(e)
        } else {
          console.error("Error processing message: ", e);
          messageBuffer.current = ""; // Clear buffer if error is not related to JSON parsing
        }
      }
    };

    ws.current.onerror = (error) => {
      console.log("WebSocket Error: ", error);
    };

    ws.current.onclose = (event) => {
      if (event.wasClean) {
        console.log(`WebSocket closed cleanly, code=${event.code}, reason=${event.reason}`);
      } else {
        console.log("WebSocket Disconnected unexpectedly");
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [initialMessage, setProcessing, chatHistory]
); // Add setProcessing to the dependency array

return (
  <Grid container direction="row" justifyContent="flex-start" alignItems="flex-end">
    <Grid item>
      <Avatar alt="Bot Avatar" src={BCO_avatar} />
    </Grid>
    {ALLOW_MARKDOWN_BOT ? (
      <Grid item className="botMessage" sx={{ backgroundColor: (theme) => theme.palette.background.botMessage }}>
        <ReactMarkdown>{responses.join("")}</ReactMarkdown>
      </Grid>
    ) : (
      <Grid item className="botMessage" sx={{ backgroundColor: (theme) => theme.palette.background.botMessage }}>
        <Typography variant="body2">{responses.join("")}</Typography>  
      </Grid>
    )}
  </Grid>
  );
};

export default StreamingMessage;