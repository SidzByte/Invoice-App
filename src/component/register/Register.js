import React, { useEffect, useRef, useState } from 'react';
import '../login/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase'; // No storage import needed for Cloudinary
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import axios from 'axios'; // For handling the Cloudinary upload

const Register = () => {
  const fileInputRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState(null)
  const navigate = useNavigate()
  const [isLoading, setLoading] = useState(false)

  // Cleanup logic
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl); // Cleanup the generated URL
      }
    };
  }, [imageUrl]);


  // File selection handler with validation
  const onSelectFile = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile); // Set the file state
      setImageUrl(URL.createObjectURL(selectedFile)); // Generate and set the preview URL
    } else {
      setError('Please select a valid image file.');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true)
    console.log(email, password);

    try {
      setLoading(false)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log(userCredential);

      const date = new Date().getTime(); // Generate a unique timestamp
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "invoice-preset");

      // Send the image to Cloudinary
      const response = await axios.post(`https://api.cloudinary.com/v1_1/dtfr8jlef/image/upload`, formData);
      const downloadURL = response.data.secure_url;

      // Update the user profile in Firebase Auth
      await updateProfile(userCredential.user, {
        displayName: displayName,
        photoURL: downloadURL,
      });

      // Store the user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: displayName,
        email: email,
        photoURL: downloadURL,
      });

      navigate('/dashboard/home')
      setLoading(false)
      localStorage.setItem('cName', displayName)
      localStorage.setItem('photoURL', downloadURL)
      localStorage.setItem('email', email) // check this in application
      localStorage.setItem('uid', userCredential.user.uid)
      console.log("User registered successfully!");
    } catch (err) {
      setLoading(false)
      if (err.code === "auth/email-already-in-use") {
        console.log("This email is already in use. Please try another email.");
      } else {
        console.log("Error: ", err.message);
      }
    }
  };


  return (
    <div className='login-wrapper'>
      <div className='login-container'>
        <div className='login-boxes login-left'></div>
        <div className='login-boxes login-right'>
          <h2 className='login-heading'>Register</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={submitHandler}>
            <input required
              onChange={(e) => setEmail(e.target.value)}
              className='login-input'
              type='text'
              placeholder='Email'
            />
            <input required
              onChange={(e) => setDisplayName(e.target.value)}
              className='login-input'
              type='text'
              placeholder='Company Name'
            />
            <input required
              onChange={(e) => setPassword(e.target.value)}
              className='login-input'
              type='password'
              placeholder='Password'
            />
            <input required
              onChange={(e) => onSelectFile(e)}
              style={{ display: 'none' }}
              className='login-input'
              type='file'
              ref={fileInputRef}
            />
            <input required
              className='login-input'
              type='button'
              value='Select your logo'
              onClick={() => fileInputRef.current.click()}
            />

            {imageUrl != null && <img className='image-preview' src={imageUrl} alt='preview' />}

            <button className='login-input login-btn' type='submit'>{isLoading && <i class="fa-solid fa-spinner fa-spin-pulse"></i>}Submit</button>

          </form>

          <Link to='/login' className='register-link'>
            Login With Your Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
