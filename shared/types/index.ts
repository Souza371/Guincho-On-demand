// Tipos base do sistema

export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

// Enums
export enum UserRole {
  CLIENT = 'client',
  PROVIDER = 'provider',
  ADMIN = 'admin'
}

export enum ServiceType {
  LIGHT_TOW = 'light_tow',
  HEAVY_TOW = 'heavy_tow',
  TIRE_CHANGE = 'tire_change',
  FUEL = 'fuel',
  BATTERY = 'battery'
}

export enum RideStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ProposalStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  PIX = 'pix',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash'
}

export enum ProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_APPROVAL = 'pending_approval',
  SUSPENDED = 'suspended'
}

// Location
export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address extends BaseEntity {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  location: Location;
  is_primary: boolean;
}

// User (Cliente)
export interface User extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
  subscription_plan_id?: string;
  subscription_plan?: SubscriptionPlan;
  is_active: boolean;
}

// Provider (Guincheiro)
export interface Provider extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  cnh: string;
  vehicle_documents: VehicleDocument[];
  service_areas: ServiceArea[];
  rating: number;
  total_rides: number;
  status: ProviderStatus;
  is_available: boolean;
  current_location?: Location;
}

export interface VehicleDocument extends BaseEntity {
  provider_id: string;
  document_type: string; // 'crlv', 'insurance', 'license'
  document_number: string;
  document_url: string;
  expiry_date?: Date;
  is_verified: boolean;
}

export interface ServiceArea extends BaseEntity {
  provider_id: string;
  city: string;
  state: string;
  radius_km: number;
  center_location: Location;
  is_active: boolean;
}

// Ride (Corrida/Solicitação)
export interface Ride extends BaseEntity {
  user_id: string;
  provider_id?: string;
  service_type: ServiceType;
  origin_location: Location;
  destination_location?: Location;
  origin_address: string;
  destination_address?: string;
  status: RideStatus;
  estimated_price?: number;
  final_price?: number;
  estimated_time?: number; // em minutos
  description?: string;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  completed_at?: Date;
  
  // Relacionamentos
  user?: User;
  provider?: Provider;
  proposals?: RideProposal[];
  payment?: Payment;
  ratings?: Rating[];
}

// Proposta de Preço
export interface RideProposal extends BaseEntity {
  ride_id: string;
  provider_id: string;
  price: number;
  estimated_time: number; // em minutos
  message?: string;
  status: ProposalStatus;
  expires_at: Date;
  
  // Relacionamentos
  ride?: Ride;
  provider?: Provider;
}

// Avaliação
export interface Rating extends BaseEntity {
  ride_id: string;
  evaluator_id: string; // user_id ou provider_id
  evaluated_id: string; // user_id ou provider_id
  rating: number; // 1-5
  comment?: string;
  
  // Relacionamentos
  ride?: Ride;
}

// Pagamento
export interface Payment extends BaseEntity {
  ride_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  external_payment_id?: string;
  commission_amount: number;
  provider_amount: number;
  processed_at?: Date;
  
  // Relacionamentos
  ride?: Ride;
}

// Plano de Assinatura
export interface SubscriptionPlan extends BaseEntity {
  name: string;
  price: number;
  rides_included: number;
  description: string;
  features: string[];
  is_active: boolean;
}

// Admin
export interface Admin extends BaseEntity {
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  is_active: boolean;
}

// DTOs para APIs
export interface CreateUserDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface CreateProviderDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  cnh: string;
}

export interface CreateRideDTO {
  service_type: ServiceType;
  origin_location: Location;
  destination_location?: Location;
  origin_address: string;
  destination_address?: string;
  description?: string;
}

export interface CreateProposalDTO {
  ride_id: string;
  price: number;
  estimated_time: number;
  message?: string;
}

export interface CreateRatingDTO {
  ride_id: string;
  evaluated_id: string;
  rating: number;
  comment?: string;
}

// Responses das APIs
export interface AuthResponse {
  user: User | Provider | Admin;
  access_token: string;
  refresh_token: string;
}

export interface RideListResponse {
  rides: Ride[];
  total: number;
  page: number;
  limit: number;
}

export interface ProposalListResponse {
  proposals: RideProposal[];
  total: number;
}

// WebSocket Events
export interface RideUpdateEvent {
  type: 'ride_update';
  ride_id: string;
  status: RideStatus;
  provider_location?: Location;
}

export interface NewProposalEvent {
  type: 'new_proposal';
  ride_id: string;
  proposal: RideProposal;
}

export interface ProposalAcceptedEvent {
  type: 'proposal_accepted';
  ride_id: string;
  proposal_id: string;
}

export type SocketEvent = RideUpdateEvent | NewProposalEvent | ProposalAcceptedEvent;