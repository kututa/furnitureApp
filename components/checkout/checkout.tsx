
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type CartItem = {
  id: string;
  name: string;
  price: string;
  image: any;
  quantity: number;
};

type CheckoutProps = {
  items?: CartItem[];
  subtotal?: number;
  shipping?: number;
  total?: number;
  onBack?: () => void;
  onRemoveItem?: (id: string) => void;
  onConfirmPayment?: (form: any) => void;
};

const Checkout: React.FC<CheckoutProps> = ({
  items = [],
  subtotal = 0,
  shipping = 0,
  total = 0,
  onBack,
  onRemoveItem,
  onConfirmPayment,
}) => {
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Nairobi');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.header}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Order Summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {items.map(item => (
          <View key={item.id} style={styles.orderItemRow}>
            <Image source={item.image} style={styles.orderItemImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.orderItemName}>{item.quantity} x {item.name}</Text>
              <Text style={styles.orderItemDesc}>Handcrafted Wooden Chair</Text>
            </View>
            <TouchableOpacity onPress={() => onRemoveItem && onRemoveItem(item.id)}>
              <Ionicons name="close-circle" size={22} color="#E47272" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>KES {subtotal}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Shipping</Text><Text style={styles.summaryValue}>KES {shipping}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total</Text><Text style={styles.summaryValue}>KES {total}</Text></View>

        {/* Shipping Details */}
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        <TextInput style={styles.input} placeholder="Enter your full name" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Street address, building, apartment" value={address} onChangeText={setAddress} />
        <TextInput style={styles.input} placeholder="Nairobi" value={city} onChangeText={setCity} />
        <TextInput style={styles.input} placeholder="Enter your phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>M-Pesa</Text>
          <Ionicons name="checkmark" size={20} color="#38E472" />
        </View>
        <Text style={styles.paymentDesc}>Please enter your M-Pesa registered phone number below to initiate the payment.</Text>
        <TextInput style={styles.input} placeholder="Enter your phone number" value={mpesaPhone} onChangeText={setMpesaPhone} keyboardType="phone-pad" />
        <Text style={styles.paymentNote}>You will receive an M-Pesa prompt on your phone to complete the payment of KES {total}.</Text>

        {/* Confirm Payment Button */}
        <TouchableOpacity style={styles.confirmBtn} onPress={() => onConfirmPayment && onConfirmPayment({ fullName, address, city, phone, email, mpesaPhone })}>
          <Text style={styles.confirmBtnText}>Confirm Payment</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      {/* <View style={styles.bottomNav}>
        <Ionicons name="home-outline" size={24} color="#7CB798" />
        <Ionicons name="search-outline" size={24} color="#7CB798" />
        <Ionicons name="cart-outline" size={24} color="#7CB798" />
        <Ionicons name="person-outline" size={24} color="#7CB798" />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCF9',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 18, // Push header down from the top
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
    marginBottom: 8,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E7F3EC',
  },
  orderItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  orderItemDesc: {
    color: '#7CB798',
    fontSize: 13,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  summaryLabel: {
    color: '#7CB798',
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  input: {
    backgroundColor: '#E7F3EC',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentLabel: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 8,
  },
  paymentDesc: {
    color: '#7CB798',
    fontSize: 14,
    marginBottom: 6,
  },
  paymentNote: {
    color: '#7CB798',
    fontSize: 13,
    marginBottom: 10,
  },
  confirmBtn: {
    backgroundColor: '#38E472',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 12,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E7F3EC',
  },
});

export default Checkout;
