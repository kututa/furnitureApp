

import { useAuthStore } from '@/stores/authStore';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type LoginProps = {
  onShowRegister?: () => void;
  onLogin?: (data: { role: 'buyer' | 'seller'; email: string; password: string }) => void;
};

const Login: React.FC<LoginProps> = ({ onShowRegister, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const {login, isLoading, error, user} = useAuthStore()

  const handleSubmit = async () =>{
    if(!email || !password) return
    try{
      await login(email, password)
 if (user) {
		onLogin?.({ role: user.role, email, password });
 }
    } catch(err){
      console.error("Failed to login", err)
    }
  }

  return (
		<View style={styles.container}>
			{/* Spacer to push form down */}
			<View style={{ height: 60 }} />
			{/* Form */}
			<View style={styles.formBox}>
				<Text style={styles.label}>Email</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter your email"
					placeholderTextColor="#7CB798"
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
				/>

				<Text style={styles.label}>Password</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter password"
					placeholderTextColor="#7CB798"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>

				<TouchableOpacity>
					<Text style={styles.forgot}>Forgot Password?</Text>
				</TouchableOpacity>

				<View style={styles.roleRow}>
					<Pressable
						style={[styles.roleBtn, role === "buyer" && styles.roleBtnActive]}
						onPress={() => setRole("buyer")}
					>
						<Text
							style={[
								styles.roleBtnText,
								role === "buyer" && styles.roleBtnTextActive,
							]}
						>
							Buyer
						</Text>
					</Pressable>
					<Pressable
						style={[
							styles.roleBtn,
							role === "seller" && styles.roleBtnActive,
							{ marginLeft: 16 },
						]}
						onPress={() => setRole("seller")}
					>
						<Text
							style={[
								styles.roleBtnText,
								role === "seller" && styles.roleBtnTextActive,
							]}
						>
							Seller
						</Text>
					</Pressable>
				</View>

				<TouchableOpacity
					style={styles.loginBtn}
					disabled={isLoading}
					onPress={handleSubmit}
				>
					<Text style={styles.loginBtnText}>Login</Text>
				</TouchableOpacity>
				{!!error && (
					<Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
				)}
			</View>
			{/* Move sign up link higher */}
			<View style={{ flex: 1 }} />
			<Text style={styles.signupText}>
				Don&apos;t have an account?{" "}
				<Text style={styles.signupLink} onPress={onShowRegister}>
					Sign up
				</Text>
			</Text>
			<View style={{ height: 24 }} />
		</View>
	);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCF9',
    padding: 24,
  },
  formBox: {
    // Optional: add shadow or border if you want a card look
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
  label: {
    fontSize: 15,
    color: '#222',
    marginBottom: 6,
    marginTop: 8,
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
  forgot: {
    color: '#7CB798',
    textAlign: 'center',
    marginVertical: 8,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  roleBtn: {
    flex: 1,
    backgroundColor: '#E7F3EC',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: '#38E472',
  },
  roleBtnText: {
    color: '#7CB798',
    fontWeight: 'bold',
    fontSize: 16,
  },
  roleBtnTextActive: {
    color: '#222',
  },
  loginBtn: {
    backgroundColor: '#38E472',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  loginBtnText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 18,
  },
  signupText: {
    textAlign: 'center',
    color: '#7CB798',
    marginBottom: 0,
    fontSize: 14,
  },
  signupLink: {
    color: '#38E472',
    fontWeight: 'bold',
  },
});

export default Login;
