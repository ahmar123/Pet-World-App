import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingPage from './LoadingPage';
import { MotiView } from 'moti'; // Import MotiView

const ChatHistory = ({ navigation, route }) => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = route.params;

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch(
        `https://pet-world-app123-default-rtdb.firebaseio.com/Chats/${userId}.json`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      if (data) {
        const chatArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setChats(chatArray);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatPress = (chatId, vetId) => {
    navigation.navigate('Chat', { userId, vetId, chatId });
  };

  const renderChatItem = ({ item }) => (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 1000 }}
    >
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item.id, item.vetId)}
      >
        <LinearGradient
          colors={['#D3C0A8', '#E7D5BB']}
          style={styles.chatItemGradient}
        >
          <View style={styles.chatInfo}>
            <Text style={styles.vetName}>{item.vetName || 'Veterinarian'}</Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage || 'Start a conversation'}
            </Text>
            <Text style={styles.timestamp}>
              {item.lastMessageTime
                ? new Date(item.lastMessageTime).toLocaleString()
                : ''}
            </Text>
          </View>
          <Feather name="chevron-right" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ImageBackground
      source={{
        uri: 'https://i.pinimg.com/736x/5d/9c/3b/5d9c3bc727522ffdb01d9a33a77a4506.jpg',
      }}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Chat History</Text>
        </View>
        {chats.length > 0 ? (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
          />
        ) : (
          <View style={styles.noChatsContainer}>
            <Text style={styles.noChatsText}>No chat history found</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
    color: 'black',
  },
  chatList: {
    padding: 15,
  },
  chatItem: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  chatItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    justifyContent: 'space-between',
  },
  chatInfo: {
    flex: 1,
  },
  vetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#fff',
  },
  noChatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatsText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
});

export default ChatHistory; 