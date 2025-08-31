import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function  App() {
  const { user, loading } = useAuth();
  
  console.log("Index mounted", { user, loading });
  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.loading}>Loading...</ThemedText>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/register" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: 18,
  },
});
