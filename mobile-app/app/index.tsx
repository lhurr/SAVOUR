import React from 'react';
import { View, StyleSheet, Platform, Pressable, ScrollView } from 'react-native';
import { Text } from '../components/ui/Typography';
import { colors, borderRadius } from '../constants/theme';
import { useRouter } from 'expo-router';
import { IconSymbol, IconSymbolName } from '../components/ui/IconSymbol';

const SAVOUR_GREEN = colors.primary;
const SAVOUR_DARK = colors.primaryDark;
const DARK_BG = colors.background.dark;
const CARD_BG = colors.surface.dark;

const features: { icon: IconSymbolName; title: string; desc: string }[] = [
  { icon: 'paperplane.fill', title: 'Map Discovery', desc: 'Explore restaurants on an interactive map, filter by distance, cuisine, and more.' },
  { icon: 'magnifyingglass', title: 'AI Deep Research', desc: 'Get smart, up-to-date info and recommendations powered by LLMs.' },
  { icon: 'message.fill', title: 'Conversational Search', desc: 'Find places with natural language—just ask and get personalized results.' },
  { icon: 'person.crop.circle.fill', title: 'Secure Access', desc: 'Easy sign up, login, and privacy-first user management.' },
  { icon: 'house.fill', title: 'Personalized Home', desc: 'See tailored suggestions based on your tastes and history.' },
  { icon: 'person.crop.circle.fill', title: 'Profile Control', desc: 'Set dietary needs, cuisine preferences, and more.' },
];

const steps: { icon: IconSymbolName; title: string; desc: string }[] = [
  { icon: 'person.crop.circle.fill', title: 'Personalize', desc: 'Set your tastes and dietary needs.' },
  { icon: 'paperplane.fill', title: 'Explore', desc: 'Browse and filter restaurants on the map.' },
  { icon: 'message.fill', title: 'Chat', desc: 'Ask for recommendations and get instant answers.' },
];

const testimonials = [
  { name: 'Sarah Chen', quote: 'SAVOUR helped me find new favorites I never would have tried!', role: 'Food Blogger', initial: 'S' },
  { name: 'Mike Rodriguez', quote: 'Conversational search is a game changer. Love it!', role: 'Tech Professional', initial: 'M' },
  { name: 'Alex Thompson', quote: 'Personalized picks are always spot on.', role: 'Local Explorer', initial: 'A' },
];

