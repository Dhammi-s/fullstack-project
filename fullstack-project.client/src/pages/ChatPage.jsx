import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/UI';
import * as signalR from '@microsoft/signalr';
import { Send, MessageCircle, User } from 'lucide-react';

export default function ChatPage() {
  const { userId: chatUserId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    chatApi.getConversations().then(r => setConversations(r.data));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const conn = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/chat', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    conn.on('ReceiveMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    conn.on('MessageSent', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    conn.start().then(() => setConnection(conn)).catch(console.error);
    return () => conn.stop();
  }, []);

  const loadMessages = useCallback(async (uid) => {
    setLoading(true);
    try {
      const res = await chatApi.getMessages(uid);
      setMessages(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (chatUserId) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const res = await chatApi.getMessages(chatUserId);
          setMessages(res.data);
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    }
  }, [chatUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (conv) => {
    setSelectedUser(conv);
    navigate(`/chat/${conv.userId}`);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatUserId) return;
    if (connection?.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('SendMessage', chatUserId, newMessage);
    } else {
      await chatApi.sendMessage({ receiverId: chatUserId, message: newMessage });
      await loadMessages(chatUserId);
    }
    setNewMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex h-[600px]">
        {/* Conversations */}
        <div className="w-72 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No conversations yet</div>
            ) : conversations.map(conv => (
              <button key={conv.userId}
                onClick={() => selectConversation(conv)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${chatUserId === conv.userId ? 'bg-blue-50' : ''}`}>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800">{conv.userName}</p>
                  <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {!chatUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageCircle className="w-16 h-16 mb-4 text-gray-200" />
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-700">{selectedUser?.userName || 'Chat'}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? <LoadingSpinner /> : messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                      msg.senderId === user?.userId
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.senderId === user?.userId ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-2">
                <input className="input-field flex-1" placeholder="Type a message..."
                  value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                <button type="submit" disabled={!newMessage.trim()}
                  className="btn-primary px-4 flex items-center gap-1">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
    