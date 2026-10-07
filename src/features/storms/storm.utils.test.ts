/// <reference types="jest" />
import { buildStormMapHtml, coordinateBounds, validateStormDraft } from '@/features/storms/storm.utils';
import type { StormDraft } from '@/features/storms/storm.types';

const validDraft: StormDraft = {
  photoUri: 'file:///storm.jpg',
  weatherConditions: 'Rotating wall cloud to the west',
  latitude: 35.22,
  longitude: -97.44,
  capturedAt: '2026-10-07T18:00:00.000Z',
  notes: 'Brief funnel, no touchdown',
  stormType: 'supercell',
};

describe('storm utils', () => {
  test('accepts a complete draft and trims text', () => {
    const result = validateStormDraft({
      ...validDraft,
      weatherConditions: '  Rotating wall cloud  ',
      notes: '  Brief funnel  ',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.weatherConditions).toBe('Rotating wall cloud');
      expect(result.value.notes).toBe('Brief funnel');
    }
  });

  test('requires a photo, storm type, and location', () => {
    const result = validateStormDraft({
      ...validDraft,
      photoUri: null,
      stormType: null,
      latitude: 120,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.photoUri).toBeTruthy();
      expect(result.errors.stormType).toBeTruthy();
      expect(result.errors.location).toBeTruthy();
    }
  });

  test('embeds map points without letting labels break the page', () => {
    const html = buildStormMapHtml([
      {
        id: 'storm-1',
        latitude: 35.2,
        longitude: -97.4,
        label: '</script><script>alert(1)</script>',
      },
    ]);
    expect(html).toContain('storm-1');
    expect(html).not.toContain('</script><script>');
    expect(html).toContain('\\u003c/script>');
  });

  test('computes bounds for documented positions', () => {
    expect(
      coordinateBounds([
        { latitude: 35, longitude: -98 },
        { latitude: 36.5, longitude: -96 },
      ]),
    ).toEqual({ minLat: 35, maxLat: 36.5, minLon: -98, maxLon: -96 });
  });
});
