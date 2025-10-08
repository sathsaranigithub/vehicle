import React, { FC, useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useFormik } from 'formik';
import useDarkMode from '../../../hooks/useDarkMode';
import PaginationButtons, { PER_COUNT } from '../../../components/PaginationButtons';
import { demoPagesMenu } from '../../../menu';
import useSortableData from '../../../hooks/useSortableData';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import VehicleRegistrationModal from '../manageusers/VehicleRegistrationModal';
import { doc, deleteDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { getColorNameWithIndex } from '../../../common/data/enumColors';
import { getFirstLetter } from '../../../helpers/helpers';
import Swal from 'sweetalert2';
import Switch from 'react-switch';
import emailjs from 'emailjs-com';

interface Police {
    cid: string;
    email: string;
    name: string;
    pid: string;
    station: string;
    permissionStatus: boolean; // Add permissionStatus to the Police type
}

const Index: NextPage = () => {
    const { darkModeStatus } = useDarkMode();
    const [searchTerm, setSearchTerm] = useState("");
    const [id, setId] = useState<any>();
    const [editModalStatus, setEditModalStatus] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(PER_COUNT['5']);
    const [filteredData, setFilteredData] = useState<Police[]>([]);

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

    const [policeData, setPoliceData] = useState<Police[]>([]);

    const fetchData = async () => {
        try {
            const dataCollection = collection(firestore, 'police');
            const querySnapshot = await getDocs(dataCollection);
            const firebaseData = querySnapshot.docs.map((doc) => {
                const data = doc.data() as Police;
                return {

                    ...data,
                    cid: doc.id,
                };
            });

            setPoliceData(firebaseData);
            await new Promise(resolve => setTimeout(resolve, 10000));
            setId(policeData.length + 1)

        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    fetchData();

    const { items, requestSort, getClassNamesFor } = useSortableData(policeData);

    useEffect(() => {
        setId(policeData.length + 1)
    }, [policeData]);
    // Handle permission status change (toggle switch)
    const handlePermissionChange = async (cid: string, newStatus: boolean, email: string) => {
        try {
            const docRef = doc(firestore, 'police', cid);
            await updateDoc(docRef, { permissionStatus: newStatus });

            // Show success message
            Swal.fire('Success', `Permission status updated to ${newStatus ? 'Granted' : 'Revoked'}`, 'success');

            // Send an email notification if permission is granted
            if (newStatus) {
                sendPermissionEmail(email);
            }
        } catch (error) {
            console.error('Error updating permission status: ', error);
            Swal.fire('Error', 'Failed to update permission status.', 'error');
        }
    };

    const handleClickDelete = async (cid: string) => {
        try {
            // Confirm deletion
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                // Firestore reference for the specific police record by its CID (police ID)
                const docRef = doc(firestore, 'police', cid);

                // Delete the document from the 'police' collection
                await deleteDoc(docRef);

                // Show success message
                Swal.fire('Deleted!', 'Police record has been deleted.', 'success');

                // Refresh the data to reflect the changes
                fetchData(); // Re-fetch the police data to show updated records
            }
        } catch (error) {
            console.error('Error deleting document: ', error);
            // Handle error (show an error message)
            Swal.fire('Error', 'Failed to delete the record.', 'error');
        }
    };

    const sendPermissionEmail = (email: string) => {
        const templateParams = {
            user_email: email,  // Recipient email
            message: 'Your account has permission to log in.',  // The message content
        };

        // Send email via EmailJS
        emailjs
            .send(
                'service_mzrnox9',  // EmailJS service ID
                'template_ovcesrx',  // EmailJS template ID
                templateParams,
                'DWpUMn2qtc2-CDPF-'  // EmailJS PUBLIC KEY
            )
            .then((response) => {
                console.log('Email sent successfully:', response);
            })
            .catch((error) => {
                console.error('Error sending email:', error);
            });
    };

    useEffect(() => {
        if (searchTerm) {
            const filtered = policeData.filter((police) =>
                police.pid.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(policeData);
        }
    }, [searchTerm, policeData]);

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
                        placeholder='Search policeman to enter ID number...'
                        onChange={(event: any) => { setSearchTerm(event.target.value); }}
                        value={searchTerm}
                    />
                </SubHeaderLeft>
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
                                            <th>Police ID Number</th>
                                            <th>Policemen Name</th>
                                            <th>Police Station</th>
                                            <th>Permission Status</th>
                                            <th></th>
                                            <td />
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredData.map((police) => (
                                            <tr key={police.cid}>
                                                <td>
                                                    <div className='d-flex align-items-center'>
                                                        <div className='flex-shrink-0'>
                                                            <div className='ratio ratio-1x1 me-3' style={{ width: 48 }}>
                                                                <div
                                                                    className={`bg-l${darkModeStatus ? 'o25' : '25'}-${getColorNameWithIndex(
                                                                        Number(police.pid),
                                                                    )} text-${getColorNameWithIndex(Number(police.pid))} rounded-2 d-flex align-items-center justify-content-center`}>
                                                                    <span className='fw-bold'>{getFirstLetter(police.station)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='flex-grow-1'>
                                                            <div className='fs-6 fw-bold'>{police.pid}</div>
                                                            <div className='text-muted'>
                                                                <Icon icon='Label' /> <small>{police.name}</small>
                                                            </div>
                                                            <div className='text-muted'>
                                                                <Icon icon='Label' /> <small>{police.email}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className='fs-6 fw-bold'>{police.name}</div>
                                                </td>
                                                <td>
                                                    <div className='fs-6 fw-bold'>{police.station}</div>
                                                </td>
                                                <td>
                                                    {/* Switch component to toggle permission status */}
                                                    <Switch
                                                        checked={police.permissionStatus}  // Set switch state based on permissionStatus
                                                        onChange={(newStatus) => handlePermissionChange(police.cid, newStatus, police.email)}
                                                        offColor="#888"  // Red color for 'off'
                                                        onColor="#4CAF50"  // Green color for 'on'
                                                        onHandleColor="#fff"  // White color for the knob
                                                        offHandleColor="#fff"  // White color for the knob
                                                    />
                                                </td>
                                                <td>

                                                    <Button
                                                        icon='Delete'
                                                        isLight
                                                        onClick={() => handleClickDelete(police.cid)}>
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



