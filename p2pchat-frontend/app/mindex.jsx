import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId] = useState("user123"); // TODO: make dynamic later

  useEffect(() => {
    // Connect to Ballerina WebSocket server
    const ws = new WebSocket("ws://192.168.1.5:9090/ws"); 
    // ⚠️ replace with your PC’s LAN IP

    ws.onopen = () => {
      console.log("✅ Connected to server");
      // Register this user
      ws.send(JSON.stringify({ type: "register", userId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Received:", data);

        if (data.type === "chat-message") {
          setMessages((prev) => [...prev, data]);
        } else {
          console.log("ℹ️ Non-chat message:", data);
        }
      } catch (err) {
        console.log("⚠️ Error parsing message:", err);
      }
    };

    ws.onclose = () => console.log("❌ Disconnected");
    ws.onerror = (err) => console.log("⚠️ Error:", err.message);

    setSocket(ws);

    return () => ws.close();
  }, [userId]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      const msg = {
        type: "chat-message",
        text: input,
        from: userId,
      };
      socket.send(JSON.stringify(msg));
      setMessages((prev) => [...prev, msg]); // show own message immediately
      setInput("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.from === userId
                ? styles.myMessage
                : styles.otherMessage,
            ]}
          >
            <Text style={styles.messageText}>
              {item.from}: {item.text}
            </Text>
          </View>
        )}
      />

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Type a message..."
      />

      <Button title="Send" onPress={sendMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#ddd",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#000",
  },
});
