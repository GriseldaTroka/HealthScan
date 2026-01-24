// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (email && password) {
      login({ name: email.split('@')[0], email });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header with pattern background */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.brandName}>SEEN2SERVE </Text>
          <TouchableOpacity>
            <Ionicons name="person-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Food Bowl Image */}
      <View style={styles.imageContainer}>
        <View style={styles.foodBowlCircle}>
          <Image
            source={{ uri: 'https://i.pinimg.com/736x/cb/f8/88/cbf88853fd26e7b894925583a70034ed.jpg' }}
            style={styles.foodImage}
          />
        </View>
      </View>

      {/* Login Form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formSection}
      >
        <Text style={styles.welcomeText}>Miresevini! </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={COLORS.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Ionicons name="person-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIcon}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Icon row */}
        <View style={styles.iconRow}>
          <View style={styles.decorIcon}>
            <Ionicons name="leaf-outline" size={20} color={COLORS.white} />
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Ionicons name="leaf-outline" size={18} color={COLORS.primary} />
          <Text style={styles.loginButtonText}>LOG IN</Text>
          <Ionicons name="restaurant-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Harrove fjalekalimin?</Text>
        </TouchableOpacity>

        {/* Social Login */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  headerSection: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: SPACING.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  brandName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 2,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  foodBowlCircle: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.275,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  formSection: {
    flex: 1,
    paddingHorizontal: SPACING.xxxl,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: FONTS.sizes.title,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xxl,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.lg,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
  },
  inputIcon: {
    padding: SPACING.sm,
  },
  iconRow: {
    marginVertical: SPACING.md,
  },
  decorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxxl,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  loginButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  forgotPassword: {
    marginTop: SPACING.lg,
  },
  forgotPasswordText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    textDecorationLine: 'underline',
  },
  socialContainer: {
    flexDirection: 'row',
    marginTop: SPACING.xxl,
    gap: SPACING.lg,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default LoginScreen;