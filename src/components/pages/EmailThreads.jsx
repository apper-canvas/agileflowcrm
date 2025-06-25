import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/molecules/Card';
import LoadingSpinner from '@/components/molecules/LoadingSpinner';
import ErrorState from '@/components/molecules/ErrorState';
import EmailComposer from '@/components/organisms/EmailComposer';
import emailService from '@/services/api/emailService';
import contactService from '@/services/api/contactService';

const EmailThreads = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [contacts, setContacts] = useState({});

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      const threadsData = await emailService.getThreads();
      setThreads(threadsData);
      
      // Load contact information for threads
      const contactIds = [...new Set(threadsData.map(t => t.lastMessage.contactId).filter(Boolean))];
      const contactsData = {};
      await Promise.all(
        contactIds.map(async (contactId) => {
          try {
            const contact = await contactService.getById(contactId);
            contactsData[contactId] = contact;
          } catch (error) {
            console.warn(`Could not load contact ${contactId}`);
          }
        })
      );
      setContacts(contactsData);
    } catch (error) {
      setError('Failed to load email threads');
      console.error('Load threads error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThreadMessages = async (threadId) => {
    try {
      setMessagesLoading(true);
      const messages = await emailService.getByThreadId(threadId);
      setThreadMessages(messages);
      
      // Mark messages as read
      const unreadMessages = messages.filter(m => !m.isRead);
      await Promise.all(
        unreadMessages.map(message => emailService.markAsRead(message.Id))
      );
      
      if (unreadMessages.length > 0) {
        loadThreads(); // Refresh threads to update read status
      }
    } catch (error) {
      toast.error('Failed to load messages');
      console.error('Load messages error:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleThreadSelect = (thread) => {
    setSelectedThread(thread);
    loadThreadMessages(thread.threadId);
  };

  const handleCompose = () => {
    setReplyTo(null);
    setShowComposer(true);
  };

  const handleReply = (message) => {
    setReplyTo(message);
    setShowComposer(true);
  };

  const handleToggleStar = async (messageId, event) => {
    event.stopPropagation();
    try {
      await emailService.toggleStar(messageId);
      loadThreads();
      if (selectedThread) {
        loadThreadMessages(selectedThread.threadId);
      }
    } catch (error) {
      toast.error('Failed to update star status');
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <ApperIcon name="AlertCircle" size={14} className="text-error" />;
      case 'low':
        return <ApperIcon name="ArrowDown" size={14} className="text-gray-400" />;
      default:
        return null;
    }
  };

  const getContactInfo = (email, contactId) => {
    if (contactId && contacts[contactId]) {
      return contacts[contactId].name;
    }
    return email.split('@')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load emails"
        message={error}
        action={
          <Button onClick={loadThreads} icon="RefreshCw">
            Try Again
          </Button>
        }
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email</h1>
          <p className="text-gray-600 mt-1">Manage your email conversations</p>
        </div>
        <Button onClick={handleCompose} icon="Plus" variant="primary">
          Compose Email
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Thread List */}
        <Card className="col-span-1 p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Conversations</h2>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {threads.length === 0 ? (
              <div className="p-6 text-center">
                <ApperIcon name="Mail" size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No email conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {threads.map((thread) => (
                  <motion.div
                    key={thread.threadId}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    onClick={() => handleThreadSelect(thread)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedThread?.threadId === thread.threadId ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-medium text-sm truncate ${
                        !thread.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {thread.subject}
                      </h3>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        {getPriorityIcon(thread.priority)}
                        {thread.isStarred && (
                          <ApperIcon name="Star" size={14} className="text-warning fill-current" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      From: {getContactInfo(thread.lastMessage.from, thread.lastMessage.contactId)}
                    </p>
                    <p className="text-xs text-gray-400 truncate mb-2">
                      {thread.lastMessage.body.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {format(new Date(thread.lastMessage.createdAt), 'MMM d, h:mm a')}
                      </span>
                      <div className="flex items-center gap-2">
                        {thread.messageCount > 1 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {thread.messageCount}
                          </span>
                        )}
                        {!thread.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Message View */}
        <Card className="col-span-2 p-0 overflow-hidden">
          {selectedThread ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedThread.subject}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedThread.messageCount} message{selectedThread.messageCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="Reply"
                    onClick={() => handleReply(threadMessages[threadMessages.length - 1])}
                  >
                    Reply
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : (
                  threadMessages.map((message, index) => (
                    <motion.div
                      key={message.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {getContactInfo(message.from, message.contactId)}
                            </span>
                            <span className="text-xs text-gray-500">
                              &lt;{message.from}&gt;
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            To: {message.to.join(', ')}
                          </div>
                          {message.cc.length > 0 && (
                            <div className="text-xs text-gray-500">
                              CC: {message.cc.join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleToggleStar(message.Id, e)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <ApperIcon 
                              name="Star" 
                              size={14} 
                              className={`${message.isStarred ? 'text-warning fill-current' : 'text-gray-400'}`}
                            />
                          </button>
                          <span className="text-xs text-gray-400">
                            {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {message.body}
                      </div>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-xs text-gray-500 mb-2">Attachments:</div>
                          <div className="space-y-1">
                            {message.attachments.map((attachment, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <ApperIcon name="Paperclip" size={12} className="text-gray-400" />
                                <span className="text-primary hover:underline cursor-pointer">
                                  {attachment.name}
                                </span>
                                <span className="text-gray-400">({attachment.size})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <ApperIcon name="Mail" size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the list to view messages</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <EmailComposer
        isOpen={showComposer}
        onClose={() => {
          setShowComposer(false);
          setReplyTo(null);
          loadThreads();
        }}
        replyTo={replyTo}
        threadId={selectedThread?.threadId}
      />
    </div>
  );
};

export default EmailThreads;