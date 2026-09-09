import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../auth/AuthContext';
import { FormField } from '../components/FormField';
import { createListingRequest, fetchMyListings, uploadListingImage } from '../services/api';
import { CATEGORIES, Listing, MarketMode, listingPriceLabel } from '../types/listing';
import { primaryListingImageUrl } from '../utils/listingImages';
import { DEFAULT_SEATTLE_ZIP, SEATTLE_ZIPS } from '../data/seattleZips';
import { colors, radii, spacing } from '../theme/tokens';
import type { MyListingsScreenProps } from '../navigation/types';

type CreateForm = {
  title: string;
  category: Exclude<Listing['category'], never>;
  mode: MarketMode;
  price: string;
  description: string;
  zipCode: string;
};

const EMPTY_FORM: CreateForm = {
  title: '',
  category: 'camping',
  mode: 'rent',
  price: '',
  description: '',
  zipCode: DEFAULT_SEATTLE_ZIP,
};

export function MyListingsScreen({ navigation }: MyListingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setListings([]);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const result = await fetchMyListings();
      setListings(result.listings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      setLoading(true);
      void load();
    }
  }, [authLoading, load]);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const onCreate = async () => {
    const title = form.title.trim();
    const priceNum = Number(form.price);
    if (!title) {
      setFormError('Enter a title');
      return;
    }
    if (!form.price.trim() || Number.isNaN(priceNum) || priceNum < 0) {
      setFormError(form.mode === 'rent' ? 'Enter a valid daily rate' : 'Enter a valid buy price');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await createListingRequest({
        title,
        category: form.category,
        mode: form.mode,
        description: form.description.trim(),
        zipCode: form.zipCode,
        ...(form.mode === 'rent' ? { pricePerDay: priceNum } : { buyPrice: priceNum }),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      Alert.alert('Listing created', 'Your gear is now available near you.');
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const onAddPhoto = async (listing: Listing) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo library access to upload listing images.');
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsMultipleSelection: false,
      });
      if (picked.canceled || !picked.assets?.[0]?.uri) return;
      const asset = picked.assets[0];
      setUploadingId(listing.id);
      await uploadListingImage(listing.id, asset.uri, {
        mimeType: asset.mimeType || 'image/jpeg',
        fileName: asset.fileName || `listing-${listing.id}.jpg`,
      });
      await load();
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Unable to upload photo');
    } finally {
      setUploadingId(null);
    }
  };

  const categoryChoices = CATEGORIES.filter((c) => c.id !== 'all');

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + spacing.sm }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.topTitle}>My listings</Text>
        <Pressable
          onPress={() => setShowForm((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={showForm ? 'Hide create form' : 'Create listing'}
          hitSlop={12}
          disabled={!isAuthenticated}
        >
          <Ionicons
            name={showForm ? 'close' : 'add'}
            size={24}
            color={isAuthenticated ? colors.forest : colors.muted}
          />
        </Pressable>
      </View>

      {!isAuthenticated && !authLoading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sign in to manage listings</Text>
          <Text style={styles.emptyBody}>List your gear for rent or sale around Seattle.</Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Text style={styles.primaryText}>Sign in</Text>
          </Pressable>
        </View>
      ) : loading || authLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.forest} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {showForm ? (
            <View style={styles.formCard}>
              <Text style={styles.formHeading}>New listing</Text>
              <FormField
                label="Title"
                value={form.title}
                onChangeText={(title) => setForm((f) => ({ ...f, title }))}
                placeholder="4-Person Blackout Tent"
              />

              <Text style={styles.chipLabel}>Mode</Text>
              <View style={styles.chipRow}>
                {(['rent', 'buy'] as MarketMode[]).map((mode) => (
                  <Pressable
                    key={mode}
                    style={[styles.chip, form.mode === mode && styles.chipActive]}
                    onPress={() => setForm((f) => ({ ...f, mode }))}
                    accessibilityRole="button"
                    accessibilityLabel={`Mode ${mode}`}
                  >
                    <Text style={[styles.chipText, form.mode === mode && styles.chipTextActive]}>
                      {mode === 'rent' ? 'Rent' : 'Buy'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.chipLabel}>Category</Text>
              <View style={styles.chipRow}>
                {categoryChoices.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[styles.chip, form.category === cat.id && styles.chipActive]}
                    onPress={() => setForm((f) => ({ ...f, category: cat.id }))}
                    accessibilityRole="button"
                    accessibilityLabel={`Category ${cat.label}`}
                  >
                    <Text
                      style={[styles.chipText, form.category === cat.id && styles.chipTextActive]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <FormField
                label={form.mode === 'rent' ? 'Price per day (USD)' : 'Buy price (USD)'}
                value={form.price}
                onChangeText={(price) => setForm((f) => ({ ...f, price }))}
                keyboardType="decimal-pad"
                placeholder={form.mode === 'rent' ? '28' : '160'}
              />

              <Text style={styles.chipLabel}>ZIP code</Text>
              <View style={styles.chipRow}>
                {SEATTLE_ZIPS.slice(0, 6).map((z) => (
                  <Pressable
                    key={z.zip}
                    style={[styles.chip, form.zipCode === z.zip && styles.chipActive]}
                    onPress={() => setForm((f) => ({ ...f, zipCode: z.zip }))}
                    accessibilityRole="button"
                    accessibilityLabel={`ZIP ${z.zip}`}
                  >
                    <Text style={[styles.chipText, form.zipCode === z.zip && styles.chipTextActive]}>
                      {z.zip}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <FormField
                label="Description"
                value={form.description}
                onChangeText={(description) => setForm((f) => ({ ...f, description }))}
                placeholder="Condition, included accessories, pickup notes…"
                multiline
                style={{ minHeight: 88, textAlignVertical: 'top' }}
              />

              {formError ? <Text style={styles.error}>{formError}</Text> : null}

              <Pressable
                style={[styles.primaryBtn, submitting && { opacity: 0.7 }]}
                onPress={onCreate}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Publish listing"
              >
                {submitting ? (
                  <ActivityIndicator color={colors.cream} />
                ) : (
                  <Text style={styles.primaryText}>Publish listing</Text>
                )}
              </Pressable>
            </View>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {listings.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptyBody}>Tap + to list gear for rent or sale.</Text>
            </View>
          ) : (
            listings.map((listing) => {
              const uri = primaryListingImageUrl(listing);
              return (
                <View key={listing.id} style={styles.card} accessibilityLabel={listing.title}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardThumb}>
                      {uri ? (
                        <Image source={{ uri }} style={styles.cardThumbImg} resizeMode="cover" />
                      ) : (
                        <Ionicons name="cube-outline" size={28} color={colors.cream} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{listing.title}</Text>
                      <Text style={styles.cardMeta}>
                        {listing.mode === 'rent' ? 'For rent' : 'For sale'} ·{' '}
                        {listingPriceLabel(listing)}
                      </Text>
                      <Text style={styles.cardMeta}>
                        {listing.location || listing.zipCode || 'Seattle'} · {listing.category}
                      </Text>
                    </View>
                  </View>
                  {listing.description ? (
                    <Text style={styles.cardDesc} numberOfLines={3}>
                      {listing.description}
                    </Text>
                  ) : null}
                  <Pressable
                    style={styles.photoBtn}
                    onPress={() => onAddPhoto(listing)}
                    disabled={uploadingId === listing.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Add photo to ${listing.title}`}
                  >
                    {uploadingId === listing.id ? (
                      <ActivityIndicator color={colors.forest} />
                    ) : (
                      <>
                        <Ionicons name="camera-outline" size={18} color={colors.forest} />
                        <Text style={styles.photoBtnText}>
                          {(listing.images?.length || 0) > 0 ? 'Add another photo' : 'Add photo'}
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  formCard: {
    backgroundColor: colors.creamCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  formHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.chipActive,
    borderColor: colors.chipActive,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.cream,
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  empty: {
    backgroundColor: colors.creamCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.creamCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cardThumb: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.forestMid,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardThumbImg: { width: '100%', height: '100%' },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.muted,
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  photoBtn: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
  },
  photoBtnText: {
    color: colors.forest,
    fontWeight: '700',
    fontSize: 13,
  },
  primaryBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: colors.cream,
    fontWeight: '800',
    fontSize: 15,
  },
});
