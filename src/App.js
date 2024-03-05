import React, { useState } from 'react';
import { chatCompletion, followUpGeneration } from './openai';
import { Chip } from '@mui/material';
import './chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [followUpActions, setFollowUpActions] = useState([]);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (inputText.trim() !== '') {
      // add user message to the messages list
      setMessages([...messages, { text: inputText, sender: 'user' }]);
      // reset the input text after sending the message
      setInputText('');
      setLoadingResponse(true);
      // call openai chat completion api here. Because it's an async function, we need to use .then (chaining promise) to get the response asynchrously
      // refer to the following link to see how to use async/await: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises#chaining_promises
      chatCompletion(inputText).then((sysResponse) => {
        // 
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: sysResponse, sender: 'chatbot' },
        ]);
        setLoadingResponse(false);
        return { inputText, sysResponse };
      }).then((inputText, sysResponse) => {
        setLoadingAction(true)
        followUpGeneration(inputText, sysResponse).then((res) => {
          setFollowUpActions(res);
          setLoadingAction(false);
        });
      })

    }
  };

  const handleActionSelected = (action) => {
    setLoadingResponse(true);
    chatCompletion(action).then((sysResponse) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: sysResponse, sender: 'chatbot' },
      ]);
      setLoadingResponse(false);
    });
  }

  return (
    <div className="chatbot-container">
      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user-message' : 'chatbot-message'
              }`}
          >
            {message.text}
          </div>
        ))}
        {loadingResponse && <div className="ellipsis"></div>}
      </div>
      <div>
        <div>
          {
            loadingAction && <div className="ellipsis"></div>
          }
        </div>
        {
          !loadingAction && followUpActions.length > 0 && (
            followUpActions.map((action, index) => {
              return (
                <Chip key={index} label={action} className="chatbot-chip" onClick={() => handleActionSelected(action)} />
              )
            }
            ))
        }
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
