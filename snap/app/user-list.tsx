import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface User {
  _id: string;
  username: string;
  profilePicture: string;
}

export default function UserList() {
  const { image } = useLocalSearchParams<{ image: string }>();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Erreur', 'Token manquant. Connecte-toi à nouveau.');
          return;
        }

        const response = await fetch('https://snapchat.epihub.eu/user', {
          headers: {
            'x-api-key':
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lbHZpbi5oaXJlcEBlcGl0ZWNoLmV1IiwiaWF0IjoxNzQ3NjY1ODk3fQ.Su9kgrjpuVpzCi5jlcAxCE-T_fcSYsLOiLLV-r9DIb4',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await response.json();
        if (Array.isArray(json.data)) {
          setUsers(json.data);
        } else {
          console.error('Réponse inattendue :', json);
          Alert.alert('Erreur', 'Les utilisateurs ne sont pas au bon format.');
        }
      } catch (err) {
        console.error('Erreur fetch utilisateurs :', err);
        Alert.alert('Erreur', 'Impossible de charger les utilisateurs.');
      }
    };

    fetchUsers();
  }, []);

  const handleSelectUser = (userId: string) => {
    router.push({
      pathname: '/send-snap',
      params: {
        image,
        selectedUser: userId,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Envoyer à :</Text>
      </View>

      <View style={styles.imagePreview}>
        {image && (
          <Image source={{ uri: image }} style={styles.previewImage} />
        )}
      </View>

      <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
        {users.map((user) => (
          <TouchableOpacity
            key={user._id}
            style={styles.userItem}
            onPress={() => handleSelectUser(user._id)}
          >
            <Text style={styles.userName}>{user.username}</Text>
            <View style={styles.sendIcon}>
              <Text style={styles.sendText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#130d62',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sendIcon: {
    width: 35,
    height: 35,
    borderRadius: 17,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});