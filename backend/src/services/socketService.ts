import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

export const setupSocket = (io: SocketIOServer): void => {
  io.on('connection', (socket) => {
    logger.info(`Cliente conectado: ${socket.id}`);

    // Entrar em sala específica (usuário ou prestador)
    socket.on('join', (data: { userId: string; userType: 'user' | 'provider' }) => {
      const room = `${data.userType}_${data.userId}`;
      socket.join(room);
      logger.info(`Cliente ${socket.id} entrou na sala ${room}`);
    });

    // Atualização de localização do prestador
    socket.on('location_update', (data: { providerId: string; latitude: number; longitude: number }) => {
      // Broadcast para usuários que estão acompanhando este prestador
      socket.broadcast.emit('provider_location', data);
      logger.info(`Localização atualizada para prestador ${data.providerId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`Cliente desconectado: ${socket.id}`);
    });
  });
};

// Função para notificar usuário sobre nova proposta
export const notifyNewProposal = (io: SocketIOServer, userId: string, proposal: any): void => {
  io.to(`user_${userId}`).emit('new_proposal', proposal);
};

// Função para notificar prestador sobre corrida aceita
export const notifyRideAccepted = (io: SocketIOServer, providerId: string, ride: any): void => {
  io.to(`provider_${providerId}`).emit('ride_accepted', ride);
};

// Função para notificar sobre mudança de status da corrida
export const notifyRideUpdate = (io: SocketIOServer, userId: string, providerId: string, update: any): void => {
  io.to(`user_${userId}`).emit('ride_update', update);
  if (providerId) {
    io.to(`provider_${providerId}`).emit('ride_update', update);
  }
};