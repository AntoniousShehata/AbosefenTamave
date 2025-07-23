import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

function Contact() {
  const form = useRef();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);

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
          setLoading(false);
          form.current.reset();
        },
        (error) => {
          console.log(error.text);
          setLoading(false);
        }
      );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 sm:py-12 lg:py-16">
        <div className="container-responsive text-center">
          <h1 className="text-responsive-4xl font-bold mb-3 sm:mb-4">Get in Touch</h1>
          <p className="text-responsive-xl opacity-90">We'd love to hear from you. Send us a message!</p>
        </div>
      </div>

      <div className="container-responsive py-8 sm:py-12 -mt-4 sm:-mt-8 relative">
        {/* Success Message */}
        {sent && (
          <div className="bg-green-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-lg mb-6 sm:mb-8 text-center animate-pulse">
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-responsive-base">Message sent successfully! We'll get back to you soon.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="card p-4 sm:p-6 lg:p-8">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-responsive-3xl font-bold text-gray-800 mb-2">Send us a Message</h2>
                <p className="text-responsive-base text-gray-600">Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>
              
              <form ref={form} onSubmit={sendEmail} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="group">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      name="user_name"
                      placeholder="Enter your full name"
                      className="form-input group-hover:border-gray-400"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="form-label">Your Email</label>
                    <input
                      type="email"
                      name="user_email"
                      placeholder="Enter your email address"
                      className="form-input group-hover:border-gray-400"
                      required
                    />
                  </div>
                </div>
                
                <div className="group">
                  <label className="form-label">Your Message</label>
                  <textarea
                    name="message"
                    placeholder="Tell us how we can help you..."
                    rows="6"
                    className="form-input group-hover:border-gray-400 resize-none"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full text-responsive-lg py-3 sm:py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none touch-manipulation"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m15.84 10.2-1.8 1.83-1.8-1.83 1.8-1.83 1.8 1.83z"></path>
                      </svg>
                      Sending Message...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                      Send Message
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="order-1 lg:order-2">
            {/* Contact Cards */}
            <div className="card p-4 sm:p-6">
              <h3 className="text-responsive-2xl font-bold text-gray-800 mb-4 sm:mb-6">Contact Information</h3>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Address */}
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300 touch-manipulation">
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 text-responsive-base">Visit Our Store</h4>
                    <p className="text-gray-600 text-responsive-sm leading-relaxed">
                      10 شارع الظاهر، وسط البلد، القاهرة، مصر
                      <br />
                      10 Eldaher Street, Downtown, Cairo, Egypt
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300 touch-manipulation">
                  <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 text-responsive-base">Call Us</h4>
                    <div className="space-y-1 text-gray-600 text-responsive-sm">
                      <p>+20227868761</p>
                      <p>+201029552085</p>
                      <p>+201226766750</p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300 touch-manipulation">
                  <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 text-responsive-base">Email Us</h4>
                    <p className="text-gray-600 text-responsive-sm break-all">maherfouadshehata@gmail.com</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300 touch-manipulation">
                  <div className="bg-orange-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 text-responsive-base">Working Hours</h4>
                    <div className="text-gray-600 text-responsive-sm space-y-1">
                      <p>Monday to Saturday: 9 AM – 9 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Store Showcase Section */}
        <div className="mt-8 sm:mt-12">
          <div className="card overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Store Information - Left Side */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 sm:p-8 lg:p-12 flex items-center order-2 lg:order-1">
                <div className="w-full text-white">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-responsive-4xl font-bold mb-2 sm:mb-3">Visit Our Store</h2>
                    <p className="text-responsive-xl opacity-90 font-medium">Abosefen & TamaveIrini</p>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div className="flex items-center text-responsive-lg">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4 text-blue-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>Downtown Cairo, Egypt</span>
                    </div>
                    
                    <div className="flex items-center text-responsive-lg">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4 text-green-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Mon-Sat: 9 AM – 9 PM</span>
                    </div>
                    
                    <div className="flex items-center text-responsive-lg">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4 text-yellow-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      <span>Premium Bathroom & Kitchen Fittings</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <a
                      href="https://maps.app.goo.gl/eBJY31BSuHipwYXf8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-blue-600 px-6 py-3 sm:px-8 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center hover:bg-blue-50 text-responsive-base touch-manipulation"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"></path>
                      </svg>
                      Get Directions
                    </a>
                    
                    <a
                      href="tel:+20227868761"
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 sm:px-8 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-responsive-base touch-manipulation"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      Call Now
                    </a>
                  </div>
                </div>
              </div>

              {/* Store Photo - Right Side */}
              <div className="relative h-64 sm:h-80 lg:h-auto overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 order-1 lg:order-2">
                <img
                  src="/images/shop.jpg"
                  alt="Abosefen & TamaveIrini Storefront"
                  className="w-full h-full object-contain lg:object-cover"
                  loading="lazy"
                />
                
                {/* Subtle overlay for better blend */}
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-blue-600/10"></div>
              </div>
            </div>

            {/* Store Features */}
            <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 touch-manipulation">
                  <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <h4 className="text-responsive-lg font-semibold text-gray-800 mb-2">Showroom</h4>
                  <p className="text-gray-600 text-responsive-sm">Experience our premium collection in person</p>
                </div>

                <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 touch-manipulation">
                  <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                  </div>
                  <h4 className="text-responsive-lg font-semibold text-gray-800 mb-2">Expert Support</h4>
                  <p className="text-gray-600 text-responsive-sm">Professional consultation and installation</p>
                </div>

                <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 touch-manipulation sm:col-span-1 col-span-1">
                  <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    </svg>
                  </div>
                  <h4 className="text-responsive-lg font-semibold text-gray-800 mb-2">Quality Guarantee</h4>
                  <p className="text-gray-600 text-responsive-sm">Premium products with warranty coverage</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8 sm:mt-12">
          <div className="card overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-responsive-2xl font-bold text-gray-800">Find Us on the Map</h3>
                  <p className="text-gray-600 text-responsive-base">Click to open in Google Maps for directions</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <a
                href="https://maps.app.goo.gl/eBJY31BSuHipwYXf8"
                target="_blank"
                rel="noopener noreferrer"
                className="block touch-manipulation"
              >
                <iframe
                  title="Store Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.1693508478666!2d31.254679524769365!3d30.060679817801887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14584182eab8962d%3A0xd79f62d7e61502d0!2z2KfYqNmI2LPZitmB2YrZhiDZiNiq2YXYp9mBINin2YrYsdmK2YbZiSDZhNmE2KfYr9mI2KfYqiDYp9mE2LXYrdmK2KkgLUFib3NlZmVuICYgVGFtYXZlaXJpbmk!5e0!3m2!1sar!2sde!4v1746560127671!5m2!1sar!2sde"
                  width="100%"
                  height="300"
                  style={{ border: '0' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="hover:opacity-80 transition-opacity duration-300 sm:h-96 lg:h-[400px]"
                ></iframe>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300">
                  <div className="bg-white bg-opacity-90 rounded-full p-3 sm:p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
