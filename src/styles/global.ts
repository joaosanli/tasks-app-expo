import { StyleSheet } from 'react-native';

export const globalStyles = {
  primaryColor: '#6200EE',
  backgroundColor: '#F5F5F5',
  bodyFontSize: 16,
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.backgroundColor,
  },
  text: {
    fontSize: globalStyles.bodyFontSize,
    color: '#333',
  },
});