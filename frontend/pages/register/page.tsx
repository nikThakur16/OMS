"use client";
import React from "react";
import RegisterSidenav from "@/components/layouts/registerSidenav";
import { useSearchParams } from "next/navigation";
import PersonalDetails from "@/components/registerModals/personalDetails";
import Address from "@/components/registerModals/Address";
import Contact from "@/components/registerModals/Contact";
import BankDetails from "@/components/registerModals/BankDetails";
import ReviewAndSubmit from "@/components/registerModals/ReviewAndSubmit";
import { useRegisterMutation } from "@/store/api";
import CreateDepartmentModal from '@/components/modals/department/CreateDepartmentModal';
import { useCreateDepartmentMutation } from '@/store/api';
// Import necessary Formik types
import {
  Form,
  Formik,
  FormikErrors,
  FormikHelpers,
  FormikTouched,
} from "formik"; // Removed unused FormikValues
// Import your types, initial values, and schema
import {
  RegistrationData,
  RegistrationSchema,
  initialValues,
  PersonalDetailsData,
  AddressDetailsData,
  ContactDetailsData,
  BankDetailsData,
} from "@/types/register/page"; // Ensure PersonalDetailsData is also imported if used in PersonalDetails types

const RegisterPage = () => {
  const searchParams = useSearchParams();
  const currentType = searchParams ? searchParams.get("type") : null;
  const activeStep = currentType || "personalDetails"; // Default step
  const [register, { isLoading, isSuccess, isError, error, data }] =
    useRegisterMutation();
  const [showDepartmentModal, setShowDepartmentModal] = React.useState(false);
  const [createDepartment] = useCreateDepartmentMutation();

  const onSubmit = async (
    values: RegistrationData,
    { setSubmitting, resetForm }: FormikHelpers<RegistrationData> // Use FormikHelpers for the second argument type
  ) => {
    console.log("Submitting Registration Data:", values);
    setSubmitting(true); // Set submitting state

    try {
      // Trigger the register mutation with the form data
      await register(values).unwrap(); // .unwrap() throws an error if the mutation fails

      console.log("Registration successful!");
      alert("User registered successfully!"); // Provide user feedback
      resetForm(); // Reset the form fields to initial values on success
    } catch (err) {
      console.error("Registration failed:", err);
      // Handle the error, e.g., display an error message to the user
      alert("Registration failed. Please try again."); // Basic error feedback
      // You might want to check the error object (err) for more specific error details from the backend
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };

  const handleCreateDepartment = async (data) => {
    try {
      await createDepartment(data).unwrap();
      alert('Department created!');
      setShowDepartmentModal(false);
      // Optionally refetch departments here if needed
    } catch {
      alert('Failed to create department.');
    }
  };

  return (
    <div className="flex gap-8">
      <RegisterSidenav />
      <div className="flex-grow p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={RegistrationSchema}
          onSubmit={onSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            isSubmitting,
            isValid,
            dirty,
            handleSubmit,
          }) => (
            <Form
              onSubmit={handleSubmit}
              className="max-h-[77vh] overflow-y-auto shadow-md rounded-md   "
            >
              {/* Personal Details Step */}
              {activeStep === "personalDetails" && (
                <PersonalDetails
                  values={values.personalDetails}
                  errors={errors.personalDetails || {}}
                  touched={touched.personalDetails || {}}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  setFieldValue={setFieldValue}
                  showDepartmentModal={showDepartmentModal}
                  setShowDepartmentModal={setShowDepartmentModal}
                  handleCreateDepartment={handleCreateDepartment}
                />
              )}

              {/* Address Details Step */}
              {activeStep === "addressDetails" && (
                <Address
                  values={values.addressDetails}
                  // Provide default empty objects
                  errors={
                    errors.addressDetails ||
                    ({} as FormikErrors<AddressDetailsData>)
                  } // Adjust type if you have AddressDetailsData type
                  touched={
                    touched.addressDetails ||
                    ({} as FormikTouched<AddressDetailsData>)
                  } // Adjust type if you have AddressDetailsData type
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  setFieldValue={setFieldValue}
                />
              )}

              {/* Contact Details Step */}
              {activeStep === "contactDetails" && (
                <Contact
                  values={values.contactDetails}
                  // Provide default empty objects
                  errors={
                    errors.contactDetails ||
                    ({} as FormikErrors<ContactDetailsData>)
                  } // Adjust type if you have ContactDetailsData type
                  touched={
                    touched.contactDetails ||
                    ({} as FormikTouched<ContactDetailsData>)
                  } // Adjust type if you have ContactDetailsData type
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  setFieldValue={setFieldValue}
                />
              )}

              {/* Bank Details Step */}
              {activeStep === "bankDetails" && (
                <BankDetails
                  values={values.bankDetails}
                  // Provide default empty objects
                  errors={
                    errors.bankDetails || ({} as FormikErrors<BankDetailsData>)
                  } // Adjust type if you have BankDetailsData type
                  touched={
                    touched.bankDetails ||
                    ({} as FormikTouched<BankDetailsData>)
                  } // Adjust type if you have BankDetailsData type
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  setFieldValue={setFieldValue}
                />
              )}

              {/* Review and Submit Step */}
              {activeStep === "reviewAndSubmit" && (
                <ReviewAndSubmit
                  data={values} // Pass the full values object
                  onSubmit={handleSubmit} // Pass Formik's handleSubmit
                  isSubmitting={isSubmitting} // Pass Formik's isSubmitting
                  // You might also want to pass errors and touched for review page validation display
                  allErrors={errors}
                  allTouched={touched}
                />
              )}
            </Form>
          )}
        </Formik>
      </div>
      {/* Render modal OUTSIDE the Formik <Form> */}
      <CreateDepartmentModal
        open={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onCreate={handleCreateDepartment}
      />
    </div>
  );
};

export default RegisterPage;
