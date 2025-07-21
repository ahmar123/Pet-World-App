import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView  
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { colors } from '../theme/colors';

const GEMINI_API_KEY = 'AIzaSyBPfrNZh-B4cbUG-Rlu6kfx5n6pTbhDKCQ';
const FIREBASE_DB_URL = 'https://pet-world-app123-default-rtdb.firebaseio.com';

const backgroundImage = { uri: 'https://i.pinimg.com/736x/f0/7f/c5/f07fc577527b4c11e1b489be8c2dc29a.jpg' };
const logoImage = require('../assets/1.png');

const Chatbot = ({ route }) => {
  const { userId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const handleTextChange = (text) => {
    // Sanitize input to allow only letters, numbers, and basic punctuation.
    const sanitizedText = text.replace(/[^a-zA-Z0-9\\s.,?!'-]/g, '');
    setInputText(sanitizedText);
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${FIREBASE_DB_URL}/Users/${userId}/Chat.json`);
      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = { text: inputText, sender: 'user' };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    await saveMessagesToFirebase(updatedMessages);

    try {
      const systemInstruction =
        "You are ChatPaw, a highly knowledgeable pet expert specializing exclusively in cats and dogs. " +
        "Your primary role is to provide helpful, accurate, and engaging information related to the care and well-being of these pets. " +
        "Your responses should be warm, friendly, and professional, always encouraging responsible pet ownership.\n\n" +
        "### Guidelines for Responses:\n" +
        "- **Greet users warmly** and encourage them to ask about their pet cat or dog.\n" +
        "- **Stay strictly within the scope of expertise**, covering only:\n" +
        "  - Cat and dog care (daily routines, grooming, general well-being)\n" +
        "  - Behavior (understanding body language, socialization, common behavioral issues)\n" +
        "  - Health (common illnesses, symptoms, veterinary care recommendations)\n" +
        "  - Training (obedience, potty training, behavioral corrections)\n" +
        "  - Breeds (characteristics, temperament, suitability for owners)\n" +
        "  - Nutrition (diet recommendations, safe and unsafe foods, feeding schedules)\n\n" +
        "### Handling Unrelated Questions:\n" +
        "- If asked about **animals other than cats or dogs**, respond with: " +
        "  'I specialize only in cats and dogs. How can I assist you with your pet?'\n" +
        "- If asked about **general knowledge, unrelated topics, or anything beyond your expertise**, reply with: " +
        "  'My expertise is solely in cats and dogs. Let me know how I can help with your furry friend!'\n\n" +
        "### Encouragement:\n" +
        "- Always prompt users to ask specific questions about their cat or dog.\n" +
        "- If a user greets you, respond in a friendly manner while guiding them toward discussing their pet.\n\n" +
        "### User Question:\n" +
        "User input: " + inputText;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: systemInstruction,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      let botResponseText = response.data.candidates[0].content.parts[0].text;

      const cleanedBotResponse = botResponseText
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/#+\s*/g, '')
        .replace(/\n\s*\n/g, '\n')
        .replace(/-\s*/g, '• ')
        .trim();

      const botMessage = { text: cleanedBotResponse, sender: 'bot' };
      const updatedMessagesWithBot = [...updatedMessages, botMessage];
      setMessages(updatedMessagesWithBot);

      await saveMessagesToFirebase(updatedMessagesWithBot);
    } catch (error) {
      console.error('Error fetching response from Gemini:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessagesToFirebase = async (messages) => {
    try {
      await axios.put(`${FIREBASE_DB_URL}/Users/${userId}/Chat.json`, messages);
    } catch (error) {
      console.error('Error saving messages to Firebase:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.logoContainer}>
      <Image source={logoImage} style={styles.logo} />
      <Text style={styles.chatbotText}>ChatPaw</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}
      >
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
          <View style={styles.container}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={item.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
                  {item.sender === 'bot' && (
                    <View style={styles.catEars}>
                      <Text style={styles.catEarLeft}>🐱</Text>
                      <Text style={styles.catEarRight}>🐱</Text>
                    </View>
                  )}
                  <View style={item.sender === 'user' ? styles.userMessage : styles.botMessage}>
                    <Text style={styles.messageText}>{item.text}</Text>
                  </View>
                  {item.sender === 'bot' && (
                    <View style={styles.whiskers}>
                      <Text style={styles.whiskerLeft}>╱╱</Text>
                      <Text style={styles.whiskerRight}>╲╲</Text>
                    </View>
                  )}
                </View>
              )}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              contentContainerStyle={[styles.flatListContent, { paddingBottom: 120 }]}
              ListHeaderComponent={renderHeader}
              ListFooterComponent={
                isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </View>
                ) : null
              }
            />

            <View style={styles.inputContainer}>
              <View style={styles.textInputWrapper}>
                <TextInput
                  ref={textInputRef}
                  style={styles.input}
                  value={inputText}
                  onChangeText={handleTextChange}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  maxLength={1000}
                />
                <Text style={styles.charCounter}>{inputText.length} / 1000</Text>
              </View>
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={isLoading}>
                <Icon name="send" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    
  },
  chatbotText: {
    fontSize: 45,
    fontWeight: 'bold',
    color: 'white',
    marginTop: -100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 500,
    height: 300,
    resizeMode: 'contain',
  },
  flatListContent: {
    paddingBottom: 80,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  
  },
  textInputWrapper: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  charCounter: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    paddingRight: 8,
  },
  sendButton: {
    padding: 10,
  
  
  },
  userMessageContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  botMessageContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 16,
    position: 'relative',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 20,
    maxWidth: '80%',
  },
  botMessage: {
    backgroundColor: '#ECECEC',
    padding: 12,
    borderRadius: 20,
    maxWidth: '80%',
    position: 'relative',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  catEars: {
    flexDirection: 'row',
    position: 'absolute',
    top: -20,
    left: 10,
  },
  catEarLeft: {
    fontSize: 24,
    transform: [{ rotate: '-30deg' }],
  },
  catEarRight: {
    fontSize: 24,
    transform: [{ rotate: '30deg' }],
    marginLeft: -10,
  },
  whiskers: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -10,
    left: 10,
  },
  whiskerLeft: {
    fontSize: 16,
    transform: [{ rotate: '-20deg' }],
    marginRight: 5,
  },
  whiskerRight: {
    fontSize: 16,
    transform: [{ rotate: '20deg' }],
    marginLeft: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default Chatbot;
