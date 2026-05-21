import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TaskPriority, useTaskStore } from '../../src/store/useTaskStore';
import { globalStyles } from '../../src/styles/global';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTaskStore((state) => state.tasks.find((item) => item._id === id));
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const toggleTaskCompleted = useTaskStore((state) => state.toggleTaskCompleted);

  const [modalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState('');
  const [completed, setCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>('Baixa');

  useEffect(() => {
    if (!task) return;
    setText(task.text);
    setCompleted(task.completed);
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setPriority(task.priority);
  }, [task]);

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Tarefa não encontrada</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const handleSave = async () => {
    await updateTask(task._id, {
      text: text.trim(),
      completed,
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
    });
    setModalVisible(false);
  };

  const handleDelete = async () => {
    await deleteTask(task._id);
    router.back();
  };

  const onChangeDate = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={[styles.status, task.completed ? styles.statusCompleted : styles.statusPending]}>
          {task.completed ? 'Concluída' : 'Pendente'}
        </Text>
        <Text style={[styles.title, task.completed && styles.titleCompleted]}>{task.text}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Prioridade</Text>
          <Text style={styles.value}>{task.priority}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Data limite</Text>
          <Text style={[styles.value, isOverdue ? styles.dateOverdue : styles.dateOnTime]}>
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sem data definida'}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => toggleTaskCompleted(task._id)}>
            <Text style={styles.primaryButtonText}>{task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.secondaryButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDelete}>
            <Text style={styles.primaryButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Tarefa</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome da tarefa..."
              value={text}
              maxLength={50}
              onChangeText={setText}
            />

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Data limite:</Text>
              {Platform.OS === 'web' ? (
                // @ts-ignore: input HTML usado somente no build web do Expo.
                <input
                  type="date"
                  value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
                  onChange={(event: any) => {
                    const value = event.target.value;
                    if (!value) {
                      setDueDate(null);
                      return;
                    }
                    const [year, month, day] = value.split('-');
                    setDueDate(new Date(Number(year), Number(month) - 1, Number(day)));
                  }}
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', flex: 1, marginLeft: 16 }}
                />
              ) : (
                <View style={{ flex: 1, marginLeft: 16, alignItems: 'flex-start' }}>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerBtn}>
                    <Text>{dueDate ? dueDate.toLocaleDateString() : 'Selecionar Data'}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker value={dueDate || new Date()} mode="date" display="default" onChange={onChangeDate} />
                  )}
                </View>
              )}
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Concluída:</Text>
              <View style={styles.checkboxContainer}>
                <Checkbox value={completed} onValueChange={setCompleted} color={completed ? '#000' : undefined} />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Prioridade:</Text>
              <View style={styles.priorityContainer}>
                {(['Baixa', 'Média', 'Alta'] as TaskPriority[]).map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.priorityButton, priority === item && styles.priorityButtonActive]}
                    onPress={() => setPriority(item)}
                  >
                    <Text style={[styles.priorityText, priority === item && styles.priorityTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, !text.trim() && styles.modalSaveBtnDisabled]}
                onPress={handleSave}
                disabled={!text.trim()}
              >
                <Text style={styles.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: globalStyles.backgroundColor,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    padding: 20,
  },
  status: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 4,
    paddingHorizontal: 10,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusCompleted: {
    backgroundColor: '#43a047',
  },
  statusPending: {
    backgroundColor: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#777',
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  label: {
    color: '#666',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 18,
  },
  dateOverdue: {
    color: '#e53935',
  },
  dateOnTime: {
    color: '#43a047',
  },
  actions: {
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#d9363e',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    marginLeft: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    flex: 1,
    marginLeft: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  priorityButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  priorityText: {
    color: '#333',
  },
  priorityTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  datePickerBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSaveBtn: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  modalSaveBtnDisabled: {
    backgroundColor: '#ccc',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
