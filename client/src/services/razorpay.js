import axiosInstance from './axiosConfig'

/**
 * Opens Razorpay Checkout for an existing ViQure order or appointment.
 *
 * Flow: the server creates the gateway order (with the authoritative amount from
 * the DB), the browser opens Checkout, and on completion the server verifies the
 * signature before marking anything paid. The browser only relays the handshake —
 * it never decides the amount or the paid status.
 *
 * @param {Object}   opts
 * @param {'ORDER'|'APPOINTMENT'} opts.context  what is being paid for
 * @param {string}   opts.id         the order/appointment _id
 * @param {Object}   opts.user       current user (for prefill)
 * @param {Function} opts.onSuccess  called after server-side verification succeeds
 * @param {Function} opts.onFailure  called on cancel, gateway error, or verify failure
 */
export async function payViaRazorpay({ context, id, user, onSuccess, onFailure }) {
  if (!window.Razorpay) {
    onFailure?.(new Error('Payment SDK failed to load. Check your connection and try again.'))
    return
  }

  // 1) Ask our server to create the Razorpay order (amount comes from the DB).
  let gateway
  try {
    const { data } = await axiosInstance.post('/payments/order', { context, id })
    gateway = data.data
  } catch (e) {
    onFailure?.(e)
    return
  }

  const { keyId, gatewayOrderId, amount, currency } = gateway

  // 2) Open Checkout. On success, the handler verifies the signature server-side.
  const rzp = new window.Razorpay({
    key: keyId,
    order_id: gatewayOrderId,
    amount,
    currency,
    name: 'ViQure Health',
    description: context === 'ORDER' ? 'Order payment' : 'Consultation fee',
    prefill: {
      name: user?.profile
        ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
        : '',
      email: user?.email,
      contact: user?.phone || '',
    },
    theme: { color: '#1890ff' },
    handler: async (resp) => {
      try {
        await axiosInstance.post('/payments/verify', { context, id, ...resp })
        onSuccess?.()
      } catch (e) {
        onFailure?.(e)
      }
    },
    modal: {
      // User closed the modal without paying — leave the order/appointment unpaid.
      ondismiss: () => onFailure?.(new Error('Payment cancelled')),
    },
  })

  rzp.on('payment.failed', (resp) =>
    onFailure?.(new Error(resp?.error?.description || 'Payment failed')),
  )
  rzp.open()
}
