interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'provider';
  message: string;
  timestamp: number;
  type: 'text' | 'location' | 'image' | 'system';
  isRead: boolean;
  metadata?: {
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    imageUrl?: string;
    systemMessageType?: 'ride_started' | 'ride_completed' | 'arrival' | 'payment_confirmed';
  };
}

interface ChatRoom {
  id: string;
  rideId: string;
  participants: {
    userId: string;
    userName: string;
    userType: 'user' | 'provider';
    avatar?: string;
  }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: number;
}

type MessageListener = (message: ChatMessage) => void;
type RoomUpdateListener = (room: ChatRoom) => void;

class ChatService {
  private isConnected = false;
  private currentRoomId: string | null = null;
  private messages: { [roomId: string]: ChatMessage[] } = {};
  private rooms: ChatRoom[] = [];
  private messageListeners: MessageListener[] = [];
  private roomUpdateListeners: RoomUpdateListener[] = [];
  private connectionRetryCount = 0;
  private maxRetries = 5;

  /**
   * Conectar ao serviço de chat
   */
  async connect(userId: string): Promise<boolean> {
    try {
      console.log('Conectando ao chat service para usuário:', userId);
      
      // Para desenvolvimento, simular conexão
      this.isConnected = true;
      this.connectionRetryCount = 0;
      console.log('Chat service conectado (simulado)');
      return true;

      // Implementação real (descomentada quando integrar com WebSocket/Socket.IO):
      /*
      const socket = io(CHAT_SERVER_URL, {
        auth: {
          token: await AsyncStorage.getItem('authToken'),
          userId,
        },
        transports: ['websocket'],
      });

      return new Promise((resolve, reject) => {
        socket.on('connect', () => {
          console.log('Conectado ao chat service');
          this.isConnected = true;
          this.connectionRetryCount = 0;
          this.setupSocketListeners(socket);
          resolve(true);
        });

        socket.on('connect_error', (error) => {
          console.error('Erro de conexão ao chat:', error);
          this.handleConnectionError();
          reject(false);
        });

        socket.on('disconnect', (reason) => {
          console.log('Desconectado do chat:', reason);
          this.isConnected = false;
          this.handleDisconnection();
        });
      });
      */
    } catch (error) {
      console.error('Erro ao conectar ao chat:', error);
      return false;
    }
  }

  /**
   * Entrar em uma sala de chat
   */
  async joinRoom(rideId: string): Promise<ChatRoom | null> {
    try {
      if (!this.isConnected) {
        throw new Error('Não conectado ao serviço de chat');
      }

      console.log('Entrando na sala de chat:', rideId);
      this.currentRoomId = rideId;

      // Simular criação/entrada em sala
      const existingRoom = this.rooms.find(room => room.rideId === rideId);
      if (existingRoom) {
        return existingRoom;
      }

      // Criar nova sala simulada
      const newRoom: ChatRoom = {
        id: `room_${rideId}`,
        rideId,
        participants: [
          {
            userId: 'user1',
            userName: 'Cliente',
            userType: 'user',
          },
          {
            userId: 'provider1',
            userName: 'Prestador',
            userType: 'provider',
          },
        ],
        unreadCount: 0,
        isActive: true,
        createdAt: Date.now(),
      };

      this.rooms.push(newRoom);
      await this.loadRoomMessages(rideId);

      return newRoom;

      // Implementação real:
      /*
      const response = await apiService.joinChatRoom(rideId);
      if (response.success && response.data) {
        this.currentRoomId = rideId;
        await this.loadRoomMessages(rideId);
        return response.data;
      }
      return null;
      */
    } catch (error) {
      console.error('Erro ao entrar na sala de chat:', error);
      return null;
    }
  }

