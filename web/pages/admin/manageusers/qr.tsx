import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { firestore, storage } from '../../../firebaseConfig'; 
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import ReactQRCode from 'react-qr-code'; // Using react-qr-code
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Import Firebase Auth
import emailjs from 'emailjs-com'; // Import EmailJS

const QRPage = () => {
  const router = useRouter();
  const { registrationNumber } = router.query;
  const qrRef = useRef<HTMLDivElement | null>(null); // Reference to the QR code element
  const [vehicleData, setVehicleData] = useState<any>(null); // Store fetched vehicle data
  const [loading, setLoading] = useState<boolean>(true); // To show loading state
  const [email, setEmail] = useState(''); // To hold email input
  const [password, setPassword] = useState(''); // To hold password input
  const [uploadProgress, setUploadProgress] = useState<number>(0); // To handle progress bar

  useEffect(() => {
    if (registrationNumber) {
      fetchVehicleData(registrationNumber);
    }
  }, [registrationNumber]);

  const fetchVehicleData = async (registrationNumber: string) => {
    try {
      const vehicleRef = collection(firestore, 'vehicleRegistrations');
      const q = query(vehicleRef, where('registrationNumber', '==', registrationNumber));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setVehicleData(docData);
        setLoading(false);
      } else {
        setLoading(false);
        Swal.fire('Not Found', 'No vehicle found with this registration number.', 'error');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching vehicle data:', error);
      Swal.fire('Error', 'An error occurred while fetching the data.', 'error');
    }
  };

  const handleShareQR = async () => {
    if (qrRef.current) {
      setUploadProgress(0);
      // Use html2canvas to capture the QR code as an image with extra white space on the top and bottom
      const canvas = await html2canvas(qrRef.current, {
        scrollX: 0, // Ensure no scrolling is involved
        scrollY: 0, // Ensure no scrolling is involved
        x: 0, // Adjust if there is any offset
        y: 0, // Adjust if there is any offset
        width: qrRef.current.offsetWidth, // Keep the width the same as the QR code size
        height: qrRef.current.offsetHeight + 50, // Add 50px of white space to the bottom
        backgroundColor: '#ffffff', // Ensure white background for padding
      });

      // Create the padded canvas and set the dimensions correctly
      const paddedCanvas = document.createElement('canvas');
      const ctx = paddedCanvas.getContext('2d');

      // Set the padded canvas size to add white space on top and bottom
      paddedCanvas.width = canvas.width;
      paddedCanvas.height = canvas.height + 40; // Add 40px of white space on top

      if (ctx) {
        // Fill the background with white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);

        // Draw the QR code canvas onto the new padded canvas (shifting it down by 40px)
        ctx.drawImage(canvas, 0, 40); // Shift the QR code down by 40px
      }

      const imageBlob = await new Promise<Blob>((resolve) => paddedCanvas.toBlob(resolve, 'image/png'));

      // Create a reference to Firebase Storage
      const storageRef = ref(storage, `qr-codes/${registrationNumber}.png`);

      // Upload the image to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, imageBlob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Get the progress as a percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          // Update the progress bar
          setUploadProgress(progress);
        },
        (error) => {
          Swal.fire('Error', 'An error occurred while uploading the QR code.', 'error');
          console.error(error);
        },
        async () => {
          // Once the upload is complete, get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Store the download URL in Firestore
          const vehicleRef = doc(firestore, 'vehicleRegistrations', registrationNumber as string);
          await updateDoc(vehicleRef, {
            qr: downloadURL, // Save the QR image URL to the Firestore document
          });
          setUploadProgress(0);
          Swal.fire('Success', 'QR code image shared with the owner.', 'success');
        }
      );
    }
  };

  const handleRegister = async () => {
    const auth = getAuth();

    // Check if email and password are provided
    if (!email || !password) {
      Swal.fire('Error', 'Please enter both email and password.', 'error');
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      Swal.fire('Success', 'Account successfully created and user is signed in!', 'success');
      // Save user data to Firestore under 'Registration_users'
      const userData = {
        email,
        password,
        registrationNumber,
      };

      const collectionRef = collection(firestore, 'Registration_users');
      const documentRef = doc(collectionRef, registrationNumber as string); // Use registrationNumber as the document ID
      await setDoc(documentRef, userData);
      // Send email to the user with their email and password
      sendEmail(email, password);
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const sendEmail = (userEmail: string, userPassword: string) => {
    const templateParams = {
      user_email: userEmail,
      from_name: 'CheckMyCar App Administration',
      message: `Welcome to the app! Here are your credentials: 
                \nEmail: ${userEmail} 
                \nPassword: ${userPassword}`,
    };

    // Send the email using EmailJS
    emailjs
      .send(
        'service_mzrnox9', // service ID from EmailJS
        'template_ovcesrx', // template ID from EmailJS
        templateParams,
        'DWpUMn2qtc2-CDPF-' // EmailJS PUBLIC KEY
      )
      .then(
        (response) => {
          console.log('Email sent successfully:', response);
          Swal.fire('Success', 'Credentials have been sent to your email!', 'success');
        },
        (error) => {
          console.error('Error sending email:', error);
          Swal.fire('Error', 'An error occurred while sending the email.', 'error');
        }
      );
  };

  if (loading) {
    return (
      <div className="container text-center">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className="container text-center">
        <h2>No data found for this registration number.</h2>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center">QR Code for Registration Number: {registrationNumber}</h1>

      {/* Card Container for QR code and share button */}
      <div className="card mt-4">
        <div className="card-body">
          <div className="row">
            {/* Left side: QR code and share button */}
            <div className="col-md-6 text-center">
              <div ref={qrRef}>
                <ReactQRCode value={JSON.stringify(vehicleData)} size={256} />
              </div>
              <div className="mt-4">
                <button className="btn btn-primary" onClick={handleShareQR}>
                  Share QR to Owner
                </button>
              </div>
            </div>

            {/* Display progress bar while uploading */}
            {uploadProgress > 0 && (
              <div className="mt-4">
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${uploadProgress}%` }}
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    {Math.round(uploadProgress)}%
                  </div>
                </div>
              </div>
            )}

            {/* Right side: Vehicle Information */}
            <div className="col-md-6">
              <h4>Vehicle Information:</h4>
              <ul>
                <li><strong>Vehicle Make:</strong> {vehicleData.vehicleMake}</li>
                <li><strong>Vehicle Model:</strong> {vehicleData.vehicleModel}</li>
                <li><strong>Vehicle Year:</strong> {vehicleData.vehicleYear}</li>
                <li><strong>Registration Number:</strong> {vehicleData.registrationNumber}</li>
                <li><strong>Registration Expiry Date:</strong> {vehicleData.registrationExpiryDate}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Card Container for Firebase Authentication Registration */}
      <div className="card mt-4">
        <div className="card-body">
          <h4 className="card-title">Owner Mobile App Registration</h4>
          <form>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-success" onClick={handleRegister}>
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QRPage;
