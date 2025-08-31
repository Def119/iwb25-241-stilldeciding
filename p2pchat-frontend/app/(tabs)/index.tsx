import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { getFriends, type Friend } from '@/lib/friends-manager';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ChatsScreen() {
  const { user, signOut } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load friends when component mounts
  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
      console.log(`📱 Loaded ${friendsList.length} friends`);
    } catch (error) {
      console.error('❌ Error loading friends:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  }, []);

  const formatTimestamp = (timestamp: number | null): string => {
    if (!timestamp) return '';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const renderChatItem = ({ item }: { item: Friend }) => {
    // Generate initials from display name or email
    const getInitials = (name: string, email: string): string => {
      if (name && name.trim()) {
        return name.split(' ')
          .map(n => n.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2);
      }
      return email.charAt(0).toUpperCase();
    };

    const initials = getInitials(item.displayName, item.email);
    const lastMessageText = item.lastMessage?.content || 'No messages yet';
    const lastMessageTime = item.lastMessage?.timestamp || item.addedAt;
    const hasUnreadMessage = item.lastMessage && !item.lastMessage.isRead;

    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => {
          // Navigate to chat screen with this friend
          // router.push(`/chat/${item.id}`);
          console.log('Opening chat with:', item.displayName);
        }}
      >
        <View style={[styles.avatar, item.isOnline && styles.avatarOnline]}>
          <ThemedText style={styles.avatarText}>{initials}</ThemedText>
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <ThemedText style={styles.chatName}>{item.displayName}</ThemedText>
            <ThemedText style={styles.timestamp}>
              {formatTimestamp(lastMessageTime)}
            </ThemedText>
          </View>
          
          <View style={styles.messageRow}>
            <ThemedText style={styles.lastMessage} numberOfLines={1}>
              {lastMessageText}
            </ThemedText>
            {hasUnreadMessage && (
              <View style={styles.unreadBadge}>
                <ThemedText style={styles.unreadText}>1</ThemedText>
              </View>
            )}
          </View>
          
          {/* <View style={styles.contactInfo}>
            <ThemedText style={styles.emailText} numberOfLines={1}>
              {item.email}
            </ThemedText>
            <View style={styles.encryptionBadge}>
              <ThemedText style={styles.encryptionBadgeText}>🔐</ThemedText>
            </View>
          </View> */}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Whispr</ThemedText>
          <ThemedText style={styles.subtitle}>Connected. Unseen</ThemedText>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={signOut}>
          <ThemedText style={styles.profileText}>
            {user?.email?.charAt(0).toUpperCase()}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.statusBar}>
        <View style={styles.encryptionStatus}>
          <ThemedText style={styles.encryptionText}>🔐 End-to-End Encrypted</ThemedText>
        </View>
        <View style={styles.friendsCount}>
          <ThemedText style={styles.friendsCountText}>
            👥 {friends.length} contact{friends.length !== 1 ? 's' : ''}
          </ThemedText>
        </View>
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ThemedText style={styles.emptyIcon}>👥</ThemedText>
      <ThemedText style={styles.emptyTitle}>No Contacts Yet</ThemedText>
      <ThemedText style={styles.emptyText}>
        Add your first contact by scanning their QR code or entering their contact data manually.
      </ThemedText>
      <TouchableOpacity 
        style={styles.addContactButton}
        onPress={() => router.push('/scanner')}
      >
        <ThemedText style={styles.addContactText}>📷 Add Contact</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (friends.length === 0) return null;
    
    return (
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Pull down to refresh • Tap camera icon to add contacts
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={friends}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          friends.length === 0 && styles.emptyContentContainer
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => router.push('/scanner')}
      >
        <ThemedText style={styles.floatingButtonText}>📷</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyContentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  encryptionStatus: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  encryptionText: {
    fontSize: 12,
    color: '#0891b2',
    fontWeight: '500',
  },
  friendsCount: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  friendsCountText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarOnline: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: 'white',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emailText: {
    fontSize: 12,
    opacity: 0.5,
    flex: 1,
  },
  encryptionBadge: {
    marginLeft: 8,
  },
  encryptionBadgeText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addContactButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addContactText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 24,
    color: 'white',
  },
});
