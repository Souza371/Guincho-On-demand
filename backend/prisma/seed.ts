import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.rating.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rideProposal.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.address.deleteMany();
  await prisma.vehicleDocument.deleteMany();
  await prisma.serviceArea.deleteMany();
  await prisma.user.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.admin.deleteMany();

  console.log('🧹 Dados existentes removidos...');

  // Criar planos de assinatura
  const basicPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Básico',
      price: 29.90,
      ridesIncluded: 2,
      description: 'Plano básico com 2 chamados por mês',
      features: ['2 chamados/mês', 'Suporte básico', 'Rastreamento'],
      isActive: true
    }
  });

  const premiumPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Premium',
      price: 59.90,
      ridesIncluded: 5,
      description: 'Plano premium com 5 chamados por mês',
      features: ['5 chamados/mês', 'Suporte prioritário', 'Rastreamento', 'Desconto 10%'],
      isActive: true
    }
  });

  // Hash da senha padrão
  const hashedPassword = await bcrypt.hash('123456', 12);

  // Criar administrador
  const admin = await prisma.admin.create({
    data: {
      name: 'Administrador Geral',
      email: 'admin@guincho.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      permissions: ['*'],
      isActive: true
    }
  });

  // Criar usuários de teste
  const user1 = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@test.com',
      phone: '11999999001',
      password: hashedPassword,
      isActive: true
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@test.com',
      phone: '11999999002',
      password: hashedPassword,
      subscriptionPlanId: basicPlan.id,
      isActive: true
    }
  });

  // Criar endereços para os usuários
  await prisma.address.create({
    data: {
      userId: user1.id,
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipcode: '01000-000',
      latitude: -23.5505,
      longitude: -46.6333,
      isPrimary: true
    }
  });

  await prisma.address.create({
    data: {
      userId: user2.id,
      street: 'Avenida Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipcode: '01310-100',
      latitude: -23.5618,
      longitude: -46.6565,
      isPrimary: true
    }
  });

  // Criar prestadores (guincheiros)
  const provider1 = await prisma.provider.create({
    data: {
      name: 'Carlos Guincho',
      email: 'carlos@guincho.com',
      phone: '11999999101',
      password: hashedPassword,
      cnh: '12345678901',
      rating: 4.8,
      totalRides: 150,
      status: 'ACTIVE',
      isAvailable: true,
      currentLat: -23.5505,
      currentLng: -46.6333
    }
  });

  const provider2 = await prisma.provider.create({
    data: {
      name: 'Roberto Assistência',
      email: 'roberto@guincho.com',
      phone: '11999999102',
      password: hashedPassword,
      cnh: '12345678902',
      rating: 4.6,
      totalRides: 89,
      status: 'ACTIVE',
      isAvailable: true,
      currentLat: -23.5618,
      currentLng: -46.6565
    }
  });

  // Criar documentos dos veículos
  await prisma.vehicleDocument.createMany({
    data: [
      {
        providerId: provider1.id,
        documentType: 'crlv',
        documentNumber: 'ABC1234',
        documentUrl: '/docs/crlv_carlos.pdf',
        isVerified: true
      },
      {
        providerId: provider1.id,
        documentType: 'insurance',
        documentNumber: 'SEG123456',
        documentUrl: '/docs/insurance_carlos.pdf',
        isVerified: true
      },
      {
        providerId: provider2.id,
        documentType: 'crlv',
        documentNumber: 'DEF5678',
        documentUrl: '/docs/crlv_roberto.pdf',
        isVerified: true
      }
    ]
  });

  // Criar áreas de serviço
  await prisma.serviceArea.createMany({
    data: [
      {
        providerId: provider1.id,
        city: 'São Paulo',
        state: 'SP',
        radiusKm: 20,
        centerLatitude: -23.5505,
        centerLongitude: -46.6333,
        isActive: true
      },
      {
        providerId: provider2.id,
        city: 'São Paulo',
        state: 'SP',
        radiusKm: 15,
        centerLatitude: -23.5618,
        centerLongitude: -46.6565,
        isActive: true
      }
    ]
  });

  // Criar algumas corridas de exemplo
  const ride1 = await prisma.ride.create({
    data: {
      userId: user1.id,
      providerId: provider1.id,
      serviceType: 'TIRE_CHANGE',
      originLatitude: -23.5505,
      originLongitude: -46.6333,
      originAddress: 'Rua das Flores, 123 - Centro, São Paulo - SP',
      status: 'COMPLETED',
      finalPrice: 80.00,
      estimatedTime: 30,
      description: 'Pneu furado no pneu dianteiro direito',
      paymentMethod: 'PIX',
      paymentStatus: 'PAID',
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 dia atrás
    }
  });

  const ride2 = await prisma.ride.create({
    data: {
      userId: user2.id,
      serviceType: 'FUEL',
      originLatitude: -23.5618,
      originLongitude: -46.6565,
      originAddress: 'Avenida Paulista, 1000 - Bela Vista, São Paulo - SP',
      status: 'PENDING',
      estimatedPrice: 50.00,
      description: 'Carro sem combustível',
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'PENDING'
    }
  });

  // Criar propostas para a corrida pendente
  await prisma.rideProposal.createMany({
    data: [
      {
        rideId: ride2.id,
        providerId: provider1.id,
        price: 50.00,
        estimatedTime: 25,
        message: 'Chegando em 25 minutos!',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 1000 * 60 * 15) // 15 minutos no futuro
      },
      {
        rideId: ride2.id,
        providerId: provider2.id,
        price: 45.00,
        estimatedTime: 20,
        message: 'Melhor preço da região!',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 1000 * 60 * 15) // 15 minutos no futuro
      }
    ]
  });

  // Criar pagamento para a corrida concluída
  await prisma.payment.create({
    data: {
      rideId: ride1.id,
      amount: 80.00,
      method: 'PIX',
      status: 'PAID',
      commissionAmount: 8.00, // 10% de comissão
      providerAmount: 72.00,
      processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      externalPaymentId: 'pix_123456789'
    }
  });

  // Criar avaliações
  await prisma.rating.create({
    data: {
      rideId: ride1.id,
      evaluatorId: user1.id, // usuário avalia o prestador
      evaluatedId: provider1.id,
      rating: 5,
      comment: 'Excelente serviço! Muito rápido e eficiente.'
    }
  });

  await prisma.rating.create({
    data: {
      rideId: ride1.id,
      evaluatorId: provider1.id, // prestador avalia o usuário
      evaluatedId: user1.id,
      rating: 5,
      comment: 'Cliente muito educado e pontual.'
    }
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Dados criados:');
  console.log(`- ${await prisma.admin.count()} administrador(es)`);
  console.log(`- ${await prisma.user.count()} usuário(s)`);
  console.log(`- ${await prisma.provider.count()} prestador(es)`);
  console.log(`- ${await prisma.ride.count()} corrida(s)`);
  console.log(`- ${await prisma.subscriptionPlan.count()} plano(s) de assinatura`);
  console.log(`- ${await prisma.payment.count()} pagamento(s)`);
  console.log(`- ${await prisma.rating.count()} avaliação(ões)`);
  
  console.log('\n🔑 Credenciais de teste:');
  console.log('Admin: admin@guincho.com / 123456');
  console.log('Usuário 1: joao@test.com / 123456');
  console.log('Usuário 2: maria@test.com / 123456');
  console.log('Prestador 1: carlos@guincho.com / 123456');
  console.log('Prestador 2: roberto@guincho.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });