import React, { useState } from 'react';
import { StyleSheet,  View,  Text,  TouchableOpacity,  TextInput,  FlatList, SafeAreaView, KeyboardAvoidingView, Platform,} from 'react-native';
import { colors } from '@/constants';
import { ArrowLeft, Send, Phone} from 'lucide-react-native';



export default function ChatDetailPage({ 
  chatId, 
  driverName, 
  driverAvatar,
  onBack 
}: any) {
  const [chatMessages, setChatMessages] = useState([
    { 
      id: '1', 
      text: 'Hi, I am on the way!', 
      sender: 'driver', 
      time: '2:30 PM' 
    },
    { 
      id: '2', 
      text: 'Thank you!', 
      sender: 'user', 
      time: '2:31 PM' 
    },
    { 
      id: '3', 
      text: 'I am 5 minutes away', 
      sender: 'driver', 
      time: '2:40 PM' 
    },
  ]);
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        id: String(chatMessages.length + 1),
        text: messageText,
        sender: 'user',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessageText('');
    }
  };

  return (
    <SafeAreaView style={styles.chatContainer}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.chatHeaderTitle}>
          <Text style={styles.headerTitle}>{driverName}</Text>
        </View>
        <TouchableOpacity style={styles.phoneButton}>
          <Phone size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        data={chatMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === 'user'
                ? styles.userMessage
                : styles.driverMessage,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.sender === 'user'
                  ? styles.userBubbleText
                  : styles.driverBubbleText,
              ]}
            >
              {item.text}
            </Text>
            <Text
              style={[
                styles.bubbleTime,
                item.sender === 'user'
                  ? styles.userBubbleTime
                  : styles.driverBubbleTime,
              ]}
            >
              {item.time}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.chatMessagesList}
        scrollEnabled={true}
      />

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Send 
              size={20} 
              color={messageText.trim() ? '#fff' : '#ccc'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  // Messages Page Styles
  container: {
    flex: 1,
    backgroundColor: colors.background || '#f5f5f5',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  messageAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary || '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text || '#000',
  },
  messageTime: {
    fontSize: 12,
    color: colors.textSecondary || '#999',
  },
  messagePreview: {
    fontSize: 13,
    color: colors.textSecondary || '#999',
  },
  unreadMessage: {
    color: colors.text || '#000',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: colors.primary || '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text || '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary || '#999',
  },

  // Chat Detail Page Styles
  chatContainer: {
    flex: 1,
    backgroundColor: colors.background || '#f5f5f5',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  chatHeaderTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text || '#000',
  },
  phoneButton: {
    padding: 8,
  },
  chatMessagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary || '#007AFF',
  },
  driverMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 18,
  },
  userBubbleText: {
    color: '#fff',
  },
  driverBubbleText: {
    color: colors.text || '#000',
  },
  bubbleTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userBubbleTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  driverBubbleTime: {
    color: colors.textSecondary || '#999',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text || '#000',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary || '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ddd',
    opacity: 0.6,
  },
});

