import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Typography';
import { colors, spacing, typography, borderRadius, mixins } from '../../constants/theme';

export default function ChatScreen() {
  const [message, setMessage] = useState('');

  // Placeholder function for sending messages
  const handleSendMessage = () => {
    if (!message.trim()) return;
    // Will implement message sending logic in milestone 2
    setMessage('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Messages Area (MS2) */}
      <ScrollView 
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {/* Placeholder welcome message (MS2) */}
        <View style={styles.messageWrapper}>
          <View style={[styles.message, styles.botMessage]}>
            <Text variant="body">
               Hi! I'm your SAVOUR assistant. I'm currently a work in progress, that will be worked on in milestone 2!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Message Input Area (MS2) */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder=" Type your message..."
          placeholderTextColor={colors.text.secondary.dark}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <Button
          title="Send"
          onPress={handleSendMessage}
          variant="primary"
          size="medium"
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
  },
  messageWrapper: {
    marginVertical: spacing.xs,
  },
  message: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  botMessage: {
    backgroundColor: colors.surface.dark,
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
    backgroundColor: colors.surface.dark,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.dark,
    color: colors.text.primary.dark,
    fontSize: typography.sizes.md,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
  },
}); 