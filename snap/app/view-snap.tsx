import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';

export default function ViewSnap() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [image, setImage] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(5);
  const [countdown, setCountdown] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSnapDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error("Token manquant");

        const res = await fetch(`https://snapchat.epihub.eu/snap/${id}`, {
          headers: {
            'x-api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lbHZpbi5oaXJlcEBlcGl0ZWNoLmV1IiwiaWF0IjoxNzQ3NjY1ODk3fQ.Su9kgrjpuVpzCi5jlcAxCE-T_fcSYsLOiLLV-r9DIb4',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.data || 'Erreur API');

        const snap = json.data;

        if (!snap.image || !snap.image.startsWith('data:image/')) {
          throw new Error("Image invalide");
        }

        const snapDuration = snap.duration ?? 5;
        setImage(snap.image);
        setDuration(snapDuration);
        setCountdown(snapDuration);

        setTimeout(() => {
          router.replace('/received-snaps');
        }, snapDuration * 1000);

        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(countdownInterval);

      } catch (err: any) {
        Alert.alert('Erreur', err.message || 'Snap invalide.');
        router.replace('/accueil');
      } finally {
        setLoading(false);
      }
    };

    fetchSnapDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  }

  if (!image) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Aucune image à afficher.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
      <Text style={styles.duration}>
        Ce snap sera visible pendant {countdown} seconde{countdown > 1 ? 's' : ''}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  image: {
    width: '95%',
    height: '75%',
    marginBottom: 25,
    borderRadius: 10,
  },
  duration: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  error: {
    color: '#ff6b6b',
    fontSize: 18,
    textAlign: 'center',
  },
});