import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Friend {
  id: string;
  email: string;
  displayName: string;
  publicKey: string;
  addedAt: number;
  lastSeen: number | null;
  isOnline: boolean;
  avatar?: string | null;
  status?: string;
  lastMessage?: {
    content: string;
    timestamp: number;
    isRead: boolean;
  };
}

const FRIENDS_STORAGE_KEY = 'whispr_friends';

/**
 * Get all friends from local storage
 */
export async function getFriends(): Promise<Friend[]> {
  try {
    const friendsJson = await AsyncStorage.getItem(FRIENDS_STORAGE_KEY);
    if (!friendsJson) {
      console.log('📱 No friends found in storage');
      return [];
    }

    const friends = JSON.parse(friendsJson) as Friend[];
    console.log(`📱 Loaded ${friends.length} friends from storage`);
    return friends;
  } catch (error) {
    console.error('❌ Error loading friends:', error);
    return [];
  }
}

/**
 * Save friends to local storage
 */
export async function saveFriends(friends: Friend[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
    console.log(`📱 Saved ${friends.length} friends to storage`);
  } catch (error) {
    console.error('❌ Error saving friends:', error);
    throw error;
  }
}

/**
 * Add a new friend
 */
export async function addFriend(friend: Friend): Promise<void> {
  try {
    const friends = await getFriends();
    
    // Check if friend already exists
    const existingIndex = friends.findIndex(f => f.email === friend.email);
    if (existingIndex !== -1) {
      console.log('📱 Updating existing friend:', friend.email);
      friends[existingIndex] = { ...friends[existingIndex], ...friend };
    } else {
      console.log('📱 Adding new friend:', friend.email);
      friends.push(friend);
    }

    await saveFriends(friends);
    console.log('✅ Friend added successfully');
  } catch (error) {
    console.error('❌ Error adding friend:', error);
    throw error;
  }
}

/**
 * Remove a friend
 */
export async function removeFriend(friendId: string): Promise<void> {
  try {
    const friends = await getFriends();
    const updatedFriends = friends.filter(f => f.id !== friendId);
    await saveFriends(updatedFriends);
    console.log('✅ Friend removed successfully');
  } catch (error) {
    console.error('❌ Error removing friend:', error);
    throw error;
  }
}

/**
 * Get friend by email
 */
export async function getFriendByEmail(email: string): Promise<Friend | null> {
  try {
    const friends = await getFriends();
    return friends.find(f => f.email === email) || null;
  } catch (error) {
    console.error('❌ Error getting friend by email:', error);
    return null;
  }
}

/**
 * Update friend's online status
 */
export async function updateFriendStatus(email: string, isOnline: boolean, lastSeen?: number): Promise<void> {
  try {
    const friends = await getFriends();
    const friendIndex = friends.findIndex(f => f.email === email);
    
    if (friendIndex !== -1) {
      friends[friendIndex].isOnline = isOnline;
      if (lastSeen) {
        friends[friendIndex].lastSeen = lastSeen;
      }
      await saveFriends(friends);
      console.log(`📱 Updated ${email} status: ${isOnline ? 'online' : 'offline'}`);
    }
  } catch (error) {
    console.error('❌ Error updating friend status:', error);
  }
}

/**
 * Update friend's last message
 */
export async function updateFriendLastMessage(
  email: string, 
  content: string, 
  timestamp: number, 
  isRead: boolean = false
): Promise<void> {
  try {
    const friends = await getFriends();
    const friendIndex = friends.findIndex(f => f.email === email);
    
    if (friendIndex !== -1) {
      friends[friendIndex].lastMessage = {
        content,
        timestamp,
        isRead,
      };
      await saveFriends(friends);
      console.log(`📱 Updated last message for ${email}`);
    }
  } catch (error) {
    console.error('❌ Error updating friend last message:', error);
  }
}

/**
 * Search friends by name or email
 */
export async function searchFriends(query: string): Promise<Friend[]> {
  try {
    const friends = await getFriends();
    const lowercaseQuery = query.toLowerCase();
    
    return friends.filter(friend => 
      friend.displayName.toLowerCase().includes(lowercaseQuery) ||
      friend.email.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error('❌ Error searching friends:', error);
    return [];
  }
}

/**
 * Get online friends count
 */
export async function getOnlineFriendsCount(): Promise<number> {
  try {
    const friends = await getFriends();
    return friends.filter(f => f.isOnline).length;
  } catch (error) {
    console.error('❌ Error getting online friends count:', error);
    return 0;
  }
}

/**
 * Export friends for backup
 */
export async function exportFriends(): Promise<string> {
  try {
    const friends = await getFriends();
    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      friends: friends.map(f => ({
        ...f,
        // Don't export sensitive data in plaintext
        publicKey: f.publicKey ? '[ENCRYPTED_KEY]' : null,
      })),
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('❌ Error exporting friends:', error);
    throw error;
  }
}

/**
 * Clear all friends (for testing/reset)
 */
export async function clearAllFriends(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FRIENDS_STORAGE_KEY);
    console.log('🗑️ All friends cleared');
  } catch (error) {
    console.error('❌ Error clearing friends:', error);
    throw error;
  }
}

/**
 * Sync friends with Supabase (for future implementation)
 */
export async function syncFriendsWithServer(): Promise<void> {
  try {
    // This would sync friends with a server database
    // For now, just log that it's not implemented
    console.log('🔄 Server sync not implemented yet');
    
    // Future implementation:
    // 1. Get local friends
    // 2. Get server friends
    // 3. Merge and resolve conflicts
    // 4. Update both local and server
  } catch (error) {
    console.error('❌ Error syncing with server:', error);
    throw error;
  }
}