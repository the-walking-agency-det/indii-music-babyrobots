import { useState } from 'react';
import { ContactForm, ContactFormData } from '../src/components/contact/ContactForm';
import { Toast } from '../src/components/ui/Toast';

const ContactPage = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSubmit = async (data: ContactFormData) => {
    try {
      // TODO: Implement API endpoint for contact form
      // For now, just show a success message
      setToastMessage('Message sent successfully! We will get back to you soon.');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to send message. Please try again later.');
      setShowToast(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-2 text-lg text-gray-600">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <ContactForm onSubmit={handleSubmit} />
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Other Ways to Connect</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Email</h3>
              <p className="text-gray-600">support@indiimusic.com</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Social Media</h3>
              <div className="mt-2 flex justify-center space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  Instagram
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          type={toastMessage.includes('success') ? 'success' : 'error'}
        />
      )}
    </div>
  );
};

export default ContactPage;
