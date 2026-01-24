import type { Cabin, PopulatedBooking } from '@/types';

interface EmailTemplateProps {
  firstName: string;
}

interface BookingEmailTemplateProps {
  bookingData: PopulatedBooking;
  cabinData: Cabin;
  firstName: string;
}

interface PaymentEmailTemplateProps {
  bookingData: PopulatedBooking;
  cabinData: Cabin;
  firstName: string;
  amountPaid: number;
  isDeposit: boolean;
}

const emailStyles = {
  button: {
    backgroundColor: '#2563eb',
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontWeight: 'bold',
    marginTop: '20px',
    padding: '12px 24px',
    textDecoration: 'none',
  },
  container: {
    backgroundColor: '#ffffff',
    color: '#333333',
    fontFamily: 'Arial, sans-serif',
    margin: '0 auto',
    maxWidth: '600px',
    padding: '20px',
  },
  content: {
    backgroundColor: '#f8fafc',
    padding: '30px 20px',
  },
  footer: {
    backgroundColor: '#1e293b',
    borderRadius: '0 0 8px 8px',
    color: '#ffffff',
    padding: '20px',
    textAlign: 'center' as const,
  },
  header: {
    backgroundColor: '#2563eb',
    borderRadius: '8px 8px 0 0',
    color: '#ffffff',
    padding: '30px 20px',
    textAlign: 'center' as const,
  },
  label: {
    color: '#64748b',
    fontWeight: 'bold',
  },
  price: {
    color: '#059669',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  section: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '20px',
    padding: '20px',
  },
  sectionTitle: {
    borderBottom: '2px solid #e2e8f0',
    color: '#1e293b',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    paddingBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    margin: '8px 0 0 0',
    opacity: 0.9,
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0',
  },
  value: {
    color: '#1e293b',
  },
};

export function WelcomeEmail({ firstName }: EmailTemplateProps) {
  return (
    <div style={emailStyles.container}>
      <div style={emailStyles.header}>
        <h1 style={emailStyles.title}>Welcome to LodgeFlow!</h1>
        <p style={emailStyles.subtitle}>
          We're excited to have you join us, {firstName}!
        </p>
      </div>

      <div style={emailStyles.content}>
        <div style={emailStyles.section}>
          <h2 style={emailStyles.sectionTitle}>Getting Started</h2>
          <p>Hello {firstName},</p>
          <p>
            Welcome to LodgeFlow! Your account has been successfully created and
            you can now start exploring our beautiful cabins and booking your
            perfect getaway.
          </p>
          <p>
            We offer a variety of luxury cabins with modern amenities,
            breathtaking views, and exceptional service to make your stay
            unforgettable.
          </p>
        </div>

        <div style={emailStyles.section}>
          <h2 style={emailStyles.sectionTitle}>What's Next?</h2>
          <ul>
            <li>Browse our available cabins and amenities</li>
            <li>Book your perfect retreat dates</li>
            <li>Enjoy personalized service and experiences</li>
            <li>Create lasting memories in nature</li>
          </ul>
        </div>
      </div>

      <div style={emailStyles.footer}>
        <p>Thank you for choosing LodgeFlow!</p>
        <p style={{ fontSize: '14px', margin: '0', opacity: 0.8 }}>
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </div>
  );
}

