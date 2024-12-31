import React, { useEffect, useState } from 'react';
import IconMobileDownload from '../Images/app-icon-download.png';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setDeferredPrompt(null);
    });
  };

  return (
    <div>
      {deferredPrompt && (
        <div className="install-popup" style={styles.centerContainer}>
          <p>Install RME Mantri Agus di Desktop PC or Mobile App</p>
          <div style={styles.centerContent}>
            <img 
              src={IconMobileDownload} 
              alt="Mobile download icon" 
              style={styles.icon} 
              onClick={handleInstallClick}
            />
            <button onClick={handleInstallClick} style={styles.button}>
              Install
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  centerContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    width: '30px',
    height: '30px',
    marginRight: '10px'
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};

export default InstallPrompt;