  /**
   * Enviar mensagem
   */
  async sendMessage(
    rideId: string,
    message: string,
    type: 'text' | 'location' | 'image' = 'text',
    metadata?: any
  ): Promise<ChatMessage | null> {
    try {
      if (!this.isConnected) {
        throw new Error('Não conectado ao serviço de chat');
      }

      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rideId,
        senderId: 'current_user', // Substituir pelo ID do usuário atual
        senderName: 'Você',
        senderType: 'user', // Substituir pelo tipo do usuário atual
        message,
        timestamp: Date.now(),
        type,
        isRead: false,
        metadata,
      };

      // Adicionar à lista local
      if (!this.messages[rideId]) {
        this.messages[rideId] = [];
      }
      this.messages[rideId].push(newMessage);

      // Notificar listeners
      this.messageListeners.forEach(listener => listener(newMessage));

      console.log('Mensagem enviada (simulada):', newMessage);

      // Simular resposta do prestador após 2-5 segundos
      this.simulateProviderResponse(rideId);

      return newMessage;

      // Implementação real:
      /*
      const response = await apiService.sendChatMessage({
        rideId,
        message,
        type,
        metadata,
      });

      if (response.success && response.data) {
        const sentMessage = response.data;
        
        if (!this.messages[rideId]) {
          this.messages[rideId] = [];
        }
        this.messages[rideId].push(sentMessage);
        
        this.messageListeners.forEach(listener => listener(sentMessage));
        return sentMessage;
      }
      return null;
      */
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return null;
    }
  }

  /**
   * Simular resposta do prestador (apenas para desenvolvimento)
   */
  private simulateProviderResponse(rideId: string): void {
    const responses = [
      'Ok, estou a caminho!',
      'Chegando em 5 minutos',
      'Estou no local, onde você está?',
      'Serviço concluído, obrigado!',
      'Tudo bem por aí?',
    ];

    setTimeout(() => {
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const providerMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rideId,
        senderId: 'provider1',
        senderName: 'Carlos - Prestador',
        senderType: 'provider',
        message: randomResponse,
        timestamp: Date.now(),
        type: 'text',
        isRead: false,
      };

      if (!this.messages[rideId]) {
        this.messages[rideId] = [];
      }
      this.messages[rideId].push(providerMessage);

      this.messageListeners.forEach(listener => listener(providerMessage));
    }, Math.random() * 3000 + 2000); // 2-5 segundos
  }

  /**
   * Carregar mensagens da sala
   */
  async loadRoomMessages(rideId: string): Promise<ChatMessage[]> {
    try {
      // Simular carregamento de mensagens
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg_1',
          rideId,
          senderId: 'system',
          senderName: 'Sistema',
          senderType: 'user',
          message: 'Chat iniciado. Converse com seu prestador de serviço.',
          timestamp: Date.now() - 300000, // 5 minutos atrás
          type: 'system',
          isRead: true,
          metadata: {
            systemMessageType: 'ride_started',
          },
        },
      ];

      this.messages[rideId] = mockMessages;
      return mockMessages;

      // Implementação real:
      /*
      const response = await apiService.getChatMessages(rideId);
      if (response.success && response.data) {
        this.messages[rideId] = response.data;
        return response.data;
      }
      return [];
      */
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      return [];
    }
  }

  /**
   * Obter mensagens de uma sala
   */
  getRoomMessages(rideId: string): ChatMessage[] {
    return this.messages[rideId] || [];
  }

  /**
   * Marcar mensagens como lidas
   */
  async markMessagesAsRead(rideId: string): Promise<void> {
    try {
      if (this.messages[rideId]) {
        this.messages[rideId].forEach(msg => {
          if (!msg.isRead && msg.senderId !== 'current_user') {
            msg.isRead = true;
          }
        });

        // Atualizar contador de não lidas na sala
        const room = this.rooms.find(r => r.rideId === rideId);
        if (room) {
          room.unreadCount = 0;
          this.roomUpdateListeners.forEach(listener => listener(room));
        }
      }

      // Implementação real:
      /*
      await apiService.markChatMessagesAsRead(rideId);
      */
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  }

  /**
   * Enviar localização
   */
  async sendLocation(rideId: string, latitude: number, longitude: number, address?: string): Promise<ChatMessage | null> {
    try {
      return await this.sendMessage(
        rideId,
        'Localização compartilhada',
        'location',
        {
          location: {
            latitude,
            longitude,
            address,
          },
        }
      );
    } catch (error) {
      console.error('Erro ao enviar localização:', error);
      return null;
    }
  }

  /**
   * Enviar mensagem do sistema
   */
  async sendSystemMessage(
    rideId: string,
    message: string,
    systemMessageType: string
  ): Promise<ChatMessage | null> {
    try {
      const systemMessage: ChatMessage = {
        id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rideId,
        senderId: 'system',
        senderName: 'Sistema',
        senderType: 'user',
        message,
        timestamp: Date.now(),
        type: 'system',
        isRead: true,
        metadata: {
          systemMessageType: systemMessageType as any,
        },
      };

      if (!this.messages[rideId]) {
        this.messages[rideId] = [];
      }
      this.messages[rideId].push(systemMessage);

      this.messageListeners.forEach(listener => listener(systemMessage));
      return systemMessage;
    } catch (error) {
      console.error('Erro ao enviar mensagem do sistema:', error);
      return null;
    }
  }

  /**
   * Adicionar listener para novas mensagens
   */
  addMessageListener(listener: MessageListener): void {
    this.messageListeners.push(listener);
  }

  /**
   * Remover listener de mensagens
   */
  removeMessageListener(listener: MessageListener): void {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }

  /**
   * Adicionar listener para atualizações de sala
   */
  addRoomUpdateListener(listener: RoomUpdateListener): void {
    this.roomUpdateListeners.push(listener);
  }

  /**
   * Remover listener de atualizações de sala
   */
  removeRoomUpdateListener(listener: RoomUpdateListener): void {
    this.roomUpdateListeners = this.roomUpdateListeners.filter(l => l !== listener);
  }

  /**
   * Sair da sala atual
   */
  leaveCurrentRoom(): void {
    if (this.currentRoomId) {
      console.log('Saindo da sala:', this.currentRoomId);
      this.currentRoomId = null;
    }
  }

  /**
   * Desconectar do serviço
   */
  disconnect(): void {
    try {
      this.isConnected = false;
      this.currentRoomId = null;
      this.messageListeners = [];
      this.roomUpdateListeners = [];
      console.log('Desconectado do chat service');

      // Implementação real:
      /*
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      */
    } catch (error) {
      console.error('Erro ao desconectar do chat:', error);
    }
  }

  /**
   * Verificar se está conectado
   */
  isConnectedToChat(): boolean {
    return this.isConnected;
  }

  /**
   * Obter salas ativas
   */
  getActiveRooms(): ChatRoom[] {
    return this.rooms.filter(room => room.isActive);
  }

  /**
   * Limpar dados do serviço
   */
  cleanup(): void {
    this.disconnect();
    this.messages = {};
    this.rooms = [];
    this.connectionRetryCount = 0;
    console.log('ChatService limpo');
  }

  /**
   * Tratar erro de conexão
   */
  private handleConnectionError(): void {
    this.connectionRetryCount++;
    
    if (this.connectionRetryCount < this.maxRetries) {
      console.log(`Tentando reconectar... (${this.connectionRetryCount}/${this.maxRetries})`);
      setTimeout(() => {
        // Tentar reconectar
      }, Math.pow(2, this.connectionRetryCount) * 1000); // Backoff exponencial
    }
  }

  /**
   * Tratar desconexão
   */
  private handleDisconnection(): void {
    console.log('Chat desconectado, tentando reconectar...');
    this.isConnected = false;
    // Implementar lógica de reconexão automática
  }
}

export const chatService = new ChatService();
export type { ChatMessage, ChatRoom, MessageListener, RoomUpdateListener };