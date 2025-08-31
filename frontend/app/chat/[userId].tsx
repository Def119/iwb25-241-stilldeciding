import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ChatMessage, webRTCService } from '@/lib/webrtc-service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [connectionState, setConnectionState] = useState<string>('new');
  const [signalingState, setSignalingState] = useState<string>('disconnected');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Decode the userId from URL encoding
  const targetUserId = decodeURIComponent(userId || '');
  const currentUserId = 'user_2@gmail.com';

  useEffect(() => {
    setupWebRTC();
    checkOnlineUsers();
    
    return () => {
      webRTCService.disconnect();
    };
  }, []);

  const checkOnlineUsers = async () => {
    try {
      const response = await fetch('http://10.80.33.116:9093/api/users/online');
      const data = await response.json();
      setOnlineUsers(data.onlineUsers || []);
      
      console.log('📋 Online users:', data.onlineUsers);
      console.log('🎯 Target user online:', data.onlineUsers?.includes(targetUserId));
    } catch (error) {
      console.error('❌ Failed to check online users:', error);
    }
  };

  const setupWebRTC = async () => {
    webRTCService.onConnectionStateChange = (state) => {
      console.log('🔗 Connection state changed to:', state);
      setConnectionState(state);
      setIsConnecting(state === 'connecting');
      
      if (state === 'failed') {
        setTimeout(() => {
          setConnectionState('new');
          setIsConnecting(false);
        }, 3000);
      }
    };

    webRTCService.onMessageReceived = (message) => {
      setMessages(prev => [...prev, { ...message, type: 'received' }]);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    };

    webRTCService.onSignalingStateChange = (state) => {
      setSignalingState(state);
    };

    setSignalingState(webRTCService.getSignalingState());
    setConnectionState(webRTCService.getConnectionState());

    console.log('💬 Chat opened with:', targetUserId);
  };

  const handleConnect = async () => {
    console.log('🔘 Connect button pressed!');
    console.log('🔍 Current states - Signaling:', signalingState, 'Connection:', connectionState);

    if (signalingState !== 'connected') {
      console.log('❌ Not connected to signaling server');
      Alert.alert('Connection Error', 'Not connected to signaling server. Please check your internet connection.');
      return;
    }

    if (isConnecting) {
      console.log('❌ Already connecting, ignoring click');
      return;
    }

    // Check if target user is online first
    await checkOnlineUsers();
    if (!onlineUsers.includes(targetUserId)) {
      console.log('❌ Target user not online');
      Alert.alert(
        'User Offline', 
        `${targetUserId.split('@')[0]} is not currently online. They need to be connected to establish a P2P connection.`,
        [
          { text: 'Refresh', onPress: checkOnlineUsers },
          { text: 'OK', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      console.log('🚀 Starting WebRTC connection...');
      setIsConnecting(true);
      setConnectionState('connecting');
      
      await webRTCService.initiateCall(targetUserId);
      console.log('✅ WebRTC initiation completed');
      
      // Set a timeout for connection attempt
      setTimeout(() => {
        console.log('⏰ Checking connection timeout...');
        if (connectionState === 'connecting') {
          console.log('❌ Connection timeout, resetting state');
          setConnectionState('failed');
          setIsConnecting(false);
        }
      }, 15000);
      
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      setConnectionState('failed');
      setIsConnecting(false);
      Alert.alert('Call Error', `Failed to initiate WebRTC connection: ${error.message}`);
    }
  };

  const sendMessage = () => {
    if (messageText.trim() && connectionState === 'connected') {
      try {
        const message: ChatMessage = {
          id: Date.now().toString(),
          content: messageText.trim(),
          sender: currentUserId,
          timestamp: Date.now(),
          type: 'sent'
        };

        webRTCService.sendMessage(messageText.trim());
        setMessages(prev => [...prev, message]);
        setMessageText('');
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      } catch (error) {
        console.error('❌ Failed to send message:', error);
        Alert.alert('Send Error', 'Failed to send message. Please check your P2P connection.');
      }
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'sent' ? styles.sentMessage : styles.receivedMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.type === 'sent' ? styles.sentText : styles.receivedText
      ]}>
        {item.content}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getConnectionStatusText = () => {
    const isTargetOnline = onlineUsers.includes(targetUserId);
    
    switch (connectionState) {
      case 'connected': return '🔗 P2P Connected';
      case 'connecting': return '🔄 Connecting...';
      case 'failed': return '❌ Connection Failed';
      default: 
        if (signalingState === 'connected') {
          return isTargetOnline ? '📡 Ready to Connect' : '💤 User Offline';
        }
        return '❌ Offline';
    }
  };

  // Test button to verify touch is working
  const handleTestButton = () => {
    console.log('🧪 Test button pressed - touch is working!');
    Alert.alert('Test', 'Button touch is working!');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.headerTitle}>
            {targetUserId.split('@')[0]}
          </ThemedText>
          <Text style={[styles.statusText, { color: getConnectionStatusColor() }]}>
            {getConnectionStatusText()}
          </Text>
        </View>
        <TouchableOpacity onPress={checkOnlineUsers} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Debug Test Button */}
      <View style={styles.testSection}>
        <TouchableOpacity style={styles.testButton} onPress={handleTestButton}>
          <Text style={styles.testButtonText}>🧪 Test Touch</Text>
        </TouchableOpacity>
        <Text style={styles.debugText}>
          States: Signaling={signalingState}, Connection={connectionState}, Connecting={isConnecting ? 'Yes' : 'No'}
        </Text>
      </View>

      {/* Connection Button */}
      {connectionState !== 'connected' && signalingState === 'connected' && (
        <View style={styles.connectionSection}>
          <TouchableOpacity 
            style={[
              styles.connectButton,
              isConnecting && styles.connectButtonDisabled
            ]} 
            onPress={handleConnect}
            disabled={isConnecting}
            activeOpacity={0.7}
          >
            <Text style={styles.connectButtonText}>
              {isConnecting ? '🔄 Connecting...' : '🔗 Establish P2P Connection'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>
            Establish secure peer-to-peer connection with {targetUserId.split('@')[0]}
          </Text>
          
          {/* Online status */}
          <View style={styles.onlineStatus}>
            <Text style={[styles.onlineStatusText, { 
              color: onlineUsers.includes(targetUserId) ? '#10b981' : '#ef4444' 
            }]}>
              {onlineUsers.includes(targetUserId) ? '🟢 Online' : '🔴 Offline'}
            </Text>
          </View>
        </View>
      )}

      {/* Connection Failed Retry */}
      {connectionState === 'failed' && (
        <View style={styles.connectionSection}>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleConnect}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>🔄 Retry Connection</Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>
            Connection failed. Make sure {targetUserId.split('@')[0]} is online and try again.
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Message Input */}
      {connectionState === 'connected' && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a secure message..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!messageText.trim()}
          >
            <Text style={styles.sendButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          You: {currentUserId} → {targetUserId} | {webRTCService.getConnectionDetails()}
        </Text>
        <Text style={styles.debugText}>
          Signaling: {signalingState} | Online Users: {onlineUsers.length} | Target Online: {onlineUsers.includes(targetUserId) ? 'Yes' : 'No'}
        </Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    fontSize: 24,
    marginRight: 16,
    color: '#6366f1',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 16,
  },
  testSection: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  connectionSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  connectButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  onlineStatus: {
    marginTop: 8,
  },
  onlineStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 16,
  },
  sentText: {
    color: 'white',
  },
  receivedText: {
    color: '#374151',
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 4,
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    fontSize: 20,
  },
  debugInfo: {
    padding: 8,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  debugText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
});