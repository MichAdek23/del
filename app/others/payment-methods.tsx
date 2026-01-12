import React, { useState } from 'react';
import {  StyleSheet,  View,  Text,  ScrollView,  TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Card, Button } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { ArrowLeft,  X,  Plus,  Trash2,  Check,  CreditCard } from 'lucide-react-native';

// ==================== PAYMENT METHODS PAGE ====================
export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'card',
      cardName: 'Visa',
      cardNumber: '**** **** **** 1234',
      expiryDate: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      cardName: 'Mastercard',
      cardNumber: '**** **** **** 5678',
      expiryDate: '08/26',
      isDefault: false,
    },
  ]);

  const [showAddPayment, setShowAddPayment] = useState(false);

  if (showAddPayment) {
    return (
      <AddPaymentMethodPage onBack={() => setShowAddPayment(false)} />
    );
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete Payment Method', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          setPaymentMethods(paymentMethods.filter((p) => p.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentMethods.map((method) => (
          <Card key={method.id} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentInfo}>
                <View style={styles.cardIcon}>
                  <CreditCard size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.cardName}>{method.cardName}</Text>
                  <Text style={styles.cardNumber}>{method.cardNumber}</Text>
                </View>
              </View>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Check size={14} color="#fff" />
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            <View style={styles.paymentFooter}>
              <Text style={styles.expiryLabel}>
                Expires: {method.expiryDate}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(method.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={18} color="#FF4444" />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        <Button
          title="Add Payment Method"
          onPress={() => setShowAddPayment(true)}
          variant="outline"
          style={styles.addButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  signOutButton: {
    marginTop: 20,
    marginBottom: 30,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 30,
  },
  driverHeaderSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  driverAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  driverName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  reviewsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  phoneButton: {
    backgroundColor: colors.primary,
  },
  messageButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailsCard: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  messagesList: {
    padding: 16,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  messageAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  messageTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messagePreview: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  unreadMessage: {
    color: colors.text,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chatMessagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  driverMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  bubbleText: {
    fontSize: 14,
  },
  userBubbleText: {
    color: '#fff',
  },
  driverBubbleText: {
    color: colors.text,
  },
  bubbleTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userBubbleTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  driverBubbleTime: {
    color: colors.textSecondary,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  paymentCard: {
    marginBottom: 12,
    padding: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardNumber: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  defaultText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  addressCard: {
    marginBottom: 12,
    padding: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editAddressBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    gap: 6,
  },
  editAddressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteAddressBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    gap: 6,
  },
  deleteAddressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF4444',
  },
  addButton: {
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  defaultAddressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginVertical: 16,
  },
  defaultAddressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  MessageSquare: {
    // for the chat icon
  },
});
