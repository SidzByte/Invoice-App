import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from '../../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const Setting = () => {
  const fileInputRef = useRef(null);
  const [cName, setCName] = useState(localStorage.getItem('cName'));

  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState(localStorage.getItem('email'));
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(localStorage.getItem('cName'));
  const [imageUrl, setImageUrl] = useState(localStorage.getItem('photoURL'));

  const updateCompanyName = () => {
    updateProfile(auth.currentUser, {
      displayName: displayName
    })
      .then(res => {
        localStorage.setItem('cName', displayName)
        updateDoc(doc(db, "users", localStorage.getItem('uid')), {
          displayName: displayName
        })
          .then(res => {
            window.location.reload()
          })
      })
  }


  useEffect(() => {
    // Cleanup generated object URL
    return () => {
      if (file) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // File selection handler with validation
  const onSelectFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile); // Save the selected file
      setImageUrl(URL.createObjectURL(selectedFile)); // Generate preview URL
      setError('');
    } else {
      setError('Please select a valid image file.');
    }
  };

  // Upload file to Cloudinary
  const updateLogo = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file); // Add the file to the form data
      formData.append('upload_preset', 'invoice-preset'); // Use your Cloudinary upload preset

      // Upload to Cloudinary
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dtfr8jlef/image/upload',
        formData
      );

      const downloadURL = response.data.secure_url;

      // Update the image URL
      setImageUrl(downloadURL);
      localStorage.setItem('photoURL', downloadURL); // Persist the new URL

      alert('Profile picture updated successfully!');

      // Reload the page to reflect changes (if needed)
      window.location.reload();
    } catch (err) {
      setError('Failed to upload the profile picture. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>Setting</p>
      <div className="setting-wrapper">
        <div className="profile-info update-cName">
          <img
            onClick={() => fileInputRef.current.click()}
            className="pro"
            alt="profile-pic"
            src={imageUrl}
          />
          <input
            onChange={onSelectFile}
            style={{ display: 'none' }}
            type="file"
            ref={fileInputRef}
          />
          {file && <button onClick={updateLogo} disabled={loading} style={{width: '30%', padding: '10px', backgroundColor:'hotpink' }}>
            {loading ? 'Uploading...' : 'Update Profile Pic'}
          </button>}
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className='update-cName'>
          <input onChange={e => { setDisplayName(e.target.value) }} type='text' placeholder='Company Name' value={displayName} />
          <button onClick={updateCompanyName}>Update Company Name</button>

        </div>
      </div>
    </div>
  );
};

export default Setting;
