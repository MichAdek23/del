import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Button, Input } from '@/components';
import { colors } from '@/constants';
import { ArrowLeft } from 'lucide-react-native';
import { CreditCardInput } from 'react-native-credit-card-input';

// ==================== ADD PAYMENT METHOD PAGE ====================
export default function AddPaymentMethodPage({ onBack }: any) {
  const [cardName, setCardName] = useState('');
  const [cardForm, setCardForm] = useState({
    valid: false,
    values: {
      number: '',
      expiry: '',
      cvc: '',
      type: '',
    },
  });

  const handleCardInputChange = (form: any) => {
    setCardForm(form);
    
    // Log detected card type
    if (form.values.type) {
      console.log('Card Type:', form.values.type);
    }
  };

  const handleAdd = () => {
    if (!cardForm?.valid) {
      Alert.alert('Error', 'Please enter valid card information');
      return;
    }

    if (!cardName.trim()) {
      Alert.alert('Error', 'Please name this payment method');
      return;
    }

    const cardValues = cardForm.values;

    Alert.alert('Success', `Payment method "${cardName}" added successfully`, [
      {
        text: 'OK',
        onPress: () => {
          // Pass the card data back to parent if needed
          onBack(          {
            id: Date.now().toString(),
            type: 'card',
            cardName,
            cardNumber: `**** **** **** ${cardValues.number.slice(-4)}`,
            expiryDate: cardValues.expiry,
            cardholderName: cardValues.name,
            cardType: cardForm.values.type?.toUpperCase() || 'UNKNOWN',
            isDefault: false,
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Card Details</Text>

        <View style={styles.creditCardContainer}>
          <CreditCardInput
            onChange={handleCardInputChange}
            labels={{
              number: 'Card Number',
              expiry: 'Expiry Date',
              cvc: 'CVC',
            }}
            placeholders={{
              number: '1234 5678 9012 3456',
              expiry: 'MM/YY',
              cvc: '123',
            }}
            inputStyle={styles.creditCardInput}
            labelStyle={styles.labelStyle}
            validColor={colors.primary}
            invalidColor="#FF4444"
            placeholderColor={colors.textSecondary}
            allowScroll={false}
          />
        </View>

        <Text style={styles.sectionLabel}>Payment Method Name</Text>

        <Input
          label="Cardholder Name"
          value={cardName}
          onChangeText={setCardName}
          placeholder="John Doe"
          editable={true}
        />

        <Text style={styles.sectionLabel}>Card Nickname</Text>

        <Input
          label="Nickname (e.g., My Visa, Work Card)"
          value={cardName}
          onChangeText={setCardName}
          placeholder="e.g., Personal Visa"
          editable={true}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Give this card a memorable name to easily identify it later
          </Text>
        </View>

        <Button
          title="Add Payment Method"
          onPress={handleAdd}
          style={styles.submitButton}
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  creditCardContainer: {
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  creditCardInput: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  labelStyle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoBox: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginVertical: 20,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 30,
  },
});