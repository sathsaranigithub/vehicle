import React, { useState, useEffect, FC } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../../components/bootstrap/Modal';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Swal from 'sweetalert2';
interface Owner {
  ownerName: string;
  ownerAddress: string;
  ownerPhoneNumber: string;
  ownerEmail: string;
}
interface VehicleRegistrationValues {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehicleType: string;
  vin: string;
  engineNumber: string;
  licensePlateNumber: string;
  odometerReading: string;
  insuranceProviderName: string;
  policyNumber: string;
  insuranceExpiryDate: string;
  registrationDate: string;
  registrationNumber: string;
  registrationExpiryDate: string;
  owners: Owner[]; // Array of owners
}

const CustomerEditModal: FC<{ id: string; isOpen: boolean; setIsOpen(...args: unknown[]): unknown }> = ({
  id,
  isOpen,
  setIsOpen,
}) => {
  const [vehicle, setVehicle] = useState<any>(null); // Store the fetched vehicle data

  // Fetch vehicle data based on `id`
  useEffect(() => {
    const fetchVehicleData = async () => {
      console.log(`Fetching vehicle data for registration number: ${id}`);
      try {
        const dataCollection = collection(firestore, 'vehicleRegistrations');
        const q = query(dataCollection, where('registrationNumber', '==', id));
        const querySnapshot = await getDocs(q);
        const vehicleData = querySnapshot.docs.map((doc) => doc.data());

        console.log('Fetched vehicle data:', vehicleData);

        if (vehicleData.length > 0) {
          console.log('Setting vehicle data:', vehicleData[0]);
          setVehicle(vehicleData[0]); // Set the first document as the vehicle data
        } else {
          console.log('No vehicle found for this registration number');
        }
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };

    if (id) {
      fetchVehicleData();
    }
  }, [id]);

  const formik = useFormik<VehicleRegistrationValues>({
    initialValues: {
      vehicleMake: vehicle?.vehicleMake || '',
      vehicleModel: vehicle?.vehicleModel || '',
      vehicleYear: vehicle?.vehicleYear || '',
      vehicleColor: vehicle?.vehicleColor || '',
      vehicleType: vehicle?.vehicleType || '',
      vin: vehicle?.vin || '',
      engineNumber: vehicle?.engineNumber || '',
      licensePlateNumber: vehicle?.licensePlateNumber || '',
      odometerReading: vehicle?.odometerReading || '',
      insuranceProviderName: vehicle?.insuranceProviderName || '',
      policyNumber: vehicle?.policyNumber || '',
      insuranceExpiryDate: vehicle?.insuranceExpiryDate || '',
      registrationDate: vehicle?.registrationDate || '',
      registrationNumber: vehicle?.registrationNumber || '',
      registrationExpiryDate: vehicle?.registrationExpiryDate || '',
      owners: vehicle?.owners || [
        {
          ownerName: '',
          ownerAddress: '',
          ownerPhoneNumber: '',
          ownerEmail: ''
        },
      ],
    },
    enableReinitialize: true, // Reinitialize form with new vehicle data on change
    validate: (values) => {
      const errors: Partial<VehicleRegistrationValues> = {};
      if (!values.vehicleMake) errors.vehicleMake = 'Required';
      if (!values.vehicleModel) errors.vehicleModel = 'Required';
      if (!values.vehicleYear) errors.vehicleYear = 'Required';
      if (!values.registrationNumber) errors.registrationNumber = 'Required';
      return errors;
    },
    onSubmit: async (values) => {
      try {
        const processingPopup = Swal.fire({
          title: 'Processing...',
          html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
          allowOutsideClick: false,
          showCancelButton: false,
          showConfirmButton: false,
        });

        const collectionRef = collection(firestore, 'vehicleRegistrations');
        const documentRef = doc(collectionRef, id);
        await updateDoc(documentRef, {
          ...values  // Spread the values object to pass it as a flat object
        });
        Swal.fire('Added!', 'Vehicle registration has been added successfully.', 'success');
      } catch (error) {
        console.error('Error during vehicle registration: ', error);
        alert('An error occurred while registering the vehicle. Please try again later.');
      }
    },
  });
  // Function to add a new owner
  const addOwner = () => {
    formik.setFieldValue('owners', [
      ...formik.values.owners,
      {
        ownerName: '',
        ownerAddress: '',
        ownerPhoneNumber: '',
        ownerEmail: ''
      }
    ]);
  };

  // Function to remove an owner
  const removeOwner = (index: number) => {
    const updatedOwners = formik.values.owners.filter((_, i) => i !== index);
    formik.setFieldValue('owners', updatedOwners);
  };
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} size="xl" titleId={id}>
      <ModalHeader setIsOpen={setIsOpen} className="p-4">
        <ModalTitle id="">{'Edit Customer'}</ModalTitle>
      </ModalHeader>
      <ModalBody className="px-4">
        <div className="row g-4">
          {/* Vehicle Information */}
          <Card className="col-md-6 mb-4">
            <CardHeader>
              <CardLabel icon="Car">
                <CardTitle>Vehicle Information</CardTitle>
              </CardLabel>
            </CardHeader>
            <CardBody>
              <FormGroup id="vehicleMake" label="Vehicle Make" className="col-12">
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.vehicleMake}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.vehicleMake}
                  invalidFeedback={formik.errors.vehicleMake}
                  validFeedback="Looks good!"
                />
              </FormGroup>
              <FormGroup id="vehicleModel" label="Vehicle Model" className="col-12">
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.vehicleModel}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.vehicleModel}
                  invalidFeedback={formik.errors.vehicleModel}
                  validFeedback="Looks good!"
                />
              </FormGroup>
              <FormGroup id="vehicleYear" label="Vehicle Year" className="col-12">
                <Input
                  type="number"
                  onChange={formik.handleChange}
                  value={formik.values.vehicleYear}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.vehicleYear}
                  invalidFeedback={formik.errors.vehicleYear}
                  validFeedback="Looks good!"
                />
              </FormGroup>
              <FormGroup id="vehicleColor" label="Vehicle Color" className="col-12">
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.vehicleColor}
                />
              </FormGroup>
              <FormGroup id="vehicleType" label="Vehicle Type" className="col-12">
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.vehicleType}
                />
              </FormGroup>
              <FormGroup id="vin" label="Vehicle Identification Number (VIN)" className="col-12">
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.vin}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.vin}
                  invalidFeedback={formik.errors.vin}
                  validFeedback="Looks good!"
                />
              </FormGroup>
              <FormGroup id="engineNumber" label="Engine Number" className="col-12">
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.engineNumber}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.engineNumber}
                  invalidFeedback={formik.errors.engineNumber}
                  validFeedback="Looks good!"
                />
              </FormGroup>
              <FormGroup id="licensePlateNumber" label="License Plate Number" className="col-12">
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.licensePlateNumber}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.licensePlateNumber}
                  invalidFeedback={formik.errors.licensePlateNumber}
                  validFeedback="Looks good!"
                />
              </FormGroup>
              <FormGroup id="odometerReading" label="Odometer Reading" className="col-12">
                <Input
                  type="number"
                  onChange={formik.handleChange}
                  value={formik.values.odometerReading}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.odometerReading}
                  invalidFeedback={formik.errors.odometerReading}
                  validFeedback="Looks good!"
                />
              </FormGroup>
            </CardBody>
          </Card>

          {/* Owner Information */}
          <Card className="col-md-6 mb-4">
            <CardHeader>
              <CardLabel icon="User">
                <CardTitle>Owner Information</CardTitle>
              </CardLabel>
            </CardHeader>
            <CardBody>
              {formik.values.owners.map((owner, index) => (
                <div key={index}>
                  <Card className="mb-3">
                    <CardBody>
                      <FormGroup id={`ownerName-${index}`} label={`Owner ${index + 1} Name`} className="col-12">
                        <Input
                          onChange={formik.handleChange}
                          value={owner.ownerName}
                          name={`owners[${index}].ownerName`}
                        />
                      </FormGroup>
                      <FormGroup id={`ownerEmail-${index}`} label={`Owner ${index + 1} Email`} className="col-12">
                        <Input
                          onChange={formik.handleChange}
                          value={owner.ownerEmail}
                          name={`owners[${index}].ownerEmail`}
                        />
                      </FormGroup>
                      <FormGroup id={`ownerAddress-${index}`} label={`Owner ${index + 1} Address`} className="col-12">
                        <Input
                          onChange={formik.handleChange}
                          value={owner.ownerAddress}
                          name={`owners[${index}].ownerAddress`}
                        />
                      </FormGroup>
                      <FormGroup id={`ownerPhoneNumber-${index}`} label={`Owner ${index + 1} Phone Number`} className="col-12">
                        <Input
                          onChange={formik.handleChange}
                          value={owner.ownerPhoneNumber}
                          name={`owners[${index}].ownerPhoneNumber`}
                        />
                      </FormGroup>
                      <Button type="button" color="danger" onClick={() => removeOwner(index)}>
                        Remove Owner
                      </Button>
                    </CardBody>
                  </Card>
                </div>
              ))}
              <Button type="button" color="primary" onClick={addOwner}>Add Owner</Button>
            </CardBody>
          </Card>

          {/* Registration Details */}
          <Card className="col-md-6 mb-4">
            <CardHeader>
              <CardLabel icon="Document">
                <CardTitle>Registration Details</CardTitle>
              </CardLabel>
            </CardHeader>
            <CardBody>
              <FormGroup id="registrationNumber" label="Registration Number" className="col-12">
                <Input
                  type="text"
                  value={formik.values.registrationNumber}
                  readOnly
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  invalidFeedback={formik.errors.registrationNumber}
                />
              </FormGroup>
              <FormGroup id="registrationDate" label="Date of Registration" className="col-12">
                <Input
                  type="date"
                  onChange={formik.handleChange}
                  value={formik.values.registrationDate}
                />
              </FormGroup>
              <FormGroup id="registrationExpiryDate" label="Registration Expiry Date" className="col-12">
                <Input
                  type="date"
                  onChange={formik.handleChange}
                  value={formik.values.registrationExpiryDate}
                />
              </FormGroup>
            </CardBody>
          </Card>

          {/* Insurance Information */}
          <Card className="col-md-6 mb-4">
            <CardHeader>
              <CardLabel icon="Shield">
                <CardTitle>Insurance Information</CardTitle>
              </CardLabel>
            </CardHeader>
            <CardBody>
              <FormGroup id="insuranceProviderName" label="Insurance Provider Name" className="col-12">
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.insuranceProviderName}
                />
              </FormGroup>
              <FormGroup id="policyNumber" label="Policy Number" className="col-12">
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.policyNumber}
                />
              </FormGroup>
              <FormGroup id="insuranceExpiryDate" label="Insurance Expiry Date" className="col-12">
                <Input
                  type="date"
                  onChange={formik.handleChange}
                  value={formik.values.insuranceExpiryDate}
                />
              </FormGroup>
            </CardBody>
          </Card>
        </div>
      </ModalBody>
      <ModalFooter className="px-4 pb-4">
        <Button color="info" onClick={formik.handleSubmit}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

CustomerEditModal.propTypes = {
  id: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default CustomerEditModal;