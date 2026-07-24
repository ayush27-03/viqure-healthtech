import axiosInstance from './axiosConfig'

export async function payViaRazorpay({ context, id, user, onSuccess, onFailure }) {
  const { data } = await axiosInstance.post('/payments/order', { context, id })
  const { keyId, gatewayOrderId, amount, currency } = data.data

  const rzp = new window.Razorpay({
    key: keyId,
    order_id: gatewayOrderId,
    amount, currency,
    name: 'ViQure Health',
    prefill: { email: user?.email, contact: user?.phone || '' },
    handler: async (resp) => {
      try {
        await axiosInstance.post('/payments/verify', { context, id, ...resp })
        onSuccess?.()
      } catch (e) { onFailure?.(e) }
    },
    modal: { ondismiss: () => onFailure?.(new Error('Payment cancelled')) },
  })
  rzp.open()
}