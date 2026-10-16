import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface AuthScreenProps {
  onSuccess: () => void;
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onClose }) => {
  const { login, register, requestOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'OTP'>('LOGIN');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handlePasswordLogin = async () => {
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setError('Please fill in all registration fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await requestOtp(phone.trim());
      setOtpSent(true);
      setInfo(data?.message || 'OTP sent successfully! (Dev test OTP: 123456)');
      if (data?.otp) {
        setOtp(data.otp);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(phone.trim(), otp.trim());
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const fillCustomerDemo = () => {
    setEmail('rahul.sharma@example.com');
    setPassword('Password123!');
    setMode('LOGIN');
    setError(null);
  };

  const fillOtpDemo = () => {
    setPhone('9876543210');
    setOtp('123456');
    setOtpSent(true);
    setMode('OTP');
    setInfo('Dev OTP auto-filled: 123456');
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Banner */}
        <View style={styles.header}>
          {onClose && (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={styles.brandRow}>
            <Ionicons name="diamond" size={18} color="#D4AF37" style={{ marginRight: 4 }} />
            <Text style={styles.brandTitle}>A U R E L I A</Text>
            <View style={styles.plusBadge}>
              <Text style={styles.plusText}>PRIVÉ</Text>
              <Ionicons name="sparkles" size={10} color="#D4AF37" />
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Maison de Haute Couture & Curated Living
          </Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, mode === 'LOGIN' && styles.activeTabBtn]}
            onPress={() => {
              setMode('LOGIN');
              setError(null);
            }}
          >
            <Text style={[styles.tabBtnText, mode === 'LOGIN' && styles.activeTabBtnText]}>
              Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, mode === 'OTP' && styles.activeTabBtn]}
            onPress={() => {
              setMode('OTP');
              setError(null);
            }}
          >
            <Text style={[styles.tabBtnText, mode === 'OTP' && styles.activeTabBtnText]}>
              Mobile OTP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, mode === 'REGISTER' && styles.activeTabBtn]}
            onPress={() => {
              setMode('REGISTER');
              setError(null);
            }}
          >
            <Text style={[styles.tabBtnText, mode === 'REGISTER' && styles.activeTabBtnText]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Demo Credentials */}
        <View style={styles.demoCard}>
          <Text style={styles.demoCardTitle}>Demo Quick-Login Buttons:</Text>
          <View style={styles.demoBtnRow}>
            <TouchableOpacity style={styles.demoPill} onPress={fillCustomerDemo}>
              <Ionicons name="person-circle-outline" size={16} color="#2874F0" />
              <Text style={styles.demoPillText}>Fill Test Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.demoPill} onPress={fillOtpDemo}>
              <Ionicons name="phone-portrait-outline" size={16} color="#2874F0" />
              <Text style={styles.demoPillText}>Fill Test OTP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Body */}
        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#D32F2F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {info && (
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={18} color="#0288D1" />
              <Text style={styles.infoText}>{info}</Text>
            </View>
          )}

          {mode === 'LOGIN' && (
            <View>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. rahul.sharma@example.com"
                placeholderTextColor="#9E9E9E"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#9E9E9E"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handlePasswordLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>CONTINUE</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {mode === 'OTP' && (
            <View>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {!otpSent ? (
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>REQUEST OTP</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View>
                  <Text style={styles.inputLabel}>Enter 6-Digit OTP</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    placeholderTextColor="#9E9E9E"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />

                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleVerifyOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitBtnText}>VERIFY & LOGIN</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={handleSendOtp}
                    disabled={loading}
                  >
                    <Text style={styles.resendBtnText}>Resend OTP</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {mode === 'REGISTER' && (
            <View>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor="#9E9E9E"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. rahul.sharma@example.com"
                placeholderTextColor="#9E9E9E"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 9876543210"
                placeholderTextColor="#9E9E9E"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create password (min 6 characters)"
                placeholderTextColor="#9E9E9E"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>CREATE ACCOUNT</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.termsText}>
            By continuing, you agree to Aurelia Luxe's{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Confidentiality Charter</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6'
  },
  scrollContent: {
    paddingBottom: 40
  },
  header: {
    backgroundColor: '#0A0A0E',
    paddingTop: Platform.OS === 'ios' ? 52 : 44,
    paddingBottom: 28,
    paddingHorizontal: 20,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)'
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 44,
    right: 20,
    zIndex: 10
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  brandTitle: {
    color: '#FAF9F6',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
  },
  plusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3
  },
  plusText: {
    color: '#D4AF37',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1
  },
  headerSubtitle: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 6,
    letterSpacing: 0.5
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE7DF'
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTabBtn: {
    borderBottomColor: '#D4AF37'
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8A93'
  },
  activeTabBtnText: {
    color: '#111115',
    fontWeight: '700'
  },
  demoCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#0A0A0E',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 10,
    padding: 12
  },
  demoCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 8,
    letterSpacing: 0.8
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: 10
  },
  demoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16161D',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 5
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FAF9F6'
  },
  formContainer: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EAE7DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
    gap: 8
  },
  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '500'
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
    gap: 8
  },
  infoText: {
    flex: 1,
    color: '#8C7335',
    fontSize: 12,
    fontWeight: '500'
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#27272A',
    marginBottom: 6,
    marginTop: 10,
    letterSpacing: 0.3
  },
  input: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#EAE7DF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111115'
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8
  },
  countryCode: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#EAE7DF',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111115'
  },
  phoneInput: {
    flex: 1
  },
  submitBtn: {
    backgroundColor: '#0A0A0E',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
  },
  submitBtnText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5
  },
  resendBtn: {
    marginTop: 14,
    alignItems: 'center'
  },
  resendBtnText: {
    color: '#8C7335',
    fontSize: 13,
    fontWeight: '600'
  },
  termsText: {
    fontSize: 11,
    color: '#8A8A93',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 20
  },
  termsLink: {
    color: '#8C7335',
    fontWeight: '600'
  }
});
