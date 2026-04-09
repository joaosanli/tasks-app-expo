import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TaskItem = ({ task }) => {
  const today = new Date();
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;

  const isOverdue = dueDate && dueDate < today;

  return (
    <View style={styles.container}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      {dueDate && (
        <Text style={[styles.dueDate, isOverdue ? styles.overdue : styles.onTime]}>
          {dueDate.toLocaleDateString()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dueDate: {
    fontSize: 14,
    marginTop: 5,
  },
  overdue: {
    color: '#e53935',
  },
  onTime: {
    color: '#43a047',
  },
});

export default TaskItem;