import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { Vehicle } from '../../../types';
import Button from '../../../components/bootstrap/Button';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Card, { CardActions, CardBody, CardHeader, CardLabel, CardTitle } from '../../../components/bootstrap/Card';
import Swal from 'sweetalert2';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import moment from 'moment';
import SubHeader, { SubHeaderLeft, SubHeaderRight, SubheaderSeparator } from '../../../layout/SubHeader/SubHeader';
import CustomerEditModal from './CustomerEditModal';
import Page from '../../../layout/Page/Page';

const Id: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Fetch data for the specific vehicle
  const [vehicleData, setVehicleData] = useState<Vehicle[]>([]);

  // State for the edit modal
  const [editModalStatus, setEditModalStatus] = useState<boolean>(false);

  // Open the edit modal
  const handleClickEdit = () => {
    setEditModalStatus(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataCollection = collection(firestore, 'vehicleRegistrations');
        const q = query(dataCollection, where('registrationNumber', '==', id)); // Using registration number as query
        const querySnapshot = await getDocs(q);
        const firebaseData = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Vehicle;
          return {
            ...data,
            cid: doc.id, // Storing Firestore document id
          };
        });
        setVehicleData(firebaseData);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, [editModalStatus]);

  // Delete functionality for vehicle
  const handleClickDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this vehicle!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        const docRef = doc(firestore, 'vehicleRegistrations', id);
        await deleteDoc(docRef);

        Swal.fire('Deleted!', 'Vehicle has been deleted.', 'success');
        router.push('../../admin/dashboard');
      }
    } catch (error) {
      console.error('Error deleting document: ', error);
      Swal.fire('Error', 'Failed to delete vehicle.', 'error');
    }
  };

  return (
    <PageWrapper>
      <Head>
        <title>Vehicle Details</title>
      </Head>
      <SubHeader>
        <SubHeaderLeft>
          {/* Back to list button */}
          <Button
            color="primary"
            isLink
            icon="ArrowBack"
            tag="a"
            to={`../../admin/dashboard`}
          >
            Back to List
          </Button>
          <SubheaderSeparator />
        </SubHeaderLeft>
        <SubHeaderRight>
          {/* Edit and Delete buttons */}
          <Button icon='Edit' color='primary' isLight onClick={handleClickEdit}>
            Edit
          </Button>
          <Button icon="Delete" color="primary" isLight onClick={() => handleClickDelete(vehicleData[0]?.cid)}>
            Delete
          </Button>
        </SubHeaderRight>
      </SubHeader>
      <Page>
        <div className="pt-3 pb-5 d-flex align-items-center">
          <span className="display-4 fw-bold me-3">{vehicleData[0]?.vehicleMake} {vehicleData[0]?.vehicleType}</span>
          <span className="border border-success border-2 text-success fw-bold px-3 py-2 rounded">
            {vehicleData[0]?.registrationNumber}
          </span>
        </div>
        <div className="row">
          {/* Vehicle Details Card */}
          <div className="col-lg-3">
            <Card className="shadow-3d-primary">
              <CardHeader>
                <CardLabel icon="Car">
                  <CardTitle>Vehicle Details</CardTitle>
                </CardLabel>
              </CardHeader>
              <CardBody>
                <div>
                  <p className="lead fw-bold">Make</p>
                  <div>{vehicleData[0]?.vehicleMake}</div>
                  <p className="lead fw-bold">Model</p>
                  <div>{vehicleData[0]?.vehicleModel}</div>
                  <p className="lead fw-bold">Color</p>
                  <div>{vehicleData[0]?.vehicleColor}</div>
                  <p className="lead fw-bold">VIN</p>
                  <div>{vehicleData[0]?.vin}</div>
                  <p className="lead fw-bold">Engin Number</p>
                  <div>{vehicleData[0]?.engineNumber}</div>
                  <p className="lead fw-bold">Registration Date</p>
                  <div>{vehicleData[0]?.vehicleRegistrations}</div>
                  <p className="lead fw-bold">Type</p>
                  <div>{vehicleData[0]?.vehicleType}</div>
                  <p className="lead fw-bold">License Plate Number</p>
                  <div>{vehicleData[0]?.licensePlateNumber}</div>
                  <p className="lead fw-bold">Odometer Reading</p>
                  <div>{vehicleData[0]?.odometerReading}</div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Owner Details Card */}
          <div className="col-lg-3">
            <Card className="shadow-3d-primary">
              <CardHeader>
                <CardLabel icon="User">
                  <CardTitle>Owner Information</CardTitle>
                </CardLabel>
              </CardHeader>
              <CardBody>
                {vehicleData[0]?.owners?.map((owner, index) => (
                  <div key={index}>
                    <p className="lead fw-bold">Owner {index + 1} Name</p>
                    <div>{owner.ownerName}</div>
                    <p className="lead fw-bold">Owner {index + 1} Email</p>
                    <div>{owner.ownerEmail}</div>
                    <p className="lead fw-bold">Owner {index + 1} Phone</p>
                    <div>{owner.ownerPhoneNumber}</div>
                    <p className="lead fw-bold">Owner {index + 1} Address</p>
                    <div>{owner.ownerAddress}</div>
                    <hr />
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Registration Details Card */}
          <div className="col-lg-3">
            <Card className="shadow-3d-primary">
              <CardHeader>
                <CardLabel icon="Document">
                  <CardTitle>Registration Details</CardTitle>
                </CardLabel>
              </CardHeader>
              <CardBody>
                <div>
                  <p className="lead fw-bold">Registration Number</p>
                  <div>{vehicleData[0]?.registrationNumber}</div>
                  <p className="lead fw-bold">Registration Date</p>
                  <div>{moment(vehicleData[0]?.registrationDate).format('YYYY-MM-DD')}</div>
                  <p className="lead fw-bold">Registration Expiry</p>
                  <div>{moment(vehicleData[0]?.registrationExpiryDate).format('YYYY-MM-DD')}</div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Insurance Details Card */}
          <div className="col-lg-3">
            <Card className="shadow-3d-primary">
              <CardHeader>
                <CardLabel icon="Shield">
                  <CardTitle>Insurance Information</CardTitle>
                </CardLabel>
              </CardHeader>
              <CardBody>
                <div>
                  <p className="lead fw-bold">Insurance Provider</p>
                  <div>{vehicleData[0]?.insuranceProviderName}</div>
                  <p className="lead fw-bold">Policy Number</p>
                  <div>{vehicleData[0]?.policyNumber}</div>
                  <p className="lead fw-bold">Insurance Expiry Date</p>
                  <div>{moment(vehicleData[0]?.insuranceExpiryDate).format('YYYY-MM-DD')}</div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </Page>
      <CustomerEditModal
        setIsOpen={setEditModalStatus}
        isOpen={editModalStatus}
        id={vehicleData[0]?.registrationNumber}
      />
    </PageWrapper>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'menu'])),
  },
});

export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: '1' } },
      { params: { id: '2' } },
    ],
    fallback: true,
  };
}

export default Id;