import {
  getAvatarColor,
  getInitials,
  getInitialsFromFullName,
  splitDisplayName,
} from '@/utils/avatar';

describe('splitDisplayName', () => {
  it('splits on the first space', () => {
    expect(splitDisplayName('Ana Anić')).toEqual({ first: 'Ana', rest: 'Anić' });
    expect(splitDisplayName('Branimir Valentin V')).toEqual({
      first: 'Branimir',
      rest: 'Valentin V',
    });
  });

  it('returns a single token with null rest', () => {
    expect(splitDisplayName('Ana')).toEqual({ first: 'Ana', rest: null });
    expect(splitDisplayName('  Ana  ')).toEqual({ first: 'Ana', rest: null });
  });

  it('trims trailing empty rest after space', () => {
    expect(splitDisplayName('Ana ')).toEqual({ first: 'Ana', rest: null });
  });
});

describe('getInitialsFromFullName', () => {
  it('uses first and last word', () => {
    expect(getInitialsFromFullName('Ana Anić')).toBe('AA');
    expect(getInitialsFromFullName('Branimir Valentin V')).toBe('BV');
  });

  it('handles a single name', () => {
    expect(getInitialsFromFullName('Ana')).toBe('A');
    expect(getInitials('Ana', '')).toBe('A');
  });
});

describe('getAvatarColor', () => {
  it('is stable for the same name', () => {
    expect(getAvatarColor('StanApp')).toBe(getAvatarColor('StanApp'));
  });
});
