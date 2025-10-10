import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { chatService, ChatMessage, ChatRoom } from '../services/chatService';
import { locationService } from '../services/locationService';

interface ChatScreenProps {
  rideId: string;
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ rideId, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
    setupMessageListener();

    return () => {
      chatService.removeMessageListener(handleNewMessage);
      chatService.leaveCurrentRoom();
    };
  }, [rideId]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // Conectar ao chat se não estiver conectado
      if (!chatService.isConnectedToChat()) {
        const connected = await chatService.connect('current_user_id');
        if (!connected) {
          Alert.alert('Erro', 'Não foi possível conectar ao chat');
          return;
        }
      }

      // Entrar na sala do chat
      const room = await chatService.joinRoom(rideId);
      if (room) {
        setChatRoom(room);
        const roomMessages = chatService.getRoomMessages(rideId);
        setMessages(roomMessages);
        
        // Marcar mensagens como lidas
        await chatService.markMessagesAsRead(rideId);
      }
    } catch (error) {
      console.error('Erro ao inicializar chat:', error);
      Alert.alert('Erro', 'Erro ao carregar o chat');
    } finally {
      setIsLoading(false);
    }
  };

  const setupMessageListener = () => {
    chatService.addMessageListener(handleNewMessage);
  };

  const handleNewMessage = (message: ChatMessage) => {
    if (message.rideId === rideId) {
      setMessages(prevMessages => [...prevMessages, message]);
      
      // Scroll para o final automaticamente
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Marcar como lida se não for mensagem própria
      if (message.senderId !== 'current_user') {
        chatService.markMessagesAsRead(rideId);
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const message = newMessage.trim();
      setNewMessage('');

      const sentMessage = await chatService.sendMessage(rideId, message);
      
      if (!sentMessage) {
        Alert.alert('Erro', 'Não foi possível enviar a mensagem');
        setNewMessage(message); // Restaurar mensagem
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  const sendLocation = async () => {
    try {
      Alert.alert(
        'Compartilhar Localização',
        'Deseja compartilhar sua localização atual?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Compartilhar',
            onPress: async () => {
              try {
                const location = await locationService.getCurrentLocationWithAddress();
                
                await chatService.sendLocation(
                  rideId,
                  location.coordinates.latitude,
                  location.coordinates.longitude,
                  location.address
                );
              } catch (error) {
                Alert.alert('Erro', 'Não foi possível obter sua localização');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao compartilhar localização:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === 'current_user';
    const isSystemMessage = item.type === 'system';

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessage}>{item.message}</Text>
          <Text style={styles.systemMessageTime}>{formatTime(item.timestamp)}</Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          
          {item.type === 'location' && item.metadata?.location ? (
            <View style={styles.locationMessage}>
              <Text style={styles.locationIcon}>📍</Text>
              <View style={styles.locationDetails}>
                <Text style={[styles.messageText, { color: isOwnMessage ? 'white' : '#333' }]}>
                  Localização compartilhada
                </Text>
                {item.metadata.location.address && (
                  <Text style={[styles.locationAddress, { color: isOwnMessage ? '#f0f0f0' : '#666' }]}>
                    {item.metadata.location.address}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              { color: isOwnMessage ? 'white' : '#333' }
            ]}>
              {item.message}
            </Text>
          )}
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              { color: isOwnMessage ? '#f0f0f0' : '#999' }
            ]}>
              {formatTime(item.timestamp)}
            </Text>
            {isOwnMessage && (
              <Text style={styles.messageStatus}>
                {item.isRead ? '✓✓' : '✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {chatRoom?.participants.find(p => p.userType !== 'user')?.userName || 'Chat'}
          </Text>
          <Text style={styles.headerSubtitle}>Serviço #{rideId.slice(-6)}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.locationButton} onPress={sendLocation}>
            <Text style={styles.locationButtonText}>📍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Digite sua mensagem..."
          multiline
          maxLength={500}
          editable={!isSending}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!newMessage.trim() || isSending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || isSending}
        >
          <Text style={styles.sendButtonText}>
            {isSending ? '⏳' : '➤'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    marginLeft: 16,
  },
  locationButton: {
    padding: 8,
  },
  locationButtonText: {
    fontSize: 20,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  senderName: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  locationDetails: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  messageStatus: {
    fontSize: 11,
    color: '#f0f0f0',
    marginLeft: 4,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessage: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  systemMessageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatScreen;