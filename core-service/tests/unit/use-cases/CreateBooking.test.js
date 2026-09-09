'use strict';

const { CreateBooking } = require('../../../src/application/use-cases/CreateBooking');
const { UpdateBookingStatus } = require('../../../src/application/use-cases/UpdateBookingStatus');
const { SimulateCheckout } = require('../../../src/application/use-cases/SimulateCheckout');
const {
  InMemoryListingRepository,
} = require('../../../src/infrastructure/persistence/InMemoryListingRepository');
const {
  InMemoryBookingRepository,
} = require('../../../src/infrastructure/persistence/InMemoryBookingRepository');

function futureDate(daysAhead) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

describe('Booking flow use cases', () => {
  it('creates a rental booking with pricing', async () => {
    const useCase = new CreateBooking({
      listingRepository: new InMemoryListingRepository(),
      bookingRepository: new InMemoryBookingRepository(),
    });
    const result = await useCase.execute(
      { listingId: 'lst_tent_1', startDate: futureDate(2), endDate: futureDate(5) },
      { userId: 'renter_1', name: 'Alex' },
    );
    expect(result.booking.status).toBe('requested');
    expect(result.booking.pricing.days).toBe(3);
  });

  it('rejects overlapping bookings', async () => {
    const bookingRepository = new InMemoryBookingRepository();
    const useCase = new CreateBooking({
      listingRepository: new InMemoryListingRepository(),
      bookingRepository,
    });
    const start = futureDate(10);
    const end = futureDate(13);
    await useCase.execute(
      { listingId: 'lst_tent_1', startDate: start, endDate: end },
      { userId: 'renter_1' },
    );
    await expect(
      useCase.execute(
        { listingId: 'lst_tent_1', startDate: start, endDate: end },
        { userId: 'renter_2' },
      ),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('simulates checkout after acceptance', async () => {
    const listingRepository = new InMemoryListingRepository();
    const bookingRepository = new InMemoryBookingRepository();
    const createBooking = new CreateBooking({ listingRepository, bookingRepository });
    const updateStatus = new UpdateBookingStatus({ bookingRepository });
    const checkout = new SimulateCheckout({ bookingRepository });

    const created = await createBooking.execute(
      { listingId: 'lst_tent_1', startDate: futureDate(2), endDate: futureDate(4) },
      { userId: 'renter_1' },
    );
    await updateStatus.execute({
      bookingId: created.booking.id,
      status: 'accepted',
      userId: 'owner_mara',
    });
    const paid = await checkout.execute({ bookingId: created.booking.id, userId: 'renter_1' });
    expect(paid.status).toBe('completed');
    expect(paid.payment.provider).toBe('bivvy_sim');
  });
});
