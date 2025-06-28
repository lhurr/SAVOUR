import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Pressable, ScrollView, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/ui/Typography';
import { colors, borderRadius, spacing, typography, shadows } from '../constants/theme';
import { useRouter } from 'expo-router';
import { IconSymbol, IconSymbolName } from '../components/ui/IconSymbol';

const SAVOUR_GREEN = colors.primary;
const SAVOUR_DARK = colors.primaryDark;
const DARK_BG = colors.background.dark;
const CARD_BG = colors.surface.dark;

const interactiveFeatures = [
  { icon: 'sparkles', text: 'Agentic Assistant', delay: 0 },
  { icon: 'map.fill', text: 'Smart Discovery', delay: 200 },
  { icon: 'message.fill', text: 'Informative', delay: 400 },
  { icon: 'person.crop.circle.fill', text: 'Personalized', delay: 600 },
];

const features: { icon: IconSymbolName; title: string; highlight?: string }[] = [
  { 
    icon: 'map.fill', 
    title: 'Smart Discovery', 
    highlight: 'Hyperlocal'
  },
  { 
    icon: 'message.fill', 
    title: 'Deep Research', 
    highlight: 'Multi-Agent System'
  },
  { 
    icon: 'person.crop.circle.fill', 
    title: 'Personalized Experience', 
    highlight: 'Personalized'
  },
];



const socialProof = [
  // { metric: '10K+', label: 'Active Users' },
  { metric: 'To-date', label: 'Restaurants/Cafes/Bars' },
  { metric: '95%', label: 'Satisfaction Rate' },
  { metric: '24/7', label: 'Availability' },
];

