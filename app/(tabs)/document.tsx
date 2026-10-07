import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { chooseStormPhoto, takeStormPhoto } from '@/features/storms/storm.camera';
import { STORM_TYPE_OPTIONS, type StormDraft, type StormField, type StormType } from '@/features/storms/storm.types';
import { validateStormDraft } from '@/features/storms/storm.utils';
import { describeConditions, formatCoordinates } from '@/features/weather/weather.utils';
import { useLocation } from '@/hooks/useLocation';
import { useStorms } from '@/hooks/useStorms';
import { useWeather } from '@/hooks/useWeather';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDateTime } from '@/utils/date';
import { toAppError } from '@/utils/errors';

export default function DocumentScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const location = useLocation();
  const weather = useWeather(location.coords, location.label);
  const { save } = useStorms();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [stormType, setStormType] = useState<StormType | null>(null);
  const [conditions, setConditions] = useState('');
  const [notes, setNotes] = useState('');
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<StormField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cameraMessage, setCameraMessage] = useState<string | null>(null);
  const prefilled = useRef(false);

  useEffect(() => {
    if (prefilled.current || conditions.length > 0 || !weather.snapshot) {
      return;
    }
    setConditions(describeConditions(weather.snapshot.current));
    prefilled.current = true;
  }, [weather.snapshot, conditions.length]);

  async function onCapture(source: 'camera' | 'library') {
    setCameraMessage(null);
    try {
      const uri = source === 'camera' ? await takeStormPhoto() : await chooseStormPhoto();
      if (!uri) {
        return;
      }
      setPhotoUri(uri);
      setCapturedAt(new Date().toISOString());
      setErrors((current) => ({ ...current, photoUri: undefined, capturedAt: undefined }));
    } catch (error) {
      setCameraMessage(toAppError(error).message);
    }
  }

  async function onSave() {
    const draft: StormDraft = {
      photoUri,
      weatherConditions: conditions,
      latitude: location.coords?.latitude ?? null,
      longitude: location.coords?.longitude ?? null,
      capturedAt,
      notes,
      stormType,
    };
    const validation = validateStormDraft(draft);
    if (!validation.ok) {
      setErrors(validation.errors);
      setFormError('Complete the highlighted fields before saving.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const record = await save(draft);
      setPhotoUri(null);
      setStormType(null);
      setConditions('');
      setNotes('');
      setCapturedAt(null);
      setErrors({});
      prefilled.current = false;
      router.push(`/storm/${record.id}`);
    } catch (error) {
      setFormError(toAppError(error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = [
    styles.input,
    typography.body,
    {
      color: colors.text,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.md,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + spacing.sm }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="New report" subtitle="Photo, place, and conditions" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg }}
      >
        <View style={[styles.photoFrame, { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.md }]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" accessibilityLabel="Selected storm photo" />
          ) : (
            <Text style={[typography.body, { color: colors.textMuted, padding: spacing.lg }]}>No photo yet</Text>
          )}
        </View>
        {errors.photoUri ? <Text style={[typography.caption, { color: colors.danger }]}>{errors.photoUri}</Text> : null}
        {cameraMessage ? <Text style={[typography.caption, { color: colors.danger }]}>{cameraMessage}</Text> : null}
        <PrimaryButton label={photoUri ? 'Retake photo' : 'Capture photo'} onPress={() => void onCapture('camera')} />
        <PrimaryButton label="Choose from library" variant="secondary" onPress={() => void onCapture('library')} />

        <Field label="Storm type" error={errors.stormType}>
          <View style={styles.chips}>
            {STORM_TYPE_OPTIONS.map((option) => {
              const selected = stormType === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setStormType(option.value);
                    setErrors((current) => ({ ...current, stormType: undefined }));
                  }}
                  style={[
                    styles.chip,
                    {
                      borderRadius: radius.pill,
                      borderColor: selected ? colors.accent : colors.border,
                      backgroundColor: selected ? colors.accent : colors.surface,
                    },
                  ]}
                >
                  <Text style={[typography.caption, { color: selected ? colors.accentText : colors.text }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Weather conditions" error={errors.weatherConditions}>
          <TextInput
            value={conditions}
            onChangeText={(value) => {
              setConditions(value);
              prefilled.current = true;
            }}
            multiline
            placeholder="What the sky is doing right now"
            placeholderTextColor={colors.textMuted}
            style={[inputStyle, styles.multiline]}
          />
        </Field>

        <Field label="Notes" error={errors.notes}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Structure, motion, hail size, damage"
            placeholderTextColor={colors.textMuted}
            style={[inputStyle, styles.multiline]}
          />
        </Field>

        <Field label="Location" error={errors.location}>
          <View style={[styles.meta, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <Text style={[typography.body, { color: colors.text }]}>
              {location.coords
                ? formatCoordinates(location.coords.latitude, location.coords.longitude)
                : 'Waiting for a location'}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
              {location.label ?? (location.isSample ? 'Sample target' : 'Coordinates from this device')}
            </Text>
          </View>
          {location.coords ? null : (
            <PrimaryButton label="Use Norman, Oklahoma" variant="secondary" onPress={location.useSample} />
          )}
        </Field>

        <Field label="Date and time" error={errors.capturedAt}>
          <Text style={[typography.body, { color: colors.text }]}>
            {capturedAt ? formatDateTime(capturedAt) : 'Set when you capture the photo'}
          </Text>
        </Field>

        {formError ? <Text style={[typography.body, { color: colors.danger }]}>{formError}</Text> : null}
        <PrimaryButton label="Save report" onPress={() => void onSave()} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[typography.label, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
      {children}
      {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  photoFrame: {
    minHeight: 180,
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: 220,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  multiline: {
    minHeight: 96,
  },
  meta: {
    borderWidth: 1,
    padding: 12,
  },
});
