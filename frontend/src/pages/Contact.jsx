import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

function Contact() {
  const form = useRef();
  const [sent, setSent] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        'service_12072017',
        'template_kuoc4hk',
        form.current,
        'RPbS8AmHgESARsVws'
      )
      .then(
        (result) => {
          console.log(result.text);
          setSent(true);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">Contact Us</h2>

      {sent && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
          ✅ Message sent successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-secondary mb-4">Get in Touch</h3>
          <form ref={form} onSubmit={sendEmail} className="space-y-4">
            <input
              type="text"
              name="user_name"
              placeholder="Your Name"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <input
              type="email"
              name="user_email"
              placeholder="Your Email"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            ></textarea>
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 px-4 rounded hover:bg-secondary transition font-semibold"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-secondary">📍 Visit our store:</h3>
            <p className="text-sm">
              10 شارع الظاهر، وسط البلد، القاهرة، مصر
              <br />
              10 Eldaher Street, Downtown, Cairo, Egypt
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-secondary">📞 Call us:</h3>
            <div className="text-sm space-y-1">
              <p>+20227868761</p>
              <p>+201029552085</p>
              <p>+201226766750</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-secondary">✉️ Email us:</h3>
            <p className="text-sm">maherfouadshehata@gmail.com</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-secondary">🕒 Working Hours:</h3>
            <ul className="list-disc list-inside text-sm">
              <li>Monday to Saturday: 9 AM – 9 PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>

          <div>
            <img
              src="/images/shop.jpg"
              alt="Abosefen & TamaveIrini Storefront"
              className="w-full object-contain max-h-[400px] rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold text-secondary mb-2">🗺️ Find us on the map</h3>
        <a
          href="https://maps.app.goo.gl/eBJY31BSuHipwYXf8"
          target="_blank"
          rel="noopener noreferrer"
        >
          <iframe
            title="Store Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.1693508478666!2d31.254679524769365!3d30.060679817801887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14584182eab8962d%3A0xd79f62d7e61502d0!2z2KfYqNmI2LPZitmB2YrZhiDZiNiq2YXYp9mBINin2YrYsdmK2YbZiSDZhNmE2KfYr9mI2KfYqiDYp9mE2LXYrdmK2KkgLUFib3NlZmVuICYgVGFtYXZlaXJpbmk!5e0!3m2!1sar!2sde!4v1746560127671!5m2!1sar!2sde"
            width="100%"
            height="400"
            style={{ border: '0', borderRadius: '10px', pointerEvents: 'none' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </a>
      </div>
    </div>
  );
}

export default Contact;