export function BookingConfirmationEmail({
  bookingData,
  cabinData,
  firstName,
}: BookingEmailTemplateProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      currency: 'USD',
      style: 'currency',
    }).format(price);
  };

  const getAddons = () => {
    const addons = [];
    if (bookingData.extras.hasBreakfast) {
      addons.push(
        `Breakfast - ${formatPrice(bookingData.extras.breakfastPrice)}`
      );
    }
    if (bookingData.extras.hasPets) {
      addons.push(`Pet Fee - ${formatPrice(bookingData.extras.petFee)}`);
    }
    if (bookingData.extras.hasParking) {
      addons.push(`Parking - ${formatPrice(bookingData.extras.parkingFee)}`);
    }
    if (bookingData.extras.hasEarlyCheckIn) {
      addons.push(
        `Early Check-in - ${formatPrice(bookingData.extras.earlyCheckInFee)}`
      );
    }
    if (bookingData.extras.hasLateCheckOut) {
      addons.push(
        `Late Check-out - ${formatPrice(bookingData.extras.lateCheckOutFee)}`
      );
    }
    return addons;
  };

  return (
    <div style={emailStyles.container}>
      <div style={emailStyles.header}>
        <h1 style={emailStyles.title}>Booking Confirmed!</h1>
        <p style={emailStyles.subtitle}>
          Your reservation is all set, {firstName}!
        </p>
      </div>

      <div style={emailStyles.content}>
        <div style={emailStyles.section}>
          <h2 style={emailStyles.sectionTitle}>Booking Details</h2>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Booking ID:</span>
            <span style={emailStyles.value}>
              #{bookingData._id.toString().slice(-8).toUpperCase()}
            </span>
          </div>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Check-in:</span>
            <span style={emailStyles.value}>
              {formatDate(bookingData.checkInDate)}
            </span>
          </div>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Check-out:</span>
            <span style={emailStyles.value}>
              {formatDate(bookingData.checkOutDate)}
            </span>
          </div>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Duration:</span>
            <span style={emailStyles.value}>
              {bookingData.numNights} nights
            </span>
          </div>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Guests:</span>
            <span style={emailStyles.value}>
              {`${bookingData.numGuests} guest${bookingData.numGuests > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        <div style={emailStyles.section}>
          <h2 style={emailStyles.sectionTitle}>Cabin Information</h2>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Cabin:</span>
            <span style={emailStyles.value}>{cabinData.name}</span>
          </div>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Capacity:</span>
            <span style={emailStyles.value}>
              Up to {cabinData.capacity} guests
            </span>
          </div>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Nightly Rate:</span>
            <span style={emailStyles.value}>
              {formatPrice(cabinData.price)}
            </span>
          </div>

          <div style={{ marginTop: '15px' }}>
            <span style={emailStyles.label}>Description:</span>
            <p style={{ color: '#64748b', margin: '5px 0' }}>
              {cabinData.description}
            </p>
          </div>

          {cabinData.amenities.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <span style={emailStyles.label}>Amenities:</span>
              <ul style={{ color: '#64748b', margin: '5px 0' }}>
                {cabinData.amenities.map((amenity, index) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={emailStyles.section}>
          <h2 style={emailStyles.sectionTitle}>Pricing Breakdown</h2>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>
              Cabin ({bookingData.numNights} nights):
            </span>
            <span style={emailStyles.value}>
              {formatPrice(bookingData.cabinPrice)}
            </span>
          </div>

          {getAddons().length > 0 && (
            <>
              <div
                style={{
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  margin: '10px 0',
                }}
              >
                Add-ons:
              </div>
              {getAddons().map((addon, index) => (
                <div key={index} style={emailStyles.row}>
                  <span
                    style={{
                      ...emailStyles.label,
                      fontSize: '14px',
                      paddingLeft: '10px',
                    }}
                  >
                    {addon.split(' - ')[0]}:
                  </span>
                  <span style={{ ...emailStyles.value, fontSize: '14px' }}>
                    {addon.split(' - ')[1]}
                  </span>
                </div>
              ))}
            </>
          )}

          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Extras Subtotal:</span>
            <span style={emailStyles.value}>
              {formatPrice(bookingData.extrasPrice)}
            </span>
          </div>

          <hr
            style={{
              border: 'none',
              borderTop: '1px solid #e2e8f0',
              margin: '15px 0',
            }}
          />

          <div style={emailStyles.row}>
            <span style={{ ...emailStyles.label, fontSize: '18px' }}>
              Total:
            </span>
            <span style={emailStyles.price}>
              {formatPrice(bookingData.totalPrice)}
            </span>
          </div>

          {bookingData.depositAmount > 0 && (
            <>
              <div style={emailStyles.row}>
                <span style={emailStyles.label}>Deposit Paid:</span>
                <span style={emailStyles.value}>
                  {formatPrice(bookingData.depositAmount)}
                </span>
              </div>
              <div style={emailStyles.row}>
                <span style={emailStyles.label}>Remaining Balance:</span>
                <span style={emailStyles.value}>
                  {formatPrice(
                    bookingData.totalPrice - bookingData.depositAmount
                  )}
                </span>
              </div>
            </>
          )}
        </div>

        <div style={emailStyles.section}>
          <h2 style={emailStyles.sectionTitle}>Important Information</h2>
          <ul>
            <li>Check-in time: 3:00 PM</li>
            <li>Check-out time: 11:00 AM</li>
            <li>Please bring a valid ID for check-in</li>
            <li>Contact us if you need to modify your reservation</li>
            <li>Cancellation policy applies as per terms and conditions</li>
          </ul>
        </div>
      </div>

      <div style={emailStyles.footer}>
        <p>We can't wait to welcome you to LodgeFlow!</p>
        <p style={{ fontSize: '14px', margin: '10px 0 0 0', opacity: 0.8 }}>
          If you have any questions about your booking, please contact us at
          support@lodgeflow.com
        </p>
      </div>
    </div>
  );
}

export function PaymentConfirmationEmail({
  bookingData,
  cabinData,
  firstName,
  amountPaid,
  isDeposit,
}: PaymentEmailTemplateProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      currency: 'USD',
      style: 'currency',
    }).format(price);
  };

  return (
    <div style={emailStyles.container}>
      <div style={{ ...emailStyles.header, backgroundColor: '#059669' }}>
        <h1 style={emailStyles.title}>Payment Confirmed!</h1>
        <p style={emailStyles.subtitle}>
          Thank you for your payment, {firstName}!
        </p>
      </div>

      <div style={emailStyles.content}>
        <div style={emailStyles.section}>
          <h2 style={emailStyles.sectionTitle}>Payment Details</h2>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Amount Paid:</span>
            <span style={emailStyles.price}>{formatPrice(amountPaid)}</span>
          </div>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Payment Type:</span>
            <span style={emailStyles.value}>
              {isDeposit ? 'Deposit' : 'Full Payment'}
            </span>
          </div>
          {isDeposit && (
            <div style={emailStyles.row}>
              <span style={emailStyles.label}>Remaining Balance:</span>
              <span style={emailStyles.value}>
                {formatPrice(bookingData.totalPrice - amountPaid)}
              </span>
            </div>
          )}
        </div>

        <div style={emailStyles.section}>
          <h2 style={emailStyles.sectionTitle}>Booking Summary</h2>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Booking ID:</span>
            <span style={emailStyles.value}>
              #{bookingData._id.toString().slice(-8).toUpperCase()}
            </span>
          </div>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Cabin:</span>
            <span style={emailStyles.value}>{cabinData.name}</span>
          </div>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Check-in:</span>
            <span style={emailStyles.value}>
              {formatDate(bookingData.checkInDate)}
            </span>
          </div>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Check-out:</span>
            <span style={emailStyles.value}>
              {formatDate(bookingData.checkOutDate)}
            </span>
          </div>
          <div style={emailStyles.row}>
            <span style={emailStyles.label}>Total Price:</span>
            <span style={emailStyles.value}>
              {formatPrice(bookingData.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      <div style={emailStyles.footer}>
        <p>Thank you for choosing LodgeFlow!</p>
        <p style={{ fontSize: '14px', margin: '10px 0 0 0', opacity: 0.8 }}>
          If you have any questions about your payment, please contact us at
          support@lodgeflow.com
        </p>
      </div>
    </div>
  );
}
