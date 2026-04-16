import './WhatsAppButton.css';
import { MessageCircle } from 'lucide-react';

function WhatsAppButton() {
  const phoneNumber = '919876543210'; // Placeholder
  const message = 'Hi Artsy With Love! I would like to know more about your custom gifts.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="whatsapp-float" aria-label="Chat with us on WhatsApp">
      <MessageCircle size={28} />
    </a>
  );
}

export default WhatsAppButton;
