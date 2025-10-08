import React, { useState, useEffect, FC } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../../components/bootstrap/Modal';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { firestore} from '../../../firebaseConfig';
import Swal from 'sweetalert2';
// Define the interface for the form values
interface Owner {
  ownerName: string;
  ownerAddress: string;
  ownerPhoneNumber: string;
  ownerEmail: string;
}

// Define the interface for the form values
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
    owners: Owner[];
  }
  
  const VehicleRegistrationModal: FC<{ id: string; isOpen: boolean; setIsOpen(...args: unknown[]): unknown }> = ({ id, isOpen, setIsOpen }) => {
    const [isPaymentProof, setIsPaymentProof] = useState(false);  // State for Payment Proof Yes/No
  
    // Initialize owners array with one empty owner
  const formik = useFormik<VehicleRegistrationValues>({
    initialValues: {
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleColor: '',
      vehicleType: '',
      vin: '',
      engineNumber: '',
      licensePlateNumber: '',
      odometerReading: '',
      insuranceProviderName: '',
      policyNumber: '',
      insuranceExpiryDate: '',
      registrationDate: '',
      registrationNumber: '',
      registrationExpiryDate: '',
      owners: [
        {
          ownerName: '',
          ownerAddress: '',
          ownerPhoneNumber: '',
          ownerEmail: ''
        }
      ],
    },
      validate: (values) => {
        const errors: Partial<VehicleRegistrationValues> = {}; // use Partial to allow optional properties
        if (!values.vehicleMake) errors.vehicleMake = 'Required';
        if (!values.vehicleModel) errors.vehicleModel = 'Required';
        if (!values.vehicleYear) errors.vehicleYear = 'Required';
        if (!values.registrationNumber) errors.registrationNumber = 'Required';
        return errors;
      },
      onSubmit: async (values) => {
        try {
          const processingPopup = Swal.fire({
            title: "Processing...",
            html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
            allowOutsideClick: false,
            showCancelButton: false,
            showConfirmButton: false,
          });
        
        const collectionRef = collection(firestore, 'vehicleRegistrations');
        const documentRef = doc(collectionRef, values.registrationNumber);
        await setDoc(documentRef, values);
        setIsOpen(false);
        Swal.fire('Added!', 'Vehicle registration has been added successfully.', 'success');
      } catch (error) {
        console.error('Error during vehicle registration: ', error);
        alert('An error occurred while registering the vehicle. Please try again later.');
      }
    },
  });
// Function to generate a registration number
const generateRegistrationNumber = async () => {
    const registrationNumber = `REG-${Math.floor(Math.random() * 1000000)}`;

    // Check Firebase if the registration number already exists
    const querySnapshot = await getDocs(collection(firestore, 'vehicleRegistrations'));
    let isUnique = true;
    querySnapshot.forEach((doc) => {
      if (doc.id === registrationNumber) {
        isUnique = false;
      }
    });

    // If not unique, generate a new number
    if (!isUnique) {
      generateRegistrationNumber();
    } else {
      formik.setFieldValue('registrationNumber', registrationNumber); // Update formik field with the new unique number
    }
  };
   // Function to add a new owner
   const addOwner = () => {
    formik.setFieldValue('owners', [
      ...formik.values.owners,
      {
        ownerName: '',
        ownerAddress: '',
        ownerPhoneNumber: '',
        ownerEmail: '',
      }
    ]);
  };

  // Function to remove an owner
  const removeOwner = (index: number) => {
    const updatedOwners = formik.values.owners.filter((_, i) => i !== index);
    formik.setFieldValue('owners', updatedOwners);
  };
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
      <ModalHeader setIsOpen={setIsOpen} className='p-4'>
        <ModalTitle id="">{'New Vehicle Registration'}</ModalTitle>
      </ModalHeader>
      <ModalBody className='px-4'>
        <div className='row g-4'>
          {/* Vehicle Information */}
          <Card className='col-md-6 mb-4'>
            <CardHeader>
              <CardLabel icon='Car'>
                <CardTitle>Vehicle Information</CardTitle>
              </CardLabel>
            </CardHeader>
            <CardBody>
              <FormGroup id='vehicleMake' label='Vehicle Make' className='col-12'>
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.vehicleMake}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.vehicleMake}
                  invalidFeedback={formik.errors.vehicleMake}
                  validFeedback='Looks good!'
                />
              </FormGroup>
              <FormGroup id='vehicleModel' label='Vehicle Model' className='col-12'>
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.vehicleModel}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.vehicleModel}
                  invalidFeedback={formik.errors.vehicleModel}
                  validFeedback='Looks good!'
                />
              </FormGroup>
              <FormGroup id='vehicleYear' label='Vehicle Year' className='col-12'>
                <Input
                  type='number'
                  onChange={formik.handleChange}
                  value={formik.values.vehicleYear}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.vehicleYear}
                  invalidFeedback={formik.errors.vehicleYear}
                  validFeedback='Looks good!'
                />
              </FormGroup>
              <FormGroup id='vehicleColor' label='Vehicle Color' className='col-12'>
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.vehicleColor}
                />
              </FormGroup>
              <FormGroup id='vehicleType' label='Vehicle Type' className='col-12'>
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.vehicleType}
                />
              </FormGroup>
              <FormGroup id='vin' label='Vehicle Identification Number (VIN)' className='col-12'>
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.vin}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.vin}
                  invalidFeedback={formik.errors.vin}
                  validFeedback='Looks good!'
                />
              </FormGroup>
              <FormGroup id='engineNumber' label='Engine Number' className='col-12'>
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.engineNumber}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.engineNumber}
                  invalidFeedback={formik.errors.engineNumber}
                  validFeedback='Looks good!'
                />
              </FormGroup>
              <FormGroup id='licensePlateNumber' label='License Plate Number' className='col-12'>
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.licensePlateNumber}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.licensePlateNumber}
                  invalidFeedback={formik.errors.licensePlateNumber}
                  validFeedback='Looks good!'
                />
              </FormGroup>
              <FormGroup id='odometerReading' label='Odometer Reading' className='col-12'>
                <Input
                  type='number'
                  onChange={formik.handleChange}
                  value={formik.values.odometerReading}
                  onBlur={formik.handleBlur}
                  isValid={formik.isValid}
                  isTouched={formik.touched.odometerReading}
                  invalidFeedback={formik.errors.odometerReading}
                  validFeedback='Looks good!'
                />
              </FormGroup>
            </CardBody>
          </Card>
        
          {/* Owner Information */}
          <Card className='col-md-6 mb-4'>
            <CardHeader>
              <CardLabel icon='User'>
                <CardTitle>Owner Information</CardTitle>
              </CardLabel>
            </CardHeader>
            <CardBody>
              {formik.values.owners.map((owner, index) => (
                <div key={index}>
                  <Card className="mb-3">
                    <CardBody>
                      <FormGroup id={`ownerName-${index}`} label={`Owner ${index + 1} Name`} className='col-12'>
                        <Input
                          onChange={formik.handleChange}
                          value={owner.ownerName}
                          name={`owners[${index}].ownerName`}
                        />
                      </FormGroup>
                      <FormGroup id={`ownerEmail-${index}`} label={`Owner ${index + 1} Email`} className='col-12'>
                        <Input
                          onChange={formik.handleChange}
                          value={owner.ownerEmail}
                          name={`owners[${index}].ownerEmail`}
                        />
                      </FormGroup>
                      <FormGroup id={`ownerAddress-${index}`} label={`Owner ${index + 1} Address`} className='col-12'>
                        <Input
                          onChange={formik.handleChange}
                          value={owner.ownerAddress}
                          name={`owners[${index}].ownerAddress`}
                        />
                      </FormGroup>
                      <FormGroup id={`ownerPhoneNumber-${index}`} label={`Owner ${index + 1} Phone Number`} className='col-12'>
                        <Input
                          onChange={formik.handleChange}
                          value={owner.ownerPhoneNumber}
                          name={`owners[${index}].ownerPhoneNumber`}
                        />
                      </FormGroup>
                      {/* More fields for other owner details */}
                      <Button type="button" color="danger" onClick={() => removeOwner(index)}>Remove Owner</Button>
                    </CardBody>
                  </Card>
                </div>
              ))}
              <Button type="button" color="primary" onClick={addOwner}>Add Owner</Button>
            </CardBody>
          </Card>

          {/* Registration Details */}
          <Card className='col-md-6 mb-4'>
            <CardHeader>
              <CardLabel icon='Document'>
                <CardTitle>Registration Details</CardTitle>
              </CardLabel>
            </CardHeader>
            <CardBody>
            <FormGroup id='registrationNumber' label='Registration Number' className='col-12'>
              <Input
                type='text'
                value={formik.values.registrationNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalidFeedback={formik.errors.registrationNumber}
              />
              <Button color='secondary' onClick={generateRegistrationNumber}>Generate Registration Number</Button>
            </FormGroup>
              <FormGroup id='registrationDate' label='Date of Registration' className='col-12'>
                <Input
                  type='date'
                  onChange={formik.handleChange}
                  value={formik.values.registrationDate}
                />
              </FormGroup>
              <FormGroup id='registrationExpiryDate' label='Registration Expiry Date' className='col-12'>
                <Input
                  type='date'
                  onChange={formik.handleChange}
                  value={formik.values.registrationExpiryDate}
                />
              </FormGroup>
    
            </CardBody>
          </Card>

          {/* Insurance Information */}
          <Card className='col-md-6 mb-4'>
            <CardHeader>
              <CardLabel icon='Shield'>
                <CardTitle>Insurance Information</CardTitle>
              </CardLabel>
            </CardHeader>
            <CardBody>
              <FormGroup id='insuranceProviderName' label='Insurance Provider Name' className='col-12'>
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.insuranceProviderName}
                />
              </FormGroup>
              <FormGroup id='policyNumber' label='Policy Number' className='col-12'>
                <Input
                  onChange={formik.handleChange}
                  value={formik.values.policyNumber}
                />
              </FormGroup>
              <FormGroup id='insuranceExpiryDate' label='Insurance Expiry Date' className='col-12'>
                <Input
                  type='date'
                  onChange={formik.handleChange}
                  value={formik.values.insuranceExpiryDate}
                />
              </FormGroup>
            </CardBody>
          </Card>
        </div>
      </ModalBody>
      <ModalFooter className='px-4 pb-4'>
        <Button color='info' onClick={formik.handleSubmit}>Save</Button>
      </ModalFooter>
    </Modal>
  );
};

VehicleRegistrationModal.propTypes = {
  id: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default VehicleRegistrationModal;
