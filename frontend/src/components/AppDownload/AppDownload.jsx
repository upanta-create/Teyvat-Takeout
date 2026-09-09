import React from 'react';
import './AppDownload.css';

const AppDownload = () => {
  return (
    <div className='app-download' id='app-download'>
      <div className="app-download-badge">📱 Mobile Experience</div>
      <h2>For a Seamless Experience Download<br/><span>Teyvat Takeout App</span></h2>
      <p>Track live deliveries, receive personalized chef recommendations, and unlock app-exclusive dining discounts.</p>
      <div className="app-download-platforms">
        <a href="#download-google-play" className="store-badge-btn" aria-label="Get it on Google Play">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M3.609 1.814L13.793 12 3.61 22.186c-.365-.365-.61-.925-.61-1.586V3.4c0-.661.245-1.221.61-1.586zM15.207 13.414l2.457 2.457-13.06 7.424 10.603-9.881zm0-2.828L4.604.705l13.06 7.424-2.457 2.457zm1.414 1.414l3.197 1.817c.91.517.91 1.365 0 1.882l-3.197 1.817-2.121-2.121 2.121-3.395z"/>
          </svg>
          <div className="store-text">
            <span className="store-sub">GET IT ON</span>
            <span className="store-title">Google Play</span>
          </div>
        </a>
        <a href="#download-app-store" className="store-badge-btn" aria-label="Download on the App Store">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.36-.57.65-1.06 1.7-0.93 2.73 1.01.08 2.03-.5 2.65-1.24z"/>
          </svg>
          <div className="store-text">
            <span className="store-sub">Download on the</span>
            <span className="store-title">App Store</span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default AppDownload;
