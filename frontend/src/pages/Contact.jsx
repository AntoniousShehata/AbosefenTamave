import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import shopImage from '../pictures/shop.jpg';

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

      <div className="grid md:grid-cols-2 gap-8">
        <form ref={form} onSubmit={sendEmail} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            name="title"
            placeholder="Your Request Title"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            name="user_email"
            placeholder="you@example.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
          <textarea
            name="message"
            rows="5"
            placeholder="Your message"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded"
          ></textarea>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded hover:bg-secondary transition w-full"
          >
            Send Message
          </button>
        </form>

        <div className="grid md:grid-cols-2 gap-8 items-start">
   
        <div className="space-y-4 text-gray-700">
            <h3 className="text-xl font-semibold text-secondary">📍 Address:</h3>
            <p>10 Eldaher Street, Elfagala, Cairo, Egypt</p>

            <h3 className="text-xl font-semibold text-secondary">📞 Phone:</h3>
            <p><a href="tel:+201029552085" className="text-blue-600">+20 102 955 2085</a></p>
            <p><a href="tel:+201226766750" className="text-blue-600">+20 122 676 6750</a></p>

            <h3 className="text-xl font-semibold text-secondary">📧 Email:</h3>
            <p><a href="mailto:maherfouadshehata@gmail.com" className="text-blue-600">maherfouadshehata@gmail.com</a></p>

            <h3 className="text-xl font-semibold text-secondary">🕒 Working Hours:</h3>
            <ul className="list-disc list-inside text-sm">
            <li>Monday to Saturday: 9 AM – 9 PM</li>
            <li>Sunday: Closed</li>
            </ul>
        </div>

        <div>
            <img
            src={shopImage}
            alt="Abosefen Storefront"
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
