import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function SendSnap() {
  const { image, selectedUser } = useLocalSearchParams<{
    image: string;
    selectedUser: string;
  }>();

  const [duration, setDuration] = useState('');
  const router = useRouter();

  const handleSend = async () => {
    if (!duration || !image || !selectedUser) {
      Alert.alert('Erreur', 'Remplis tous les champs.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Erreur', 'Token manquant. Connecte-toi à nouveau.');
        return;
      }

      const payload = {
        to: selectedUser,
        image: image,
        duration: Number(duration) || 5,
      };

      const response = await fetch('https://snapchat.epihub.eu/snap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key':
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lbHZpbi5oaXJlcEBlcGl0ZWNoLmV1IiwiaWF0IjoxNzQ3NjY1ODk3fQ.Su9kgrjpuVpzCi5jlcAxCE-T_fcSYsLOiLLV-r9DIb4',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur complète :', errorData);
        throw new Error(errorData?.data || 'Erreur HTTP');
      }

      Alert.alert('Succès', 'Snap envoyé avec succès !');
      router.push('/accueil');
    } catch (err: any) {
      console.error('Erreur complète :', err);
      Alert.alert('Erreur', err.message || "L'envoi du snap a échoué.");
    }
  };

  const quickDurations = [3, 5, 10];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>⏰ Durée du snap</Text>
        <Text style={styles.subtitle}></Text>
        <View style={styles.customInput}>
          <Text style={styles.inputLabel}>Combien de temps veux-tu qu'il soit visible ?</Text>
          <TextInput
            style={styles.input}
            placeholder="Durée en secondes"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>📤 Envoyer le Snap</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#130d62',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  quickButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickButtonSelected: {
    backgroundColor: '#FF6B6B',
  },
  quickButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quickButtonTextSelected: {
    color: '#ffffff',
  },
  customInput: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    fontSize: 16,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 18,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sendButtonText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});