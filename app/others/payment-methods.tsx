import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Card, Button } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import {
  ArrowLeft,
  CreditCard,
  Trash2,
  Check,
} from 'lucide-react-native';
import AddPaymentMethodPage from './add-payment-method';

// ==================== PAYMENT METHODS PAGE ====================
export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [showAddPayment, setShowAddPayment] = useState(false);

  const handleAddPaymentMethod = (newCard: any) => {
    // Only add if newCard is not null/undefined
    if (newCard) {
      setPaymentMethods([...paymentMethods, newCard]);
    }
    setShowAddPayment(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Payment Method', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPaymentMethods(paymentMethods.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  if (showAddPayment) {
    return (
      <AddPaymentMethodPage onBack={handleAddPaymentMethod} />
    );
  }

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
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
              <CreditCard size={64} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Payment Methods Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add a credit or debit card to make payments easier
            </Text>
            <Button
              title="Add Your First Card"
              onPress={() => setShowAddPayment(true)}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <>
            {paymentMethods.map((method) => (
              <Card key={method.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <View style={styles.cardIcon}>
                      <CreditCard size={28} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName}>{method.cardName}</Text>
                      <Text style={styles.cardNumber}>{method.cardNumber}</Text>
                      <Text style={styles.cardholderName}>
                        {method.cardholderName}
                      </Text>
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
                  <View style={styles.actionButtons}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(method.id)}
                        style={styles.setDefaultBtn}
                      >
                        <Text style={styles.setDefaultText}>Set Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleDelete(method.id)}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={18} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}

            <Button
              title="Add Another Card"
              onPress={() => setShowAddPayment(true)}
              style={styles.addButton}
            />
          </>
        )}
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    alignSelf: 'center',
    width: '100%',
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
    flexShrink: 0,
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
  cardholderName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setDefaultBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  setDefaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 30,
  },
});