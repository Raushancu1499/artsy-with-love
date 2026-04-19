import { useState } from 'react';
import './CustomOrder.css';
import { Upload, Loader, MessageCircle } from 'lucide-react';
import API_BASE_URL from '../config/api';

const INITIAL_FORM = {
  name: '',
  email: '',
  primaryPhone: '',
  secondaryPhone: '',
  address: '',
  productType: 'soft_toy',
  date: '',
  description: '',
};

function CustomOrder() {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result?.toString() || '');
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Submitting request...');

    try {
      const orderPayload = {
        customerDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.primaryPhone,
          secondaryPhone: formData.secondaryPhone,
          address: formData.address,
        },
        items: [
          {
            customizationDetails: [
              `Product type: ${formData.productType}`,
              `Desired delivery date: ${formData.date || 'Flexible'}`,
              `Description: ${formData.description}`,
            ].join('\n'),
            uploadedImage: filePreview,
            quantity: 1,
          },
        ],
        status: 'pending',
        paymentStatus: 'pending',
      };

      const orderRes = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Could not submit request.');
      }

      setStatus('Request submitted successfully.');
      setFormData(INITIAL_FORM);
      setFile(null);
      setFilePreview('');
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-order-page">
      <div className="container custom-container">
        <div className="custom-info">
          <h1 className="text-accent page-title">Request a Custom Gift</h1>
          <p className="page-desc">
            Have a special idea in mind? Share your inspiration, delivery details, and a reference image so we can
            review your request and get back to you with a quote.
          </p>
          <div className="custom-steps">
            <div className="step">
              <div className="step-num">1</div>
              <p>Submit your request</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <p>We review and set a price</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <p>You approve and pay</p>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <p>We craft with love!</p>
            </div>
          </div>
        </div>

        <div className="custom-form-wrapper">
          <form className="custom-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Let us know who you are" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Where should we send the quote?" required />
            </div>
            <div className="form-group">
              <label htmlFor="primaryPhone">Primary Phone Number</label>
              <input id="primaryPhone" name="primaryPhone" type="tel" value={formData.primaryPhone} onChange={handleChange} placeholder="Delivery contact number" required />
            </div>
            <div className="form-group">
              <label htmlFor="secondaryPhone">Secondary Phone Number</label>
              <input id="secondaryPhone" name="secondaryPhone" type="tel" value={formData.secondaryPhone} onChange={handleChange} placeholder="Alternate contact number" required />
            </div>
            <div className="form-group">
              <label htmlFor="address">Full Address</label>
              <textarea id="address" name="address" rows="3" value={formData.address} onChange={handleChange} placeholder="House number, street, area, city, state, pincode" required />
            </div>
            <div className="form-group">
              <label htmlFor="productType">Type of Product</label>
              <select id="productType" name="productType" value={formData.productType} onChange={handleChange}>
                <option value="soft_toy">Soft Toy / Amigurumi</option>
                <option value="flower">Crochet Flowers</option>
                <option value="keychain">Keychain</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="date">Desired Delivery Date <span className="text-light">(approximate)</span></label>
              <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="description">Describe Your Idea in Detail</label>
              <textarea id="description" name="description" rows="5" value={formData.description} onChange={handleChange} placeholder="Colors, size, specific details..." required />
            </div>
            <div className="form-group file-upload-group">
              <label className="file-upload-label">
                <Upload size={24} />
                <span>{file ? file.name : 'Upload Inspiration Images'}</span>
                <input type="file" onChange={handleFileChange} accept="image/*" className="hidden-input" />
              </label>
            </div>

            {filePreview && (
              <div className="file-preview">
                <img src={filePreview} alt="Inspiration preview" />
              </div>
            )}

            {status && (
              <div style={{ padding: '10px', backgroundColor: 'var(--primary-light)', borderRadius: '8px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                {status}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-100">
              {loading ? <Loader className="animate-spin" /> : <><MessageCircle size={18} /> Submit Request</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CustomOrder;
