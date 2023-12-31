// Chat.tsx
import React, { useCallback, useEffect, useMemo } from 'react';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MainContainer, TypingIndicator, Avatar } from "@chatscope/chat-ui-kit-react";
import MainSidebar from '../MainSidebar/MainSidebar';
import ChatContainerComponent from '../ChatContainerComponent/ChatContainerComponent';
import './Chat.css';
import {
  useChat,
  ChatMessage,
  MessageContentType,
  MessageDirection,
  MessageStatus
} from "@chatscope/use-chat";
import {MessageContent, TextContent, User} from "@chatscope/use-chat";


export const Chat = ({user}:{user:User}) => {
    
  // Get all chat related values and methods from useChat hook 
  const {
      currentMessages, conversations, activeConversation, setActiveConversation,  sendMessage, getUser, currentMessage, setCurrentMessage,
      sendTyping, setCurrentUser
  } = useChat();
  
  useEffect( () => {
      setCurrentUser(user);
  },[user, setCurrentUser]);
  
  // Get current user data
  const [currentUserAvatar, currentUserName] = useMemo(() => {

      if (activeConversation) {
          const participant = activeConversation.participants.length > 0 ? activeConversation.participants[1] : undefined;

          if (participant) {
              const user = getUser(participant.id);
              if (user) {

                  return [<Avatar src={user.avatar} />, user.username]
              }
          }
      }

      return [undefined, undefined];

  }, [activeConversation, getUser]);

  const handleChange = (value:string) => {
      // Send typing indicator to the active conversation
      // You can call this method on each onChange event
      // because sendTyping method can throttle sending this event
      // So typing event will not be send to often to the server
      setCurrentMessage(value);
      if ( activeConversation ) {
          sendTyping({
              conversationId: activeConversation?.id,
              isTyping:true,
              userId: user.id,
              content: value, // Note! Most often you don't want to send what the user types, as this can violate his privacy!
              throttle: true
          });
      }
      
  }
  
  const handleSend = (text:string) => {
      
      const message = new ChatMessage({
          id: "", // Id will be generated by storage generator, so here you can pass an empty string
          content: text as unknown as MessageContent<TextContent>,
          contentType: MessageContentType.TextHtml,
          senderId: user.id,
          direction: MessageDirection.Outgoing,
          status: MessageStatus.Sent
      });
      
      if ( activeConversation ) {
          sendMessage({
              message,
              conversationId: activeConversation.id,
              senderId: user.id,
          });
      }

  };
  
  const getTypingIndicator = useCallback(
      () => {
          
              if (activeConversation) {

                  const typingUsers = activeConversation.typingUsers;

                  if (typingUsers.length > 0) {

                      const typingUserId = typingUsers.items[0].userId;

                      // Check if typing user participates in the conversation
                      if (activeConversation.participantExists(typingUserId)) {

                          const typingUser = getUser(typingUserId);

                          if (typingUser) {
                              return <TypingIndicator content={`${typingUser.username} is typing`} />
                          }

                      }

                  }

              }
              

          return undefined;

      }, [activeConversation, getUser],
  );

  return (
    <div className="chatContainer">
      <MainContainer>
        <MainSidebar user={user}  activeConversation={activeConversation} setActiveConversation={setActiveConversation} conversations={conversations} getUser={getUser}/>
        <ChatContainerComponent 
          user={user}
          activeConversation={activeConversation}
          currentMessages={currentMessages}
          currentUserName={currentUserName}
          currentUserAvatar={currentUserAvatar}
          currentMessage={currentMessage}
          handleChange={handleChange}
          handleSend={handleSend}
          getTypingIndicator={getTypingIndicator}
          getUser={getUser}
        />
      </MainContainer>
    </div>
  );
}

export default Chat;
