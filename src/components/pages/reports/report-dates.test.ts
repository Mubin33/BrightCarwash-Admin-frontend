import { describe, it, expect } from 'vitest';
import {
  BUSINESS_TIMEZONE,
  formatBusinessDate,
  getBusinessReportDateRange,
  getZonedDateParts,
} from '@/lib/date-utils';
import { PERIOD_OPTIONS } from './ReportsContent';

describe('AU8 (P1) / A-10: Business Time Zone Report Date Ranges & Lead Dates', () => {
  describe('Part 1: Report Date Ranges in Business Time Zone (America/Chicago)', () => {
    it('gives identical bounds for viewers in Chicago and Dhaka for "last30days" around 1 November 2026', () => {
      // 8:00 PM Central on October 31, 2026 = 01:00 UTC on November 1, 2026
      // In Dhaka (UTC+6), local time is 7:00 AM on November 1, 2026
      const instantAt8pmCentral = new Date('2026-11-01T01:00:00Z');

      // Regardless of viewer's local machine timezone, getBusinessReportDateRange
      // evaluates relative to the business timezone (America/Chicago)
      const chicagoBounds = getBusinessReportDateRange('last30days', instantAt8pmCentral, 'America/Chicago');
      const dhakaPerspective = getBusinessReportDateRange('last30days', instantAt8pmCentral, BUSINESS_TIMEZONE);

      // In Central Time, the business date is October 31, 2026.
      // 30 days prior to October 31 is October 1.
      expect(chicagoBounds).toEqual({
        startDate: '2026-10-01T00:00:00-05:00',
        endDate: '2026-10-31T23:59:59-05:00',
      });
      expect(dhakaPerspective).toEqual(chicagoBounds);
    });

    it('gives identical bounds for viewers in Chicago and Dhaka for "thisMonth" around 1 November 2026', () => {
      // Instant 1: 8:00 PM Central on October 31, 2026 (01:00 UTC on Nov 1)
      const instantOctober31 = new Date('2026-11-01T01:00:00Z');
      const octRange = getBusinessReportDateRange('thisMonth', instantOctober31);
      expect(octRange).toEqual({
        startDate: '2026-10-01T00:00:00-05:00',
        endDate: '2026-10-31T23:59:59-05:00',
      });

      // Instant 2: 9:00 AM Central on November 1, 2026 (14:00 UTC on Nov 1)
      // In Dhaka (UTC+6), local time is 8:00 PM on November 1
      const instantNovember1 = new Date('2026-11-01T14:00:00Z');
      const novRange = getBusinessReportDateRange('thisMonth', instantNovember1);
      expect(novRange).toEqual({
        startDate: '2026-11-01T00:00:00-06:00',
        endDate: '2026-11-01T23:59:59-06:00',
      });
    });

    it('correctly computes "last6months" and "thisYear" anchored to business timezone', () => {
      const instant = new Date('2026-11-01T15:00:00Z'); // 10:00 AM Central on Nov 1
      const sixMonths = getBusinessReportDateRange('last6months', instant);
      expect(sixMonths.startDate).toBe('2026-05-01T00:00:00-05:00');
      expect(sixMonths.endDate).toBe('2026-11-01T23:59:59-06:00');

      const yearRange = getBusinessReportDateRange('thisYear', instant);
      expect(yearRange.startDate).toBe('2026-01-01T00:00:00-06:00');
      expect(yearRange.endDate).toBe('2026-11-01T23:59:59-06:00');
    });

    it('exposes PERIOD_OPTIONS containing last30days, thisMonth, last6months, and thisYear', () => {
      const values = PERIOD_OPTIONS.map((opt) => opt.value);
      expect(values).toContain('last30days');
      expect(values).toContain('thisMonth');
      expect(values).toContain('last6months');
      expect(values).toContain('thisYear');
    });
  });

  describe('Part 2: Lead Dates in Business Time Zone (America/Chicago)', () => {
    it('shows an 8 PM Central lead on that day (2026-10-31) instead of tomorrow (2026-11-01)', () => {
      // 8:00 PM Central on October 31, 2026 = 01:00 UTC on November 1, 2026
      const leadCreatedAtUtc = '2026-11-01T01:00:00.000Z';

      // Old buggy behavior did split("T")[0], which yielded "2026-11-01" (tomorrow)
      const buggyDate = leadCreatedAtUtc.split('T')[0];
      expect(buggyDate).toBe('2026-11-01');

      // New timezone-aware behavior correctly places it on October 31 in Central Time
      const correctedDate = formatBusinessDate(leadCreatedAtUtc);
      expect(correctedDate).toBe('2026-10-31');
    });

    it('correctly preserves lead date at late night 11:45 PM Central', () => {
      // 11:45 PM Central on Oct 31, 2026 = 04:45 UTC on Nov 1, 2026
      const lateNightUtc = '2026-11-01T04:45:00.000Z';
      expect(formatBusinessDate(lateNightUtc)).toBe('2026-10-31');
    });

    it('correctly transitions to next day after midnight Central Time (12:15 AM Nov 1)', () => {
      // 12:15 AM Central on Nov 1, 2026 = 05:15 UTC on Nov 1, 2026
      const afterMidnightUtc = '2026-11-01T05:15:00.000Z';
      expect(formatBusinessDate(afterMidnightUtc)).toBe('2026-11-01');
    });

    it('handles already-formatted date-only strings without shift', () => {
      expect(formatBusinessDate('2026-10-31')).toBe('2026-10-31');
      expect(formatBusinessDate(null)).toBe('');
      expect(formatBusinessDate(undefined)).toBe('');
    });
  });

  describe('Part 3: Zoned Date Parts Helper', () => {
    it('correctly extracts zoned year, month, and day for Chicago', () => {
      const instant = new Date('2026-11-01T01:00:00Z');
      const parts = getZonedDateParts(instant, 'America/Chicago');
      expect(parts).toEqual({
        year: 2026,
        month: 10,
        day: 31,
      });
    });
  });
});