export default function LandingPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  // Interactive elements animations
  const featureAnimations = React.useRef(
    interactiveFeatures.map(() => new Animated.Value(0))
  ).current;
  const buttonScaleAnim = React.useRef(new Animated.Value(1)).current;
  const badgeScaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Rotate animation
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();

    // Staggered feature animations
    featureAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: interactiveFeatures[index].delay,
        useNativeDriver: true,
      }).start();
    });


    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % interactiveFeatures.length);
    }, 3000);

    return () => clearInterval(featureInterval);
  }, []);

  const handleButtonPress = (type: 'primary' | 'secondary') => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (type === 'primary') {
      router.push('/(auth)/signup');
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleBadgePress = () => {
    // Badge press animation
    Animated.sequence([
      Animated.timing(badgeScaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(badgeScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: DARK_BG }}>
      <ScrollView style={{ flex: 1, backgroundColor: DARK_BG }} contentContainerStyle={styles.scrollContent}>
        {/* Interactive Hero Section */}
        <View style={styles.heroSection}>
          {/* Remove floating elements on mobile to prevent overlap */}
          {Platform.OS === 'web' && (
            <>
              <Animated.View 
                style={[
                  styles.floatingElement,
                  styles.floatingElement1,
                  {
                    transform: [
                      { rotate: rotateInterpolation },
                      { scale: pulseAnim },
                    ],
                    opacity: 0.05,
                  }
                ]}
              />
              <Animated.View 
                style={[
                  styles.floatingElement,
                  styles.floatingElement2,
                  {
                    transform: [
                      { rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '-360deg'],
                      }) },
                      { scale: pulseAnim },
                    ],
                    opacity: 0.03,
                  }
                ]}
              />
            </>
          )}

          <View style={styles.heroContainer}>
            <Animated.View 
              style={[
                styles.heroContent,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim },
                  ],
                }
              ]}
            >
              

              {/* Main Title */}
              <Animated.View style={styles.titleContainer}>
                <Text variant="h1" style={styles.heroTitleGreen}>
                SAVOUR
                </Text>
                <Text variant="body" style={styles.heroSubtitle}>
                  Discover Where Taste Meets Technology
                </Text>
              </Animated.View>

              {/* Interactive Feature Showcase */}
              <Animated.View style={styles.featureShowcase}>
                {interactiveFeatures.map((feature, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.featureItem,
                      {
                        opacity: featureAnimations[index],
                        transform: [
                          {
                            translateY: featureAnimations[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0],
                            }),
                          },
                          {
                            scale: activeFeature === index ? 1.05 : 1,
                          },
                        ],
                      },
                    ]}
                  >
                    <View style={[
                      styles.featureIconContainer,
                      activeFeature === index && styles.activeFeatureIcon
                    ]}>
                      <IconSymbol 
                        name={feature.icon as IconSymbolName} 
                        color={activeFeature === index ? SAVOUR_GREEN : 'rgba(255, 255, 255, 0.6)'} 
                        size={18} 
                      />
                    </View>
                    <Text style={{
                      ...styles.featureText,
                      ...(activeFeature === index ? styles.activeFeatureText : {})
                    }}>
                      {feature.text}
                    </Text>
                  </Animated.View>
                ))}
              </Animated.View>

              {/* Interactive CTA Buttons */}
              <Animated.View 
                style={[
                  styles.ctaGroup,
                  {
                    transform: [{ scale: buttonScaleAnim }],
                  }
                ]}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                    isHovered && styles.buttonHovered,
                  ]}
                  onPress={() => handleButtonPress('primary')}
                  onPressIn={() => setIsHovered(true)}
                  onPressOut={() => setIsHovered(false)}
                >
                  <Text style={styles.primaryButtonText}>Start Savouring Now</Text>
                </Pressable>
              </Animated.View>

            </Animated.View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text variant="h2" style={styles.sectionTitle}>Why Choose </Text>
                <Text variant="h2" style={styles.savourGreenTitle}>SAVOUR</Text>
                <Text variant="h2" style={styles.sectionTitle}>?</Text>
              </View>
              <Text variant="body" style={styles.sectionSubtitle}>
                Built for food lovers who want more than just another restaurant app
              </Text>
            </View>
            
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <IconSymbol name={feature.icon} color={SAVOUR_GREEN} size={24} />
                  </View>
                  <View style={styles.featureContent}>
                    <View style={styles.featureHeader}>
                      <Text variant="h3" style={styles.featureTitle}>{feature.title}</Text>
                      {feature.highlight && (
                        <View style={styles.highlightBadge}>
                          <Text style={styles.highlightText}>{feature.highlight}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>



        {/* CTA Section */}
        <View style={styles.section}>
          <View style={styles.sectionContainer}>
            <View style={styles.ctaCard}>
              <Text variant="h2" style={styles.ctaCardTitle}>Ready to Discover Your Next Favorite Restaurant?</Text>
              <Text variant="body" style={styles.ctaCardSubtitle}>
              Crave It. Find It. Love It.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.ctaCardButton, pressed && styles.buttonPressed]}
                onPress={() => router.push('/(auth)/signup')}
              >
                <Text style={styles.ctaCardButtonText}>Get Started Now</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContainer}>
            <View style={styles.footerContent}>
              <Text variant="h2" style={styles.footerBrand}>SAVOUR</Text>
              <Text variant="body" style={styles.footerTagline}>
                Where Taste Meets Technology
              </Text>
            </View>
            <View style={styles.footerLinks}>
              <Text variant="body" style={styles.footerLink}>Privacy Policy</Text>
              <Text variant="body" style={styles.footerLink}>Terms of Service</Text>
              <Text variant="body" style={styles.footerLink}>Support</Text>
              <Text variant="body" style={styles.footerLink}>Contact</Text>
            </View>
            <Text variant="caption" style={styles.footerCopyright}>
              © 2025 SAVOUR. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: DARK_BG,
    paddingBottom: Platform.OS === 'web' ? 0 : spacing.xl,
  },
  heroSection: {
    backgroundColor: DARK_BG,
    paddingTop: Platform.OS === 'web' ? spacing.xxl * 2 : spacing.xl,
    paddingBottom: spacing.xxl,
    ...Platform.select({
      web: {
        minHeight: 200,
        backgroundImage: 'linear-gradient(135deg, #19C37D 0%, #0F7A4D 50%, #343541 100%)',
      },
    }),
  },
  heroContainer: {
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'web' ? 0 : spacing.sm,
  },
  heroContent: {
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: Platform.OS === 'web' ? 0 : spacing.md,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
  },
  heroTitle: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? typography.sizes.xxxl * 1.2 : typography.sizes.xl * 1.1,
    fontWeight: typography.weights.bold as any,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 1.1,
    maxWidth: Platform.OS === 'web' ? 800 : '100%',
    paddingHorizontal: spacing.sm,
    flexWrap: 'wrap',
    letterSpacing: Platform.OS === 'web' ? -1 : 0,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: Platform.OS === 'web' ? typography.sizes.md : typography.sizes.sm,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.xxl,
    lineHeight: 1.4,
    maxWidth: 400,
    alignSelf: 'center',
    fontWeight: typography.weights.bold as any,
    paddingHorizontal: spacing.sm,
  },
  ctaGroup: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing.md,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: SAVOUR_GREEN,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Platform.OS === 'web' ? 'auto' : 200,
    maxWidth: Platform.OS === 'web' ? 'auto' : '100%',
    ...shadows.md,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: Platform.OS === 'web' ? 'auto' : 200,
    maxWidth: Platform.OS === 'web' ? 'auto' : '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? typography.sizes.lg : typography.sizes.md,
    fontWeight: typography.weights.bold as any,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? typography.sizes.lg : typography.sizes.md,
    fontWeight: typography.weights.medium as any,
  },
  ctaNote: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  socialProofSection: {
    backgroundColor: CARD_BG,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderColor: colors.border.dark,
  },
  socialProofContainer: {
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: spacing.lg,
    alignItems: 'center',
  },
  metricCard: {
    alignItems: 'center',
    minWidth: Platform.OS === 'web' ? 120 : 80,
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 'auto' : '45%',
  },
  metricValue: {
    color: SAVOUR_GREEN,
    fontSize: Platform.OS === 'web' ? typography.sizes.xxl : typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  metricLabel: {
    color: colors.text.secondary.dark,
    fontSize: Platform.OS === 'web' ? typography.sizes.sm : typography.sizes.xs,
    fontWeight: typography.weights.medium as any,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  section: {
    paddingVertical: Platform.OS === 'web' ? spacing.xxl : spacing.lg,
  },
  sectionContainer: {
    maxWidth: Platform.OS === 'web' ? 1400 : '100%',
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: Platform.OS === 'web' ? spacing.xxl : spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? typography.sizes.xxl : typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.md,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  sectionSubtitle: {
    color: colors.text.secondary.dark,
    fontSize: Platform.OS === 'web' ? typography.sizes.lg : typography.sizes.md,
    textAlign: 'center',
    maxWidth: Platform.OS === 'web' ? 600 : '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: spacing.sm,
    flexWrap: 'wrap',
  },
  featuresGrid: {
    gap: spacing.lg,
  },
  featureCard: {
    backgroundColor: CARD_BG,
    borderRadius: borderRadius.lg,
    padding: Platform.OS === 'web' ? spacing.xl : spacing.lg,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  featureIconContainer: {
    backgroundColor: 'rgba(25, 195, 125, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureTitle: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? typography.sizes.lg : typography.sizes.md,
    fontWeight: typography.weights.bold as any,
    textAlign: 'center',
  },
  highlightBadge: {
    backgroundColor: 'rgba(25, 195, 125, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(25, 195, 125, 0.3)',
  },
  highlightText: {
    color: SAVOUR_GREEN,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold as any,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featureDesc: {
    color: colors.text.secondary.dark,
    fontSize: Platform.OS === 'web' ? typography.sizes.md : typography.sizes.sm,
    lineHeight: 1.6,
    // flexWrap: 'wrap',
    textAlign: Platform.OS === 'web' ? 'center' : 'center',
  },
  benefitsCard: {
    backgroundColor: CARD_BG,
    borderRadius: borderRadius.xl,
    padding: Platform.OS === 'web' ? spacing.xxl : spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  benefitsTitle: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? typography.sizes.xl : typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  benefitsList: {
    gap: spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitIcon: {
    minWidth: 24,
  },
  benefitText: {
    color: colors.text.secondary.dark,
    fontSize: Platform.OS === 'web' ? typography.sizes.md : typography.sizes.sm,
    flex: 1,
    lineHeight: 1.6,
  },
  ctaCard: {
    backgroundColor: CARD_BG,
    borderRadius: borderRadius.xl,
    padding: Platform.OS === 'web' ? spacing.xxl : spacing.lg,
    alignItems: 'center',
    textAlign: 'center',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  ctaCardTitle: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? typography.sizes.xl : typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  ctaCardSubtitle: {
    color: colors.text.secondary.dark,
    fontSize: Platform.OS === 'web' ? typography.sizes.md : typography.sizes.sm,
    marginBottom: spacing.xl,
    textAlign: 'center',
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
    lineHeight: 1.6,
  },
  ctaCardButton: {
    backgroundColor: SAVOUR_GREEN,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    minWidth: Platform.OS === 'web' ? 'auto' : 200,
  },
  ctaCardButtonText: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? typography.sizes.lg : typography.sizes.md,
    fontWeight: typography.weights.bold as any,
  },
  footer: {
    backgroundColor: CARD_BG,
    borderTopWidth: 1,
    borderColor: colors.border.dark,
    paddingVertical: spacing.xl,
  },
  footerContainer: {
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  footerContent: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  footerBrand: {
    color: SAVOUR_GREEN,
    fontSize: Platform.OS === 'web' ? typography.sizes.xl : typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.xs,
  },
  footerTagline: {
    color: colors.text.secondary.dark,
    fontSize: typography.sizes.sm,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footerLink: {
    color: colors.text.secondary.dark,
    fontSize: typography.sizes.sm,
    textDecorationLine: 'underline',
  },
  footerCopyright: {
    color: colors.text.secondary.dark,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
  },
  floatingElement: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  floatingElement1: {
    transform: [{ rotate: '0deg' }],
  },
  floatingElement2: {
    transform: [{ rotate: '0deg' }],
  },
  titleContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    flexDirection: 'column',
  },
  titleUnderline: {
    height: 2,
    backgroundColor: SAVOUR_GREEN,
    width: '100%',
  },
  subtitleContainer: {
    marginBottom: spacing.xl,
  },
  featureShowcase: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing.xl,
    marginBottom: spacing.xxl,
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    maxWidth: Platform.OS === 'web' ? 'auto' : '100%',
    paddingHorizontal: spacing.sm,
  },
  activeFeatureIcon: {
    backgroundColor: 'rgba(25, 195, 125, 0.2)',
    borderWidth: 1,
    borderColor: SAVOUR_GREEN,
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    flexWrap: 'wrap',
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
  },
  activeFeatureText: {
    color: SAVOUR_GREEN,
    fontWeight: typography.weights.bold as any,
    flexWrap: 'wrap',
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
  },
  badgePressable: {
    padding: spacing.sm,
  },
  buttonHovered: {
    backgroundColor: SAVOUR_DARK,
    transform: [{ scale: 1.02 }],
  },
  buttonIcon: {
    marginLeft: spacing.sm,
  },
  trustIndicators: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  trustIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  trustText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: typography.sizes.xs,
    marginRight: spacing.md,
  },
  savourGreenText: {
    color: SAVOUR_GREEN,
  },
  savourGreenTitle: {
    color: SAVOUR_GREEN,
    fontSize: Platform.OS === 'web' ? typography.sizes.xxl : typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.md,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  heroTitleGreen: {
    color: SAVOUR_GREEN,
    fontSize: Platform.OS === 'web' ? typography.sizes.xxxl * 1.2 : typography.sizes.xl * 1.1,
    fontWeight: typography.weights.bold as any,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 1.1,
    maxWidth: Platform.OS === 'web' ? 800 : '100%',
    paddingHorizontal: spacing.sm,
    flexWrap: 'wrap',
    letterSpacing: Platform.OS === 'web' ? -1 : 0,
    ...shadows.md,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
}); 