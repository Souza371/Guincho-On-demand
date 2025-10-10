import React, { useState, useEffect } from 'react';
import '../styles/components.css';

interface MapLocation {
  id: string;
  name: string;
  type: 'ride' | 'provider' | 'user';
  lat: number;
  lng: number;
  status?: 'active' | 'inactive' | 'pending';
  description?: string;
}

interface SimpleMapProps {
  locations?: MapLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number;
}

const mockLocations: MapLocation[] = [
  {
    id: '1',
    name: 'Solicitação #001',
    type: 'ride',
    lat: -23.5505,
    lng: -46.6333,
    status: 'active',
    description: 'Guincho solicitado - Av. Paulista'
  },
  {
    id: '2',
    name: 'João Silva',
    type: 'provider',
    lat: -23.5489,
    lng: -46.6388,
    status: 'active',
    description: 'Prestador disponível'
  },
  {
    id: '3',
    name: 'Maria Santos',
    type: 'provider',
    lat: -23.5515,
    lng: -46.6290,
    status: 'inactive',
    description: 'Prestador offline'
  },
  {
    id: '4',
    name: 'Solicitação #002',
    type: 'ride',
    lat: -23.5470,
    lng: -46.6400,
    status: 'pending',
    description: 'Aguardando prestador'
  }
];

export const SimpleMap: React.FC<SimpleMapProps> = ({ 
  locations = mockLocations, 
  center = { lat: -23.5505, lng: -46.6333 }, 
  zoom = 14,
  height = 300 
}) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  // Converter coordenadas geográficas para posição no SVG
  const latLngToPosition = (lat: number, lng: number) => {
    const bounds = {
      north: center.lat + 0.01,
      south: center.lat - 0.01,
      east: center.lng + 0.01,
      west: center.lng - 0.01
    };
    
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * 100;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * 100;
    
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const getLocationIcon = (type: MapLocation['type'], status?: string) => {
    switch (type) {
      case 'ride':
        return status === 'active' ? '🚛' : '📍';
      case 'provider':
        return status === 'active' ? '👨‍🔧' : '👤';
      case 'user':
        return '👤';
      default:
        return '📍';
    }
  };

  const getLocationColor = (type: MapLocation['type'], status?: string) => {
    if (status === 'inactive') return '#6b7280';
    
    switch (type) {
      case 'ride':
        return status === 'active' ? '#ef4444' : '#f59e0b';
      case 'provider':
        return status === 'active' ? '#10b981' : '#6b7280';
      case 'user':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="simple-map-container" style={{ height }}>
      <div className="map-header">
        <h4>Mapa em Tempo Real</h4>
        <div className="map-legend">
          <span><span style={{color: '#ef4444'}}>🚛</span> Ativo</span>
          <span><span style={{color: '#f59e0b'}}>📍</span> Pendente</span>
          <span><span style={{color: '#10b981'}}>👨‍🔧</span> Disponível</span>
          <span><span style={{color: '#6b7280'}}>👤</span> Offline</span>
        </div>
      </div>
      
      <div className="map-viewport">
        <svg className="map-svg" viewBox="0 0 100 100">
          {/* Grid de fundo */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Ruas principais simuladas */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="#d1d5db" strokeWidth="0.8" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#d1d5db" strokeWidth="0.8" />
          <line x1="20" y1="0" x2="20" y2="100" stroke="#e5e7eb" strokeWidth="0.4" />
          <line x1="80" y1="0" x2="80" y2="100" stroke="#e5e7eb" strokeWidth="0.4" />
          <line x1="0" y1="20" x2="100" y2="20" stroke="#e5e7eb" strokeWidth="0.4" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#e5e7eb" strokeWidth="0.4" />
          
          {/* Marcadores de localização */}
          {locations.map((location) => {
            const position = latLngToPosition(location.lat, location.lng);
            return (
              <g key={location.id}>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r="2"
                  fill={getLocationColor(location.type, location.status)}
                  stroke="white"
                  strokeWidth="0.5"
                  className={`map-marker ${selectedLocation?.id === location.id ? 'selected' : ''}`}
                  onClick={() => setSelectedLocation(location)}
                  style={{ cursor: 'pointer' }}
                />
                {selectedLocation?.id === location.id && (
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="3"
                    fill="none"
                    stroke={getLocationColor(location.type, location.status)}
                    strokeWidth="0.5"
                    opacity="0.5"
                  />
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Tooltip */}
        {selectedLocation && (
          <div className="map-tooltip">
            <div className="tooltip-header">
              <span className="tooltip-icon">
                {getLocationIcon(selectedLocation.type, selectedLocation.status)}
              </span>
              <strong>{selectedLocation.name}</strong>
            </div>
            <div className="tooltip-description">
              {selectedLocation.description}
            </div>
            <div className="tooltip-status">
              Status: <span className={`status-${selectedLocation.status}`}>
                {selectedLocation.status || 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Lista de localizações */}
      <div className="map-locations-list">
        <div className="locations-header">
          <h5>Localizações Ativas ({locations.length})</h5>
        </div>
        <div className="locations-scroll">
          {locations.map((location) => (
            <div
              key={location.id}
              className={`location-item ${selectedLocation?.id === location.id ? 'selected' : ''}`}
              onClick={() => setSelectedLocation(location)}
            >
              <span className="location-icon">
                {getLocationIcon(location.type, location.status)}
              </span>
              <div className="location-info">
                <div className="location-name">{location.name}</div>
                <div className="location-desc">{location.description}</div>
              </div>
              <span className={`location-status status-${location.status}`}>
                {location.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;