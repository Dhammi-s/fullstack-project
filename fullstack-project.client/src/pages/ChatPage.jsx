import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi, usersApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/UI';
import * as signalR from '@microsoft/signalr';
import { Send, MessageCircle, User, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { userId: chatUserId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Load conversations
  const loadConversations = useCallback(() => {
    chatApi.getConversations()
      .then(r => setConversations(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // SignalR connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/chat', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    conn.on('ReceiveMessage', (msg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      loadConversations();
    });

    conn.on('MessageSent', (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    conn.on('MessagesRead', () => {
      loadConversations();
    });

    conn.start()
      .then(() => setConnection(conn))
      .catch(err => console.warn('SignalR connection failed:', err));

    return () => { conn.stop(); };
  }, [loadConversations]);

  // Load messages when chatUserId changes
  const loadMessages = useCallback(async (uid) => {
    if (!uid) return;
    setLoading(true);
    setMessages([]);
    try {
      const res = await chatApi.getMessages(uid);
      setMessages(res.data || []);
      // Find selected user from conversations
      const conv = conversations.find(c => c.userId === uid);
      if (conv) setSelectedUser(conv);
      else {
        // Try loading from users
        try {
          const ur = await usersApi.getUser(uid);
          setSelectedUser({ userId: uid, userName: ur.data.fullName, userImage: ur.data.profileImage });
        } catch {}
      }
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversations]);

  useEffect(() => {
    if (chatUserId) loadMessages(chatUserId);
  }, [chatUserId]); // eslint-disable-line

  // Auto scroll
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
    setSending(true);
    try {
      if (connection?.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('SendMessage', chatUserId, newMessage.trim());
      } else {
        await chatApi.sendMessage({ receiverId: chatUserId, message: newMessage.trim() });
        await loadMessages(chatUserId);
      }
      setNewMessage('');
      loadConversations();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.userName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex h-[600px] shadow-sm">

        {/* Conversations Sidebar */}
        <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700 mb-2">Conversations</h2>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm mt-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No conversations yet
              </div>
            ) : filteredConversations.map(conv => (
              <button key={conv.userId}
                onClick={() => selectConversation(conv)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${chatUserId === conv.userId ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {conv.userName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800">{conv.userName}</p>
                  <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!chatUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageCircle className="w-16 h-16 mb-4 text-gray-200" />
              <p className="font-medium">Select a conversation to start chatting</p>
              <p className="text-sm mt-1">Or go to a worker/user profile to start a new chat</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {selectedUser?.userName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{selectedUser?.userName || 'Chat'}</h2>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? <LoadingSpinner /> : messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8 text-sm">No messages yet. Say hello! 👋</div>
                ) : messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.userId;
                  return (
                    <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2 flex-shrink-0 self-end">
                          {msg.senderName?.[0] || '?'}
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}>
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && <span className="ml-1">{msg.isRead ? ' ✓✓' : ' ✓'}</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="Type a message… (Enter to send)"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button type="submit" disabled={!newMessage.trim() || sending}
                  className="btn-primary px-4 flex items-center gap-1 disabled:opacity-50">
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}



    