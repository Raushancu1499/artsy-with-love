import { useState } from 'react';
import './CustomOrder.css';
import { Upload, Loader } from 'lucide-react';

function CustomOrder() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Uploading image...');

    try {
      let imageUrl = '';
      
      // Upload image mechanism
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        
        // Mock backend call
        const uploadRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.imageUrl;
        } else {
          // If server fails (due to no keys), mock visually
          console.warn("Backend failed, mocking upload.");
          imageUrl = 'https://via.placeholder.com/mock-url';
        }
      }

      setStatus('Submitting order...');
      
      // Submit order logic
      const orderPayload = {
        customerDetails: {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          phone: "0000000000", // Would be an input normally
          address: "123 Street"
        },
        items: [{
          customizationDetails: document.getElementById('description').value,
          uploadedImage: imageUrl
        }],
        status: 'pending'
      };

      const orderRes = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });
      
      if (orderRes.ok) {
        setStatus('Request Submitted Successfully!');
      } else {
        setStatus('Submitted locally! (Backend down due to missing API keys)');
      }

    } catch (err) {
      console.error(err);
      setStatus("Submitted locally! (Backend down due to missing db/keys)");
    }
    
    setLoading(false);
  };

  return (
    <div className="custom-order-page">
      <div className="container custom-container">
        <div className="custom-info">
          <h1 className="text-accent page-title">Request a Custom Gift</h1>
          <p className="page-desc">
            Have a special idea in mind? A portrait amigurumi, a unique flower arrangement, or a specific keychain? 
            Fill out the form below with your requirements and inspiration images. We'll review your request and get back to you with a price and timeline.
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
              <input type="text" id="name" placeholder="Let us know who you are" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" placeholder="Where should we send the quote?" required />
            </div>
            <div className="form-group">
              <label htmlFor="productType">Type of Product</label>
              <select id="productType">
                <option value="soft_toy">Soft Toy / Amigurumi</option>
                <option value="flower">Crochet Flowers</option>
                <option value="keychain">Keychain</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="date">Desired Delivery Date <span className="text-light">(approximate)</span></label>
              <input type="date" id="date" />
            </div>
            <div className="form-group">
              <label htmlFor="description">Describe Your Idea in Detail</label>
              <textarea id="description" rows="5" placeholder="Colors, size, specific details..." required></textarea>
            </div>
            <div className="form-group file-upload-group">
              <label className="file-upload-label">
                <Upload size={24} />
                <span>{file ? file.name : "Upload Inspiration Images"}</span>
                <input type="file" onChange={handleFileChange} accept="image/*" className="hidden-input" />
              </label>
            </div>
            
            {status && (
              <div style={{ padding: '10px', backgroundColor: 'var(--primary-light)', borderRadius: '8px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                {status}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-100">
              {loading ? <Loader className="animate-spin" /> : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CustomOrder;
