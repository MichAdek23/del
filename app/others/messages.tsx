import React, { useState } from 'react';
import {  StyleSheet , View , Text, TouchableOpacity , FlatList, SafeAreaView,} from 'react-native';
import { Header} from '@/components';
import { colors } from '@/constants';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import ChatDetailPage from './chat-detail';


export default function MessagesPage() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      driverName: 'John Smith',
      lastMessage: 'I am on my way!',
      timestamp: '2 mins ago',
      unread: 2,
      avatar: 'JS',
    },
    {
      id: '2',
      driverName: 'Mike Johnson',
      lastMessage: 'Your package is out for delivery',
      timestamp: '1 hour ago',
      unread: 0,
      avatar: 'MJ',
    },
    {
      id: '3',
      driverName: 'Sarah Williams',
      lastMessage: 'Package delivered successfully',
      timestamp: '3 hours ago',
      unread: 0,
      avatar: 'SW',
    },
  ]);

  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  // If a chat is selected, show the chat detail page
  if (selectedChat) {
    const chatData = messages.find((msg) => msg.id === selectedChat);
    return (
      <ChatDetailPage
        chatId={selectedChat}
        driverName={chatData?.driverName || 'Driver'}
        driverAvatar={chatData?.avatar || '?'}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedChat(item.id)}
            style={styles.messageItem}
            activeOpacity={0.7}
          >
            <View style={styles.messageAvatar}>
              <Text style={styles.messageAvatarText}>{item.avatar}</Text>
            </View>
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageName}>{item.driverName}</Text>
                <Text style={styles.messageTime}>{item.timestamp}</Text>
              </View>
              <Text
                style={[
                  styles.messagePreview,
                  item.unread > 0 && styles.unreadMessage,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        scrollEnabled={true}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation with your driver
            </Text>
          </View>
        }
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
