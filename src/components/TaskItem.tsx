import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TaskItem as TaskType, useTaskStore } from '../store/useTaskStore';

interface TaskItemProps {
  task: TaskType;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const toggleTaskCompleted = useTaskStore((state) => state.toggleTaskCompleted);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <Pressable style={styles.task} onPress={() => router.push(`/task/${task._id}`)}>
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.text, task.completed && styles.textCompleted]}>{task.text}</Text>
          <Text style={styles.priority}>{task.priority}</Text>
        </View>
        {task.dueDate && (
          <Text style={[styles.dateText, isOverdue ? styles.dateOverdue : styles.dateOnTime]}>
            Até: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
      </View>
      <View style={styles.icons}>
        <TouchableOpacity
          onPress={(event) => {
            event.stopPropagation();
            toggleTaskCompleted(task._id);
          }}
          accessibilityRole="button"
        >
          <Feather name={task.completed ? 'rotate-ccw' : 'check'} size={20} color="#fff" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(event) => {
            event.stopPropagation();
            deleteTask(task._id);
          }}
          accessibilityRole="button"
        >
          <AntDesign name="delete" size={20} color="#fff" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  task: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  priority: {
    color: '#000',
    backgroundColor: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  dateText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  dateOverdue: {
    color: '#e53935',
  },
  dateOnTime: {
    color: '#43a047',
  },
  icons: {
    flexDirection: 'row',
    gap: 16,
  },
  icon: {
    padding: 2,
  },
});

export default TaskItem;
