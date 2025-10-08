import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import { firestore } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import PageWrapper from '../layout/PageWrapper/PageWrapper';
import Page from '../layout/Page/Page';
import Card, { CardBody } from '../components/bootstrap/Card';
import Button from '../components/bootstrap/Button';
import Input from '../components/bootstrap/forms/Input';

const Login: NextPage = () => {
  const router = useRouter();
  const [adminData, setAdminData] = useState<{ username: string; password: string }>({ username: '', password: '' });
  const [loginCredentials, setLoginCredentials] = useState<{ username: string; password: string }>({
    username: '',
    password: '',
  });

  // Fetch the admin data from Firestore
  const fetchAdminData = async () => {
    try {
      const adminDocRef = doc(firestore, 'Admin', 'r6MEFR0oteFa2A0m7Opz');
      const adminDocSnap = await getDoc(adminDocRef);
      if (adminDocSnap.exists()) {
        setAdminData(adminDocSnap.data() as { username: string; password: string });
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // Fetch admin data once when the component mounts
  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the form from reloading the page
    const { username, password } = loginCredentials;

    // Check if the entered username and password match the ones in Firestore
    if (username === adminData.username && password === adminData.password) {
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'You have successfully logged in!',
      });
      router.push('/admin/dashboard'); // Redirect to /admin/dashboard if credentials match
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Credentials',
        text: 'The username or password is incorrect.',
      });
    }
  };

  return (
    <PageWrapper isProtected={false}>
      <Page className="p-0">
        <div className="row h-100 align-items-center justify-content-center">
          <div className="col-xl-4 col-lg-6 col-md-8 shadow-3d-container">
            <Card className="shadow-3d-dark">
              <CardBody>
                <div className="text-center my-5">
                  <h1>Welcome</h1>
                  <h4 className="text-muted">Sign in</h4>
                </div>

                {/* Form with onSubmit that triggers handleLogin */}
                <form
                  className="row g-4"
                  onSubmit={(e) => {
                    handleLogin(e); // Trigger handleLogin on form submission
                  }}
                >
                  <div className="col-12">
                    <Input
                      value={loginCredentials.username}
                      onChange={(e) => setLoginCredentials({ ...loginCredentials, username: e.target.value })}
                      placeholder="Username"
                    />
                  </div>
                  <div className="col-12">
                    <Input
                      type="password"
                      value={loginCredentials.password}
                      onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                      placeholder="Password"
                    />
                  </div>
                  <div className="col-12">
                    {/* Login button that triggers the form submission */}
                    <Button color="warning" className="w-100 py-3" type="submit">
                      Login
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      </Page>
    </PageWrapper>
  );
};

export default Login;
