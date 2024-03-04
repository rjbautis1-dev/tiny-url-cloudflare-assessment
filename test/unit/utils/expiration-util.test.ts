import { hasExpired } from "../../../src/utils/expiration-util";

describe('hasExpired', () => {

    const realDate = Date.now;

    beforeAll(() => {
        global.Date.now = jest.fn(() => new Date('2024-01-01T00:00:00Z').getTime());
    })

    afterAll(() => {
        global.Date.now = realDate;
    })

    it('returns true if the expiration date is before the current time', () => {
        const expiredAt = new Date('1999-01-01T00:00:00Z');
        expect(hasExpired(expiredAt)).toBe(true)
    });

    it('returns false if the expiration date is greater than the current time', () => {
        const expiredAt = new Date('2025-01-01T00:00:00Z');
        expect(hasExpired(expiredAt)).toBe(false)
    });
});
