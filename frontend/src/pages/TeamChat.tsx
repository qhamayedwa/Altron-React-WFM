import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, ListGroup, InputGroup, Spinner } from 'react-bootstrap';
import { MessageSquare, Send, Users, Search, Phone, Video, MoreVertical, Paperclip, Smile, Check, CheckCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'system';
}

interface Conversation {
  id: number;
  type: 'direct' | 'group';
  name: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  avatar?: string;
}

export default function TeamChat() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || generateMockConversations());
    } catch (err) {
      setConversations(generateMockConversations());
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const response = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages(response.data.messages || generateMockMessages());
    } catch (err) {
      setMessages(generateMockMessages());
    }
  };

  const generateMockConversations = (): Conversation[] => [
    { id: 1, type: 'group', name: 'Operations Team', participants: ['John', 'Sarah', 'Mike'], lastMessage: 'Updated the shift schedule for next week', lastMessageTime: new Date(Date.now() - 300000).toISOString(), unreadCount: 3 },
    { id: 2, type: 'direct', name: 'Sarah Johnson', participants: ['Sarah'], lastMessage: 'Can you approve my leave request?', lastMessageTime: new Date(Date.now() - 3600000).toISOString(), unreadCount: 1 },
    { id: 3, type: 'group', name: 'All Staff', participants: ['Everyone'], lastMessage: 'Reminder: Monthly meeting tomorrow at 10AM', lastMessageTime: new Date(Date.now() - 7200000).toISOString(), unreadCount: 0 },
    { id: 4, type: 'direct', name: 'Mike Brown', participants: ['Mike'], lastMessage: 'Thanks for the help!', lastMessageTime: new Date(Date.now() - 86400000).toISOString(), unreadCount: 0 },
    { id: 5, type: 'group', name: 'Managers', participants: ['Jane', 'Tom', 'Lisa'], lastMessage: 'Q4 targets have been shared', lastMessageTime: new Date(Date.now() - 172800000).toISOString(), unreadCount: 0 }
  ];

  const generateMockMessages = (): Message[] => [
    { id: 1, senderId: 2, senderName: 'Sarah Johnson', content: 'Good morning team!', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true, type: 'text' },
    { id: 2, senderId: 3, senderName: 'Mike Brown', content: 'Morning! Ready for the busy day ahead?', timestamp: new Date(Date.now() - 7000000).toISOString(), read: true, type: 'text' },
    { id: 3, senderId: user?.id || 1, senderName: 'You', content: 'Yes, I have updated the schedule for the week', timestamp: new Date(Date.now() - 6800000).toISOString(), read: true, type: 'text' },
    { id: 4, senderId: 2, senderName: 'Sarah Johnson', content: 'Great! Can you share it with the team?', timestamp: new Date(Date.now() - 6600000).toISOString(), read: true, type: 'text' },
    { id: 5, senderId: user?.id || 1, senderName: 'You', content: 'Already done, check your email', timestamp: new Date(Date.now() - 6400000).toISOString(), read: true, type: 'text' },
    { id: 6, senderId: 3, senderName: 'Mike Brown', content: 'Perfect, I can see it now 👍', timestamp: new Date(Date.now() - 6200000).toISOString(), read: true, type: 'text' },
    { id: 7, senderId: 0, senderName: 'System', content: 'Sarah Johnson left the chat', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true, type: 'system' },
    { id: 8, senderId: 2, senderName: 'Sarah Johnson', content: 'Sorry, had to step away. Back now!', timestamp: new Date(Date.now() - 1800000).toISOString(), read: true, type: 'text' },
    { id: 9, senderId: 2, senderName: 'Sarah Johnson', content: 'Updated the shift schedule for next week', timestamp: new Date(Date.now() - 300000).toISOString(), read: false, type: 'text' }
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: messages.length + 1,
      senderId: user?.id || 1,
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true,
      type: 'text'
    };

    setMessages([...messages, message]);
    setNewMessage('');

    try {
      await api.post(`/messages/conversations/${selectedConversation.id}/messages`, {
        content: newMessage
      });
    } catch (err) {
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) {
      return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) {
      return date.toLocaleDateString('en-ZA', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#28468D', '#54B8DF', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading conversations...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={4} lg={3}>
          <Card className="shadow-sm" style={{ height: 'calc(100vh - 140px)' }}>
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <MessageSquare className="text-primary" /> Messages
                </h5>
                <Button variant="primary" size="sm">
                  <Users size={14} />
                </Button>
              </div>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-white"><Search size={14} /></InputGroup.Text>
                <Form.Control
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Card.Header>
            <ListGroup variant="flush" style={{ overflowY: 'auto', flex: 1 }}>
              {filteredConversations.map(conv => (
                <ListGroup.Item
                  key={conv.id}
                  action
                  active={selectedConversation?.id === conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className="d-flex align-items-center gap-2 py-3"
                >
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                    style={{ width: 40, height: 40, background: getAvatarColor(conv.name), fontSize: 14 }}
                  >
                    {conv.type === 'group' ? <Users size={18} /> : getInitials(conv.name)}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex justify-content-between">
                      <span className="fw-medium text-truncate">{conv.name}</span>
                      <small className="text-muted">{formatTime(conv.lastMessageTime || '')}</small>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted text-truncate">{conv.lastMessage}</small>
                      {conv.unreadCount > 0 && (
                        <Badge bg="primary" pill>{conv.unreadCount}</Badge>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col md={8} lg={9}>
          <Card className="shadow-sm" style={{ height: 'calc(100vh - 140px)' }}>
            {selectedConversation ? (
              <>
                <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center text-white"
                      style={{ width: 40, height: 40, background: getAvatarColor(selectedConversation.name) }}
                    >
                      {selectedConversation.type === 'group' ? <Users size={18} /> : getInitials(selectedConversation.name)}
                    </div>
                    <div>
                      <h6 className="mb-0">{selectedConversation.name}</h6>
                      <small className="text-muted">
                        {selectedConversation.type === 'group' 
                          ? `${selectedConversation.participants.length} participants` 
                          : 'Online'}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="light" size="sm"><Phone size={16} /></Button>
                    <Button variant="light" size="sm"><Video size={16} /></Button>
                    <Button variant="light" size="sm"><MoreVertical size={16} /></Button>
                  </div>
                </Card.Header>

                <Card.Body className="p-3" style={{ overflowY: 'auto', flex: 1, background: '#f8f9fa' }}>
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === (user?.id || 1);
                    const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                    if (msg.type === 'system') {
                      return (
                        <div key={msg.id} className="text-center my-3">
                          <small className="text-muted bg-white px-3 py-1 rounded">{msg.content}</small>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`d-flex mb-2 ${isMe ? 'justify-content-end' : ''}`}>
                        {!isMe && showAvatar && (
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center text-white me-2 flex-shrink-0"
                            style={{ width: 32, height: 32, background: getAvatarColor(msg.senderName), fontSize: 12 }}
                          >
                            {getInitials(msg.senderName)}
                          </div>
                        )}
                        {!isMe && !showAvatar && <div style={{ width: 40 }} />}
                        <div style={{ maxWidth: '70%' }}>
                          {!isMe && showAvatar && (
                            <small className="text-muted ms-1">{msg.senderName}</small>
                          )}
                          <div 
                            className={`p-2 px-3 rounded-3 ${isMe ? 'bg-primary text-white' : 'bg-white'}`}
                            style={{ borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }}
                          >
                            {msg.content}
                          </div>
                          <div className={`d-flex align-items-center gap-1 mt-1 ${isMe ? 'justify-content-end' : ''}`}>
                            <small className="text-muted">{formatTime(msg.timestamp)}</small>
                            {isMe && (msg.read ? <CheckCheck size={14} className="text-primary" /> : <Check size={14} className="text-muted" />)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Card.Body>

                <Card.Footer className="bg-white py-3">
                  <Form onSubmit={handleSendMessage}>
                    <InputGroup>
                      <Button variant="light"><Paperclip size={18} /></Button>
                      <Form.Control
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <Button variant="light"><Smile size={18} /></Button>
                      <Button variant="primary" type="submit" disabled={!newMessage.trim()}>
                        <Send size={18} />
                      </Button>
                    </InputGroup>
                  </Form>
                </Card.Footer>
              </>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                <div className="text-center">
                  <MessageSquare size={64} className="mb-3 opacity-50" />
                  <h5>Select a conversation</h5>
                  <p>Choose from your existing conversations or start a new one</p>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
