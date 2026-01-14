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
import { CreditCardInput, LiteCreditCardInput } from 'react-native-credit-card-input';

// ==================== ADD PAYMENT METHOD PAGE ====================
export default function AddPaymentMethodPage({ onBack }: any) {
  const [formData, setFormData] = useState({
    cardName: '',
    cardholderName: '',
  });

  const [cardData, setCardData] = useState({
    number: '',
    exp: '',
    cvc: '',
    type: '',
  });

  const creditCardRef = useRef();

  const handleCardInputChange = (form: any) => {
    setCardData({
      number: form.values.number || '',
      exp: form.values.expiry || '',
      cvc: form.values.cvc || '',
      type: form.values.type || '',
    });
  };

  const handleAdd = () => {
    // Validate using the credit card input validation
    if (creditCardRef.current?.isValid() || 
        (cardData.number && cardData.exp && cardData.cvc && formData.cardholderName)) {
      Alert.alert('Success', 'Payment method added successfully');
      onBack();
    } else {
      Alert.alert('Error', 'Please fill all fields with valid information');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Card Information</Text>
        
        <View style={styles.creditCardContainer}>
          <CreditCardInput
            ref={creditCardRef}
            onChange={handleCardInputChange}
            labels={{
              number: 'Card Number',
              expiry: 'Expiry Date',
              cvc: 'CVV',
              name: 'Cardholder Name',
            }}
            placeholders={{
              number: '1234 5678 9012 3456',
              expiry: 'MM/YY',
              cvc: '123',
              name: 'John Doe',
            }}
            inputStyle={styles.creditCardInput}
            validColor={colors.primary}
            invalidColor="#FF4444"
            placeholderColor={colors.textSecondary}
            allowScroll={false}
          />
        </View>

        <Text style={styles.sectionLabel}>Payment Method Name</Text>
        
        <Input
          label="Name this card (e.g., My Visa)"
          value={formData.cardName}
          onChangeText={(text) =>
            setFormData({ ...formData, cardName: text })
          }
          placeholder="My Visa Card"
        />

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
    marginBottom: 12,
    marginTop: 16,
  },
  creditCardContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  creditCardInput: {
    fontSize: 16,
    color: colors.text,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 30,
  },
});