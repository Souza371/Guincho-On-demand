import { Alert, Platform } from 'react-native';

interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ride_update';
  data?: any;
}

interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android';
}

class NotificationService {
  private token: string | null = null;
  private isInitialized = false;

  /**
   * Inicializar serviço de notificações
   */
  async initialize(): Promise<boolean> {
    try {
      // Para desenvolvimento, simular inicialização
      console.log('NotificationService inicializado (modo simulado)');
      this.isInitialized = true;
      return true;

      // Implementação real (descomentada quando integrar com biblioteca de push):
      /*
      const authStatus = await messaging().requestPermission();
      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        await this.getToken();
        this.setupNotificationHandlers();
        this.isInitialized = true;
        return true;
      }
      
      return false;
      */
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
      return false;
    }
  }

  /**
   * Obter token de push notification
   */
  async getToken(): Promise<string | null> {
    try {
      if (this.token) {
        return this.token;
      }

      // Para desenvolvimento, gerar token simulado
      this.token = `sim_token_${Date.now()}_${Platform.OS}`;
      console.log('Token de notificação (simulado):', this.token);
      return this.token;

      // Implementação real (descomentada quando integrar com biblioteca):
      /*
      const token = await messaging().getToken();
      this.token = token;
      console.log('Token de notificação obtido:', token);
      return token;
      */
    } catch (error) {
      console.error('Erro ao obter token de notificação:', error);
      return null;
    }
  }

  /**
   * Configurar handlers de notificação
   */
  private setupNotificationHandlers(): void {
    // Implementação real (descomentada quando integrar com biblioteca):
    /*
    // Notificação em foreground
    messaging().onMessage(async (remoteMessage) => {
      console.log('Notificação recebida em foreground:', remoteMessage);
      this.showLocalNotification(remoteMessage);
    });

    // Notificação quando app é aberto através da notificação
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('App aberto através de notificação:', remoteMessage);
      this.handleNotificationPress(remoteMessage);
    });

    // Verificar se app foi aberto por uma notificação quando estava fechado
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App aberto por notificação (estava fechado):', remoteMessage);
          this.handleNotificationPress(remoteMessage);
        }
      });
    */
  }

  /**
   * Mostrar notificação local
   */
  private showLocalNotification(notification: any): void {
    const { title, body } = notification.notification || {};
    
    Alert.alert(
      title || 'Nova Notificação',
      body || 'Você tem uma nova atualização',
      [{ text: 'OK' }]
    );
  }

  /**
   * Tratar clique na notificação
   */
  private handleNotificationPress(notification: any): void {
    console.log('Notificação clicada:', notification);
    
    const data = notification.data;
    if (data) {
      // Navegar para tela específica baseada nos dados da notificação
      this.navigateBasedOnNotification(data);
    }
  }

  /**
   * Navegar baseado no tipo de notificação
   */
  private navigateBasedOnNotification(data: any): void {
    switch (data.type) {
      case 'new_proposal':
        // Navegar para tela de propostas
        console.log('Navegar para propostas:', data.rideId);
        break;
      case 'proposal_accepted':
        // Navegar para tracking
        console.log('Navegar para tracking:', data.rideId);
        break;
      case 'ride_completed':
        // Navegar para avaliação
        console.log('Navegar para avaliação:', data.rideId);
        break;
      default:
        console.log('Tipo de notificação não reconhecido:', data.type);
    }
  }

  /**
   * Enviar token para o servidor
   */
  async registerTokenWithServer(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        return false;
      }

      const tokenData: PushNotificationToken = {
        token,
        platform: Platform.OS as 'ios' | 'android',
      };

      // Simular envio para servidor
      console.log('Token enviado para servidor (simulado):', tokenData);
      return true;

      // Implementação real:
      /*
      const response = await apiService.registerPushToken(tokenData);
      return response.success;
      */
    } catch (error) {
      console.error('Erro ao registrar token no servidor:', error);
      return false;
    }
  }

  /**
   * Criar notificação local
   */
  async createLocalNotification(notificationData: NotificationData): Promise<void> {
    try {
      // Para desenvolvimento, usar Alert
      Alert.alert(
        notificationData.title,
        notificationData.message,
        [{ text: 'OK' }]
      );

      // Implementação real (descomentada quando integrar com biblioteca):
      /*
      await notifee.displayNotification({
        title: notificationData.title,
        body: notificationData.message,
        data: notificationData.data,
        android: {
          channelId: await this.createNotificationChannel(notificationData.type),
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      });
      */
    } catch (error) {
      console.error('Erro ao criar notificação local:', error);
    }
  }

  /**
   * Criar canal de notificação (Android)
   */
  private async createNotificationChannel(type: string): Promise<string> {
    const channelId = `guincho_${type}`;
    
    // Implementação real:
    /*
    await notifee.createChannel({
      id: channelId,
      name: this.getChannelName(type),
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
    */
    
    return channelId;
  }

  /**
   * Obter nome do canal baseado no tipo
   */
  private getChannelName(type: string): string {
    const channelNames: { [key: string]: string } = {
      'info': 'Informações Gerais',
      'success': 'Confirmações',
      'warning': 'Avisos',
      'error': 'Alertas',
      'ride_update': 'Atualizações de Serviço',
    };
    
    return channelNames[type] || 'Notificações Guincho';
  }

  /**
   * Agendar notificação para lembrete
   */
  async scheduleNotification(
    notificationData: NotificationData,
    delayInMinutes: number
  ): Promise<void> {
    try {
      const trigger = new Date(Date.now() + delayInMinutes * 60 * 1000);
      
      console.log(`Notificação agendada para ${trigger.toLocaleTimeString()}:`, notificationData.title);

      // Implementação real:
      /*
      await notifee.createTriggerNotification(
        {
          title: notificationData.title,
          body: notificationData.message,
          data: notificationData.data,
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: trigger.getTime(),
        }
      );
      */
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
    }
  }

  /**
   * Cancelar todas as notificações agendadas
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      console.log('Cancelando todas as notificações agendadas');
      
      // Implementação real:
      /*
      await notifee.cancelAllNotifications();
      */
    } catch (error) {
      console.error('Erro ao cancelar notificações:', error);
    }
  }

  /**
   * Verificar permissão de notificação
   */
  async checkPermission(): Promise<boolean> {
    try {
      // Para desenvolvimento, sempre retornar true
      return true;

      // Implementação real:
      /*
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
      */
    } catch (error) {
      console.error('Erro ao verificar permissão de notificação:', error);
      return false;
    }
  }

  /**
   * Limpar dados do serviço
   */
  cleanup(): void {
    this.token = null;
    this.isInitialized = false;
    console.log('NotificationService limpo');
  }
}

export const notificationService = new NotificationService();
export type { NotificationData, PushNotificationToken };