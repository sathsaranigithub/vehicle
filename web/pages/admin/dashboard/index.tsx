import React, { FC, useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useFormik } from 'formik';
import useDarkMode from '../../../hooks/useDarkMode';
import PaginationButtons, { PER_COUNT } from '../../../components/PaginationButtons';
import { demoPagesMenu } from '../../../menu';
import useSortableData from '../../../hooks/useSortableData';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import VehicleRegistrationModal from '../manageusers/VehicleRegistrationModal';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { getColorNameWithIndex } from '../../../common/data/enumColors';
import { getFirstLetter } from '../../../helpers/helpers';
import Swal from 'sweetalert2';
import router from 'next/router';

interface Vehicle {
  cid: string;
  registrationDate: string;
  registrationNumber: string;
  ownerName: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleType: string;
  vehicleYear: string;
}

const Index: NextPage = () => {
  const { darkModeStatus } = useDarkMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [id, setId] = useState<any>();
  const [editModalStatus, setEditModalStatus] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_COUNT['5']);
  const [filteredData, setFilteredData] = useState<Vehicle[]>([]);

  // Formik form for search and filter
  const formik = useFormik({
    initialValues: {
      searchInput: '',
      type: [],
    },
    onSubmit: () => {
      // alert(JSON.stringify(values, null, 2));
    },
  });

  const [vehicleData, setVehicleData] = useState<Vehicle[]>([]);

  const fetchData = async () => {
    try {
      const dataCollection = collection(firestore, 'vehicleRegistrations');
      const querySnapshot = await getDocs(dataCollection);
      const firebaseData = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Vehicle;
        return {

          ...data,
          cid: doc.id,
        };
      });

      setVehicleData(firebaseData);
      await new Promise(resolve => setTimeout(resolve, 10000));
      setId(vehicleData.length + 1)

    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  fetchData();

  const { items, requestSort, getClassNamesFor } = useSortableData(vehicleData);

  useEffect(() => {
    setId(vehicleData.length + 1)
  }, [vehicleData]);

  const handleClickDelete = async (id: string) => {
    console.log(id)
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this Vehicle!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        const docRef = doc(firestore, 'vehicleRegistrations', id);
        await deleteDoc(docRef);

        // Show success message
        Swal.fire('Deleted!', 'Vehicle has been deleted.', 'success');

        // Refresh data after deletion
        const updatedDataCollection = await getDocs(collection(firestore, 'Vehicle'));
        const updatedData = updatedDataCollection.docs.map((doc) => {
          const data = doc.data() as Vehicle;
          return {

            ...data,

          };
        });

        setVehicleData(updatedData);
      }
    } catch (error) {
      console.error('Error deleting document: ', error);
      // Handle error (e.g., show an error message)
      Swal.fire('Error', 'Failed to delete employee.', 'error');
    }
  };
  const handleGenerateQR = (registrationNumber: string) => {
    // Navigate to the QR page, passing the registration number as a query parameter
    router.push(`/admin/manageusers/qr?registrationNumber=${registrationNumber}`);
  };

 // Filter vehicle data based on the search term
 useEffect(() => {
  if (searchTerm) {
    const filtered = vehicleData.filter((vehicle) =>
      vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  } else {
    setFilteredData(vehicleData);
  }
}, [searchTerm, vehicleData]);

  return (
    <PageWrapper>
      <Head>
        <title>{demoPagesMenu.hrm.subMenu.customersList.text}</title>
      </Head>
      <SubHeader>
        <SubHeaderLeft>
          {/* Search input */}
          <label className='border-0 bg-transparent cursor-pointer me-0' htmlFor='searchInput'>
            <Icon icon='Search' size='2x' color='primary' />
          </label>
          <Input
            id='searchInput'
            type='search'
            className='border-0 shadow-none bg-transparent'
            placeholder='Search vechicle to enter register number...'
            onChange={(event: any) => { setSearchTerm(event.target.value); }}
            value={searchTerm}
          />
        </SubHeaderLeft>
        <SubHeaderRight>

          {/* Button to open new employee modal */}
          <Button icon='PersonAdd' color='primary' isLight onClick={() => setEditModalStatus(true)}>
            New Registration vehicle
          </Button>
        </SubHeaderRight>
      </SubHeader>
      <Page>
        <div className='row h-100'>
          <div className='col-12'>
            {/* Table for displaying customer data */}
            <Card stretch>
              <CardBody isScrollable className='table-responsive'>
                <table className='table table-modern table-hover'>
                  <thead>
                    <tr>
                      <th>Ragistration number</th>
                      <th>Registration date</th>
                      <th>Vehicale Make</th>
                      <th>Vehicle Year</th>
                      <th>Generate QR</th>
                      <td />
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.map((vehicle) => (
                      <tr key={vehicle.cid}>
                        <td>
                          <div className='d-flex align-items-center'>
                            <div className='flex-shrink-0'>
                              <div className='ratio ratio-1x1 me-3' style={{ width: 48 }}>
                                <div
                                  className={`bg-l${darkModeStatus ? 'o25' : '25'}-${getColorNameWithIndex(
                                    Number(vehicle.registrationNumber),
                                  )} text-${getColorNameWithIndex(Number(vehicle.registrationNumber))} rounded-2 d-flex align-items-center justify-content-center`}>
                                  <span className='fw-bold'>{getFirstLetter(vehicle.vehicleType)}</span>
                                </div>
                              </div>
                            </div>
                            <div className='flex-grow-1'>
                              <div className='fs-6 fw-bold'>{vehicle.registrationNumber}</div>
                              <div className='text-muted'>
                                <Icon icon='Label' /> <small>{vehicle.vehicleModel}</small>
                              </div>
                              <div className='text-muted'>
                                <Icon icon='Label' /> <small>{vehicle.vehicleType}</small>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className='fs-6 fw-bold'>{vehicle.registrationDate}</div>
                        </td>
                        <td>
                          <div className='fs-6 fw-bold'>{vehicle.vehicleMake}</div>
                        </td>
                        <td>
                          <div className='fs-6 fw-bold'>{vehicle.vehicleYear}</div>
                        </td>
                        <td>
                          <Button
                            icon='QRCode'
                            color='primary'
                            onClick={() => handleGenerateQR(vehicle.registrationNumber)}>
                            Generate QR
                          </Button>
                        </td>
                        <td>
                          <Button
                            icon='Visibility'
                            tag='a'
                            href={`/admin/manageusers/${vehicle.registrationNumber}`}>
                            View
                          </Button>
                          <Button
                            icon='Delete'
                            isLight
                            onClick={() => handleClickDelete(vehicle.cid)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
              {/* PaginationButtons component can be added here if needed */}
              <PaginationButtons
                data={items}
                label='items'
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
                perPage={perPage}
                setPerPage={setPerPage}
              />
            </Card>
          </div>
        </div>
      </Page>
      <VehicleRegistrationModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id="" />
    </PageWrapper>
  );
};

export default Index;



