
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type RegisterProps = {
  onShowLogin?: () => void;
};

const Register: React.FC<RegisterProps> = ({ onShowLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.backArrow}>{'\u2190'}</Text>
        <Text style={styles.header}>Create Account</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Full Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#7CB798"
        value={fullName}
        onChangeText={setFullName}
      />
      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#7CB798"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {/* Password */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#7CB798"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {/* Role Toggle */}
      <View style={styles.roleRow}>
        <Pressable
          style={[styles.roleBtn, role === 'buyer' && styles.roleBtnActive]}
          onPress={() => setRole('buyer')}
        >
          <Text style={[styles.roleBtnText, role === 'buyer' && styles.roleBtnTextActive]}>Buyer</Text>
        </Pressable>
        <Pressable
          style={[styles.roleBtn, role === 'seller' && styles.roleBtnActive, { marginLeft: 16 }]}
          onPress={() => setRole('seller')}
        >
          <Text style={[styles.roleBtnText, role === 'seller' && styles.roleBtnTextActive]}>Seller</Text>
        </Pressable>
      </View>
      {/* Create Account Button */}
      <TouchableOpacity style={styles.createBtn}>
        <Text style={styles.createBtnText}>Create Account</Text>
      </TouchableOpacity>
      {/* Sign in link */}
      <View style={{ flex: 1 }} />
  <Text style={styles.signinText}>Already have an account? <Text style={styles.signinLink} onPress={onShowLogin}>Sign in</Text></Text>
      <View style={{ height: 16 }} />
    </View>
  );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCF9',
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  backArrow: {
    fontSize: 22,
    color: '#222',
    width: 24,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#E7F3EC',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    marginBottom: 14,
    width: '100%',
    minWidth: 220,
    maxWidth: 500,
    alignSelf: 'center',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 10,
  },
  roleBtn: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7F3EC',
  },
  roleBtnActive: {
    backgroundColor: '#E7F3EC',
    borderColor: '#38E472',
  },
  roleBtnText: {
    color: '#7CB798',
    fontWeight: 'bold',
    fontSize: 16,
  },
  roleBtnTextActive: {
    color: '#222',
  },
  createBtn: {
    backgroundColor: '#38E472',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  createBtnText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 18,
  },
  signinText: {
    textAlign: 'center',
    color: '#7CB798',
    marginBottom: 0,
    fontSize: 14,
  },
  signinLink: {
    color: '#38E472',
    fontWeight: 'bold',
  },
});

export default Register;
