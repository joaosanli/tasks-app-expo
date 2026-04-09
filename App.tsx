import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import TaskItem from './src/components/TaskItem';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    // Simulação de carregamento de tarefas
    setTimeout(() => {
      setTasks([
        { id: 1, title: 'Tarefa 1', dueDate: '2023-10-20' },
        { id: 2, title: 'Tarefa 2', dueDate: '2023-10-25' },
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!logoError ? (
        <Image
          source={require('./assets/task-app-banner.png')}
          style={styles.logo}
          onError={() => setLogoError(true)}
        />
      ) : (
        <Text style={styles.logoFallback}>Gerenciador de Tarefas</Text>
      )}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TaskItem task={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  logoFallback: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
});