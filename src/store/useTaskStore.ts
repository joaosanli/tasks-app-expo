import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export type TaskPriority = 'Baixa' | 'Média' | 'Alta';

export interface TaskItem {
  _id: string;
  text: string;
  completed: boolean;
  dueDate: string | null;
  priority: TaskPriority;
}

interface TaskState {
  tasks: TaskItem[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (payload: Omit<TaskItem, '_id'>) => Promise<void>;
  updateTask: (taskId: string, payload: Omit<TaskItem, '_id'>) => Promise<void>;
  toggleTaskCompleted: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  clearTasks: () => void;
  getTaskById: (taskId: string) => TaskItem | undefined;
}

const normalizeTask = (task: Partial<TaskItem> & { _id?: string; text?: string }): TaskItem => ({
  _id: task._id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  text: task.text ?? '',
  completed: Boolean(task.completed),
  dueDate: task.dueDate ?? null,
  priority: task.priority ?? 'Baixa',
});

const canUseApi = Boolean(baseURL);

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      error: null,

      fetchTasks: async () => {
        if (!canUseApi) return;

        set({ loading: true, error: null });
        try {
          const { data } = await axios.get<TaskItem[]>(`${baseURL}`);
          set({ tasks: data.map(normalizeTask), loading: false });
        } catch (error) {
          console.log(error);
          set({ loading: false, error: 'Não foi possível carregar as tarefas da API.' });
        }
      },

      addTask: async (payload) => {
        const localTask = normalizeTask(payload);

        if (!canUseApi) {
          set((state) => ({ tasks: [localTask, ...state.tasks] }));
          return;
        }

        set({ loading: true, error: null });
        try {
          await axios.post(`${baseURL}/save`, payload);
          await get().fetchTasks();
        } catch (error) {
          console.log(error);
          set((state) => ({
            tasks: [localTask, ...state.tasks],
            loading: false,
            error: 'A tarefa foi salva localmente porque a API não respondeu.',
          }));
        }
      },

      updateTask: async (taskId, payload) => {
        const previousTasks = get().tasks;
        const updatedTask = normalizeTask({ _id: taskId, ...payload });

        set((state) => ({
          tasks: state.tasks.map((task) => (task._id === taskId ? updatedTask : task)),
          error: null,
        }));

        if (!canUseApi) return;

        set({ loading: true });
        try {
          await axios.post(`${baseURL}/update`, { _id: taskId, ...payload });
          await get().fetchTasks();
        } catch (error) {
          console.log(error);
          set({
            tasks: previousTasks,
            loading: false,
            error: 'Não foi possível atualizar a tarefa na API.',
          });
        }
      },

      toggleTaskCompleted: async (taskId) => {
        const task = get().tasks.find((item) => item._id === taskId);
        if (!task) return;

        await get().updateTask(taskId, {
          text: task.text,
          completed: !task.completed,
          dueDate: task.dueDate,
          priority: task.priority,
        });
      },

      deleteTask: async (taskId) => {
        const previousTasks = get().tasks;

        set((state) => ({
          tasks: state.tasks.filter((task) => task._id !== taskId),
          error: null,
        }));

        if (!canUseApi) return;

        set({ loading: true });
        try {
          await axios.post(`${baseURL}/delete`, { _id: taskId });
          await get().fetchTasks();
        } catch (error) {
          console.log(error);
          set({
            tasks: previousTasks,
            loading: false,
            error: 'Não foi possível excluir a tarefa na API.',
          });
        }
      },

      clearTasks: () => set({ tasks: [], error: null }),

      getTaskById: (taskId) => get().tasks.find((task) => task._id === taskId),
    }),
    {
      name: 'tasks-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);
