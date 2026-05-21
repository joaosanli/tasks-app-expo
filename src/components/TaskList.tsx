import React, { useMemo } from 'react';
import { SectionList, StyleSheet, View, Text } from 'react-native';
import TaskItem from './TaskItem';
import { useTaskStore } from '../store/useTaskStore';

type TaskFilter = 'all' | 'completed' | 'pending';

interface TaskListProps {
  filter: TaskFilter;
}

const TaskList: React.FC<TaskListProps> = ({ filter }) => {
  const tasks = useTaskStore((state) => state.tasks);

  const filteredTasks = useMemo(() => {
    if (filter === 'completed') return tasks.filter((task) => task.completed);
    if (filter === 'pending') return tasks.filter((task) => !task.completed);
    return tasks;
  }, [tasks, filter]);

  const sections = useMemo(() => {
    const completedTasks = filteredTasks.filter((task) => task.completed);
    const pendingTasks = filteredTasks.filter((task) => !task.completed);

    return [
      { title: '📋 Pendentes', data: pendingTasks },
      { title: '✅ Concluídas', data: completedTasks },
    ];
  }, [filteredTasks]);

  return (
    <View style={styles.listContainer}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
        renderItem={({ item }) => <TaskItem task={item} />}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? (
            <Text style={styles.emptySectionText}>Nenhuma tarefa nesta categoria.</Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  emptySectionText: {
    padding: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default TaskList;
