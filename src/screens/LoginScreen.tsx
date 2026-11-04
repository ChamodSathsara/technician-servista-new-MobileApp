import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../auth/AuthContext';
import {colors, spacing} from '../theme';

export function LoginScreen() {
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = !!email.trim() && !!password && !busy;
  const submit = async () => {
    if (!canSubmit) return;
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Login failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={s.hero}>
            <View style={s.glowLarge} />
            <View style={s.glowSmall} />
            <View style={s.brandRow}>
              <View style={s.logo}><Text style={s.logoText}>SV</Text></View>
              <View>
                <Text style={s.brand}>SERVVISTA</Text>
                <Text style={s.company}>GESTETNER OF CEYLON PLC</Text>
              </View>
            </View>
            <View style={s.heroCopy}>
              <View style={s.badge}><Text style={s.badgeText}>TECHNICIAN PORTAL</Text></View>
              <Text style={s.heroTitle}>Your field work,{`\n`}all in one place.</Text>
              <Text style={s.heroSubtitle}>Access jobs, customer details and service updates wherever the day takes you.</Text>
            </View>
          </View>

          <View style={s.formCard}>
            <Text style={s.welcome}>Welcome back</Text>
            <Text style={s.instructions}>Sign in with your technician account to continue.</Text>

            <View style={s.form}>
              <View style={s.fieldGroup}>
                <Text style={s.label}>EMAIL ADDRESS</Text>
                <View style={s.inputShell}>
                  <View style={s.inputIcon}><Text style={s.inputIconText}>@</Text></View>
                  <TextInput
                    accessibilityLabel="Email address"
                    value={email}
                    onChangeText={value => {setEmail(value); if (error) setError('');}}
                    placeholder="name@company.com"
                    placeholderTextColor="#94A09E"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    returnKeyType="next"
                    style={s.input}
                  />
                </View>
              </View>

              <View style={s.fieldGroup}>
                <Text style={s.label}>PASSWORD</Text>
                <View style={s.inputShell}>
                  <View style={s.inputIcon}><Text style={s.lockIcon}>*</Text></View>
                  <TextInput
                    accessibilityLabel="Password"
                    value={password}
                    onChangeText={value => {setPassword(value); if (error) setError('');}}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A09E"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="current-password"
                    returnKeyType="done"
                    onSubmitEditing={submit}
                    style={s.input}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    onPress={() => setShowPassword(value => !value)}
                    hitSlop={8}
                    style={s.showButton}>
                    <Text style={s.showText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                  </Pressable>
                </View>
              </View>

              {!!error && (
                <View style={s.errorBox}>
                  <View style={s.errorMark}><Text style={s.errorMarkText}>!</Text></View>
                  <Text style={s.error}>{error}</Text>
                </View>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{disabled: !canSubmit, busy}}
                disabled={!canSubmit}
                onPress={submit}
                style={({pressed}) => [s.signIn, !canSubmit && s.signInDisabled, pressed && canSubmit && s.signInPressed]}>
                {busy ? <ActivityIndicator color="#fff" /> : <><Text style={s.signInText}>Sign in securely</Text><Text style={s.arrow}>→</Text></>}
              </Pressable>
            </View>

            <View style={s.secureNote}>
              <View style={s.secureDot} />
              <Text style={s.secureText}>Secure access for authorized technicians only</Text>
            </View>
          </View>

          <Text style={s.footer}>ServVista Technician  •  Version 2.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.primaryDark},
  flex: {flex: 1},
  page: {flexGrow: 1, backgroundColor: '#F1F5F4'},
  hero: {minHeight: 325, backgroundColor: colors.primaryDark, paddingHorizontal: spacing.lg, paddingTop: 22, paddingBottom: 62, overflow: 'hidden'},
  glowLarge: {position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(30,139,125,.23)', right: -85, top: -75},
  glowSmall: {position: 'absolute', width: 125, height: 125, borderRadius: 63, backgroundColor: 'rgba(245,165,36,.13)', left: -48, bottom: -28},
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  logo: {width: 48, height: 48, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'},
  logoText: {fontSize: 17, fontWeight: '900', color: colors.primary, letterSpacing: -1},
  brand: {fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 2},
  company: {fontSize: 8, fontWeight: '800', color: '#9DCBC5', letterSpacing: 1.15, marginTop: 3},
  heroCopy: {marginTop: 38},
  badge: {alignSelf: 'flex-start', borderRadius: 20, backgroundColor: 'rgba(255,255,255,.1)', paddingHorizontal: 11, paddingVertical: 6},
  badgeText: {fontSize: 9, fontWeight: '900', color: '#9ED9D1', letterSpacing: 1.4},
  heroTitle: {fontSize: 34, lineHeight: 40, fontWeight: '900', color: '#fff', letterSpacing: -1, marginTop: 15},
  heroSubtitle: {fontSize: 14, lineHeight: 21, color: '#B8D3D0', marginTop: 10, maxWidth: 330},
  formCard: {marginHorizontal: spacing.md, marginTop: -38, backgroundColor: '#fff', borderRadius: 26, padding: 22, borderWidth: 1, borderColor: '#E3EBE9', shadowColor: '#062E29', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.12, shadowRadius: 20, elevation: 8},
  welcome: {fontSize: 25, fontWeight: '900', color: colors.text, letterSpacing: -0.4},
  instructions: {fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: 5},
  form: {gap: 17, marginTop: 23},
  fieldGroup: {gap: 7},
  label: {fontSize: 9, fontWeight: '900', color: '#64716F', letterSpacing: 1.3},
  inputShell: {height: 56, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#DCE6E3', borderRadius: 15, backgroundColor: '#F9FBFA', paddingHorizontal: 10},
  inputIcon: {width: 34, height: 34, borderRadius: 11, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center'},
  inputIconText: {fontSize: 16, fontWeight: '900', color: colors.primary},
  lockIcon: {fontSize: 20, fontWeight: '900', color: colors.primary, marginTop: 7},
  input: {flex: 1, height: '100%', paddingHorizontal: 11, fontSize: 15, color: colors.text},
  showButton: {paddingHorizontal: 6, paddingVertical: 10},
  showText: {fontSize: 9, fontWeight: '900', color: colors.primary, letterSpacing: 0.8},
  errorBox: {flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 13, backgroundColor: '#FCEDEC', padding: 11},
  errorMark: {width: 22, height: 22, borderRadius: 11, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center'},
  errorMarkText: {fontSize: 13, fontWeight: '900', color: '#fff'},
  error: {flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600', color: colors.danger},
  signIn: {height: 56, borderRadius: 16, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, shadowColor: colors.primary, shadowOffset: {width: 0, height: 7}, shadowOpacity: 0.22, shadowRadius: 10, elevation: 5},
  signInDisabled: {backgroundColor: '#9DB9B5', shadowOpacity: 0, elevation: 0},
  signInPressed: {opacity: 0.86, transform: [{scale: 0.99}]},
  signInText: {fontSize: 16, fontWeight: '800', color: '#fff'},
  arrow: {position: 'absolute', right: 19, fontSize: 23, color: '#fff'},
  secureNote: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 20},
  secureDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success},
  secureText: {fontSize: 10, fontWeight: '600', color: '#7C8987'},
  footer: {fontSize: 10, fontWeight: '700', color: '#8A9795', textAlign: 'center', letterSpacing: 0.4, marginVertical: 22},
});
