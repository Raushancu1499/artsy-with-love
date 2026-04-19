import './WhatsAppButton.css';
import { MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const DEFAULT_NUMBER = '919876543210';

function WhatsAppButton() {
  const { cartItems, getSubtotal } = useCart();
  const phoneNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_NUMBER).replace(/\D/g, '');
  const subtotal = getSubtotal();
  const hasCartItems = cartItems.length > 0;

  const message = hasCartItems
    ? [
        'Hi Artsy With Love, I would like to place this order:',
        ...cartItems.map((item) => `- ${item.name} x ${item.quantity}`),
        `Subtotal: ${subtotal}`,
        'Please share the next steps for delivery and UPI payment.',
      ].join('\n')
    : 'Hi Artsy With Love, I would like to know more about your custom gifts and order options.';

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}

export default WhatsAppButton;
