import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';

interface RatingScreenProps {
  rideId: string;
  providerName: string;
  serviceType: string;
  onRatingComplete: (rating: number, review: string) => void;
  onSkip: () => void;
}

const RatingScreen: React.FC<RatingScreenProps> = ({ 
  rideId, 
  providerName, 
  serviceType, 
  onRatingComplete, 
  onSkip 
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingLabels = {
    1: 'Muito Ruim',
    2: 'Ruim',
    3: 'Regular',
    4: 'Bom',
    5: 'Excelente'
  };

  const positiveTags = [
    'Pontual',
    'Profissional',
    'Educado',
    'Rápido',
    'Cuidadoso',
    'Preço justo',
    'Bem equipado',
    'Comunicativo'
  ];

  const negativeTags = [
    'Atrasado',
    'Mal educado',
    'Demorado',
    'Descuidado',
    'Caro',
    'Mal equipado',
    'Não se comunicou',
    'Serviço incompleto'
  ];

  const getCurrentTags = () => {
    return rating >= 4 ? positiveTags : negativeTags;
  };

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
    setSelectedTags([]); // Limpar tags ao mudar avaliação
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Avaliação Necessária', 'Por favor, selecione uma avaliação de 1 a 5 estrelas');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Simular envio da avaliação
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
      
      const fullReview = `${review}${selectedTags.length > 0 ? `\n\nTags: ${selectedTags.join(', ')}` : ''}`;
      
      onRatingComplete(rating, fullReview);
      
      Alert.alert(
        'Obrigado!',
        'Sua avaliação foi enviada com sucesso.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar sua avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            style={styles.starButton}
            onPress={() => handleStarPress(star)}
          >
            <Text style={[
              styles.star,
              { color: star <= rating ? '#FFD700' : '#ddd' }
            ]}>
              ⭐
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getServiceTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      'towing': 'Reboque/Guincho',
      'battery_jump': 'Bateria',
      'tire_change': 'Troca de Pneu',
      'fuel_delivery': 'Combustível',
      'lockout': 'Abertura',
      'mechanical_help': 'Socorro Mecânico'
    };
    return types[type] || type;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Como foi seu atendimento?</Text>
        <Text style={styles.headerSubtitle}>
          Avalie o serviço de {getServiceTypeName(serviceType)} realizado por {providerName}
        </Text>
      </View>

      {/* Rating Stars */}
      <View style={styles.ratingSection}>
        <Text style={styles.sectionTitle}>Sua avaliação:</Text>
        {renderStars()}
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {ratingLabels[rating as keyof typeof ratingLabels]}
          </Text>
        )}
      </View>

      {/* Tags Section */}
      {rating > 0 && (
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>
            {rating >= 4 ? 'O que você mais gostou?' : 'O que pode melhorar?'}
          </Text>
          <View style={styles.tagsContainer}>
            {getCurrentTags().map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.selectedTag
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.selectedTagText
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Review Text */}
      <View style={styles.reviewSection}>
        <Text style={styles.sectionTitle}>Comentário (opcional):</Text>
        <TextInput
          style={styles.reviewInput}
          value={review}
          onChangeText={setReview}
          placeholder="Conte-nos mais sobre sua experiência..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.characterCount}>{review.length}/500</Text>
      </View>

      {/* Service Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Resumo do Serviço</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Prestador:</Text>
          <Text style={styles.summaryValue}>{providerName}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Serviço:</Text>
          <Text style={styles.summaryValue}>{getServiceTypeName(serviceType)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>ID do Serviço:</Text>
          <Text style={styles.summaryValue}>#{rideId.slice(-8)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={onSkip}
          disabled={isSubmitting}
        >
          <Text style={styles.skipButtonText}>Pular Avaliação</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitButton, rating === 0 && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 Dicas</Text>
        <Text style={styles.tipsText}>
          • Sua avaliação ajuda outros usuários a escolherem o melhor prestador{'\n'}
          • Avaliações justas contribuem para a melhoria do serviço{'\n'}
          • Comentários específicos são mais úteis que genéricos
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    marginHorizontal: 8,
  },
  star: {
    fontSize: 32,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  tagsSection: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
  },
  selectedTag: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagText: {
    fontSize: 14,
    color: '#495057',
  },
  selectedTagText: {
    color: 'white',
  },
  reviewSection: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#f8f9fa',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#6c757d',
    marginTop: 8,
  },
  summarySection: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 8,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
  },
});

export default RatingScreen;