export default function LandingPage() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: DARK_BG }} contentContainerStyle={styles.scrollContent}>
      {/* Hero with gradient background */}
      <View style={[styles.heroGradient, Platform.OS === 'web' ? { minHeight: '60vh' } as any : null]}>
        <View style={styles.heroContent}>
          <Text variant="h1" style={styles.savourBrand} center>SAVOUR</Text>
          <Text variant="h2" style={styles.heroHeadline} center>Discover Where Taste Meets Technology</Text>
          <Text variant="body" style={styles.heroSubheadline} center>
            AI-powered, personalized restaurant discovery. Map, chat, and explore new tastes—tailored just for you.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.ctaButton, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text variant="h2" style={styles.ctaText} center>Sign Up Now!</Text>
          </Pressable>
        </View>
      </View>
      {/* Why SAVOUR */}
      <View style={styles.section}>
        <View style={styles.cardWide}>
          <Text variant="h1" style={styles.sectionTitle} center>Why SAVOUR?</Text>
          <Text variant="body" style={styles.sectionText} center>
            Tired of endless scrolling and decision fatigue? SAVOUR cuts through the noise with smart, personalized recommendations—so you can discover new favorites, not just the same old spots. Let AI do the searching, you do the tasting.
          </Text>
        </View>
      </View>
      {/* Features */}
      <View style={styles.section}>
        <Text variant="h1" style={styles.sectionTitle} center>Features</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuresScroll}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <IconSymbol name={f.icon} color={SAVOUR_GREEN} size={32} style={styles.featureIcon} />
              <Text variant="h2" style={styles.featureTitle} center>{f.title}</Text>
              <Text variant="body" style={styles.featureDesc} center>{f.desc}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* How It Works */}
      <View style={styles.section}>
        <Text variant="h1" style={styles.sectionTitle} center>How It Works</Text>
        <View style={styles.stepsRow}>
          {steps.map((s, i) => (
            <View key={i} style={styles.stepCard}>
              <IconSymbol name={s.icon} color={SAVOUR_GREEN} size={28} style={styles.stepIcon} />
              <Text variant="h2" style={styles.stepTitle} center>{s.title}</Text>
              <Text variant="body" style={styles.stepDesc} center>{s.desc}</Text>
            </View>
          ))}
        </View>
      </View>
      {/* Testimonials */}
      <View style={styles.section}>
        <Text variant="h1" style={styles.sectionTitle} center>What Our Users Say</Text>
        <View style={styles.testimonialsRow}>
          {testimonials.map((t, i) => (
            <View key={i} style={styles.testimonialCard}>
              <View style={styles.avatar}><Text variant="h2" style={{ color: '#fff' }}>{t.initial}</Text></View>
              <Text variant="h2" style={styles.testimonialName} center>{t.name}</Text>
              <Text variant="body" style={styles.testimonialRole} center>{t.role}</Text>
              <Text variant="body" style={styles.testimonialQuote} center>“{t.quote}”</Text>
            </View>
          ))}
        </View>
      </View>
      {/* Footer */}
      <View style={styles.footer}>
        <Text variant="h2" style={styles.footerBrand} center>SAVOUR</Text>
        <View style={styles.footerLinks}>
          <Text variant="body" style={styles.footerLink}>Why SAVOUR?</Text>
          <Text variant="body" style={styles.footerLink}>Features</Text>
          <Text variant="body" style={styles.footerLink}>How It Works</Text>
          <Text variant="body" style={styles.footerLink}>Testimonials</Text>
          <Text variant="body" style={styles.footerLink}>Sign Up</Text>
        </View>
        <Text variant="caption" style={styles.footerCopyright} center>
          © 2024 <Text style={{ color: SAVOUR_GREEN }}>SAVOUR</Text> by BiteDunce. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
    backgroundColor: DARK_BG,
  },
  heroGradient: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg, #19C37D 0%, #181A20 100%)',
      },
      default: {
        backgroundColor: DARK_BG,
      },
    }),
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 0,
    marginBottom: 0,
  },
  savourBrand: {
    color: SAVOUR_GREEN,
    fontWeight: 'bold',
    fontSize: 72,
    letterSpacing: 2,
    textShadowColor: SAVOUR_DARK,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 8,
  },
  heroHeadline: {
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '700',
    color: '#fff',
    fontSize: 36,
  },
  heroSubheadline: {
    color: colors.text.secondary.dark,
    marginBottom: 16,
    fontSize: 18,
    maxWidth: 480,
  },
  ctaButton: {
    backgroundColor: SAVOUR_GREEN,
    borderRadius: borderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginTop: 8,
    shadowColor: SAVOUR_GREEN,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: 1,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 56,
  },
  cardWide: {
    backgroundColor: CARD_BG,
    borderRadius: borderRadius.xl,
    padding: 40,
    width: '92%',
    maxWidth: 700,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    color: SAVOUR_GREEN,
    fontWeight: '800',
    marginBottom: 18,
    fontSize: 38,
    letterSpacing: 1,
    textAlign: 'center',
  },
  sectionText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  featuresScroll: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  featureCard: {
    backgroundColor: CARD_BG,
    borderRadius: borderRadius.lg,
    padding: 32,
    marginHorizontal: 12,
    minWidth: 220,
    maxWidth: 260,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  featureIcon: {
    marginBottom: 12,
  },
  featureTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 22,
  },
  featureDesc: {
    color: colors.text.secondary.dark,
    fontSize: 16,
    textAlign: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 24,
    marginTop: 24,
  },
  stepCard: {
    backgroundColor: CARD_BG,
    borderRadius: borderRadius.lg,
    padding: 28,
    marginHorizontal: 12,
    minWidth: 140,
    maxWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  stepIcon: {
    marginBottom: 10,
  },
  stepTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 20,
  },
  stepDesc: {
    color: colors.text.secondary.dark,
    fontSize: 15,
    textAlign: 'center',
  },
  testimonialsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  testimonialCard: {
    backgroundColor: CARD_BG,
    borderRadius: borderRadius.lg,
    padding: 28,
    margin: 12,
    minWidth: 220,
    maxWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SAVOUR_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  testimonialName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 2,
  },
  testimonialRole: {
    color: colors.text.secondary.dark,
    fontSize: 14,
    marginBottom: 8,
  },
  testimonialQuote: {
    color: colors.text.secondary.dark,
    fontStyle: 'italic',
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    marginTop: 0,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderTopWidth: 1,
    borderColor: colors.border.dark,
  },
  footerBrand: {
    color: SAVOUR_GREEN,
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 8,
    textShadowColor: SAVOUR_DARK,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 16,
  },
  footerLink: {
    color: colors.text.secondary.dark,
    marginHorizontal: 8,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  footerCopyright: {
    color: colors.text.secondary.dark,
    marginTop: 8,
  },
}); 