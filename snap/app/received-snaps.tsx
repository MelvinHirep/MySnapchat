import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';

interface Snap {
  _id: string;
  from: string;
  image?: string;
  duration?: number;
}

interface SnapWithSender extends Snap {
  senderUsername: string;
}

export default function ReceivedSnaps() {
  const [snaps, setSnaps] = useState<SnapWithSender[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSnaps = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error("Token manquant");

        const res = await fetch('https://snapchat.epihub.eu/snap', {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lbHZpbi5oaXJlcEBlcGl0ZWNoLmV1IiwiaWF0IjoxNzQ3NjY1ODk3fQ.Su9kgrjpuVpzCi5jlcAxCE-T_fcSYsLOiLLV-r9DIb4',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.data || 'Erreur API');

        const snapsData: Snap[] = json.data;

        const snapsWithSenders: SnapWithSender[] = await Promise.all(
          snapsData.map(async (snap) => {
            try {
              const userRes = await fetch(`https://snapchat.epihub.eu/user/${snap.from}`, {
                headers: {
                  'x-api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lbHZpbi5oaXJlcEBlcGl0ZWNoLmV1IiwiaWF0IjoxNzQ3NjY1ODk3fQ.Su9kgrjpuVpzCi5jlcAxCE-T_fcSYsLOiLLV-r9DIb4',
                  Authorization: `Bearer ${token}`,
                },
              });

              const userJson = await userRes.json();
              return {
                ...snap,
                senderUsername: userJson.data?.username || 'Inconnu',
              };
            } catch {
              return {
                ...snap,
                senderUsername: 'Inconnu',
              };
            }
          })
        );

        setSnaps(snapsWithSenders);
      } catch (err: any) {
        console.error('Erreur fetch snaps :', err);
        Alert.alert('Erreur', err.message || 'Impossible de charger les snaps.');
      }
    };

    fetchSnaps();
  }, []);

  const handlePressSnap = (snap: SnapWithSender) => {
    router.push({
      pathname: '/view-snap',
      params: {
        id: snap._id,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Snaps reçus :</Text>

      {snaps.length === 0 ? (
        <Text style={styles.empty}>Aucun snap reçu pour le moment.</Text>
      ) : (
        snaps.map((snap) => (
          <TouchableOpacity
            key={snap._id}
            onPress={() => handlePressSnap(snap)}
            style={styles.snapItem}
          >
            <Text>{snap.senderUsername}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#130d62',
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
  empty: {
    marginTop: 60,
    fontStyle: 'italic',
    color: '#bbb',
    textAlign: 'center',
    fontSize: 16,
  },
  snapItem: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});